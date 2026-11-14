import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AddRecordModal({ isOpen, onClose, onAddRecord }) {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    date: todayStr,
    day: 'Monday',
    weather: 'Sunny',
    student_count: 80,
    prepared_quantity: 90,
    remaining_quantity: 6,
    sold_out: false,
    snack_type: 'Samosa',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.date || !formData.day || !formData.weather || !formData.snack_type) {
      setError('Please fill all required fields.');
      return;
    }

    const prep = parseInt(formData.prepared_quantity, 10);
    const rem = parseInt(formData.remaining_quantity, 10);
    const stud = parseInt(formData.student_count, 10);

    if (isNaN(prep) || prep < 0 || isNaN(rem) || rem < 0 || isNaN(stud) || stud < 0) {
      setError('Quantities and headcount must be non-negative whole numbers.');
      return;
    }

    if (rem > prep) {
      setError('Remaining quantity cannot exceed prepared quantity.');
      return;
    }

    const sold = prep - rem;
    const isSoldOut = rem === 0 || formData.sold_out;

    setSubmitting(true);
    try {
      await onAddRecord({
        ...formData,
        student_count: stud,
        prepared_quantity: prep,
        remaining_quantity: rem,
        sold_quantity: sold,
        sold_out: isSoldOut,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save observation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-card-header">
          <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0f172a' }}>
            Record New Evening Snack Observation
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-card-body">
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '8px 12px', borderRadius: 6, marginBottom: 14, fontSize: '0.8rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="form-field">
                <label className="field-label">Date</label>
                <input
                  type="date"
                  className="field-input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <label className="field-label">Day</label>
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="form-field">
                <label className="field-label">Weather</label>
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

            <div className="form-field">
              <label className="field-label">5–6 PM Headcount</label>
              <input
                type="number"
                min="0"
                className="field-input"
                value={formData.student_count}
                onChange={(e) => setFormData({ ...formData, student_count: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="form-field">
                <label className="field-label">Portions Prepared</label>
                <input
                  type="number"
                  min="0"
                  className="field-input"
                  value={formData.prepared_quantity}
                  onChange={(e) => setFormData({ ...formData, prepared_quantity: e.target.value })}
                  required
                />
              </div>

              <div className="form-field">
                <label className="field-label">Remaining at 7 PM</label>
                <input
                  type="number"
                  min="0"
                  className="field-input"
                  value={formData.remaining_quantity}
                  onChange={(e) => setFormData({ ...formData, remaining_quantity: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                id="sold_out_modal"
                checked={formData.sold_out || formData.remaining_quantity === 0}
                onChange={(e) => setFormData({ ...formData, sold_out: e.target.checked })}
              />
              <label htmlFor="sold_out_modal" style={{ fontSize: '0.8rem', color: '#475569', cursor: 'pointer' }}>
                Snack ran out before 7:00 PM (Stockout)
              </label>
            </div>
          </div>

          <div className="modal-card-footer">
            <button type="button" className="btn-secondary" onClick={onClose} style={{ marginRight: 8 }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '8px 16px' }} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Observation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
