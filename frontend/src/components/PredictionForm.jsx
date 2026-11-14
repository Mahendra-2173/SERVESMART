import React, { useState } from 'react';
import { Sparkles, Sliders } from 'lucide-react';

export default function PredictionForm({ formData, setFormData, onSubmit, loading }) {
  const [showSettings, setShowSettings] = useState(false);

  const presets = [
    { label: 'Sunny Wed (82)', day: 'Wednesday', weather: 'Sunny', count: 82, snack: 'Samosa' },
    { label: 'Rainy Fri (110)', day: 'Friday', weather: 'Rainy', count: 110, snack: 'Samosa' },
    { label: 'Drizzle Thu (95)', day: 'Thursday', weather: 'Drizzle', count: 95, snack: 'Onion Pakora' },
    { label: 'Quiet Sun (42)', day: 'Sunday', weather: 'Sunny', count: 42, snack: 'Bread Pakora' },
  ];

  return (
    <div className="card">
      <div className="card-title">
        <Sparkles size={18} color="#ea580c" />
        Kitchen Input
      </div>
      <div className="card-desc">
        Enter 5:00 PM – 6:00 PM entrance headcount to calculate today's preparation batch.
      </div>

      <div className="quick-chips">
        {presets.map((p, idx) => (
          <button
            key={idx}
            type="button"
            className="chip"
            onClick={() => setFormData({ ...formData, day: p.day, weather: p.weather, student_count: p.count, snack_type: p.snack })}
          >
            {p.label}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-field">
            <label className="field-label">Day of Week</label>
            <select
              className="field-select"
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="field-label">Weather Condition</label>
            <select
              className="field-select"
              value={formData.weather}
              onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
            >
              {['Sunny', 'Cloudy', 'Rainy', 'Drizzle', 'Humid'].map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-field">
            <label className="field-label">5-6 PM Student Turnout</label>
            <input
              type="number"
              min="0"
              max="350"
              className="field-input"
              placeholder="e.g. 84"
              value={formData.student_count}
              onChange={(e) => setFormData({ ...formData, student_count: e.target.value })}
              required
            />
          </div>

          <div className="form-field">
            <label className="field-label">Snack Item</label>
            <select
              className="field-select"
              value={formData.snack_type}
              onChange={(e) => setFormData({ ...formData, snack_type: e.target.value })}
            >
              {['Samosa', 'Bread Pakora', 'Aloo Bonda', 'Veg Cutlet', 'Onion Pakora'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clean optional setting toggle */}
        <div style={{ marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: 0
            }}
          >
            <Sliders size={13} />
            {showSettings ? 'Hide preparation settings' : 'Customize buffer & batch size'}
          </button>

          {showSettings && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8, padding: 10, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div>
                <label className="field-label" style={{ fontSize: '0.72rem' }}>Safety Buffer</label>
                <select
                  className="field-select"
                  style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                  value={formData.safety_buffer ?? 4}
                  onChange={(e) => setFormData({ ...formData, safety_buffer: parseInt(e.target.value, 10) })}
                >
                  <option value={0}>0 (No buffer)</option>
                  <option value={2}>+2 portions</option>
                  <option value={4}>+4 portions (Standard)</option>
                  <option value={6}>+6 portions (Peak day)</option>
                </select>
              </div>

              <div>
                <label className="field-label" style={{ fontSize: '0.72rem' }}>Batch Rounding</label>
                <select
                  className="field-select"
                  style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                  value={formData.batch_size ?? 5}
                  onChange={(e) => setFormData({ ...formData, batch_size: parseInt(e.target.value, 10) })}
                >
                  <option value={1}>1 portion (Exact)</option>
                  <option value={5}>5 portions (Tray)</option>
                  <option value={10}>10 portions (Large)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate Batch Quantity'}
        </button>
      </form>
    </div>
  );
}
