
import React, { useState } from 'react';
import { Pet, Language, TrainingGuide } from '../types';
import { ChevronLeft, Loader2, Megaphone, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import { t } from '../services/translations';
import { generateTrainingGuide } from '../services/geminiService';

interface TrainingViewProps {
  pet: Pet;
  lang: Language;
  onBack: () => void;
}

const TrainingView: React.FC<TrainingViewProps> = ({ pet, lang, onBack }) => {
  const [selectedCommand, setSelectedCommand] = useState<string | null>(null);
  const [guide, setGuide] = useState<TrainingGuide | null>(null);
  const [loading, setLoading] = useState(false);

  const dogCommands = [
    { key: 'sit', label: t('cmd.sit', lang) },
    { key: 'stay', label: t('cmd.stay', lang) },
    { key: 'come', label: t('cmd.come', lang) },
    { key: 'down', label: t('cmd.down', lang) },
    { key: 'heel', label: t('cmd.heel', lang) },
    { key: 'leaveit', label: t('cmd.leaveit', lang) },
    { key: 'fetch', label: t('cmd.fetch', lang) },
    { key: 'crate', label: t('cmd.crate', lang) },
    { key: 'social', label: t('cmd.social', lang) },
    { key: 'potty', label: t('cmd.potty', lang) },
  ];

  const catCommands = [
    { key: 'sit', label: t('cmd.sit', lang) },
    { key: 'litter', label: t('cmd.litter', lang) },
    { key: 'come', label: t('cmd.come', lang) },
    { key: 'carrier', label: t('cmd.crate', lang) },
    { key: 'social', label: t('cmd.social', lang) },
  ];

  const commands = pet.species === 'Cat' ? catCommands : dogCommands;

  const handleCommandClick = async (cmd: { key: string, label: string }) => {
    setSelectedCommand(cmd.label);
    setLoading(true);
    const result = await generateTrainingGuide(pet, cmd.label, lang);
    setGuide(result);
    setLoading(false);
  };

  // --- Detail View ---
  if (selectedCommand) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
         {/* Header */}
        <div className="bg-gradient-to-r from-[#3FD37F] to-[#0A9B4A] p-6 pb-10 rounded-b-3xl shadow-lg text-white relative">
          <button 
            onClick={() => { setSelectedCommand(null); setGuide(null); }}
            className="absolute top-6 left-4 p-2 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="mt-8 text-center">
            <h2 className="text-3xl font-bold">{selectedCommand}</h2>
            <p className="text-white/80 text-sm mt-1">{pet.name} - {pet.breed}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 -mt-6 space-y-4">
          {loading ? (
            <div className="bg-white rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-green-600">
              <Loader2 size={48} className="animate-spin mb-4" />
              <p>{t('loading.ai', lang)}</p>
            </div>
          ) : guide ? (
            <>
              {/* Goal & Requirements */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <p className="text-gray-600 italic mb-4 text-center border-b pb-4">"{guide.goal}"</p>
                
                <h3 className="font-bold text-green-700 flex items-center gap-2 mb-3">
                  <ShoppingBag size={20} />
                  {t('training.req', lang)}
                </h3>
                <ul className="grid grid-cols-2 gap-2">
                  {guide.requirements.map((req, i) => (
                    <li key={i} className="bg-green-50 text-green-800 text-sm px-3 py-2 rounded-lg text-center font-medium">
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Steps */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                   <CheckCircle2 size={20} className="text-green-600" />
                   {t('training.steps', lang)}
                </h3>
                <div className="space-y-6 relative pl-2">
                  {/* Line */}
                  <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-green-100"></div>
                  
                  {guide.steps.map((step, i) => (
                    <div key={i} className="relative flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold shrink-0 z-10 border-2 border-white shadow-sm">
                        {i + 1}
                      </div>
                      <p className="text-gray-700 text-sm pt-2 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-red-50 rounded-3xl p-6 shadow-sm border border-red-100">
                <h3 className="font-bold text-red-600 mb-3 flex items-center gap-2">
                   <AlertCircle size={20} />
                   {t('training.tips', lang)}
                </h3>
                <ul className="space-y-2">
                  {guide.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-red-400">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
             <div className="p-4 text-center text-gray-500">Error loading guide.</div>
          )}
        </div>
      </div>
    );
  }

  // --- List View ---
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#3FD37F] to-[#0A9B4A] p-6 pb-10 rounded-b-3xl shadow-lg text-white relative">
        <button 
          onClick={onBack}
          className="absolute top-6 left-4 p-2 bg-white/20 rounded-full backdrop-blur-sm"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex justify-center items-center gap-2 mt-8">
           <Megaphone size={28} />
           <h2 className="text-3xl font-bold">{t('home.training', lang)}</h2>
        </div>
        <p className="text-center opacity-90 mt-1 text-sm">{t('training.subtitle', lang)} {pet.name}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 -mt-6 grid grid-cols-1 gap-3">
        <h3 className="text-gray-500 font-semibold px-2 text-sm uppercase tracking-wider mt-2">{t('training.listTitle', lang)}</h3>
        
        {commands.map((cmd) => (
          <button
            key={cmd.key}
            onClick={() => handleCommandClick(cmd)}
            className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between hover:shadow-md transition group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold text-sm group-hover:bg-green-100 transition">
                 {cmd.label.charAt(0)}
              </div>
              <span className="font-semibold text-gray-800">{cmd.label}</span>
            </div>
            <ChevronLeft size={20} className="text-gray-300 rotate-180 group-hover:text-green-500 transition" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default TrainingView;
