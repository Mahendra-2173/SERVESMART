import React from 'react';
import { UtensilsCrossed, Flame, BarChart2, Table2, BookOpen, WifiOff } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenFieldwork, backendConnected, onRetryBackend }) {
  const tabs = [
    { id: 'predict', label: 'Batch Predictor', icon: Flame },
    { id: 'analytics', label: 'Analytics & Accuracy', icon: BarChart2 },
    { id: 'records', label: 'Field Records (24 Days)', icon: Table2 },
  ];

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand">
          <div className="brand-icon">
            <UtensilsCrossed size={20} />
          </div>
          <div>
            <div className="brand-title">ServeSmart</div>
            <div className="brand-subtitle">Smart Food Demand & Batch Prediction</div>
          </div>
        </div>

        <div className="header-right">
          <button className="btn-secondary" onClick={onOpenFieldwork}>
            <BookOpen size={14} />
            Cook & Fieldwork Notes
          </button>

          {backendConnected ? (
            <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }}></span>
              Connected (Port 5001)
            </span>
          ) : (
            <button
              onClick={onRetryBackend}
              style={{
                fontSize: '0.75rem',
                color: '#dc2626',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '4px 10px',
                borderRadius: 999,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <WifiOff size={12} />
              Offline • Retry
            </button>
          )}
        </div>
      </div>

      <nav className="tabs-container">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
