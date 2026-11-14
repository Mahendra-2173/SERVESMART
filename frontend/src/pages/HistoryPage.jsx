import React, { useState } from 'react';
import { History, CheckCircle, Edit3, Save } from 'lucide-react';
import { api } from '../services/api';

export default function HistoryPage({ history, onRefreshHistory }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    actual_prepared: '',
    actual_consumed: '',
    remaining_quantity: '',
    notes: '',
  });

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      actual_prepared: item.actual_prepared ?? item.recommended_quantity,
      actual_consumed: item.actual_consumed ?? '',
      remaining_quantity: item.remaining_quantity ?? '',
      notes: item.notes || '',
    });
  };

  const handleSaveActuals = async (id) => {
    try {
      const consumed = parseInt(editForm.actual_consumed, 10);
      const prepared = parseInt(editForm.actual_prepared, 10);
      const remaining = isNaN(editForm.remaining_quantity) || editForm.remaining_quantity === ''
        ? Math.max(0, prepared - consumed)
        : parseInt(editForm.remaining_quantity, 10);

      await api.updateHistoryActuals(id, {
        actual_prepared: prepared,
        actual_consumed: consumed,
        remaining_quantity: remaining,
        notes: editForm.notes,
      });

      setEditingId(null);
      if (onRefreshHistory) onRefreshHistory();
    } catch (err) {
      alert('Failed to update actuals: ' + err.message);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <History size={24} color="#ea580c" />
            Prediction vs Actuals History
          </h2>
          <div className="section-desc">
            Track past batch recommendations and record actual evening consumption to evaluate model accuracy.
          </div>
        </div>
      </div>

      <div>
        {(!history || history.length === 0) ? (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 40, textAlign: 'center', color: '#64748b' }}>
            No prediction logs yet. Generate a batch prediction from the "Cook's Predictor" tab and click "Save to Prediction History".
          </div>
        ) : (
          history.map((item) => {
            const isEditing = editingId === item.id;
            const diff = item.actual_consumed !== undefined && item.actual_consumed !== null
              ? item.recommended_quantity - item.actual_consumed
              : null;

            return (
              <div key={item.id} className="history-card">
                <div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                    {item.date || 'Today'} • {item.day}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    {item.snack_type}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: 2 }}>
                    Weather: <strong>{item.weather}</strong> | Turnout: <strong>{item.student_count}</strong>
                  </div>
                </div>

                {isEditing ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Actual Prepared</label>
                      <input
                        type="number"
                        className="form-input"
                        style={{ padding: '6px 8px', fontSize: '0.88rem' }}
                        value={editForm.actual_prepared}
                        onChange={(e) => setEditForm({ ...editForm, actual_prepared: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Actual Consumed</label>
                      <input
                        type="number"
                        className="form-input"
                        style={{ padding: '6px 8px', fontSize: '0.88rem' }}
                        value={editForm.actual_consumed}
                        onChange={(e) => setEditForm({ ...editForm, actual_consumed: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Remaining at 7 PM</label>
                      <input
                        type="number"
                        className="form-input"
                        style={{ padding: '6px 8px', fontSize: '0.88rem' }}
                        value={editForm.remaining_quantity}
                        onChange={(e) => setEditForm({ ...editForm, remaining_quantity: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Recommended</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ea580c' }}>
                        {item.recommended_quantity}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Actual Prepared</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                        {item.actual_prepared ?? item.recommended_quantity}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Actual Consumed</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>
                        {item.actual_consumed !== undefined && item.actual_consumed !== null ? item.actual_consumed : 'Pending'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Accuracy Gap</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: diff !== null ? (Math.abs(diff) <= 6 ? '#16a34a' : '#ea580c') : '#64748b' }}>
                        {diff !== null ? `${diff > 0 ? '+' : ''}${diff}` : '—'}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  {isEditing ? (
                    <button
                      className="primary-action-btn"
                      style={{ padding: '8px 14px' }}
                      onClick={() => handleSaveActuals(item.id)}
                    >
                      <Save size={15} />
                      Save Actuals
                    </button>
                  ) : (
                    <button
                      className="secondary-btn"
                      style={{ padding: '8px 14px' }}
                      onClick={() => handleStartEdit(item)}
                    >
                      <Edit3 size={15} />
                      {item.status === 'Evaluated' ? 'Edit Actuals' : 'Log Evening Actuals'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
