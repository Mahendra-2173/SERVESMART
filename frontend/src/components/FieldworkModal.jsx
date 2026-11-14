import React from 'react';
import { X, MapPin, Calendar, UserCheck, MessageSquareQuote, AlertCircle, Camera } from 'lucide-react';

export default function FieldworkModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={22} color="#ea580c" />
            Fieldwork & Cook Profile
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#334155' }}>
          {/* Cook & Location Info Card */}
          <div style={{ background: '#fff7ed', border: '1px solid #fdba74', borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <UserCheck size={18} color="#c2410c" />
              <strong style={{ fontSize: '1.05rem', color: '#9a3412' }}>
                Cook Profile: Rameshwar Prasad ("Ramesh Bhaiya")
              </strong>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.84rem' }}>
              <div><strong>Role:</strong> Head Snack Cook (Evening Shift Lead)</div>
              <div><strong>Location:</strong> Block 3 Kaveri Hostel Mess, Main Campus</div>
              <div><strong>Operating Hours:</strong> 5:00 PM – 7:00 PM (Daily Snacks)</div>
              <div><strong>Fieldwork Window:</strong> Oct 5, 2026 – Oct 28, 2026 (24 Sessions)</div>
            </div>
          </div>

          {/* 3 Cook Quotes */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontWeight: 700, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MessageSquareQuote size={18} color="#2563eb" />
              Three Key Insights Stated by Ramesh Bhaiya:
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <blockquote style={{ background: '#f8fafc', borderLeft: '4px solid #ea580c', padding: '10px 14px', borderRadius: 6, fontStyle: 'italic' }}>
                "Friday shaam ko ladke labs se aate hain toh unko garam samosa turant chahiye hota hai. Agar 6:30 baje khatam ho gaya toh jhagda karte hain."
                <div style={{ fontStyle: 'normal', fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>
                  (Translation: On Friday evenings, students finish labs and rush for hot samosas. If food runs out before 6:30 PM, students get agitated.)
                </div>
              </blockquote>

              <blockquote style={{ background: '#f8fafc', borderLeft: '4px solid #ea580c', padding: '10px 14px', borderRadius: 6, fontStyle: 'italic' }}>
                "Baarish hoti hai toh chai aur pakora ka demand achanak double ho jata hai, par agar tez toofan aa jaye toh hostel ke kamron se koi nikalta hi nahi."
                <div style={{ fontStyle: 'normal', fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>
                  (Translation: When it drizzles, demand for hot tea and pakoras surges; but torrential storms trap students in rooms or labs, causing sudden drops.)
                </div>
              </blockquote>

              <blockquote style={{ background: '#f8fafc', borderLeft: '4px solid #ea580c', padding: '10px 14px', borderRadius: 6, fontStyle: 'italic' }}>
                "Main pehle andaze se banata tha ki chalo 90 plate bana lo, par somwar ko bach jata tha aur shukrawar ko kam padta tha."
                <div style={{ fontStyle: 'normal', fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>
                  (Translation: Earlier I just guessed 90 portions every day by habit; Mondays always had leftovers, while Fridays consistently suffered shortages.)
                </div>
              </blockquote>
            </div>
          </div>

          {/* Surprising Observation */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 14, marginBottom: 20 }}>
            <h4 style={{ fontWeight: 700, color: '#166534', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={17} />
              Surprising Fieldwork Observation: The "Rain Paradox"
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#14532d' }}>
              Light drizzle or cool overcast evenings cause snack demand to surge by <strong>+20% to +25%</strong> as students crave fried pakoras with tea. In contrast, heavy torrential downpours at 5:00 PM physically trap students in academic buildings 1 km away; turnout drops sharply between 5:00 PM – 6:00 PM, causing high wastage if batch sizes are not scaled back.
            </p>
          </div>

          {/* Photographic Documentation Placeholders */}
          <div>
            <h4 style={{ fontWeight: 700, color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Camera size={18} color="#475569" />
              Fieldwork Photo Documentation
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, background: '#f8fafc', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>Photo 1: Entrance Headcount Counter</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', margin: '4px 0' }}>Timestamp: 2026-10-14 17:15:22 IST</div>
                <div style={{ height: 90, background: '#e2e8f0', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', color: '#64748b' }}>
                  [Kaveri Mess Entrance - Student Turnout Observation Point]
                </div>
              </div>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, background: '#f8fafc', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>Photo 2: Hot Samosa Batch Prep</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', margin: '4px 0' }}>Timestamp: 2026-10-16 18:05:40 IST</div>
                <div style={{ height: 90, background: '#e2e8f0', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', color: '#64748b' }}>
                  [Ramesh Bhaiya at Deep Frying Counter - 6:05 PM Batch]
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="primary-action-btn" onClick={onClose}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
