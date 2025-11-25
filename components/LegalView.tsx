
import React, { useState } from 'react';
import { Language } from '../types';
import { ChevronLeft, FileText, Shield, Cookie } from 'lucide-react';
import { t } from '../services/translations';

interface LegalViewProps {
  lang: Language;
  onBack: () => void;
}

type LegalPage = 'MENU' | 'PRIVACY' | 'TERMS' | 'COOKIES';

const LegalView: React.FC<LegalViewProps> = ({ lang, onBack }) => {
  const [page, setPage] = useState<LegalPage>('MENU');

  const content = {
    en: {
      PRIVACY: (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800">1. Data Collection</h3>
          <p>We collect information you provide directly within the app, such as pet photos, names, ages, health records, and chat messages. This data is primarily stored locally on your device.</p>
          
          <h3 className="font-bold text-gray-800">2. Use of AI Services</h3>
          <p>To provide features like breed identification and chat advice, we send user-provided text and images to the Google Gemini API. We do not claim ownership of the content you generate.</p>
          
          <h3 className="font-bold text-gray-800">3. Data Storage</h3>
          <p>Your pet's profile and history are stored in your device's LocalStorage. If you clear your browser cache or delete the app, this data may be lost unless backed up.</p>
          
          <h3 className="font-bold text-gray-800">4. Third-Party Services</h3>
          <p>We utilize third-party services (Google Gemini) for AI processing. Their privacy policies apply to data processed by their servers.</p>
        </div>
      ),
      TERMS: (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-800 font-medium">
            <strong>IMPORTANT DISCLAIMER:</strong> This application uses Artificial Intelligence to provide information. It is <u>NOT</u> a substitute for professional veterinary advice, diagnosis, or treatment. Always seek the advice of your veterinarian with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on this application.
          </div>

          <h3 className="font-bold text-gray-800">1. Acceptance of Terms</h3>
          <p>By using PetCare Hub, you agree to these terms. If you do not agree, please do not use the application.</p>

          <h3 className="font-bold text-gray-800">2. No Warranty ("As Is")</h3>
          <p>The Application is provided on an "AS IS" and "AS AVAILABLE" basis. The developers make no representations or warranties of any kind, express or implied, regarding the accuracy, reliability, or completeness of the AI-generated content.</p>

          <h3 className="font-bold text-gray-800">3. Limitation of Liability</h3>
          <p>TO THE FULLEST EXTENT PERMITTED BY LAW, THE DEVELOPERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, DATA, OR OTHER INTANGIBLES, OR FOR ANY HARM TO PETS OR ANIMALS RESULTING FROM THE USE OF THIS APPLICATION.</p>

          <h3 className="font-bold text-gray-800">4. AI Limitations</h3>
          <p>You acknowledge that AI can "hallucinate" or provide incorrect information. You agree to verify any important information independently.</p>
        </div>
      ),
      COOKIES: (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800">1. Local Storage</h3>
          <p>This application uses "LocalStorage" technology to save your preferences, pet profiles, and health logs directly on your device. This allows the app to function without requiring a traditional login server.</p>
          
          <h3 className="font-bold text-gray-800">2. Necessary Operation</h3>
          <p>These storage mechanisms are strictly necessary for the application to function as intended (e.g., remembering your pet's name). We do not use tracking cookies for advertising purposes.</p>
        </div>
      )
    },
    el: {
      PRIVACY: (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800">1. Συλλογή Δεδομένων</h3>
          <p>Συλλέγουμε πληροφορίες που παρέχετε άμεσα στην εφαρμογή, όπως φωτογραφίες κατοικίδιων, ονόματα, ηλικίες, ιατρικά αρχεία και μηνύματα συνομιλίας. Αυτά τα δεδομένα αποθηκεύονται κυρίως τοπικά στη συσκευή σας.</p>
          
          <h3 className="font-bold text-gray-800">2. Χρήση Υπηρεσιών AI</h3>
          <p>Για την αναγνώριση ράτσας και την παροχή συμβουλών, στέλνουμε κείμενο και εικόνες στο Google Gemini API. Δεν διεκδικούμε ιδιοκτησία στο περιεχόμενο που δημιουργείτε.</p>
          
          <h3 className="font-bold text-gray-800">3. Αποθήκευση Δεδομένων</h3>
          <p>Το προφίλ και το ιστορικό του κατοικίδιου σας αποθηκεύονται στο "LocalStorage" της συσκευής σας. Εάν καθαρίσετε την μνήμη cache ή διαγράψετε την εφαρμογή, τα δεδομένα ενδέχεται να χαθούν.</p>
          
          <h3 className="font-bold text-gray-800">4. Υπηρεσίες Τρίτων</h3>
          <p>Χρησιμοποιούμε υπηρεσίες τρίτων (Google Gemini) για επεξεργασία AI. Οι πολιτικές απορρήτου τους ισχύουν για τα δεδομένα που επεξεργάζονται.</p>
        </div>
      ),
      TERMS: (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-800 font-medium">
            <strong>ΣΗΜΑΝΤΙΚΗ ΑΠΟΠΟΙΗΣΗ:</strong> Αυτή η εφαρμογή χρησιμοποιεί Τεχνητή Νοημοσύνη. <u>ΔΕΝ</u> υποκαθιστά επαγγελματικές κτηνιατρικές συμβουλές, διάγνωση ή θεραπεία. Αναζητάτε πάντα τη συμβουλή του κτηνιάτρου σας για οποιοδήποτε ιατρικό θέμα. Μην αγνοείτε επαγγελματικές συμβουλές λόγω πληροφοριών που διαβάσατε εδώ.
          </div>

          <h3 className="font-bold text-gray-800">1. Αποδοχή Όρων</h3>
          <p>Χρησιμοποιώντας το PetCare Hub, αποδέχεστε τους παρόντες όρους. Εάν δεν συμφωνείτε, παρακαλούμε μην χρησιμοποιείτε την εφαρμογή.</p>

          <h3 className="font-bold text-gray-800">2. Καμία Εγγύηση ("Ως Έχει")</h3>
          <p>Η Εφαρμογή παρέχεται σε βάση "ΩΣ ΕΧΕΙ". Οι δημιουργοί δεν παρέχουν καμία εγγύηση, ρητή ή σιωπηρή, σχετικά με την ακρίβεια, την αξιοπιστία ή την πληρότητα του περιεχομένου που δημιουργείται από το AI.</p>

          <h3 className="font-bold text-gray-800">3. Περιορισμός Ευθύνης</h3>
          <p>ΣΤΟ ΜΕΓΙΣΤΟ ΒΑΘΜΟ ΠΟΥ ΕΠΙΤΡΕΠΕΤΑΙ ΑΠΟ ΤΟ ΝΟΜΟ, ΟΙ ΔΗΜΙΟΥΡΓΟΙ ΔΕΝ ΦΕΡΟΥΝ ΕΥΘΥΝΗ ΓΙΑ ΟΠΟΙΑΔΗΠΟΤΕ ΕΜΜΕΣΗ, ΘΕΤΙΚΗ Ή ΑΠΟΘΕΤΙΚΗ ΖΗΜΙΑ, ΣΥΜΠΕΡΙΛΑΜΒΑΝΟΜΕΝΗΣ ΤΗΣ ΑΠΩΛΕΙΑΣ ΔΕΔΟΜΕΝΩΝ, Ή ΓΙΑ ΟΠΟΙΑΔΗΠΟΤΕ ΒΛΑΒΗ ΣΕ ΚΑΤΟΙΚΙΔΙΑ ΠΟΥ ΠΡΟΚΥΠΤΕΙ ΑΠΟ ΤΗ ΧΡΗΣΗ ΤΗΣ ΕΦΑΡΜΟΓΗΣ.</p>

          <h3 className="font-bold text-gray-800">4. Περιορισμοί AI</h3>
          <p>Αναγνωρίζετε ότι το AI μπορεί να κάνει λάθη ("hallucinations"). Συμφωνείτε να επαληθεύετε ανεξάρτητα οποιαδήποτε σημαντική πληροφορία.</p>
        </div>
      ),
      COOKIES: (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800">1. Τοπική Αποθήκευση (LocalStorage)</h3>
          <p>Αυτή η εφαρμογή χρησιμοποιεί τεχνολογία "LocalStorage" για να αποθηκεύει τις προτιμήσεις σας, τα προφίλ των ζώων και τα ημερολόγια υγείας απευθείας στη συσκευή σας. Αυτό επιτρέπει στην εφαρμογή να λειτουργεί χωρίς σύνδεση σε κεντρικό διακομιστή.</p>
          
          <h3 className="font-bold text-gray-800">2. Αναγκαία Λειτουργία</h3>
          <p>Αυτοί οι μηχανισμοί αποθήκευσης είναι απολύτως απαραίτητοι για τη λειτουργία της εφαρμογής. Δεν χρησιμοποιούμε cookies παρακολούθησης για διαφημιστικούς σκοπούς.</p>
        </div>
      )
    }
  };

  const renderContent = (titleKey: string, contentKey: keyof typeof content['en']) => (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-gray-800 p-6 pb-10 rounded-b-3xl shadow-lg text-white relative">
         <button 
          onClick={() => setPage('MENU')}
          className="absolute top-6 left-4 p-2 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-center mt-8">{t(titleKey, lang)}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6 -mt-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm min-h-[300px] text-gray-600 leading-relaxed">
          {content[lang][contentKey]}
        </div>
      </div>
    </div>
  );

  if (page === 'PRIVACY') return renderContent('legal.privacy', 'PRIVACY');
  if (page === 'TERMS') return renderContent('legal.terms', 'TERMS');
  if (page === 'COOKIES') return renderContent('legal.cookies', 'COOKIES');

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-gray-800 p-6 pb-10 rounded-b-3xl shadow-lg text-white relative">
        <button 
          onClick={onBack}
          className="absolute top-6 left-4 p-2 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-center mt-8">{t('legal.title', lang)}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 -mt-6 space-y-4">
        <button onClick={() => setPage('PRIVACY')} className="w-full bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 hover:bg-gray-50 transition transform active:scale-98">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <Shield size={24} />
          </div>
          <div className="text-left">
             <span className="font-bold text-gray-800 block">{t('legal.privacy', lang)}</span>
             <span className="text-xs text-gray-500">{lang === 'el' ? 'Δεδομένα & Ασφάλεια' : 'Data & Security'}</span>
          </div>
        </button>

        <button onClick={() => setPage('TERMS')} className="w-full bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 hover:bg-gray-50 transition transform active:scale-98">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
            <FileText size={24} />
          </div>
           <div className="text-left">
             <span className="font-bold text-gray-800 block">{t('legal.terms', lang)}</span>
             <span className="text-xs text-gray-500">{lang === 'el' ? 'Όροι & Αποποίηση Ευθύνης' : 'Rules & Disclaimer'}</span>
          </div>
        </button>

        <button onClick={() => setPage('COOKIES')} className="w-full bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 hover:bg-gray-50 transition transform active:scale-98">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
            <Cookie size={24} />
          </div>
           <div className="text-left">
             <span className="font-bold text-gray-800 block">{t('legal.cookies', lang)}</span>
             <span className="text-xs text-gray-500">{lang === 'el' ? 'Τοπική Αποθήκευση' : 'Local Storage'}</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default LegalView;
