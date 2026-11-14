import React from 'react';
import { 
  UtensilsCrossed, 
  Flame, 
  LayoutDashboard, 
  BarChart3, 
  Database, 
  History, 
  BookOpen 
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenFieldwork }) {
  const tabs = [
    { id: 'predict', label: "⚡ Cook's Predictor", icon: Flame },
    { id: 'overview', label: '📊 Overview', icon: LayoutDashboard },
    { id: 'analytics', label: '📈 Demand Analytics', icon: BarChart3 },
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
              MessMate
              <span className="brand-tag">Hostel Mess Edition</span>
            </div>
            <div className="brand-subtitle">
              Smart Food Demand & Evening Snack Batch Prediction for Hostel Cooks
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
          <div className="header-pill live-dot">
            Block 3 Kaveri Mess Live
          </div>
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
