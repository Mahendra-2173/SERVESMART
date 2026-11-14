import React, { useState } from 'react';
import { BookmarkPlus, Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export default function PredictionResult({ prediction, inputData, onSaveHistory }) {
  const [saved, setSaved] = useState(false);
  const [showMath, setShowMath] = useState(false);

  if (!prediction) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 280, textAlign: 'center', color: '#94a3b8' }}>
        <Sparkles size={36} style={{ opacity: 0.35, marginBottom: 8 }} />
        <div style={{ fontWeight: 600, color: '#64748b', fontSize: '0.95rem' }}>No Batch Calculated Yet</div>
        <div style={{ fontSize: '0.8rem', maxWidth: 280, marginTop: 4 }}>
          Enter today's weather and 5–6 PM headcount on the left to get a recommended preparation quantity.
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (saved) return;
    onSaveHistory({
      day: inputData.day,
      weather: inputData.weather,
      snack_type: inputData.snack_type,
      student_count: inputData.student_count,
      recommended_quantity: prediction.recommended_quantity,
      actual_prepared: prediction.recommended_quantity,
      notes: `Batch recommendation based on ${prediction.cohort_desc}`
    });
    setSaved(true);
  };

  return (
    <div className="card">
      <div className="result-box">
        <span className="result-badge">Recommended Batch</span>
        <div className="result-qty">{prediction.recommended_quantity}</div>
        <div className="result-item-name">{inputData.snack_type} Portions</div>

        <div className="result-metrics">
          <div>
            <div className="metric-val">{prediction.estimated_demand_min}–{prediction.estimated_demand_max}</div>
            <div className="metric-lbl">Expected Demand</div>
          </div>
          <div>
            <div className="metric-val">+{prediction.safety_buffer_applied}</div>
            <div className="metric-lbl">Kitchen Buffer</div>
          </div>
          <div>
            <div className="metric-val" style={{ color: prediction.confidence_level === 'high' ? '#16a34a' : '#ea580c' }}>
              {prediction.confidence}
            </div>
            <div className="metric-lbl">Confidence</div>
          </div>
        </div>

        {/* Clean Human-Friendly Explanation */}
        <div className="explanation-text">
          <strong>Cook's Summary:</strong> On similar {inputData.day}s, demand averaged {prediction.historical_average} portions.
          Today's 5:00–6:00 PM turnout ({inputData.student_count}) indicates ~{Math.round((prediction.estimated_demand_min + prediction.estimated_demand_max) / 2)} portions needed. 
          Preparing <strong>{prediction.recommended_quantity} {inputData.snack_type}s</strong> safely covers demand with ~{prediction.expected_leftover} portions safe margin.
        </div>

        {/* Optional step breakdown for evaluators */}
        <div style={{ textAlign: 'left', marginBottom: 14 }}>
          <button
            type="button"
            onClick={() => setShowMath(!showMath)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: 0
            }}
          >
            {showMath ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {showMath ? 'Hide calculation steps' : 'View calculation breakdown'}
          </button>

          {showMath && (
            <div style={{ marginTop: 8, padding: 10, background: '#ffffff', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {prediction.explanation_steps?.map((step, idx) => (
                <div key={idx}>• {step}</div>
              ))}
            </div>
          )}
        </div>

        <button
          className="btn-secondary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={handleSave}
          disabled={saved}
        >
          {saved ? (
            <>
              <Check size={14} color="#16a34a" />
              Saved to Prediction Log
            </>
          ) : (
            <>
              <BookmarkPlus size={14} />
              Save to Prediction Log
            </>
          )}
        </button>
      </div>
    </div>
  );
}
