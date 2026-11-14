import React, { useState } from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  TrendingUp, 
  BookmarkPlus, 
  Info, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle 
} from 'lucide-react';

export default function PredictionResult({ 
  prediction, 
  inputData, 
  onSaveHistory 
}) {
  const [showExplanation, setShowExplanation] = useState(true);
  const [saved, setSaved] = useState(false);

  if (!prediction) {
    return (
      <div className="result-panel" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ color: '#94a3b8', marginBottom: 12 }}>
          <HelpCircle size={48} style={{ margin: '0 auto', opacity: 0.5 }} />
        </div>
        <h3 style={{ fontSize: '1.15rem', color: '#334155', fontWeight: 700 }}>
          No Prediction Generated Yet
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: 360, margin: '8px auto 0' }}>
          Enter today's weather and 5:00 PM – 6:00 PM student entry count on the left, then click "Generate Preparation Recommendation".
        </p>
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

  const confClass = prediction.confidence_level || 'moderate';

  return (
    <div className="result-panel">
      {/* Hero Recommendation Box */}
      <div className="result-hero-box">
        <span className="hero-box-tag">Recommended Preparation Batch</span>
        <div className="hero-number">
          {prediction.recommended_quantity}
        </div>
        <div className="hero-portion-label">
          {inputData.snack_type} Portions / Pieces
        </div>

        <div className="hero-sub-stats">
          <div className="hero-sub-item">
            <span className="hero-sub-val">
              {prediction.estimated_demand_min} – {prediction.estimated_demand_max}
            </span>
            <span className="hero-sub-lbl">Estimated Demand</span>
          </div>
          <div className="hero-sub-item">
            <span className="hero-sub-val">
              ~{prediction.expected_leftover} portions
            </span>
            <span className="hero-sub-lbl">Safe Kitchen Buffer</span>
          </div>
        </div>
      </div>

      {/* Meta indicators */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Historical Comparison: </span>
          <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>
            {prediction.comparison_text}
          </span>
        </div>

        <div className={`confidence-pill ${confClass}`}>
          {confClass === 'high' && <CheckCircle2 size={14} />}
          {confClass === 'moderate' && <TrendingUp size={14} />}
          {confClass === 'low' && <AlertTriangle size={14} />}
          Data Confidence: {prediction.confidence}
        </div>
      </div>

      {/* Explainable Logic Drawer */}
      <div className="explain-card">
        <div 
          className="explain-header" 
          onClick={() => setShowExplanation(!showExplanation)}
          style={{ cursor: 'pointer', justifyContent: 'space-between', userSelect: 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Info size={16} color="#ea580c" />
            <span>Why this exact quantity? (Transparent Cook's Logic)</span>
          </div>
          {showExplanation ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>

        {showExplanation && (
          <div className="explain-step-list">
            {prediction.explanation_steps && prediction.explanation_steps.map((step, idx) => (
              <div key={idx} className="explain-step">
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="result-actions">
        <button 
          className="primary-action-btn"
          onClick={handleSave}
          disabled={saved}
        >
          <BookmarkPlus size={16} />
          {saved ? '✓ Saved to Prediction History' : 'Save to Prediction History'}
        </button>
      </div>
    </div>
  );
}
