import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PredictPage from './pages/PredictPage';
import AnalyticsPage from './pages/AnalyticsPage';
import RecordsPage from './pages/RecordsPage';
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

      <main className="main-wrapper">
        {/* Simple non-intrusive offline note if backend is stopped */}
        {!backendConnected && (
          <div className="notice-banner">
            <span>
              <strong>Note:</strong> Showing verified local dataset (24 days). Start Flask (<code>cd backend; python app.py</code>) for live predictions.
            </span>
            <button
              onClick={loadAllData}
              disabled={connecting}
              style={{
                background: 'none',
                border: 'none',
                color: '#b45309',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <RefreshCw size={12} className={connecting ? 'spin' : ''} />
              {connecting ? 'Checking...' : 'Retry'}
            </button>
          </div>
        )}

        {activeTab === 'predict' && (
          <PredictPage onPredictionLogged={loadAllData} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsPage analytics={analytics} stats={stats} />
        )}

        {activeTab === 'records' && (
          <RecordsPage
            records={records}
            history={history}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}
      </main>

      <footer className="app-footer-clean">
        <div>
          <strong>ServeSmart</strong> — Smart Food Demand & Batch Prediction System • Built for Rameshwar Prasad (Head Cook, Block 3 Kaveri Mess)
        </div>
        <div style={{ fontSize: '0.74rem', marginTop: 3 }}>
          24 Verified Fieldwork Sessions • Leave-One-Out Cross-Validation Tested (MAE: 2.95 portions)
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
