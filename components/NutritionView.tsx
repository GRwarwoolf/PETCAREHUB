
import React, { useState } from 'react';
import { Pet, Language } from '../types';
import { ChevronLeft, BookOpen, Utensils } from 'lucide-react';
import { t } from '../services/translations';
import InfoView from './InfoView';

interface NutritionViewProps {
  pet: Pet;
  lang: Language;
  onBack: () => void;
}

type SubView = 'MENU' | 'GENERAL' | 'RECIPES';

const NutritionView: React.FC<NutritionViewProps> = ({ pet, lang, onBack }) => {
  const [subView, setSubView] = useState<SubView>('MENU');

  if (subView === 'GENERAL') {
    return (
      <InfoView 
        title="nutrition.general.title" 
        colorFrom="#FFBA53" 
        colorTo="#FF8A00" 
        pet={pet} 
        lang={lang} 
        onBack={() => setSubView('MENU')} 
      />
    );
  }

  if (subView === 'RECIPES') {
    return (
      <InfoView 
        title="nutrition.recipes.title" 
        colorFrom="#FF9B53" 
        colorTo="#FF5353" 
        pet={pet} 
        lang={lang} 
        onBack={() => setSubView('MENU')} 
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FFBA53] to-[#FF8A00] p-6 pb-10 rounded-b-3xl shadow-lg text-white relative">
        <button 
          onClick={onBack}
          className="absolute top-6 left-4 p-2 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-3xl font-bold mt-8 text-center">{t('home.nutrition', lang)}</h2>
        <p className="text-center opacity-90 mt-1 text-sm">{pet.name}'s Diet</p>
      </div>

      {/* Menu Options */}
      <div className="flex-1 overflow-y-auto p-6 -mt-6 space-y-6">
        
        {/* General Guidelines Button */}
        <button 
          onClick={() => setSubView('GENERAL')}
          className="w-full bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition transform active:scale-98 text-left flex items-center gap-6 group"
        >
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 group-hover:scale-110 transition">
            <BookOpen size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">{t('nutrition.menu.general', lang)}</h3>
            <p className="text-sm text-gray-500">Balanced diet, portions, and prohibited foods.</p>
          </div>
        </button>

        {/* Recipes Button */}
        <button 
          onClick={() => setSubView('RECIPES')}
          className="w-full bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition transform active:scale-98 text-left flex items-center gap-6 group"
        >
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-500 group-hover:scale-110 transition">
            <Utensils size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">{t('nutrition.menu.recipes', lang)}</h3>
            <p className="text-sm text-gray-500">Healthy homemade meals, treats, and cooking ideas.</p>
          </div>
        </button>

      </div>
    </div>
  );
};

export default NutritionView;
