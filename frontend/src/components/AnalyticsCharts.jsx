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
  Filler,
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
  Legend,
  Filler
);

export default function AnalyticsCharts({ analytics }) {
  if (!analytics || !analytics.by_day) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading analytics data...</div>;
  }

  // 1. Day of Week Chart
  const dayLabels = analytics.by_day.map((d) => d.day);
  const dayData = {
    labels: dayLabels,
    datasets: [
      {
        label: 'Avg Prepared Portions',
        data: analytics.by_day.map((d) => d.avg_prepared),
        backgroundColor: 'rgba(203, 213, 225, 0.7)',
        borderRadius: 4,
      },
      {
        label: 'Avg Sold Portions',
        data: analytics.by_day.map((d) => d.avg_sold),
        backgroundColor: 'rgba(234, 88, 12, 0.85)',
        borderRadius: 4,
      },
      {
        label: 'Avg Student Turnout (5-6 PM)',
        data: analytics.by_day.map((d) => d.avg_student_count),
        backgroundColor: 'rgba(37, 99, 235, 0.75)',
        borderRadius: 4,
      },
    ],
  };

  // 2. Weather Impact Chart
  const weatherLabels = analytics.by_weather.map((w) => w.weather);
  const weatherData = {
    labels: weatherLabels,
    datasets: [
      {
        label: 'Avg Snacks Consumed',
        data: analytics.by_weather.map((w) => w.avg_sold),
        backgroundColor: 'rgba(234, 88, 12, 0.85)',
        borderRadius: 6,
      },
      {
        label: 'Stockout Days (Ran Out Before 7 PM)',
        data: analytics.by_weather.map((w) => w.stockouts),
        backgroundColor: 'rgba(220, 38, 38, 0.8)',
        borderRadius: 6,
      },
    ],
  };

  // 3. Early Turnout vs Final Consumption (Correlation)
  // Sort by student count
  const sortedTurnout = [...(analytics.turnout_vs_consumption || [])].sort(
    (a, b) => a.student_count - b.student_count
  );
  const correlationData = {
    labels: sortedTurnout.map((item) => `${item.student_count} arrivals`),
    datasets: [
      {
        label: 'Final Snacks Consumed',
        data: sortedTurnout.map((item) => item.sold_quantity),
        borderColor: '#ea580c',
        backgroundColor: 'rgba(234, 88, 12, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#ea580c',
        pointRadius: 4,
      },
    ],
  };

  // 4. Prepared vs Sold Timeline (24 Fieldwork Days)
  const timelineData = {
    labels: (analytics.prepared_vs_sold_timeline || []).map((t) => `${t.date.slice(5)} (${t.day})`),
    datasets: [
      {
        label: 'Prepared Quantity',
        data: (analytics.prepared_vs_sold_timeline || []).map((t) => t.prepared),
        borderColor: '#64748b',
        borderDash: [5, 5],
        fill: false,
        tension: 0.2,
      },
      {
        label: 'Sold Quantity',
        data: (analytics.prepared_vs_sold_timeline || []).map((t) => t.sold),
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.15)',
        fill: true,
        tension: 0.2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { boxWidth: 12, font: { size: 11 } },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { font: { size: 10 } },
      },
      x: {
        ticks: { font: { size: 10 } },
      },
    },
  };

  return (
    <div className="charts-grid">
      {/* Chart 1: Weekday Pattern */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title">Demand Across Weekdays</div>
          <div className="chart-desc">
            Friday peaks at ~110 portions; Sundays drop to ~47 as students go off-campus.
          </div>
        </div>
        <div className="chart-wrapper">
          <Bar data={dayData} options={chartOptions} />
        </div>
      </div>

      {/* Chart 2: Weather Impact */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title">Demand & Stockouts by Weather</div>
          <div className="chart-desc">
            Rainy & Drizzle days see 100% stockout rates if batch size isn't boosted.
          </div>
        </div>
        <div className="chart-wrapper">
          <Bar data={weatherData} options={chartOptions} />
        </div>
      </div>

      {/* Chart 3: Turnout Correlation */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title">Early 5-6 PM Turnout vs Total Consumption</div>
          <div className="chart-desc">
            Strong linear momentum: high 5-6 PM footfall consistently leads to high 6-7 PM demand.
          </div>
        </div>
        <div className="chart-wrapper">
          <Line data={correlationData} options={chartOptions} />
        </div>
      </div>

      {/* Chart 4: Prepared vs Sold Timeline */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title">Prepared vs Actual Consumed Timeline</div>
          <div className="chart-desc">
            Historical gap shows food wastage on low turnout days vs shortages on sudden spikes.
          </div>
        </div>
        <div className="chart-wrapper">
          <Line data={timelineData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
