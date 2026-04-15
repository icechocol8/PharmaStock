import React from 'react';
import { LayoutDashboard, Package, History, AlertTriangle, LogOut, Menu, X, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userEmail?: string | null;
  onLogout: () => void;
}

export default function Layout({ children, activeTab, setActiveTab, userEmail, onLogout }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'tracking', label: 'Daily Tracking', icon: ClipboardList },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen">
        <div className="p-6 border-bottom border-slate-100">
          <h1 className="text-xl font-bold text-teal-600 flex items-center gap-2">
            <img src="./capsules.png" className="w-8 h-8 object-contain" alt="Logo" referrerPolicy="no-referrer" />
            PharmaStock
          </h1>
          <p className="text-xs text-slate-400 mt-1">Inventory Management</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                activeTab === item.id
                  ? "bg-teal-50 text-teal-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-teal-600" : "text-slate-400")} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
              {userEmail?.[0].toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{userEmail || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">Pharmacist</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-lg font-bold text-teal-600 flex items-center gap-2">
          <img src="./capsules.png" className="w-6 h-6 object-contain" alt="Logo" referrerPolicy="no-referrer" />
          PharmaStock
        </h1>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-white z-[70] shadow-2xl md:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Menu</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium transition-all",
                      activeTab === item.id
                        ? "bg-teal-50 text-teal-700"
                        : "text-slate-600"
                    )}
                  >
                    <item.icon className={cn("w-6 h-6", activeTab === item.id ? "text-teal-600" : "text-slate-400")} />
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="p-6 border-t border-slate-100">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium text-red-600"
                >
                  <LogOut className="w-6 h-6" />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
