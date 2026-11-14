import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsCharts({ analytics }) {
  if (!analytics || !analytics.by_day) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>Loading charts...</div>;
  }

  // 1. Day of Week Chart
  const dayData = {
    labels: analytics.by_day.map(d => d.day.slice(0, 3)),
    datasets: [
      {
        label: 'Avg Prepared',
        data: analytics.by_day.map(d => d.avg_prepared),
        backgroundColor: '#cbd5e1',
        borderRadius: 4,
      },
      {
        label: 'Avg Sold',
        data: analytics.by_day.map(d => d.avg_sold),
        backgroundColor: '#ea580c',
        borderRadius: 4,
      },
    ],
  };

  // 2. Turnout vs Consumption Correlation
  const sorted = [...(analytics.turnout_vs_consumption || [])].sort((a, b) => a.student_count - b.student_count);
  const trendData = {
    labels: sorted.map(i => `${i.student_count}`),
    datasets: [
      {
        label: 'Snacks Sold',
        data: sorted.map(i => i.sold_quantity),
        borderColor: '#ea580c',
        backgroundColor: 'rgba(234, 88, 12, 0.1)',
        tension: 0.2,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 10, font: { size: 10 } } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { font: { size: 10 } } },
      x: { ticks: { font: { size: 10 } } },
    },
  };

  return (
    <div className="charts-grid-simple">
      <div className="card">
        <div className="card-title" style={{ fontSize: '0.92rem' }}>Demand by Day of Week</div>
        <div className="card-desc" style={{ marginBottom: 10 }}>Friday peaks at ~109 portions; Sunday drops to ~47.</div>
        <div className="chart-container-clean">
          <Bar data={dayData} options={options} />
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ fontSize: '0.92rem' }}>5–6 PM Turnout vs Demand</div>
        <div className="card-desc" style={{ marginBottom: 10 }}>Strong linear signal (r = 0.987): early footfall dictates final demand.</div>
        <div className="chart-container-clean">
          <Line data={trendData} options={options} />
        </div>
      </div>
    </div>
  );
}
