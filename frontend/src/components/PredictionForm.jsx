import React, { useState } from 'react';
import { Sparkles, Calendar, CloudSun, Users, Cookie, Sliders, ChevronDown, ChevronUp } from 'lucide-react';

export default function PredictionForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  loading 
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weatherOptions = ['Sunny', 'Cloudy', 'Rainy', 'Drizzle', 'Humid'];
  const snackTypes = ['Samosa', 'Bread Pakora', 'Aloo Bonda', 'Veg Cutlet', 'Onion Pakora'];

  const presets = [
    { label: 'Sunny Wednesday', day: 'Wednesday', weather: 'Sunny', student_count: 82, snack_type: 'Samosa' },
    { label: 'Rainy Friday (Surge)', day: 'Friday', weather: 'Rainy', student_count: 110, snack_type: 'Samosa' },
    { label: 'Drizzle Pakora Craving', day: 'Thursday', weather: 'Drizzle', student_count: 95, snack_type: 'Onion Pakora' },
    { label: 'Quiet Sunday Evening', day: 'Sunday', weather: 'Sunny', student_count: 42, snack_type: 'Bread Pakora' },
  ];

  const handleApplyPreset = (preset) => {
    setFormData({
      ...formData,
      day: preset.day,
      weather: preset.weather,
      student_count: preset.student_count,
      snack_type: preset.snack_type,
    });
  };

  return (
    <div className="form-panel">
      <div className="form-title">
        <Sparkles size={20} color="#ea580c" />
        Daily Kitchen Entry Form
      </div>
      <div className="form-subtitle">
        Enter the 5:00 PM – 6:00 PM entrance headcount to predict the 5:00 PM – 7:00 PM batch size.
      </div>

      <div className="presets-bar">
        <span className="presets-label">⚡ Quick Fieldwork Scenarios:</span>
        <div className="preset-buttons">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="preset-btn"
              onClick={() => handleApplyPreset(p)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label className="form-label">
            <Calendar size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
            Today's Day
          </label>
          <select
            className="form-select"
            value={formData.day}
            onChange={(e) => setFormData({ ...formData, day: e.target.value })}
            required
          >
            {days.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            <CloudSun size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
            Current Weather Condition
            <span className="form-label-hint">(Observed at 5:00 PM)</span>
          </label>
          <select
            className="form-select"
            value={formData.weather}
            onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
            required
          >
            {weatherOptions.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            <Users size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
            Student Entry Count (5:00 PM – 6:00 PM)
            <span className="form-label-hint">(Entrance tally counter)</span>
          </label>
          <input
            type="number"
            min="0"
            max="400"
            className="form-input"
            placeholder="e.g. 84"
            value={formData.student_count}
            onChange={(e) => setFormData({ ...formData, student_count: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <Cookie size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
            Snack Item Being Prepared
          </label>
          <select
            className="form-select"
            value={formData.snack_type}
            onChange={(e) => setFormData({ ...formData, snack_type: e.target.value })}
            required
          >
            {snackTypes.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Optional Configurable Kitchen Settings */}
        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <div 
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              cursor: 'pointer',
              padding: '8px 12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#475569'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sliders size={14} color="#ea580c" />
              <span>Kitchen Preparation Settings (Buffer & Batch Sizing)</span>
            </div>
            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {showAdvanced && (
            <div style={{ padding: '14px', background: '#ffffff', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>
                    Safety Buffer
                    <span className="form-label-hint">(Protection against runouts)</span>
                  </label>
                  <select
                    className="form-select"
                    style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                    value={formData.safety_buffer ?? 4}
                    onChange={(e) => setFormData({ ...formData, safety_buffer: parseInt(e.target.value, 10) })}
                  >
                    <option value={0}>0 portions (Zero buffer - highest stockout risk)</option>
                    <option value={2}>2 portions (Low buffer - quiet days)</option>
                    <option value={4}>4 portions (Standard recommended buffer)</option>
                    <option value={6}>6 portions (Conservative - peak Fridays)</option>
                    <option value={8}>8 portions (High buffer - exam weeks)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>
                    Batch Rounding
                    <span className="form-label-hint">(Fryer tray increment)</span>
                  </label>
                  <select
                    className="form-select"
                    style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                    value={formData.batch_size ?? 5}
                    onChange={(e) => setFormData({ ...formData, batch_size: parseInt(e.target.value, 10) })}
                  >
                    <option value={1}>1 portion (Exact count)</option>
                    <option value={5}>5 portions (Standard tray size)</option>
                    <option value={10}>10 portions (Large fryer batch)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Calculating from Fieldwork...' : 'Generate Preparation Recommendation'}
        </button>
      </form>
    </div>
  );
}
