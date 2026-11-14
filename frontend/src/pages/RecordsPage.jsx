import React from 'react';
import { Database } from 'lucide-react';
import RecordsTable from '../components/RecordsTable';

export default function RecordsPage({ records, onOpenAddModal }) {
  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <Database size={24} color="#ea580c" />
            Fieldwork Observation Records
          </h2>
          <div className="section-desc">
            Directly collected observations from Block 3 Kaveri Mess (Oct 5 – Oct 28). Stored in <code>data/data.csv</code>.
          </div>
        </div>
      </div>

      <RecordsTable records={records} onOpenAddModal={onOpenAddModal} />
    </div>
  );
}
