import React from 'react';
import { Sparkles, Calendar, CloudSun, Users, Cookie } from 'lucide-react';

export default function PredictionForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  loading 
}) {
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
        Enter the 5:00 PM – 6:00 PM observation to calculate the 5:00 PM – 7:00 PM preparation batch.
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
            <span className="form-label-hint">(Headcount at entrance)</span>
          </label>
          <input
            type="number"
            min="0"
            max="300"
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

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Calculating from Fieldwork...' : 'Generate Preparation Recommendation'}
        </button>
      </form>
    </div>
  );
}
