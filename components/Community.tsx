
import React, { useState, useRef } from 'react';
import { Pet, Post, Language, Comment } from '../types';
import { Heart, MessageCircle, Share2, Plus, Image as ImageIcon, X, Send, Loader2, AlertTriangle } from 'lucide-react';
import { t } from '../services/translations';
import { validateImageSafety } from '../services/geminiService';
import { uploadImage, supabase } from '../services/supabaseClient';

interface CommunityProps {
  pet: Pet;
  lang: Language;
  globalPosts: Post[];
  onUpdatePosts: (posts: Post[]) => void;
}

const Community: React.FC<CommunityProps> = ({ pet, lang, globalPosts, onUpdatePosts }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'myposts'>('feed');
  
  // Create Post State
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [newPostCaption, setNewPostCaption] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false); // State for compression status
  const [postError, setPostError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comments State
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  const displayedPosts = activeTab === 'feed' 
    ? globalPosts 
    : globalPosts.filter(p => p.isUserPost);

  // --- Image Compression Helper ---
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Max dimensions (e.g., 1080p width usually sufficient for mobile feed)
          const MAX_WIDTH = 1080;
          const MAX_HEIGHT = 1080;
          
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions maintaining aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          
          // Draw image on canvas
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to JPEG at 70% quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setPostError(null);

    try {
      const compressedBase64 = await compressImage(file);
      setNewPostImage(compressedBase64);
    } catch (error) {
      console.error("Error processing image:", error);
      setPostError("Failed to process image. Please try another one.");
    } finally {
      setIsCompressing(false);
      // Reset input value so same file can be selected again if needed
      if (event.target) event.target.value = '';
    }
  };

  const handleSubmitPost = async () => {
    if (!newPostImage) return;
    setIsPosting(true);
    setPostError(null);

    try {
        // 1. Safety Check
        const isSafe = await validateImageSafety(newPostImage);
        if (!isSafe) {
            setPostError(t('comm.safetyError', lang));
            setIsPosting(false);
            return;
        }

        // 2. Upload to Supabase Storage
        const publicUrl = await uploadImage('posts', newPostImage);
        if (!publicUrl) throw new Error("Image upload failed");

        // 3. Create Post in DB
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not logged in");

        await supabase.from('posts').insert({
              user_id: session.user.id,
              pet_name: pet.name,
              breed_tag: pet.breed,
              image_url: publicUrl,
              caption: newPostCaption
        });

        // Trigger reload in parent
        onUpdatePosts(globalPosts); // This triggers a refetch in App.tsx

        setShowNewPostModal(false);
        setNewPostImage(null);
        setNewPostCaption('');
        setActiveTab('myposts');
    } catch (e) {
        console.error(e);
        setPostError("Error posting. Please try again.");
    } finally {
        setIsPosting(false);
    }
  };

  const toggleLike = async (postId: string) => {
    // Optimistic UI update
    const updated = globalPosts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          isLiked: !p.isLiked,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    });
    
    // Send optimistic update to parent
    onUpdatePosts(updated);
    
    // DB Update
    const post = globalPosts.find(p => p.id === postId);
    if (post) {
       const newCount = post.isLiked ? post.likes - 1 : post.likes + 1;
       await supabase.from('posts').update({ likes_count: newCount }).eq('id', postId);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !activePostId || sendingComment) return;
    setSendingComment(true);
    
    try {
       const { data: { session } } = await supabase.auth.getSession();
       if (!session) throw new Error("Not logged in");

       // Optimistic Update
       const newComment: Comment = {
         id: 'temp-' + Date.now(),
         user: session.user.user_metadata?.full_name || 'Me', // Use actual user name
         text: commentText,
         timestamp: Date.now()
       };

       const updated = globalPosts.map(p => {
         if (p.id === activePostId) {
           return {
             ...p,
             commentsList: [...p.commentsList, newComment]
           };
         }
         return p;
       });

       onUpdatePosts(updated);
       setCommentText('');

       // DB Insert
       await supabase.from('comments').insert({
          post_id: activePostId,
          user_id: session.user.id,
          text: newComment.text
       });

    } catch (error) {
       console.error("Error sending comment", error);
    } finally {
       setSendingComment(false);
    }
  };

  const activePost = globalPosts.find(p => p.id === activePostId);

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-24 relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#F15AE5] to-[#8456FF] p-6 pt-12 rounded-b-3xl shadow-md text-white mb-4">
        <h2 className="text-2xl font-bold">{t('comm.title', lang)}</h2>
        <div className="flex gap-4 mt-4">
          <button 
            onClick={() => setActiveTab('feed')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition ${activeTab === 'feed' ? 'bg-white text-purple-600 shadow-sm' : 'bg-white/20 text-white'}`}
          >
            {t('comm.feed', lang)}
          </button>
          <button 
            onClick={() => setActiveTab('myposts')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition ${activeTab === 'myposts' ? 'bg-white text-purple-600 shadow-sm' : 'bg-white/20 text-white'}`}
          >
            {t('comm.myposts', lang)}
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6 pb-24">
        {displayedPosts.length === 0 && (
          <div className="text-center text-gray-400 py-10">
            <p>No posts yet.</p>
          </div>
        )}

        {displayedPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center text-purple-600 font-bold">
                {post.user[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{post.user}</p>
                <p className="text-xs text-gray-500">{post.petName} • {post.breedTag}</p>
              </div>
              <span className="ml-auto text-xs text-gray-400">{new Date(post.timestamp).toLocaleDateString()}</span>
            </div>
            
            <div className="relative aspect-square bg-gray-100">
              <img src={post.imageUrl} alt="Pet post" className="w-full h-full object-cover" />
            </div>

            <div className="p-4">
              <div className="flex gap-4 mb-3">
                <button 
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1 transition ${post.isLiked ? 'text-pink-500' : 'text-gray-600 hover:text-pink-500'}`}
                >
                  <Heart size={22} fill={post.isLiked ? "currentColor" : "none"} />
                  <span className="text-sm font-medium">{post.likes} {t('comm.like', lang)}</span>
                </button>
                <button 
                  onClick={() => setActivePostId(post.id)}
                  className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition"
                >
                  <MessageCircle size={22} />
                  <span className="text-sm font-medium">{post.commentsList.length} {t('comm.comment', lang)}</span>
                </button>
                 <button className="ml-auto text-gray-400">
                  <Share2 size={20} />
                </button>
              </div>
              <p className="text-gray-800 text-sm leading-relaxed">
                <span className="font-semibold mr-2">{post.user}</span>
                {post.caption}
              </p>

              {/* Comment Trigger Field */}
              <div className="mt-4 pt-3 border-t border-gray-50">
                 <button 
                   onClick={() => setActivePostId(post.id)}
                   className="w-full flex items-center gap-3 group"
                 >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-purple-500 font-bold text-xs">
                       {pet.name.charAt(0)}
                    </div>
                    <div className="flex-1 bg-gray-50 h-9 rounded-full flex items-center px-4 text-xs text-gray-400 group-hover:bg-gray-100 transition">
                       {t('comm.writeComment', lang)}
                    </div>
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button 
        onClick={() => setShowNewPostModal(true)}
        className="absolute bottom-24 right-4 w-14 h-14 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center text-white hover:scale-105 transition z-40"
      >
        <Plus size={32} />
      </button>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md h-[80vh] sm:h-auto rounded-t-3xl sm:rounded-3xl p-6 flex flex-col shadow-2xl animate-slide-up">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-gray-800">{t('comm.newPost', lang)}</h3>
               <button onClick={() => { setShowNewPostModal(false); setPostError(null); }} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                 <X size={20} />
               </button>
             </div>

             {/* Image Picker */}
             <div 
               onClick={() => !isPosting && !isCompressing && fileInputRef.current?.click()}
               className="aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-purple-200 flex flex-col items-center justify-center text-purple-400 cursor-pointer hover:bg-purple-50 transition mb-4 overflow-hidden relative"
             >
                {isCompressing ? (
                  <div className="flex flex-col items-center">
                    <Loader2 size={32} className="animate-spin mb-2 text-purple-500" />
                    <span className="text-xs font-medium text-gray-500">Compressing...</span>
                  </div>
                ) : newPostImage ? (
                  <img src={newPostImage} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon size={32} className="mb-2" />
                    <span className="font-medium text-sm">{t('comm.addPhoto', lang)}</span>
                  </>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
             </div>

             {postError && (
                 <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-start gap-2">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <span>{postError}</span>
                 </div>
             )}

             {/* Caption */}
             <textarea 
                value={newPostCaption}
                onChange={(e) => setNewPostCaption(e.target.value)}
                placeholder={t('comm.captionPlaceholder', lang)}
                disabled={isPosting || isCompressing}
                className="w-full p-4 bg-gray-50 rounded-2xl resize-none h-32 focus:ring-2 focus:ring-purple-500 outline-none mb-6"
             />

             <button 
               onClick={handleSubmitPost}
               disabled={!newPostImage || isPosting || isCompressing}
               className="w-full py-4 bg-gradient-to-r from-[#F15AE5] to-[#8456FF] text-white rounded-2xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition flex items-center justify-center gap-2"
             >
               {isPosting ? (
                   <>
                     <Loader2 size={20} className="animate-spin" />
                     {t('loading.posting', lang)}
                   </>
               ) : (
                   t('comm.postBtn', lang)
               )}
             </button>
          </div>
        </div>
      )}

      {/* Comments Modal - increased z-index to 60 to be above bottom nav (50) */}
      {activePost && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex flex-col justify-end sm:justify-center sm:items-center">
          <div className="bg-white w-full max-w-md h-[90vh] sm:h-[800px] sm:rounded-3xl flex flex-col shadow-2xl animate-slide-up overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
              <h3 className="font-bold text-lg">{t('comm.comment', lang)}s</h3>
              <button onClick={() => setActivePostId(null)} className="p-2 bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Original Post Snippet */}
              <div className="flex gap-3 mb-6 pb-6 border-b border-gray-100">
                <img src={activePost.imageUrl} className="w-16 h-16 rounded-xl object-cover" />
                <div>
                  <p className="font-bold text-sm">{activePost.user}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{activePost.caption}</p>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {activePost.commentsList.length === 0 && (
                   <p className="text-center text-gray-400 text-sm py-4">No comments yet. Be the first!</p>
                )}
                {activePost.commentsList.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs shrink-0">
                       {comment.user[0]}
                     </div>
                     <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-xs">{comment.user}</span>
                          <span className="text-[10px] text-gray-400">{new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="text-sm text-gray-800">{comment.text}</p>
                     </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 bg-white pb-8 sm:pb-4">
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                <input 
                  type="text" 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t('comm.writeComment', lang)}
                  className="flex-1 bg-transparent outline-none text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                />
                <button 
                  onClick={handleSendComment}
                  disabled={!commentText.trim() || sendingComment}
                  className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 disabled:opacity-50 disabled:bg-gray-400 transition"
                >
                  {sendingComment ? <Loader2 size={16} className="animate-spin"/> : <Send size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
