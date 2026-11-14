import React, { useState } from 'react';
import PredictionForm from '../components/PredictionForm';
import PredictionResult from '../components/PredictionResult';
import { api } from '../services/api';

export default function PredictPage({ onPredictionLogged }) {
  const [formData, setFormData] = useState({
    day: 'Wednesday',
    weather: 'Sunny',
    student_count: 82,
    snack_type: 'Samosa',
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.predictBatch({
        day: formData.day,
        weather: formData.weather,
        student_count: parseInt(formData.student_count, 10),
        snack_type: formData.snack_type,
      });

      if (!res.success) {
        throw new Error(res.error || 'Prediction calculation failed');
      }

      setPrediction(res.prediction);
    } catch (err) {
      setError(err.message || 'Failed to generate recommendation.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHistory = async (savePayload) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await api.logPrediction({
        date: today,
        ...savePayload,
      });
      if (onPredictionLogged) onPredictionLogged();
    } catch (err) {
      console.error('Failed to log prediction to history', err);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            Cook's Batch Quantity Predictor
          </h2>
          <div className="section-desc">
            Calculate recommended evening snack batch size using 5:00 PM – 6:00 PM entrance headcount.
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: 8, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div className="prediction-grid">
        <PredictionForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handlePredict}
          loading={loading}
        />

        <PredictionResult
          prediction={prediction}
          inputData={formData}
          onSaveHistory={handleSaveHistory}
        />
      </div>
    </div>
  );
}
