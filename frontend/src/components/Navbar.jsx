import React from 'react';
import { 
  UtensilsCrossed, 
  Flame, 
  LayoutDashboard, 
  BarChart3, 
  Database, 
  History, 
  BookOpen,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenFieldwork, backendConnected, onRetryBackend }) {
  const tabs = [
    { id: 'predict', label: "⚡ Cook's Predictor", icon: Flame },
    { id: 'overview', label: '📊 Dashboard Overview', icon: LayoutDashboard },
    { id: 'analytics', label: '📈 Analytics & Evaluation', icon: BarChart3 },
    { id: 'records', label: '📋 Fieldwork Data (24 Days)', icon: Database },
    { id: 'history', label: '🕒 Prediction History', icon: History },
  ];

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand-section">
          <div className="brand-icon">
            <UtensilsCrossed size={24} />
          </div>
          <div>
            <div className="brand-title">
              SERVESMART
              <span className="brand-tag">Hostel Mess System</span>
            </div>
            <div className="brand-subtitle">
              Smart Food Demand & Batch Prediction System for Hostel Cooks
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button 
            className="secondary-btn" 
            style={{ padding: '7px 14px', fontSize: '0.82rem' }}
            onClick={onOpenFieldwork}
          >
            <BookOpen size={16} />
            Fieldwork & Cook Profile
          </button>

          {backendConnected ? (
            <div className="header-pill live-dot">
              Backend Connected (Port 5001)
            </div>
          ) : (
            <button 
              onClick={onRetryBackend}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '6px 12px',
                borderRadius: 999,
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Click to retry connecting to backend at http://127.0.0.1:5001"
            >
              <WifiOff size={14} />
              Backend Offline (Port 5001) • Retry
            </button>
          )}
        </div>
      </div>

      <nav className="nav-bar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
