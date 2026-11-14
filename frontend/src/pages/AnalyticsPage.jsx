import React from 'react';
import { BarChart3, TrendingUp, CloudRain } from 'lucide-react';
import AnalyticsCharts from '../components/AnalyticsCharts';

export default function AnalyticsPage({ analytics }) {
  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <BarChart3 size={24} color="#ea580c" />
            Demand & Consumption Analytics
          </h2>
          <div className="section-desc">
            Visual comparisons across weekdays, weather conditions, student turnout velocities, and prepared vs sold trends.
          </div>
        </div>
      </div>

      <AnalyticsCharts analytics={analytics} />

      {/* Fieldwork Insights Card */}
      <div style={{ marginTop: 28, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp size={18} color="#16a34a" />
          Fieldwork Data Takeaways for Mess Operations
        </h3>
        <ul style={{ paddingLeft: 20, fontSize: '0.88rem', color: '#475569', lineHeight: 1.7 }}>
          <li>
            <strong>Weekday Disparity:</strong> Student snack demand follows a sharp curve — Friday peak demand averages 108 portions, while Sunday dips to 47 portions. Preparing a static 90 portions daily causes ~35 portions wasted every Sunday and shortages every Friday.
          </li>
          <li>
            <strong>Turnout Velocity (5-6 PM):</strong> The number of students passing the entrance counter between 5:00 PM and 6:00 PM accounts for ~65% of total evening footfall, providing a reliable early indicator for the 6:00 PM – 7:00 PM rush.
          </li>
          <li>
            <strong>Weather Modifiers:</strong> Overcast and drizzly weather shifts student cravings towards hot fried snacks (pakoras, bondas) by +18–25%, whereas heavy thunderstorms delay lab dismissals.
          </li>
        </ul>
      </div>
    </div>
  );
}
