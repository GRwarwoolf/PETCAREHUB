
import React, { useState, useRef, useEffect } from 'react';
import { identifyPetFromImage } from './services/geminiService';
import { supabase, uploadImage } from './services/supabaseClient';
import { Pet, ViewState, Language, Post, HealthRecord, WeightRecord } from './types';
import { t } from './services/translations';
import InfoView from './components/InfoView';
import TrainingView from './components/TrainingView';
import Community from './components/Community';
import LegalView from './components/LegalView';
import HealthLog from './components/HealthLog';
import AIChat from './components/AIChat';
import NutritionView from './components/NutritionView';
import { 
  Camera, 
  Dog, 
  Home as HomeIcon, 
  Users, 
  User as UserIcon, 
  Check,
  Globe,
  Scale,
  Sparkles,
  Edit2,
  HeartPulse,
  Dna,
  GraduationCap,
  Utensils,
  Zap,
  Stethoscope,
  MessageCircle,
  LogOut,
  Mail,
  Lock,
  Loader2
} from 'lucide-react';

// Custom Minimal Logo Component
const PetCareLogo = () => (
  <div className="flex flex-col items-center justify-center mb-8 animate-fade-in">
    <div className="bg-white/20 backdrop-blur-md border border-white/30 p-6 rounded-[2.5rem] shadow-2xl mb-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50"></div>
      <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 drop-shadow-md">
        <path d="M50 85C35 85 25 73 25 60C25 52 30 47 35 45C40 43 45 45 50 50C55 45 60 43 65 45C70 47 75 52 75 60C75 73 65 85 50 85Z" fill="white" />
        <circle cx="25" cy="35" r="10" fill="white" />
        <circle cx="50" cy="25" r="11" fill="white" />
        <circle cx="75" cy="35" r="10" fill="white" />
      </svg>
    </div>
  </div>
);

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<ViewState>(ViewState.LANGUAGE_SELECT);
  const [lang, setLang] = useState<Language>('en'); 
  const [session, setSession] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Data State
  const [pet, setPet] = useState<Pet | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);

  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Registration State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dashboardFileInputRef = useRef<HTMLInputElement>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [tempSpecies, setTempSpecies] = useState<string>('');
  const [tempBreed, setTempBreed] = useState<string>('');
  const [petName, setPetName] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petGender, setPetGender] = useState<'Male' | 'Female'>('Male');

  // --- Effects ---

  // 1. Initial Load & Auth Listener
  useEffect(() => {
    // Initial fetch of community posts (public)
    fetchPosts();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserData(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
         fetchUserData(session.user.id);
         // Refresh posts to update "isUserPost" status
         fetchPosts(); 
      } else {
         setPet(null);
         setHealthRecords([]);
         setWeightRecords([]);
         setView(ViewState.WELCOME);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch specific user data
  const fetchUserData = async (userId: string) => {
    setLoadingData(true);
    try {
      // Fetch Pet
      const { data: pets, error: petError } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', userId)
        .limit(1)
        .single();
      
      if (pets) {
        setPet({
            id: pets.id,
            name: pets.name,
            species: pets.species as 'Dog' | 'Cat',
            breed: pets.breed,
            age: pets.age,
            gender: pets.gender as 'Male' | 'Female',
            photoUrl: pets.photo_url
        });
        
        // If we found a pet, fetch its records
        fetchHealthRecords(pets.id);
        fetchWeightRecords(pets.id);
        setView(ViewState.DASHBOARD);
      } else {
        // Logged in but no pet -> Go to Pet Creation
        setView(ViewState.PET_ID);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchHealthRecords = async (petId: string) => {
    const { data } = await supabase.from('health_records').select('*').eq('pet_id', petId);
    if (data) {
        setHealthRecords(data.map(r => ({
            id: r.id,
            date: r.date,
            type: r.type,
            title: r.title,
            note: r.note
        })));
    }
  };

  const fetchWeightRecords = async (petId: string) => {
    const { data } = await supabase.from('weight_records').select('*').eq('pet_id', petId);
    if (data) {
        setWeightRecords(data.map(r => ({
            id: r.id,
            date: r.date,
            weight: r.weight,
            note: r.note
        })));
    }
  };

  const fetchPosts = async () => {
    // Need current session to determine isUserPost
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    
    // Updated query to be more explicit about nested resources
    // Using standard relationship names derived from Foreign Keys
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            profiles (full_name),
            comments (
                id,
                text,
                created_at,
                profiles (full_name)
            )
        `)
        .order('created_at', { ascending: false });
    
    if (data) {
        const formattedPosts: Post[] = data.map((p: any) => ({
            id: p.id,
            user: p.profiles?.full_name || 'Unknown User',
            petName: p.pet_name,
            breedTag: p.breed_tag,
            imageUrl: p.image_url,
            caption: p.caption,
            likes: p.likes_count || 0,
            isLiked: false, 
            commentsList: p.comments ? p.comments.map((c: any) => ({
                id: c.id,
                user: c.profiles?.full_name || 'Unknown',
                text: c.text,
                timestamp: new Date(c.created_at).getTime()
            })).sort((a: any, b: any) => a.timestamp - b.timestamp) : [],
            timestamp: new Date(p.created_at).getTime(),
            isUserPost: currentSession ? p.user_id === currentSession.user.id : false
        }));
        setPosts(formattedPosts);
    } else {
      if (error) {
        // Detailed error logging to see the object content
        console.error("Error fetching posts:", JSON.stringify(error, null, 2));
      }
    }
  };

  // --- Auth Handlers ---

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
        if (authMode === 'signup') {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName }
                }
            });
            if (error) throw error;
            // Auto login usually happens, handled by onAuthStateChange
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
        }
    } catch (err: any) {
        setAuthError(err.message);
        setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setPet(null);
    setView(ViewState.WELCOME);
  };

  // --- App Logic Handlers ---

  const handleLanguageSelect = (selectedLang: Language) => {
    setLang(selectedLang);
    setView(ViewState.WELCOME);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setTempImage(base64);
      setIsAnalyzing(true);
      
      const result = await identifyPetFromImage(base64);
      setTempSpecies(result.species);
      setTempBreed(result.breed);
      setIsAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  const completeRegistration = async () => {
    if (!tempImage || !petName || !petAge || !session) return;
    setAuthLoading(true);

    try {
        // Upload image to Supabase Storage first
        let photoUrl = tempImage;
        const uploadedUrl = await uploadImage('profiles', tempImage);
        if (uploadedUrl) photoUrl = uploadedUrl;

        const { data, error } = await supabase
            .from('pets')
            .insert({
                owner_id: session.user.id,
                name: petName,
                species: tempSpecies,
                breed: tempBreed,
                age: Number(petAge),
                gender: petGender,
                photo_url: photoUrl
            })
            .select()
            .single();

        if (error) throw error;

        if (data) {
            setPet({
                id: data.id,
                name: data.name,
                age: data.age,
                gender: data.gender as 'Male' | 'Female',
                species: data.species as 'Dog' | 'Cat',
                breed: data.breed,
                photoUrl: data.photo_url
            });
            setView(ViewState.DASHBOARD);
        }
    } catch (e: any) {
        console.error("Error creating pet:", e);
        alert("Failed to create profile. " + e.message);
    } finally {
        setAuthLoading(false);
    }
  };

  const handleDashboardPhotoUpdate = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !pet) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      
      // Optimistic update
      setPet({ ...pet, photoUrl: base64 });

      // Upload to Storage
      const publicUrl = await uploadImage('profiles', base64);
      
      if (publicUrl) {
         // Update DB with valid URL
         setPet({ ...pet, photoUrl: publicUrl });
         await supabase
          .from('pets')
          .update({ photo_url: publicUrl })
          .eq('id', pet.id);
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Data update handlers passed to components ---

  const handleSaveHealthRecord = async (allRecords: HealthRecord[]) => {
      // Logic to find new or modified records
      const newRecord = allRecords.find(r => !healthRecords.find(old => old.id === r.id));
      const modifiedRecord = allRecords.find(r => {
          const old = healthRecords.find(o => o.id === r.id);
          return old && (old.title !== r.title || old.note !== r.note || old.date !== r.date);
      });

      if (newRecord) {
          await supabase.from('health_records').insert({
              pet_id: pet?.id,
              type: newRecord.type,
              title: newRecord.title,
              date: newRecord.date,
              note: newRecord.note
          });
      } else if (modifiedRecord) {
           await supabase.from('health_records').update({
              type: modifiedRecord.type,
              title: modifiedRecord.title,
              date: modifiedRecord.date,
              note: modifiedRecord.note
          }).eq('id', modifiedRecord.id);
      }
      
      if (pet) fetchHealthRecords(pet.id);
  };

  const handleDeleteHealthRecord = async (id: string) => {
      await supabase.from('health_records').delete().eq('id', id);
      if (pet) fetchHealthRecords(pet.id);
  };

  const handleSaveWeightRecord = async (allRecords: WeightRecord[]) => {
       const newRecord = allRecords.find(r => !weightRecords.find(old => old.id === r.id));
       const modifiedRecord = allRecords.find(r => {
          const old = weightRecords.find(o => o.id === r.id);
          return old && (old.weight !== r.weight || old.note !== r.note || old.date !== r.date);
      });

      if (newRecord) {
          await supabase.from('weight_records').insert({
              pet_id: pet?.id,
              weight: newRecord.weight,
              date: newRecord.date,
              note: newRecord.note
          });
      } else if (modifiedRecord) {
           await supabase.from('weight_records').update({
              weight: modifiedRecord.weight,
              date: modifiedRecord.date,
              note: modifiedRecord.note
          }).eq('id', modifiedRecord.id);
      }
      if (pet) fetchWeightRecords(pet.id);
  };

  const handleDeleteWeightRecord = async (id: string) => {
      await supabase.from('weight_records').delete().eq('id', id);
      if (pet) fetchWeightRecords(pet.id);
  };

  const handleUpdatePosts = async (updatedPosts: Post[]) => {
      // 1. Apply Optimistic Update Immediately
      setPosts(updatedPosts);
      
      // 2. Fetch fresh data to ensure consistency (e.g. real IDs for comments)
      // We debounce or just let it happen in background
      fetchPosts();
  };


  // --- Render Helpers ---

  const renderView = () => {
    switch (view) {
      case ViewState.LANGUAGE_SELECT:
        return (
          <div className="h-screen w-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#FF6FD8] to-[#6F9EFF] text-white">
            <PetCareLogo />
            <h1 className="text-4xl font-bold mb-2 text-center tracking-tight drop-shadow-sm">PetCare Hub</h1>
            <p className="mb-12 text-center opacity-90 font-medium">Choose your language / Επίλεξε γλώσσα</p>
            
            <div className="flex flex-col gap-4 w-full max-w-xs animate-slide-up">
              <button 
                onClick={() => handleLanguageSelect('en')}
                className="bg-white text-gray-800 py-4 px-6 rounded-2xl font-bold shadow-lg flex items-center gap-4 hover:bg-gray-50 transition transform hover:-translate-y-1 active:scale-95 group"
              >
                <img src="https://flagcdn.com/w80/gb.png" alt="English" className="w-10 h-7 object-cover rounded-md shadow-sm border border-gray-100" />
                <span className="text-lg">English</span>
              </button>
              <button 
                onClick={() => handleLanguageSelect('el')}
                className="bg-white text-gray-800 py-4 px-6 rounded-2xl font-bold shadow-lg flex items-center gap-4 hover:bg-gray-50 transition transform hover:-translate-y-1 active:scale-95 group"
              >
                 <img src="https://flagcdn.com/w80/gr.png" alt="Ελληνικά" className="w-10 h-7 object-cover rounded-md shadow-sm border border-gray-100" />
                <span className="text-lg">Ελληνικά</span>
              </button>
            </div>
          </div>
        );

      case ViewState.WELCOME:
        return (
          <div className="h-screen w-full flex flex-col items-center justify-center p-8 relative overflow-hidden bg-white">
            <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>

            <div className="z-10 text-center w-full max-w-xs">
              <div className="mb-6 inline-flex p-4 bg-gradient-to-br from-[#FF6FD8] to-[#6F9EFF] rounded-3xl shadow-xl">
                <Dog size={56} color="white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('app.title', lang)}</h1>
              
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-gray-100 mt-6 w-full">
                  <h3 className="text-lg font-bold text-gray-700 mb-4">
                      {authMode === 'login' ? (lang === 'el' ? 'Σύνδεση' : 'Welcome Back') : (lang === 'el' ? 'Δημιουργία Λογαριασμού' : 'Create Account')}
                  </h3>
                  
                  {authError && (
                      <div className="mb-4 p-3 bg-red-50 text-red-500 text-xs rounded-xl text-left">
                          {authError}
                      </div>
                  )}

                  <form onSubmit={handleAuth} className="space-y-3">
                      {authMode === 'signup' && (
                           <div className="relative">
                              <UserIcon className="absolute left-3 top-3.5 text-gray-400" size={18} />
                              <input 
                                  type="text" 
                                  placeholder={lang === 'el' ? "Ονοματεπώνυμο" : "Full Name"}
                                  value={fullName}
                                  onChange={(e) => setFullName(e.target.value)}
                                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                                  required
                              />
                           </div>
                      )}
                      <div className="relative">
                          <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                          <input 
                              type="email" 
                              placeholder="Email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                              required
                          />
                      </div>
                      <div className="relative">
                          <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                          <input 
                              type="password" 
                              placeholder={lang === 'el' ? "Κωδικός" : "Password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                              required
                          />
                      </div>

                      <button 
                        type="submit" 
                        disabled={authLoading}
                        className="w-full bg-black text-white py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
                      >
                         {authLoading && <Loader2 size={16} className="animate-spin" />}
                         {authMode === 'login' ? (lang === 'el' ? 'Είσοδος' : 'Sign In') : (lang === 'el' ? 'Εγγραφή' : 'Sign Up')}
                      </button>
                  </form>

                  <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                      {authMode === 'login' ? (lang === 'el' ? 'Δεν έχεις λογαριασμό;' : "Don't have an account?") : (lang === 'el' ? 'Έχεις ήδη λογαριασμό;' : "Already have an account?")}
                      <button 
                        onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(null); }}
                        className="ml-1 font-bold text-purple-600 hover:underline"
                      >
                          {authMode === 'login' ? (lang === 'el' ? 'Εγγραφή' : 'Sign Up') : (lang === 'el' ? 'Σύνδεση' : 'Log In')}
                      </button>
                  </div>
              </div>
            </div>
          </div>
        );

      case ViewState.PET_ID:
        return (
          <div className="h-screen w-full bg-gray-50 flex flex-col p-6 overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-2">{t('petid.title', lang)}</h2>
            <p className="text-gray-500 mb-8">{t('petid.subtitle', lang)}</p>

            <div className="flex-1 flex flex-col items-center">
              <div 
                className="w-full max-w-sm aspect-[4/3] bg-white border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer relative overflow-hidden shadow-sm hover:border-purple-400 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                {tempImage ? (
                  <img src={tempImage} alt="Pet" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4 text-purple-500">
                      <Camera size={32} />
                    </div>
                    <p className="font-medium text-gray-600">{t('petid.takePhoto', lang)}</p>
                  </>
                )}
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
              </div>

              {isAnalyzing && <div className="mt-6 flex items-center gap-3 text-purple-600 font-medium animate-pulse">{t('loading.analyzing', lang)}</div>}

              {!isAnalyzing && tempImage && (
                <div className="w-full max-w-sm mt-8 space-y-4 animate-fade-in">
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-2xl border border-purple-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">{t('petid.identified', lang)}</p>
                      <p className="text-lg font-bold text-gray-800">{tempSpecies} • {tempBreed}</p>
                    </div>
                    <div className="bg-white p-2 rounded-full shadow-sm"><Check size={20} className="text-green-500" /></div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">{t('petid.name', lang)}</label>
                    <input type="text" value={petName} onChange={(e) => setPetName(e.target.value)} className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">{t('petid.age', lang)}</label>
                      <input type="number" value={petAge} onChange={(e) => setPetAge(e.target.value)} className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-medium" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">{t('petid.gender', lang)}</label>
                      <div className="flex bg-white rounded-xl border border-gray-200 p-1">
                        <button onClick={() => setPetGender('Male')} className={`flex-1 py-3 rounded-lg font-medium text-sm transition ${petGender === 'Male' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-400'}`}>{t('petid.male', lang)}</button>
                        <button onClick={() => setPetGender('Female')} className={`flex-1 py-3 rounded-lg font-medium text-sm transition ${petGender === 'Female' ? 'bg-pink-50 text-pink-600 shadow-sm' : 'text-gray-400'}`}>{t('petid.female', lang)}</button>
                      </div>
                    </div>
                  </div>

                  <button onClick={completeRegistration} disabled={!petName || !petAge || authLoading} className="w-full mt-8 bg-gradient-to-r from-[#FF6FD8] to-[#6F9EFF] text-white py-4 rounded-2xl font-bold shadow-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {authLoading ? <Loader2 className="animate-spin mx-auto" /> : t('petid.create', lang)}
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case ViewState.DASHBOARD:
        return (
          <div className="h-screen bg-gray-50 flex flex-col pb-20 relative">
             {/* Header Component */}
            <div className="relative pt-4 pb-6 px-4 rounded-b-[2rem] shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF6FD8] to-[#6F9EFF]"></div>
              <div className="relative z-10 flex flex-col items-center">
                
                {/* Updated Image Container - Smaller Compact Size */}
                <div className="relative mb-3 group">
                  <div 
                    onClick={() => dashboardFileInputRef.current?.click()}
                    className="w-32 h-20 rounded-[1.5rem] border-2 border-white/90 shadow-xl overflow-hidden shrink-0 cursor-pointer active:scale-95 transition-transform"
                  >
                    {pet?.photoUrl && <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="text-white drop-shadow-md opacity-80" size={20} />
                    </div>
                  </div>

                  <button 
                    onClick={() => dashboardFileInputRef.current?.click()}
                    className="absolute bottom-0 -right-2 bg-white text-purple-600 p-1.5 rounded-full shadow-lg border border-purple-50 hover:bg-gray-50 transition active:scale-90 z-20"
                    title="Change Photo"
                  >
                    <Edit2 size={12} />
                  </button>
                  
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={dashboardFileInputRef} 
                    className="hidden"
                    onChange={handleDashboardPhotoUpdate}
                  />
                </div>

                {/* Name and Breed Side-by-Side */}
                <div className="flex items-center gap-3 mb-3">
                   <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">{pet?.name}</h1>
                   <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 shadow-sm">
                      <span className="text-sm">{pet?.species === 'Dog' ? '🐶' : '🐱'}</span>
                      <span className="text-white font-medium text-xs tracking-wide">{pet?.breed}</span>
                   </div>
                </div>

                {/* AI Chat Trigger - Compact */}
                <button 
                  onClick={() => setView(ViewState.AI_CHAT)}
                  className="w-full max-w-xs bg-white/25 backdrop-blur-md border border-white/50 text-white py-2 px-3 rounded-xl flex items-center gap-2 shadow-lg hover:bg-white/35 transition group"
                >
                  <div className="p-1.5 bg-white rounded-full text-purple-500 shadow-sm group-hover:scale-110 transition">
                    <Sparkles size={14} fill="currentColor" />
                  </div>
                  <span className="text-xs font-bold opacity-100 truncate flex-1 text-left">{t('chat.trigger', lang, { name: pet?.name || 'Pet' })}</span>
                </button>
              </div>
            </div>

            {/* Grid Menu */}
            <div className="flex-1 overflow-y-auto px-4 -mt-6 z-20 pb-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <DashboardCard title={t('home.healthLog', lang)} icon={<HeartPulse size={52} className="text-white" />} colorFrom="#9C00FF" colorTo="#5200A3" onClick={() => setView(ViewState.HEALTH_LOG)} />
                <DashboardCard title={t('home.breedInfo', lang)} icon={<Dna size={52} className="text-white" />} colorFrom="#0CE7FA" colorTo="#0661F5" onClick={() => setView(ViewState.BREED_INFO)} />
                <DashboardCard title={t('home.training', lang)} icon={<GraduationCap size={52} className="text-white" />} colorFrom="#3FD37F" colorTo="#0A9B4A" onClick={() => setView(ViewState.TRAINING)} />
                <DashboardCard title={t('home.nutrition', lang)} icon={<Utensils size={52} className="text-white" />} colorFrom="#FFBA53" colorTo="#FF8A00" onClick={() => setView(ViewState.NUTRITION)} />
                <DashboardCard title={t('home.specialTraits', lang)} icon={<Sparkles size={52} className="text-white" />} colorFrom="#FF6EE0" colorTo="#B966F7" onClick={() => setView(ViewState.SPECIAL_TRAITS)} />
                <DashboardCard title={t('home.activityIdeas', lang)} icon={<Zap size={52} className="text-white" fill="currentColor" />} colorFrom="#A1E9FF" colorTo="#33C3FF" onClick={() => setView(ViewState.ACTIVITY_IDEAS)} />
                <DashboardCard title={t('home.vetTips', lang)} icon={<Stethoscope size={52} className="text-white" />} colorFrom="#FF7373" colorTo="#FF006E" onClick={() => setView(ViewState.VET_TIPS)} />
                <DashboardCard title={t('home.community', lang)} icon={<MessageCircle size={52} className="text-white" />} colorFrom="#F15AE5" colorTo="#8456FF" onClick={() => setView(ViewState.COMMUNITY)} />
              </div>
            </div>
          </div>
        );

      case ViewState.BREED_INFO:
        return <InfoView title="home.breedInfo" colorFrom="#0CE7FA" colorTo="#0661F5" pet={pet!} lang={lang} onBack={() => setView(ViewState.DASHBOARD)} />;
      case ViewState.TRAINING:
        return <TrainingView pet={pet!} lang={lang} onBack={() => setView(ViewState.DASHBOARD)} />;
      case ViewState.NUTRITION:
        return <NutritionView pet={pet!} lang={lang} onBack={() => setView(ViewState.DASHBOARD)} />;
      case ViewState.SPECIAL_TRAITS:
        return <InfoView title="home.specialTraits" colorFrom="#FF6EE0" colorTo="#B966F7" pet={pet!} lang={lang} onBack={() => setView(ViewState.DASHBOARD)} />;
      case ViewState.ACTIVITY_IDEAS:
         return <InfoView title="home.activityIdeas" colorFrom="#A1E9FF" colorTo="#33C3FF" pet={pet!} lang={lang} onBack={() => setView(ViewState.DASHBOARD)} />;
      case ViewState.VET_TIPS:
         return <InfoView title="home.vetTips" colorFrom="#FF7373" colorTo="#FF006E" pet={pet!} lang={lang} onBack={() => setView(ViewState.DASHBOARD)} />;
      case ViewState.HEALTH_LOG:
         return (
           <HealthLog 
             pet={pet!} 
             lang={lang} 
             records={healthRecords}
             weightRecords={weightRecords}
             onUpdateRecords={handleSaveHealthRecord}
             onUpdateWeightRecords={handleSaveWeightRecord}
             onDeleteRecord={handleDeleteHealthRecord}
             onDeleteWeight={handleDeleteWeightRecord}
             onBack={() => setView(ViewState.DASHBOARD)} 
           />
         );
      case ViewState.AI_CHAT:
        return <AIChat pet={pet!} lang={lang} onBack={() => setView(ViewState.DASHBOARD)} />;
      case ViewState.COMMUNITY:
        return <Community pet={pet!} lang={lang} globalPosts={posts} onUpdatePosts={handleUpdatePosts} />;
      case ViewState.LEGAL:
        return <LegalView lang={lang} onBack={() => setView(ViewState.PROFILE)} />;
      case ViewState.PROFILE:
        return (
          <div className="h-screen flex flex-col bg-gray-50 pb-24">
             <div className="bg-white p-6 pt-12 shadow-sm">
               <h2 className="text-2xl font-bold text-gray-800">{t('profile.title', lang)}</h2>
             </div>
             <div className="p-6 space-y-6 flex-1 overflow-y-auto">
               <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                 <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                   {session?.user.email?.[0].toUpperCase() || <Users size={32} />}
                 </div>
                 <div className="overflow-hidden">
                   <h3 className="font-bold text-lg truncate">{session?.user.user_metadata?.full_name || 'User'}</h3>
                   <p className="text-gray-500 text-sm truncate">{session?.user.email}</p>
                 </div>
               </div>

               <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="text-purple-500" />
                    <span className="font-medium text-gray-700">{t('profile.changeLang', lang)}</span>
                  </div>
                  <select 
                    value={lang}
                    onChange={(e) => setLang(e.target.value as Language)}
                    className="bg-gray-100 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 outline-none"
                  >
                    <option value="en">English 🇬🇧</option>
                    <option value="el">Ελληνικά 🇬🇷</option>
                  </select>
               </div>

               <button 
                 onClick={() => setView(ViewState.LEGAL)}
                 className="w-full bg-white rounded-2xl shadow-sm overflow-hidden p-4 flex items-center justify-between hover:bg-gray-50 transition"
               >
                  <div className="flex items-center gap-3">
                    <Scale className="text-blue-500" />
                    <span className="font-medium text-gray-700">{t('profile.legal', lang)}</span>
                  </div>
               </button>

               <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                 <div className="p-4 border-b border-gray-100 font-medium text-gray-700">{t('profile.petDetails', lang)}</div>
                 <div className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('petid.name', lang)}</span>
                      <span className="font-medium">{pet?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('petid.identified', lang)}</span>
                      <span className="font-medium">{pet?.breed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('petid.age', lang)}</span>
                      <span className="font-medium">{pet?.age}</span>
                    </div>
                 </div>
               </div>

               <button 
                 onClick={handleLogout}
                 className="w-full py-4 text-red-500 font-medium bg-white rounded-2xl shadow-sm hover:bg-red-50 flex items-center justify-center gap-2"
               >
                 <LogOut size={20} />
                 {t('profile.logout', lang)}
               </button>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="font-sans text-gray-900 max-w-md mx-auto bg-white min-h-screen shadow-2xl overflow-hidden relative">
      {renderView()}

      {/* Bottom Nav */}
      {pet && view !== ViewState.PET_ID && view !== ViewState.WELCOME && view !== ViewState.LANGUAGE_SELECT && view !== ViewState.AI_CHAT && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex justify-around items-center py-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <NavButton 
            icon={<HomeIcon size={18} />} 
            label={t('nav.home', lang)} 
            active={view === ViewState.DASHBOARD || [ViewState.BREED_INFO, ViewState.TRAINING, ViewState.NUTRITION, ViewState.SPECIAL_TRAITS, ViewState.ACTIVITY_IDEAS, ViewState.VET_TIPS, ViewState.HEALTH_LOG].includes(view)} 
            onClick={() => setView(ViewState.DASHBOARD)} 
          />
          <NavButton 
            icon={<Users size={18} />} 
            label={t('nav.community', lang)} 
            active={view === ViewState.COMMUNITY} 
            onClick={() => setView(ViewState.COMMUNITY)} 
          />
          <NavButton 
            icon={<UserIcon size={18} />} 
            label={t('nav.profile', lang)} 
            active={view === ViewState.PROFILE || view === ViewState.LEGAL} 
            onClick={() => setView(ViewState.PROFILE)} 
          />
        </div>
      )}
    </div>
  );
};

// Helper Components
const DashboardCard: React.FC<{ title: string, icon: React.ReactNode, colorFrom: string, colorTo: string, onClick: () => void }> = ({ title, icon, colorFrom, colorTo, onClick }) => (
  <button 
    onClick={onClick}
    className="rounded-[2rem] p-4 h-48 flex flex-col items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 relative overflow-hidden group border border-white/10"
    style={{ background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})` }}
  >
    <div className="bg-white/20 w-24 h-24 rounded-[1.5rem] flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition duration-300 shadow-inner border border-white/20 text-white">
      {icon}
    </div>
    <div className="text-center z-10 relative px-2">
      <span className="text-white font-bold text-lg leading-tight block tracking-wide drop-shadow-sm">{title}</span>
    </div>
    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition"></div>
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/10 to-transparent opacity-40 rounded-bl-[4rem]"></div>
  </button>
);

const NavButton: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-0.5 transition p-2 ${active ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default App;
