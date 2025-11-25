
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { generatePetContent } from '../services/geminiService';
import { Pet, Language } from '../types';
import { t } from '../services/translations';

interface InfoViewProps {
  title: string;
  colorFrom: string;
  colorTo: string;
  pet: Pet;
  lang: Language;
  onBack: () => void;
}

const InfoView: React.FC<InfoViewProps> = ({ title, colorFrom, colorTo, pet, lang, onBack }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      const result = await generatePetContent(pet, title, lang);
      if (isMounted) {
        setContent(result);
        setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [pet, title, lang]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div 
        className={`p-6 pb-12 rounded-b-3xl shadow-lg text-white relative`}
        style={{ background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})` }}
      >
        <button 
          onClick={onBack}
          className="absolute top-6 left-4 p-2 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-3xl font-bold mt-8 text-center">{t(title, lang)}</h2>
        <p className="text-center opacity-90 mt-1 text-sm">Personalized for {pet.name}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 -mt-6 pb-28">
        <div className="bg-white rounded-3xl p-6 shadow-sm min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Loader2 size={48} className="animate-spin mb-4" style={{ color: colorFrom }} />
              <p>{t('loading.ai', lang)}</p>
            </div>
          ) : (
            <div className="prose prose-sm sm:prose max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-li:text-gray-600">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoView;
