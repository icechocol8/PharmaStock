import React from 'react';
import { Package, AlertCircle, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatPHP, cn } from '@/src/lib/utils';
import { Medicine, Transaction } from '@/src/types';

interface DashboardProps {
  medicines: Medicine[];
  transactions: Transaction[];
}

export default function Dashboard({ medicines, transactions }: DashboardProps) {
  const stats = {
    totalMedicines: medicines.length,
    lowStock: medicines.filter(m => m.stock <= m.minStock).length,
    expiringSoon: medicines.filter(m => {
      const expiry = new Date(m.expiryDate);
      const now = new Date();
      const diff = expiry.getTime() - now.getTime();
      const days = diff / (1000 * 60 * 60 * 24);
      return days > 0 && days < 30;
    }).length,
    totalSalesToday: transactions
      .filter(t => t.type === 'sale' && new Date(t.timestamp).toDateString() === new Date().toDateString())
      .reduce((acc, curr) => acc + curr.totalAmount, 0)
  };

  // Mock data for charts if no transactions
  const chartData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Inventory Overview</h2>
        <p className="text-slate-500">Real-time summary of your pharmacy stock</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Medicines"
          value={stats.totalMedicines}
          icon={Package}
          color="blue"
          trend="+2.5%"
          isUp={true}
        />
        <StatCard
          title="Low Stock Alert"
          value={stats.lowStock}
          icon={AlertCircle}
          color="orange"
          trend="-5%"
          isUp={false}
        />
        <StatCard
          title="Expiring Soon"
          value={stats.expiringSoon}
          icon={Calendar}
          color="red"
          trend="+1"
          isUp={true}
        />
        <StatCard
          title="Today's Sales"
          value={formatPHP(stats.totalSalesToday)}
          icon={TrendingUp}
          color="teal"
          trend="+12%"
          isUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Weekly Sales Performance</h3>
            <select className="text-sm border-none bg-slate-50 rounded-lg px-2 py-1 text-slate-600 focus:ring-0">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="sales" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  t.type === 'sale' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                )}>
                  {t.type === 'sale' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{t.medicineName || 'Medicine'}</p>
                  <p className="text-xs text-slate-500">{new Date(t.timestamp).toLocaleTimeString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{t.type === 'sale' ? '-' : '+'}{t.quantity}</p>
                  <p className="text-xs text-slate-500">{formatPHP(t.totalAmount)}</p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-slate-400">No recent activity</p>
              </div>
            )}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-xl transition-colors">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, trend, isUp }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
    teal: "bg-teal-50 text-teal-600",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-xl", colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
          isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
        )}>
          {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </motion.div>
  );
}
