import React from 'react';
import { Plus, Calendar, Search, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { DailyLog, Medicine } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface DailyTrackingProps {
  logs: DailyLog[];
  medicines: Medicine[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export default function DailyTracking({ logs, medicines, onAdd, onDelete }: DailyTrackingProps) {
  const [selectedDate, setSelectedDate] = React.useState(format(new Date(), 'yyyy-MM-dd'));
  const [showAll, setShowAll] = React.useState(false);

  const filteredLogs = showAll 
    ? logs 
    : logs.filter(log => log.date === selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Daily Tracking</h2>
          <p className="text-slate-500">Record and view daily stock movements</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700 transition-all shadow-lg shadow-teal-200"
        >
          <Plus className="w-5 h-5" />
          Record Stock
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-slate-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setShowAll(false);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all"
          />
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className={cn(
            "text-sm font-medium px-4 py-2 rounded-lg transition-all",
            showAll ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          {showAll ? "Showing All Logs" : "Show All"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Medicine</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Opening</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-red-600">Sold</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-green-600">Received</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-orange-600">Damaged</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Closing</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-slate-900">{format(new Date(log.date), 'MM/dd/yyyy')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{log.medicineName}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{log.openingStock}</td>
                  <td className="px-6 py-4 text-sm font-bold text-red-600">{log.sold}</td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600">{log.received}</td>
                  <td className="px-6 py-4 text-sm font-bold text-orange-600">{log.damaged}</td>
                  <td className="px-6 py-4 text-sm font-bold text-teal-600">{log.closingStock}</td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-500 max-w-xs truncate" title={log.notes}>
                      {log.notes || '-'}
                    </p>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <ClipboardList className="w-12 h-12 text-slate-200" />
                      <h3 className="text-lg font-bold text-slate-900">No logs found</h3>
                      <p className="text-slate-500 text-sm">No stock movements recorded for this date.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
