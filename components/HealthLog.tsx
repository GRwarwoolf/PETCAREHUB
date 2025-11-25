
import React, { useState, useMemo } from 'react';
import { Pet, HealthRecord, HealthRecordType, Language, WeightRecord } from '../types';
import { ChevronLeft, Activity, Plus, Edit2, Trash2, X, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { t } from '../services/translations';

interface HealthLogProps {
  pet: Pet;
  lang: Language;
  records: HealthRecord[];
  weightRecords: WeightRecord[];
  onUpdateRecords: (records: HealthRecord[]) => void;
  onUpdateWeightRecords: (records: WeightRecord[]) => void;
  onDeleteRecord: (id: string) => void;
  onDeleteWeight: (id: string) => void;
  onBack: () => void;
}

const HealthLog: React.FC<HealthLogProps> = ({ 
  pet, 
  lang, 
  records, 
  weightRecords, 
  onUpdateRecords, 
  onUpdateWeightRecords,
  onDeleteRecord,
  onDeleteWeight,
  onBack 
}) => {
  // Unified Modal State
  const [activeModal, setActiveModal] = useState<'medical' | 'weight' | null>(null);

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, id: string, type: 'medical' | 'weight'}>({
    isOpen: false,
    id: '',
    type: 'medical'
  });

  // Unified Form State
  const [medicalForm, setMedicalForm] = useState<HealthRecord>({
    id: '',
    date: '',
    type: 'Vaccine',
    title: '',
    note: ''
  });

  const [weightForm, setWeightForm] = useState<{id: string, date: string, weight: string, note: string}>({
    id: '',
    date: '',
    weight: '',
    note: ''
  });

  // --- Chart Data ---
  const chartData = useMemo(() => {
    return [...weightRecords]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(r => ({ 
        date: new Date(r.date).toLocaleDateString(lang === 'el' ? 'el-GR' : 'en-US', { month: 'short', day: 'numeric' }), 
        weight: r.weight 
      }));
  }, [weightRecords, lang]);

  // --- Medical Handlers ---

  const handleOpenMedical = (record?: HealthRecord) => {
    if (record) {
      setMedicalForm({ ...record });
    } else {
      setMedicalForm({
        id: '',
        date: new Date().toISOString().split('T')[0],
        type: 'Vaccine',
        title: '',
        note: ''
      });
    }
    setActiveModal('medical');
  };

  const handleSaveMedical = () => {
    if (!medicalForm.title) return;

    if (medicalForm.id) {
      // Edit Mode
      const updated = records.map(r => String(r.id) === String(medicalForm.id) ? medicalForm : r);
      onUpdateRecords(updated);
    } else {
      // Create Mode
      const newRecord = { 
        ...medicalForm, 
        id: Date.now().toString() + Math.random().toString(36).slice(2)
      };
      onUpdateRecords([newRecord, ...records]);
    }
    setActiveModal(null);
  };

  const requestDeleteMedical = (id: string, e?: React.MouseEvent) => {
    // CRITICAL FIX: Stop propagation to prevent parent clicks or unintended behaviors
    e?.stopPropagation();
    e?.preventDefault();
    setDeleteModal({ isOpen: true, id, type: 'medical' });
  };

  // --- Weight Handlers ---

  const handleOpenWeight = (record?: WeightRecord) => {
    if (record) {
      setWeightForm({
        id: record.id,
        date: record.date,
        weight: String(record.weight),
        note: record.note || ''
      });
    } else {
      setWeightForm({
        id: '',
        date: new Date().toISOString().split('T')[0],
        weight: '',
        note: ''
      });
    }
    setActiveModal('weight');
  };

  const handleSaveWeight = () => {
    if (!weightForm.weight) return;

    const newRecord: WeightRecord = {
      id: weightForm.id || (Date.now().toString() + Math.random().toString(36).slice(2)),
      date: weightForm.date,
      weight: parseFloat(weightForm.weight),
      note: weightForm.note
    };

    if (weightForm.id) {
      const updated = weightRecords.map(r => String(r.id) === String(weightForm.id) ? newRecord : r);
      onUpdateWeightRecords(updated);
    } else {
      onUpdateWeightRecords([newRecord, ...weightRecords]);
    }
    setActiveModal(null);
  };

  const requestDeleteWeight = (id: string, e?: React.MouseEvent) => {
    // CRITICAL FIX: Stop propagation here too
    e?.stopPropagation();
    e?.preventDefault();
    setDeleteModal({ isOpen: true, id, type: 'weight' });
  };

  // --- Consolidated Delete Confirm ---
  const handleConfirmDelete = () => {
    if (deleteModal.type === 'medical') {
       onDeleteRecord(deleteModal.id);
       // If we deleted the item that was currently open in the edit modal, close the edit modal
       if (activeModal === 'medical' && String(medicalForm.id) === String(deleteModal.id)) {
         setActiveModal(null);
       }
    } else {
       onDeleteWeight(deleteModal.id);
       // If we deleted the item that was currently open in the edit modal, close the edit modal
       if (activeModal === 'weight' && String(weightForm.id) === String(deleteModal.id)) {
         setActiveModal(null);
       }
    }
    setDeleteModal({ ...deleteModal, isOpen: false });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#9C00FF] to-[#5200A3] p-6 pb-10 rounded-b-3xl shadow-lg text-white relative">
        <button 
          onClick={onBack}
          className="absolute top-6 left-4 p-2 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex justify-center items-center gap-2 mt-8">
           <Activity size={28} />
           <h2 className="text-3xl font-bold">{t('health.title', lang)}</h2>
        </div>
        <p className="text-center opacity-90 mt-1 text-sm">{pet.name}'s {t('health.subtitle', lang)}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 -mt-6 space-y-6 pb-24">
        
        {/* Weight Section */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 flex flex-col">
              {t('health.weight', lang)}
              <span className="text-xs font-normal text-gray-400">{t('health.last6', lang)}</span>
            </h3>
            <button 
              onClick={() => handleOpenWeight()}
              className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-bold hover:bg-blue-200 transition"
            >
              <Plus size={16} /> {t('health.addWeight', lang)}
            </button>
          </div>

          {/* Chart */}
          {chartData.length > 0 ? (
            <div className="h-48 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9ca3af'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9ca3af'}} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#9C00FF" strokeWidth={3} dot={{ r: 4, fill: '#9C00FF', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-24 flex items-center justify-center text-gray-300 text-sm mb-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
               {t('health.emptyWeight', lang)}
             </div>
          )}

          {/* Weight List - Redesigned with explicit buttons */}
          <div className="space-y-3">
            {[...weightRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(rec => (
              <div key={rec.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                
                {/* Content Area */}
                <div className="flex justify-between items-start mb-3">
                   <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{new Date(rec.date).toLocaleDateString()}</p>
                        <p className="font-bold text-gray-800 text-xl">{rec.weight} <span className="text-sm font-normal text-gray-500">kg</span></p>
                      </div>
                   </div>
                </div>
                
                {rec.note && (
                  <div className="bg-gray-50 p-3 rounded-xl mb-3 text-sm text-gray-600 italic">
                    "{rec.note}"
                  </div>
                )}

                {/* Explicit Action Buttons */}
                <div className="flex gap-2 pt-2 border-t border-gray-50">
                  <button 
                    type="button"
                    onClick={() => handleOpenWeight(rec)}
                    className="flex-1 py-2.5 rounded-xl bg-gray-50 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                     <Edit2 size={16} /> {t('btn.edit', lang)}
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => requestDeleteWeight(rec.id, e)}
                    className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-500 font-semibold text-sm hover:bg-red-100 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                     <Trash2 size={16} /> {t('btn.delete', lang)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medical Records List - Redesigned with explicit buttons */}
        <div className="bg-white rounded-3xl p-5 shadow-sm min-h-[200px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">{t('health.vaccines', lang)}</h3>
            <button 
              onClick={() => handleOpenMedical()}
              className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-bold hover:bg-purple-200 transition"
            >
              <Plus size={16} /> {t('health.add', lang)}
            </button>
          </div>
          
          <div className="space-y-3">
             {records.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <Activity size={32} className="mb-2 opacity-50" />
                  <p className="text-sm">{t('health.empty', lang)}</p>
                </div>
             )}

             {[...records].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((rec) => (
              <div key={rec.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  
                  {/* Content Area */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold shrink-0 text-lg">
                      {rec.type === 'Vaccine' ? 'V' : rec.type === 'Vet Visit' ? 'Dr' : rec.type === 'Medication' ? 'Rx' : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-lg leading-tight">{rec.title}</p>
                      <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">
                        {new Date(rec.date).toLocaleDateString()} • {t(`health.type.${rec.type.toLowerCase().split(' ')[0]}` as any, lang)}
                      </p>
                    </div>
                  </div>

                  {rec.note && (
                     <div className="flex gap-2 bg-gray-50 p-3 rounded-xl mb-3">
                        <FileText size={16} className="text-gray-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-gray-600 leading-relaxed">{rec.note}</p>
                     </div>
                  )}

                  {/* Explicit Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-gray-50">
                    <button 
                      type="button"
                      onClick={() => handleOpenMedical(rec)}
                      className="flex-1 py-2.5 rounded-xl bg-gray-50 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                       <Edit2 size={16} /> {t('btn.edit', lang)}
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => requestDeleteMedical(rec.id, e)}
                      className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-500 font-semibold text-sm hover:bg-red-100 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                       <Trash2 size={16} /> {t('btn.delete', lang)}
                    </button>
                  </div>
              </div>
             ))}
          </div>
        </div>
      </div>

      {/* ------------------ MODALS ------------------ */}

      {/* Delete Confirmation Modal - HIGH Z-INDEX */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl transform scale-100 transition-all">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h3>
                    <p className="text-gray-500 text-sm">{t('health.deleteConfirm', lang)}</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        type="button"
                        onClick={() => setDeleteModal({...deleteModal, isOpen: false})}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition cursor-pointer"
                    >
                        {t('btn.cancel', lang)}
                    </button>
                    <button 
                        type="button"
                        onClick={handleConfirmDelete}
                        className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg hover:bg-red-600 transition cursor-pointer"
                    >
                        {t('btn.delete', lang)}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Medical Modal */}
      {activeModal === 'medical' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-gray-800">
                 {medicalForm.id ? t('health.form.editTitle', lang) : t('health.form.title', lang)}
               </h3>
               <button onClick={() => setActiveModal(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                 <X size={20} />
               </button>
             </div>

             <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">{t('health.field.type', lang)}</label>
                  <select 
                    value={medicalForm.type} 
                    onChange={(e) => setMedicalForm({...medicalForm, type: e.target.value as HealthRecordType})}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Vaccine">{t('health.type.vaccine', lang)}</option>
                    <option value="Vet Visit">{t('health.type.vet', lang)}</option>
                    <option value="Medication">{t('health.type.medication', lang)}</option>
                    <option value="Symptom">{t('health.type.symptom', lang)}</option>
                    <option value="Other">{t('health.type.other', lang)}</option>
                  </select>
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">{t('health.field.date', lang)}</label>
                   <input 
                     type="date" 
                     value={medicalForm.date}
                     onChange={(e) => setMedicalForm({...medicalForm, date: e.target.value})}
                     className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500"
                   />
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">{t('health.field.title', lang)}</label>
                   <input 
                     type="text" 
                     value={medicalForm.title}
                     onChange={(e) => setMedicalForm({...medicalForm, title: e.target.value})}
                     placeholder="e.g. Rabies Shot"
                     className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500"
                   />
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">{t('health.field.notes', lang)}</label>
                   <textarea 
                     value={medicalForm.note}
                     onChange={(e) => setMedicalForm({...medicalForm, note: e.target.value})}
                     rows={3}
                     className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                   />
                </div>
             </div>

             <div className="flex gap-3 mt-8">
                {medicalForm.id && (
                   <button 
                     type="button"
                     onClick={(e) => requestDeleteMedical(medicalForm.id, e)}
                     className="px-5 py-3 bg-red-50 text-red-500 rounded-xl font-bold shadow-sm border border-red-100 hover:bg-red-100 transition cursor-pointer"
                   >
                     <Trash2 size={20} />
                   </button>
                )}
               <button 
                 type="button"
                 onClick={handleSaveMedical}
                 className="flex-1 py-3 bg-gradient-to-r from-[#9C00FF] to-[#5200A3] text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition active:scale-95 cursor-pointer"
               >
                 {t('btn.save', lang)}
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Weight Modal */}
      {activeModal === 'weight' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-gray-800">
                 {weightForm.id ? t('health.form.editWeightTitle', lang) : t('health.form.weightTitle', lang)}
               </h3>
               <button onClick={() => setActiveModal(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                 <X size={20} />
               </button>
             </div>

             <div className="space-y-4">
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">{t('health.field.date', lang)}</label>
                   <input 
                     type="date" 
                     value={weightForm.date}
                     onChange={(e) => setWeightForm({...weightForm, date: e.target.value})}
                     className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500"
                   />
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">{t('health.field.weight', lang)}</label>
                   <input 
                     type="number" 
                     step="0.1"
                     value={weightForm.weight}
                     onChange={(e) => setWeightForm({...weightForm, weight: e.target.value})}
                     placeholder="e.g. 10.5"
                     className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500"
                   />
                </div>
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1 block">{t('health.field.notes', lang)}</label>
                   <textarea 
                     value={weightForm.note}
                     onChange={(e) => setWeightForm({...weightForm, note: e.target.value})}
                     rows={2}
                     placeholder={t('health.field.notes', lang)}
                     className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                   />
                </div>
             </div>

             <div className="flex gap-3 mt-8">
               {weightForm.id && (
                  <button 
                    type="button"
                    onClick={(e) => requestDeleteWeight(weightForm.id, e)}
                    className="px-5 py-3 bg-red-50 text-red-500 rounded-xl font-bold shadow-sm border border-red-100 hover:bg-red-100 transition cursor-pointer"
                  >
                    <Trash2 size={20} />
                  </button>
               )}
               <button 
                 type="button"
                 onClick={handleSaveWeight}
                 className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition active:scale-95 cursor-pointer"
               >
                 {t('btn.save', lang)}
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthLog;
