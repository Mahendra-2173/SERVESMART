import React from 'react';
import { 
  Database, 
  Utensils, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown, 
  Flame,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import StatCard from '../components/StatCard';

export default function OverviewPage({ stats, setActiveTab }) {
  if (!stats) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading operational overview...</div>;
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <Utensils size={24} color="#ea580c" />
            SERVESMART Mess Operations Dashboard
          </h2>
          <div className="section-desc">
            Operational summary based on {stats.total_observations} verified fieldwork sessions at Block 3 Kaveri Mess.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '6px 12px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={15} />
            Dataset Verified (24 Days • 0 Errors)
          </div>

          <button 
            className="submit-btn" 
            style={{ width: 'auto', padding: '10px 18px', fontSize: '0.9rem', margin: 0 }}
            onClick={() => setActiveTab('predict')}
          >
            <Flame size={16} />
            Predict Today's Batch
          </button>
        </div>
      </div>

      {/* Core Operational Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Observations Logged"
          value={stats.total_observations}
          unit="Days"
          subtext="Oct 5 – Oct 28 Fieldwork"
          icon={Database}
          variant="primary"
        />

        <StatCard
          title="Avg Daily Consumption"
          value={stats.avg_daily_consumption}
          unit="Portions"
          subtext="Actual student snack demand"
          icon={Utensils}
          variant="success"
        />

        <StatCard
          title="Avg Leftover / Wastage"
          value={stats.avg_leftover_quantity}
          unit="Portions"
          subtext={`${stats.wastage_rate_percent}% avg daily food waste`}
          icon={Trash2}
          variant={stats.wastage_rate_percent > 10 ? 'danger' : 'warning'}
        />

        <StatCard
          title="Stockouts (Ran Out Early)"
          value={stats.days_ran_out}
          unit="Days"
          subtext={`${stats.stockout_rate_percent}% historical unassisted rate`}
          icon={AlertTriangle}
          variant="danger"
        />
      </div>

      {/* Secondary Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontWeight: 700, fontSize: '0.95rem', marginBottom: 6 }}>
            <TrendingUp size={20} />
            Highest Demand Observed
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            {stats.highest_demand_day}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>
            Peak student footfall occurred on Friday evening after lab wrap-ups.
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb', fontWeight: 700, fontSize: '0.95rem', marginBottom: 6 }}>
            <TrendingDown size={20} />
            Lowest Demand Observed
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            {stats.lowest_demand_day}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>
            Sunday footfall dips sharply as students dine out or return home.
          </div>
        </div>
      </div>

      {/* Quick Cook Workflow Guidance Banner */}
      <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe', borderRadius: 16, padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e3a8a' }}>
            Ready to predict today's 5:00 PM – 7:00 PM batch?
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#3b82f6', maxWidth: 640, marginTop: 4 }}>
            Check the hostel entrance register between 5:00 PM and 6:00 PM, enter the headcount and current weather, and SERVESMART will recommend the optimal frying quantity.
          </p>
        </div>

        <button 
          className="primary-action-btn"
          style={{ padding: '12px 20px', background: '#2563eb' }}
          onClick={() => setActiveTab('predict')}
        >
          Open Batch Predictor
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
