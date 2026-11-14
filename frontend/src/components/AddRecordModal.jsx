import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

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

    // Validations
    if (!formData.date || !formData.day || !formData.weather || !formData.snack_type) {
      setError('Please fill all required fields.');
      return;
    }

    const prep = parseInt(formData.prepared_quantity, 10);
    const rem = parseInt(formData.remaining_quantity, 10);
    const stud = parseInt(formData.student_count, 10);

    if (isNaN(prep) || prep < 0 || isNaN(rem) || rem < 0 || isNaN(stud) || stud < 0) {
      setError('Quantities and student count must be non-negative whole numbers.');
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
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">Record New Snack Observation</div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Day of Week</label>
                <select
                  className="form-select"
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Weather Condition</label>
                <select
                  className="form-select"
                  value={formData.weather}
                  onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
                >
                  {['Sunny', 'Cloudy', 'Rainy', 'Drizzle', 'Humid'].map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Snack Item</label>
                <select
                  className="form-select"
                  value={formData.snack_type}
                  onChange={(e) => setFormData({ ...formData, snack_type: e.target.value })}
                >
                  {['Samosa', 'Bread Pakora', 'Aloo Bonda', 'Veg Cutlet', 'Onion Pakora'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                5:00 PM – 6:00 PM Student Turnout (Entrance Headcount)
              </label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.student_count}
                onChange={(e) => setFormData({ ...formData, student_count: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Portions Prepared</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.prepared_quantity}
                  onChange={(e) => setFormData({ ...formData, prepared_quantity: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Remaining at 7:00 PM</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.remaining_quantity}
                  onChange={(e) => {
                    const rem = parseInt(e.target.value, 10);
                    setFormData({
                      ...formData,
                      remaining_quantity: e.target.value,
                      sold_out: rem === 0,
                    });
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                id="sold_out_chk"
                checked={formData.sold_out}
                onChange={(e) => setFormData({ ...formData, sold_out: e.target.checked })}
              />
              <label htmlFor="sold_out_chk" style={{ fontSize: '0.88rem', color: '#334155', cursor: 'pointer' }}>
                Food ran out before 7:00 PM (Stockout)
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-action-btn" disabled={submitting}>
              {submitting ? 'Saving...' : 'Add to Fieldwork Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
