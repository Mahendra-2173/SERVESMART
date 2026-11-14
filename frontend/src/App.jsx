import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import OverviewPage from './pages/OverviewPage';
import PredictPage from './pages/PredictPage';
import AnalyticsPage from './pages/AnalyticsPage';
import RecordsPage from './pages/RecordsPage';
import HistoryPage from './pages/HistoryPage';
import AddRecordModal from './components/AddRecordModal';
import FieldworkModal from './components/FieldworkModal';
import { api } from './services/api';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('predict');
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [records, setRecords] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFieldworkModalOpen, setIsFieldworkModalOpen] = useState(false);

  const loadAllData = async () => {
    try {
      const [statsRes, analyticsRes, dataRes, historyRes] = await Promise.all([
        api.getStats(),
        api.getAnalytics(),
        api.getData(),
        api.getHistory(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (dataRes.success) setRecords(dataRes.data);
      if (historyRes.success) setHistory(historyRes.history);
    } catch (err) {
      console.error('Error fetching data from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleAddRecord = async (newRecord) => {
    const res = await api.addRecord(newRecord);
    if (!res.success) {
      throw new Error(res.error || 'Failed to add record');
    }
    await loadAllData();
  };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenFieldwork={() => setIsFieldworkModalOpen(true)}
      />

      <main className="main-content">
        {activeTab === 'predict' && (
          <PredictPage onPredictionLogged={loadAllData} />
        )}

        {activeTab === 'overview' && (
          <OverviewPage stats={stats} setActiveTab={setActiveTab} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsPage analytics={analytics} />
        )}

        {activeTab === 'records' && (
          <RecordsPage
            records={records}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage
            history={history}
            onRefreshHistory={loadAllData}
          />
        )}
      </main>

      <footer className="app-footer">
        <div>
          <strong>MessMate</strong> — Smart Food Demand & Batch Prediction System • Tailored for Rameshwar Prasad (Head Cook, Block 3 Kaveri Mess)
        </div>
        <div style={{ fontSize: '0.78rem', marginTop: 4 }}>
          Fieldwork Dataset: 24 Verified Sessions • Explainable Proportional Estimation Engine • Zero Food Wastage & Stockout Prevention
        </div>
      </footer>

      <AddRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddRecord={handleAddRecord}
      />

      <FieldworkModal
        isOpen={isFieldworkModalOpen}
        onClose={() => setIsFieldworkModalOpen(false)}
      />
    </div>
  );
}
