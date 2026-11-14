import React, { useState } from 'react';
import RecordsTable from '../components/RecordsTable';

export default function RecordsPage({ records, history, onOpenAddModal }) {
  const [viewMode, setViewMode] = useState('data'); // 'data' or 'history'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
            {viewMode === 'data' ? 'Fieldwork Observation Records' : 'Past Prediction History'}
          </h2>
          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
            {viewMode === 'data'
              ? '24 verified daily evening snack sessions from Block 3 Kaveri Mess.'
              : 'Log of generated batch recommendations and actual evening consumption.'}
          </div>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3 }}>
          <button
            onClick={() => setViewMode('data')}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: viewMode === 'data' ? '#ffffff' : 'transparent',
              color: viewMode === 'data' ? '#ea580c' : '#64748b',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              boxShadow: viewMode === 'data' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            Fieldwork Records ({records.length})
          </button>
          <button
            onClick={() => setViewMode('history')}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: viewMode === 'history' ? '#ffffff' : 'transparent',
              color: viewMode === 'history' ? '#ea580c' : '#64748b',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              boxShadow: viewMode === 'history' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            Prediction History ({history?.length || 0})
          </button>
        </div>
      </div>

      {viewMode === 'data' ? (
        <RecordsTable records={records} onOpenAddModal={onOpenAddModal} />
      ) : (
        <div className="card">
          {(!history || history.length === 0) ? (
            <div style={{ textAlign: 'center', padding: 30, color: '#64748b', fontSize: '0.85rem' }}>
              No predictions logged yet. Calculate a batch in the Batch Predictor and click "Save to Prediction Log".
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>Date / Day</th>
                    <th>Snack</th>
                    <th>Weather</th>
                    <th>Turnout</th>
                    <th>Recommended</th>
                    <th>Actual Prepared</th>
                    <th>Actual Sold</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i}>
                      <td><strong>{h.date}</strong> ({h.day})</td>
                      <td>{h.snack_type}</td>
                      <td>{h.weather}</td>
                      <td>{h.student_count}</td>
                      <td style={{ color: '#ea580c', fontWeight: 700 }}>{h.recommended_quantity}</td>
                      <td>{h.actual_prepared ?? h.recommended_quantity}</td>
                      <td style={{ color: '#16a34a', fontWeight: 700 }}>{h.actual_consumed ?? 'Pending'}</td>
                      <td>
                        <span className={`badge-clean ${h.status === 'Evaluated' ? 'ok' : 'sunny'}`}>
                          {h.status || 'Logged'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
