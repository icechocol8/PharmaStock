/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import TransactionHistory from './components/TransactionHistory';
import Alerts from './components/Alerts';
import DailyTracking from './components/DailyTracking';
import DailyStockForm from './components/DailyStockForm';
import MedicineForm from './components/MedicineForm';
import ErrorBoundary from './components/ErrorBoundary';
import { Medicine, Transaction, DailyLog } from './types';

export default function App() {
  const [user, setUser] = React.useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [medicines, setMedicines] = React.useState<Medicine[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [dailyLogs, setDailyLogs] = React.useState<DailyLog[]>([]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isTrackingFormOpen, setIsTrackingFormOpen] = React.useState(false);
  const [editingMedicine, setEditingMedicine] = React.useState<Medicine | null>(null);

  // Auth Listener
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Listeners
  React.useEffect(() => {
    if (!isAuthReady || !user) {
      setMedicines([]);
      setTransactions([]);
      return;
    }

    const medicinesPath = 'medicines';
    const unsubscribeMedicines = onSnapshot(
      collection(db, medicinesPath),
      (snapshot) => {
        const meds = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Medicine));
        setMedicines(meds);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, medicinesPath)
    );

    const transactionsPath = 'transactions';
    const qTransactions = query(collection(db, transactionsPath), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribeTransactions = onSnapshot(
      qTransactions,
      (snapshot) => {
        const trans = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Transaction));
        setTransactions(trans);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, transactionsPath)
    );

    const dailyLogsPath = 'dailyLogs';
    const qDailyLogs = query(collection(db, dailyLogsPath), orderBy('timestamp', 'desc'), limit(100));
    const unsubscribeDailyLogs = onSnapshot(
      qDailyLogs,
      (snapshot) => {
        const logs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as DailyLog));
        setDailyLogs(logs);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, dailyLogsPath)
    );

    return () => {
      unsubscribeMedicines();
      unsubscribeTransactions();
      unsubscribeDailyLogs();
    };
  }, [isAuthReady, user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login failed:', error);
      alert(`Login failed: ${error.message || 'Unknown error'}. Check the console for details.`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAddMedicine = () => {
    setEditingMedicine(null);
    setIsFormOpen(true);
  };

  const handleEditMedicine = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setIsFormOpen(true);
  };

  const handleSaveMedicine = async (medicineData: Omit<Medicine, 'id'>) => {
    const path = 'medicines';
    try {
      if (editingMedicine?.id) {
        await updateDoc(doc(db, path, editingMedicine.id), {
          ...medicineData,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, path), {
          ...medicineData,
          updatedAt: new Date().toISOString()
        });
      }
      setIsFormOpen(false);
    } catch (error) {
      handleFirestoreError(error, editingMedicine ? OperationType.UPDATE : OperationType.CREATE, path);
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    const path = `medicines/${id}`;
    if (confirm('Are you sure you want to delete this medicine?')) {
      try {
        await deleteDoc(doc(db, 'medicines', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
  };

  const handleSell = async (id: string, quantity: number) => {
    const medicine = medicines.find(m => m.id === id);
    if (!medicine || !medicine.id) return;

    if (medicine.stock < quantity) {
      alert('Insufficient stock!');
      return;
    }

    const medicinesPath = `medicines/${id}`;
    const transactionsPath = 'transactions';

    try {
      // Update Stock
      await updateDoc(doc(db, 'medicines', id), {
        stock: medicine.stock - quantity,
        updatedAt: new Date().toISOString()
      });

      // Log Transaction
      await addDoc(collection(db, transactionsPath), {
        medicineId: id,
        medicineName: medicine.name,
        type: 'sale',
        quantity: quantity,
        totalAmount: medicine.price * quantity,
        timestamp: new Date().toISOString(),
        userId: user?.uid || 'anonymous'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'Inventory Update');
    }
  };

  const handleSaveDailyLog = async (logData: Omit<DailyLog, 'id'>) => {
    const dailyLogsPath = 'dailyLogs';
    const medicinesPath = 'medicines';
    const transactionsPath = 'transactions';

    try {
      // 1. Save the Daily Log
      await addDoc(collection(db, dailyLogsPath), {
        ...logData,
        userId: user?.uid || 'anonymous'
      });

      // 2. Update Medicine Stock
      await updateDoc(doc(db, medicinesPath, logData.medicineId), {
        stock: logData.closingStock,
        updatedAt: new Date().toISOString()
      });

      // 3. Log as Adjustment if there's a difference not accounted for? 
      // Actually, the Daily Tracking is the record. We can log a transaction too.
      await addDoc(collection(db, transactionsPath), {
        medicineId: logData.medicineId,
        medicineName: logData.medicineName,
        type: 'adjustment',
        quantity: logData.closingStock - logData.openingStock,
        totalAmount: 0,
        timestamp: new Date().toISOString(),
        userId: user?.uid || 'anonymous'
      });

      setIsTrackingFormOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'Daily Tracking Save');
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-3xl shadow-xl max-w-md w-full text-center space-y-8">
          <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto rotate-12 overflow-hidden">
            <img src="capsules.png" className="w-14 h-14 object-contain" alt="Logo" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">PharmaStock</h1>
            <p className="text-slate-500 mt-2">Inventory Management System</p>
          </div>
          <button
            onClick={handleLogin}
            className="w-full py-4 bg-teal-600 text-white font-bold rounded-2xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 flex items-center justify-center gap-3"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" referrerPolicy="no-referrer" />
            Sign in with Google
          </button>
          <p className="text-xs text-slate-400">Secure access for authorized pharmacists only.</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userEmail={user.email}
        onLogout={handleLogout}
      >
        {activeTab === 'dashboard' && (
          <Dashboard medicines={medicines} transactions={transactions} />
        )}
        {activeTab === 'inventory' && (
          <Inventory 
            medicines={medicines} 
            onAdd={handleAddMedicine} 
            onEdit={handleEditMedicine}
            onDelete={handleDeleteMedicine}
            onSell={handleSell}
          />
        )}
        {activeTab === 'transactions' && (
          <TransactionHistory transactions={transactions} />
        )}
        {activeTab === 'tracking' && (
          <DailyTracking 
            logs={dailyLogs} 
            medicines={medicines} 
            onAdd={() => setIsTrackingFormOpen(true)}
            onDelete={() => {}} // Not implemented for now
          />
        )}
        {activeTab === 'alerts' && (
          <Alerts 
            medicines={medicines} 
            onRestock={handleEditMedicine}
          />
        )}

        {isFormOpen && (
          <MedicineForm 
            medicine={editingMedicine}
            onSave={handleSaveMedicine}
            onClose={() => setIsFormOpen(false)}
          />
        )}

        {isTrackingFormOpen && (
          <DailyStockForm 
            medicines={medicines}
            onSave={handleSaveDailyLog}
            onClose={() => setIsTrackingFormOpen(false)}
          />
        )}
      </Layout>
    </ErrorBoundary>
  );
}


