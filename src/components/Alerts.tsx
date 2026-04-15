import React from 'react';
import { AlertTriangle, Calendar, Package, ArrowRight } from 'lucide-react';
import { Medicine } from '@/src/types';
import { cn } from '@/src/lib/utils';

interface AlertsProps {
  medicines: Medicine[];
  onRestock: (medicine: Medicine) => void;
}

export default function Alerts({ medicines, onRestock }: AlertsProps) {
  const lowStock = medicines.filter(m => m.stock <= m.minStock);
  const expiringSoon = medicines.filter(m => {
    const expiry = new Date(m.expiryDate);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return days > 0 && days < 30;
  });

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Critical Alerts</h2>
        <p className="text-slate-500">Items requiring immediate attention</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Alerts */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="font-bold text-lg">Low Stock ({lowStock.length})</h3>
          </div>
          <div className="space-y-3">
            {lowStock.map(m => (
              <div key={m.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-orange-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{m.name}</p>
                    <p className="text-xs text-slate-500">Current: <span className="font-bold text-orange-600">{m.stock}</span> / Min: {m.minStock}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onRestock(m)}
                  className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-bold"
                >
                  Restock <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
            {lowStock.length === 0 && (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-200 text-center">
                <p className="text-sm text-slate-400">All stock levels are healthy</p>
              </div>
            )}
          </div>
        </section>

        {/* Expiry Alerts */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-red-600">
            <Calendar className="w-6 h-6" />
            <h3 className="font-bold text-lg">Expiring Soon ({expiringSoon.length})</h3>
          </div>
          <div className="space-y-3">
            {expiringSoon.map(m => {
              const days = Math.ceil((new Date(m.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div key={m.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-red-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{m.name}</p>
                      <p className={cn(
                        "text-xs font-medium",
                        days <= 7 ? "text-red-600" : "text-orange-600"
                      )}>
                        Expires in {days} days ({new Date(m.expiryDate).toLocaleDateString()})
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRestock(m)}
                    className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs font-bold"
                  >
                    Manage <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            {expiringSoon.length === 0 && (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-200 text-center">
                <p className="text-sm text-slate-400">No items expiring soon</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
