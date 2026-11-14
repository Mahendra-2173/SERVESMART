import React, { useState } from 'react';
import { Download, PlusCircle, Search, Filter } from 'lucide-react';
import { api } from '../services/api';

export default function RecordsTable({ records, onOpenAddModal }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [weatherFilter, setWeatherFilter] = useState('ALL');
  const [dayFilter, setDayFilter] = useState('ALL');

  const filtered = (records || []).filter((r) => {
    const matchesSearch =
      r.snack_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.date.includes(searchTerm) ||
      r.day.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWeather = weatherFilter === 'ALL' || r.weather.toLowerCase() === weatherFilter.toLowerCase();
    const matchesDay = dayFilter === 'ALL' || r.day.toLowerCase() === dayFilter.toLowerCase();
    return matchesSearch && matchesWeather && matchesDay;
  });

  const getWeatherBadge = (weather) => {
    const w = (weather || '').toLowerCase();
    if (w.includes('sun')) return 'badge sunny';
    if (w.includes('rain')) return 'badge rainy';
    if (w.includes('drizzle')) return 'badge drizzle';
    return 'badge cloudy';
  };

  return (
    <div className="table-panel">
      <div className="table-toolbar">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search date, snack, day..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={weatherFilter}
            onChange={(e) => setWeatherFilter(e.target.value)}
          >
            <option value="ALL">All Weathers</option>
            <option value="Sunny">Sunny</option>
            <option value="Cloudy">Cloudy</option>
            <option value="Rainy">Rainy</option>
            <option value="Drizzle">Drizzle</option>
          </select>

          <select
            className="filter-select"
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
          >
            <option value="ALL">All Days</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <a
            href={api.getExportUrl()}
            download="messmate_fieldwork_data.csv"
            className="secondary-btn"
            style={{ padding: '8px 14px', textDecoration: 'none' }}
          >
            <Download size={15} />
            Export CSV
          </a>

          <button
            className="primary-action-btn"
            style={{ padding: '8px 14px' }}
            onClick={onOpenAddModal}
          >
            <PlusCircle size={15} />
            Add Observation
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Weather</th>
              <th>5-6 PM Turnout</th>
              <th>Prepared</th>
              <th>Remaining</th>
              <th>Sold / Consumed</th>
              <th>Sold Out?</th>
              <th>Snack Item</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  No matching observations found.
                </td>
              </tr>
            ) : (
              filtered.map((row, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 600 }}>{row.date}</td>
                  <td>{row.day}</td>
                  <td>
                    <span className={getWeatherBadge(row.weather)}>
                      {row.weather}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#2563eb' }}>
                    {row.student_count}
                  </td>
                  <td>{row.prepared_quantity}</td>
                  <td>
                    {row.remaining_quantity > 0 ? (
                      <span style={{ color: '#d97706', fontWeight: 600 }}>
                        {row.remaining_quantity}
                      </span>
                    ) : (
                      <span style={{ color: '#64748b' }}>0</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 700, color: '#16a34a' }}>
                    {row.sold_quantity}
                  </td>
                  <td>
                    {row.sold_out ? (
                      <span className="badge danger">YES (Ran Out)</span>
                    ) : (
                      <span className="badge success">Surplus/Met</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{row.snack_type}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
