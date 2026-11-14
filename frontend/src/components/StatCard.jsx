import React from 'react';

export default function StatCard({ 
  title, 
  value, 
  subtext, 
  icon: Icon, 
  variant = 'primary',
  unit = '' 
}) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className="stat-card-icon">
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="stat-card-value">
        {value}
        {unit && <span style={{ fontSize: '1rem', fontWeight: 600, marginLeft: 4 }}>{unit}</span>}
      </div>
      {subtext && <div className="stat-card-sub">{subtext}</div>}
    </div>
  );
}
