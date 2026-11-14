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
import { DEFAULT_RECORDS, DEFAULT_STATS, DEFAULT_ANALYTICS } from './services/defaultData';
import { AlertCircle, RefreshCw } from 'lucide-react';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('predict');
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [analytics, setAnalytics] = useState(DEFAULT_ANALYTICS);
  const [records, setRecords] = useState(DEFAULT_RECORDS);
  const [history, setHistory] = useState([]);
  const [backendConnected, setBackendConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFieldworkModalOpen, setIsFieldworkModalOpen] = useState(false);

  const loadAllData = async () => {
    setConnecting(true);
    try {
      const [statsRes, analyticsRes, dataRes, historyRes] = await Promise.all([
        api.getStats(),
        api.getAnalytics(),
        api.getData(),
        api.getHistory(),
      ]);

      if (statsRes && statsRes.success) {
        setStats(statsRes.data);
        setBackendConnected(true);
      }
      if (analyticsRes && analyticsRes.success) {
        setAnalytics(analyticsRes.data);
      }
      if (dataRes && dataRes.success && dataRes.data.length > 0) {
        setRecords(dataRes.data);
      }
      if (historyRes && historyRes.success) {
        setHistory(historyRes.history);
      }
    } catch (err) {
      console.warn('Backend server not connected on port 5001. Using verified local dataset.', err);
      setBackendConnected(false);
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleAddRecord = async (newRecord) => {
    try {
      const res = await api.addRecord(newRecord);
      if (!res.success) {
        throw new Error(res.error || 'Failed to add record');
      }
      await loadAllData();
    } catch (err) {
      // Local fallback append if offline
      setRecords((prev) => [newRecord, ...prev]);
      alert('Observation added to local table (Backend offline: start Flask to sync to CSV).');
    }
  };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenFieldwork={() => setIsFieldworkModalOpen(true)}
        backendConnected={backendConnected}
        onRetryBackend={loadAllData}
      />

      {/* Offline Guidance Alert Bar */}
      {!backendConnected && (
        <div style={{
          background: '#fffbeb',
          borderBottom: '1px solid #fde68a',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          fontSize: '0.85rem',
          color: '#92400e'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={18} color="#d97706" />
            <span>
              <strong>Backend Offline:</strong> Displaying verified local dataset (24 days). To activate live API & predictions, run: <code>cd backend; python app.py</code>
            </span>
          </div>
          <button
            onClick={loadAllData}
            disabled={connecting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              color: '#b45309',
              padding: '4px 12px',
              borderRadius: 6,
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} className={connecting ? 'spin' : ''} />
            {connecting ? 'Checking...' : 'Retry Connection'}
          </button>
        </div>
      )}

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
          <strong>SERVESMART</strong> — Smart Food Demand & Batch Prediction System • Built for Rameshwar Prasad (Head Cook, Block 3 Kaveri Mess)
        </div>
        <div style={{ fontSize: '0.78rem', marginTop: 4 }}>
          Fieldwork Dataset: 24 Verified Sessions • Explainable Proportional Heuristic Engine • Zero Food Wastage & Stockout Prevention
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
