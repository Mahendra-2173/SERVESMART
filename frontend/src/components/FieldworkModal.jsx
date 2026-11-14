import React from 'react';
import { X, MapPin, UserCheck, MessageSquareQuote, AlertCircle } from 'lucide-react';

export default function FieldworkModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
            <MapPin size={18} color="#ea580c" />
            Fieldwork & Cook Profile
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-card-body">
          {/* Cook Summary */}
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: '#9a3412', marginBottom: 4 }}>
              Cook: Rameshwar Prasad ("Ramesh Bhaiya")
            </div>
            <div style={{ fontSize: '0.8rem', color: '#7c2d12', lineHeight: 1.5 }}>
              • Role: Head Snack Cook (Evening Shift Lead)<br />
              • Location: Block 3 Kaveri Boys Hostel Mess, Main Campus<br />
              • Shift: 5:00 PM – 7:00 PM Daily (Samosas, Pakoras, Cutlets)<br />
              • Fieldwork Period: Oct 5 – Oct 28, 2026 (24 Sessions)
            </div>
          </div>

          {/* Key Quotes */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MessageSquareQuote size={15} color="#2563eb" />
              Direct Quotes from Ramesh Bhaiya:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8rem', color: '#334155' }}>
              <div style={{ background: '#f8fafc', borderLeft: '3px solid #ea580c', padding: '6px 10px', borderRadius: 4 }}>
                <em>"Friday shaam ko ladke labs se aate hain toh garam samosa chahiye hota hai. 6:30 pe khatam ho gaya toh jhagda karte hain."</em>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 2 }}>
                  (Friday evenings students finish labs and rush for hot snacks; running out before 6:30 PM causes complaints.)
                </div>
              </div>

              <div style={{ background: '#f8fafc', borderLeft: '3px solid #ea580c', padding: '6px 10px', borderRadius: 4 }}>
                <em>"Baarish hoti hai toh chai-pakora ka demand double ho jata hai, par tez toofan aa jaye toh koi bahar nahi nikalta."</em>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 2 }}>
                  (Light drizzle doubles tea-pakora cravings, but torrential storms trap students in rooms or labs.)
                </div>
              </div>

              <div style={{ background: '#f8fafc', borderLeft: '3px solid #ea580c', padding: '6px 10px', borderRadius: 4 }}>
                <em>"Pehle andaze se roz 90 plate banata tha; somwar ko 15 bach jate the aur shukrawar ko 80 pe hi khatam ho jata tha."</em>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 2 }}>
                  (Earlier I guessed a flat 90 portions daily; Mondays had 15 leftovers while Fridays ran out at 80.)
                </div>
              </div>
            </div>
          </div>

          {/* Surprising Observation */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 10, fontSize: '0.8rem', color: '#166534' }}>
            <strong>The Rain Paradox:</strong> Light drizzle boosts snack cravings by +20% to +25%. Heavy torrential downpours at 5:00 PM trap students 1.2 km away in academic buildings, sharply reducing early turnout. The 5–6 PM headcount reflects whether students actually made it back.
          </div>
        </div>

        <div className="modal-card-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
