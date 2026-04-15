import React from 'react';
import { X, Save, Package, Scan, AlertCircle } from 'lucide-react';
import { Medicine, DailyLog } from '@/src/types';
import { motion } from 'motion/react';
import { format } from 'date-fns';

interface DailyStockFormProps {
  medicines: Medicine[];
  onSave: (log: Omit<DailyLog, 'id'>) => void;
  onClose: () => void;
}

export default function DailyStockForm({ medicines, onSave, onClose }: DailyStockFormProps) {
  const [selectedMedicineId, setSelectedMedicineId] = React.useState('');
  const [sold, setSold] = React.useState(0);
  const [received, setReceived] = React.useState(0);
  const [damaged, setDamaged] = React.useState(0);
  const [notes, setNotes] = React.useState('');
  const [date, setDate] = React.useState(format(new Date(), 'yyyy-MM-dd'));

  const selectedMedicine = medicines.find(m => m.id === selectedMedicineId);
  const openingStock = selectedMedicine?.stock || 0;
  const closingStock = openingStock - sold + received - damaged;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicine) return;

    onSave({
      medicineId: selectedMedicine.id!,
      medicineName: selectedMedicine.name,
      date,
      openingStock,
      sold,
      received,
      damaged,
      closingStock,
      notes,
      timestamp: new Date().toISOString(),
      userId: 'pharmacist@pharma.ph' // This will be replaced by actual user ID in App.tsx
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Record Daily Stock</h2>
            <p className="text-sm text-slate-500">Track inventory changes for today</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700">Select Product *</label>
              <button type="button" className="text-teal-600 text-xs font-bold flex items-center gap-1 hover:underline">
                <Scan className="w-3 h-3" /> Scan Barcode
              </button>
            </div>
            <select
              required
              value={selectedMedicineId}
              onChange={(e) => setSelectedMedicineId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
            >
              <option value="">Choose a medicine...</option>
              {medicines.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.stock} In Stock)</option>
              ))}
            </select>
          </div>

          {selectedMedicine && (
            <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100 space-y-1">
              <p className="text-xs font-medium text-teal-600 uppercase tracking-wider">Opening Stock</p>
              <p className="text-2xl font-bold text-teal-900">{openingStock} Units</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Sold</label>
              <input
                type="number"
                min="0"
                value={sold}
                onChange={(e) => setSold(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Received</label>
              <input
                type="number"
                min="0"
                value={received}
                onChange={(e) => setReceived(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Damaged</label>
              <input
                type="number"
                min="0"
                value={damaged}
                onChange={(e) => setDamaged(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          {selectedMedicine && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Estimated Closing Stock</p>
              <p className="text-2xl font-bold text-slate-900">{closingStock} Units</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all h-24 resize-none"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedMedicine}
              className="flex-1 px-6 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              Save Log
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
