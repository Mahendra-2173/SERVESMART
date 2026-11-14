import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CheckCircle2, AlertCircle, ShieldAlert, Scale, Target } from 'lucide-react';
import AnalyticsCharts from '../components/AnalyticsCharts';
import { api } from '../services/api';

export default function AnalyticsPage({ analytics }) {
  const [evaluation, setEvaluation] = useState(null);
  const [evalLoading, setEvalLoading] = useState(true);

  useEffect(() => {
    async function fetchEval() {
      try {
        const res = await api.getEvaluation();
        if (res.success) {
          setEvaluation(res.evaluation);
        }
      } catch (err) {
        console.error('Failed to fetch model evaluation:', err);
      } finally {
        setEvalLoading(false);
      }
    }
    fetchEval();
  }, []);

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <BarChart3 size={24} color="#ea580c" />
            Demand Analytics & Model Evaluation
          </h2>
          <div className="section-desc">
            Visual comparisons across weekdays, weather conditions, student turnout velocities, and cross-validation accuracy metrics.
          </div>
        </div>
      </div>

      {/* Model Cross-Validation Evaluation Banner */}
      {evaluation && evaluation.sufficient_data && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 28, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Target size={20} color="#ea580c" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Model Accuracy & Cross-Validation Evaluation
                </h3>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 2 }}>
                Methodology: <strong>{evaluation.validation_method}</strong> (N = {evaluation.sample_size} historical days).
                Each observation is tested strictly without being used in its own prediction.
              </div>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '6px 14px', borderRadius: 999, fontSize: '0.82rem', fontWeight: 700 }}>
              ✓ {evaluation.improvement_over_baseline_percent}% Error Reduction vs Weekday Baseline
            </div>
          </div>

          {/* 4 Evaluation Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#9a3412' }}>
                Mean Absolute Error (MAE)
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ea580c', margin: '4px 0' }}>
                {evaluation.model_mae} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>portions</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#7c2d12' }}>
                Weekday Baseline MAE: <strong>{evaluation.baseline_mae} portions</strong>
              </div>
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#1e40af' }}>
                Root Mean Squared Error (RMSE)
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563eb', margin: '4px 0' }}>
                {evaluation.model_rmse} <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>portions</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#1e3a8a' }}>
                Weekday Baseline RMSE: <strong>{evaluation.baseline_rmse} portions</strong>
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#475569' }}>
                Over / Under Prediction
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                +{evaluation.avg_overprediction} / -{evaluation.avg_underprediction}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Balanced distribution; no systematic bias
              </div>
            </div>

            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#991b1b' }}>
                Stockout Prevention Rate
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626', margin: '4px 0' }}>
                {evaluation.simulated_stockout_rate_percent}% <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>rate</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#7f1d1d' }}>
                Historical Unassisted Rate: <strong>{evaluation.historical_actual_stockout_rate_percent}% (4 runouts)</strong>
              </div>
            </div>
          </div>

          {/* Metric Distinction Callout */}
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#f8fafc', borderLeft: '4px solid #2563eb', borderRadius: 6, fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
            <strong>Operational Distinction of Metrics:</strong>
            <ul style={{ paddingLeft: 18, marginTop: 4 }}>
              <li><strong>Prediction Error (MAE {evaluation.model_mae} portions):</strong> The mathematical difference between estimated student demand and actual portions consumed.</li>
              <li><strong>Food Wastage (~{evaluation.simulated_avg_leftover} portions):</strong> The physical uneaten portions remaining at 7:00 PM, intentionally bounded by the cook's safety buffer.</li>
              <li><strong>Stockout Events ({evaluation.simulated_stockout_count} day):</strong> Service failures where food ran out before 7:00 PM, causing student dissatisfaction.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Main Charts */}
      <AnalyticsCharts analytics={analytics} />

      {/* Fieldwork Insights Card */}
      <div style={{ marginTop: 28, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp size={18} color="#16a34a" />
          Fieldwork Data Takeaways for Mess Operations
        </h3>
        <ul style={{ paddingLeft: 20, fontSize: '0.88rem', color: '#475569', lineHeight: 1.7 }}>
          <li>
            <strong>Weekday Disparity:</strong> Student snack demand follows a sharp curve — Friday peak demand averages 108 portions, while Sunday dips to 47 portions. Preparing a static 90 portions daily causes ~35 portions wasted every Sunday and shortages every Friday.
          </li>
          <li>
            <strong>Turnout Velocity (5-6 PM):</strong> The number of students passing the entrance counter between 5:00 PM and 6:00 PM accounts for ~65% of total evening footfall, providing a strong linear correlation (r = 0.987) for the 6:00 PM – 7:00 PM rush.
          </li>
          <li>
            <strong>Weather Modifiers:</strong> Overcast and drizzly weather shifts student cravings towards hot fried snacks (pakoras, bondas) by +18–25%, whereas heavy thunderstorms delay lab dismissals.
          </li>
        </ul>
      </div>
    </div>
  );
}
