import React from 'react';
import { Search, Plus, Filter, MoreVertical, Edit2, Trash2, AlertCircle, Package } from 'lucide-react';
import { formatPHP, cn } from '@/src/lib/utils';
import { Medicine } from '@/src/types';
import { motion } from 'motion/react';

interface InventoryProps {
  medicines: Medicine[];
  onAdd: () => void;
  onEdit: (medicine: Medicine) => void;
  onDelete: (id: string) => void;
  onSell: (id: string, quantity: number) => void;
}

export default function Inventory({ medicines, onAdd, onEdit, onDelete, onSell }: InventoryProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('All');

  const categories = ['All', ...new Set(medicines.map(m => m.category))];

  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         m.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Medicine Inventory</h2>
          <p className="text-slate-500">Manage your stock levels and product details</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700 transition-all shadow-lg shadow-teal-200"
        >
          <Plus className="w-5 h-5" />
          Add Medicine
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                categoryFilter === cat
                  ? "bg-teal-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-teal-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Medicine</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price (PHP)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.map((medicine) => (
                <tr key={medicine.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 font-bold">
                        {medicine.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{medicine.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{medicine.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                      {medicine.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-sm font-bold",
                        medicine.stock <= medicine.minStock ? "text-orange-600" : "text-slate-900"
                      )}>
                        {medicine.stock}
                      </span>
                      {medicine.stock <= medicine.minStock && (
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">{formatPHP(medicine.price)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">{new Date(medicine.expiryDate).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StockBadge stock={medicine.stock} minStock={medicine.minStock} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          const qty = prompt(`Enter quantity of ${medicine.name} to sell:`);
                          if (qty && !isNaN(parseInt(qty))) {
                            medicine.id && onSell(medicine.id, parseInt(qty));
                          }
                        }}
                        className="px-3 py-1 text-xs font-bold text-teal-600 hover:bg-teal-50 rounded-xl transition-all"
                      >
                        Sell
                      </button>
                      <button 
                        onClick={() => onEdit(medicine)}
                        className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => medicine.id && onDelete(medicine.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMedicines.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="w-12 h-12 text-slate-200" />
                      <p className="text-slate-500 font-medium">No medicines found</p>
                      <button onClick={onAdd} className="text-teal-600 text-sm font-bold hover:underline">
                        Add your first product
                      </button>
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

function StockBadge({ stock, minStock }: { stock: number; minStock: number }) {
  if (stock === 0) return <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase">Out of Stock</span>;
  if (stock <= minStock) return <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold uppercase">Low Stock</span>;
  return <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase">In Stock</span>;
}
