import React from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Search, Calendar } from 'lucide-react';
import { formatPHP, cn } from '@/src/lib/utils';
import { Transaction } from '@/src/types';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredTransactions = transactions.filter(t => 
    t.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Transaction History</h2>
        <p className="text-slate-500">Track all stock movements and sales</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:border-teal-200 transition-all">
          <Calendar className="w-5 h-5" />
          Filter by Date
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Medicine</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Value</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900">{new Date(t.timestamp).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-500">{new Date(t.timestamp).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{t.medicineName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <TypeBadge type={t.type} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className={cn(
                        "text-sm font-bold",
                        t.type === 'sale' ? "text-red-600" : t.type === 'restock' ? "text-green-600" : "text-blue-600"
                      )}>
                        {t.type === 'sale' ? '-' : '+'}{t.quantity}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">{formatPHP(t.totalAmount)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">{t.userId.split('@')[0]}</p>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No transactions found
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

function TypeBadge({ type }: { type: string }) {
  const styles: any = {
    sale: "bg-red-50 text-red-700 border-red-100",
    restock: "bg-green-50 text-green-700 border-green-100",
    adjustment: "bg-blue-50 text-blue-700 border-blue-100",
  };

  const icons: any = {
    sale: <ArrowDownRight className="w-3 h-3" />,
    restock: <ArrowUpRight className="w-3 h-3" />,
    adjustment: <RefreshCw className="w-3 h-3" />,
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider",
      styles[type]
    )}>
      {icons[type]}
      {type}
    </span>
  );
}
