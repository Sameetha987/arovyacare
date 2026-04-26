import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Stethoscope, Activity, ChevronRight, ArrowLeft } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useLocation} from "react-router-dom";

/* ─── helpers ─── */
const toNum = (v) => parseFloat(v) || 0;

const fmt = (d) => {
  if (!d) return "—";
  const date = d?.toDate ? d.toDate() : new Date(d);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/* ─── styles ─── */
const injectStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

  .pd-root {
    font-family: 'DM Sans', sans-serif;
    background: #fdf6f9;
    min-height: 100vh;
    padding: 2rem 2.5rem;
    position: relative;
  }
  .pd-root::before {
    content:''; position:fixed; top:-200px; right:-200px;
    width:600px; height:600px; pointer-events:none; z-index:0;
    background: radial-gradient(circle, rgba(255,182,213,0.18) 0%, transparent 70%);
  }
  .pd-root::after {
    content:''; position:fixed; bottom:-150px; left:-150px;
    width:500px; height:500px; pointer-events:none; z-index:0;
    background: radial-gradient(circle, rgba(196,181,253,0.13) 0%, transparent 70%);
  }

  .pd-back {
    display:inline-flex; align-items:center; gap:6px;
    font-size:0.82rem; color:#9ca3af; background:none; border:none;
    cursor:pointer; font-family:'DM Sans',sans-serif; padding:0;
    margin-bottom:1.5rem; position:relative; z-index:1; transition:color 0.2s;
  }
  .pd-back:hover { color:#be185d; }

  /* ── HERO (compact strip) ── */
  .hero-strip {
    background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
    border-radius: 24px;
    padding: 1.4rem 1.8rem;
    color: white;
    display: flex;
    align-items: center;
    gap: 1.2rem;
    margin-bottom: 1.2rem;
    position: relative;
    z-index: 1;
    box-shadow: 0 10px 36px rgba(236,72,153,0.28);
    overflow: hidden;
  }
  .hero-strip::before {
    content:''; position:absolute; top:-50px; right:-50px;
    width:180px; height:180px; border-radius:50%;
    background: rgba(255,255,255,0.07); pointer-events:none;
  }
  .hero-strip::after {
    content:''; position:absolute; bottom:-70px; left:35%;
    width:220px; height:220px; border-radius:50%;
    background: rgba(255,255,255,0.04); pointer-events:none;
  }
  .hero-avatar {
    width:52px; height:52px; border-radius:16px;
    background: rgba(255,255,255,0.2);
    display:flex; align-items:center; justify-content:center;
    font-family:'Playfair Display',serif; font-size:1.6rem; font-weight:700;
    color:white; flex-shrink:0;
  }
  .hero-info { flex:1; min-width:0; }
  .hero-name {
    font-family:'Playfair Display',serif; font-size:1.4rem; font-weight:700;
    margin:0 0 2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }
  .hero-meta-row {
    display:flex; gap:16px; font-size:0.82rem; opacity:0.88; flex-wrap:wrap; margin-top:2px;
  }
  .hero-meta-item { display:flex; align-items:center; gap:4px; }
  .risk-pill {
    flex-shrink:0; padding:7px 18px; border-radius:30px;
    font-family:'Playfair Display',serif; font-size:1rem; font-weight:700;
    color:white; text-align:right;
  }
  .risk-pill-wrap { text-align:right; flex-shrink:0; }
  .risk-pill-label { font-size:0.68rem; opacity:0.75; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:5px; }
  .risk-pill.high { background:rgba(239,68,68,0.28); border:1.5px solid rgba(255,255,255,0.4); }
  .risk-pill.medium { background:rgba(245,158,11,0.28); border:1.5px solid rgba(255,255,255,0.4); }
  .risk-pill.low { background:rgba(34,197,94,0.28); border:1.5px solid rgba(255,255,255,0.4); }

  /* ── CHIPS ROW ── */
  .chips-row {
    display:flex; gap:10px; margin-bottom:1.2rem; position:relative; z-index:1; flex-wrap:wrap;
  }
  .chip {
    background:white; border-radius:14px; padding:10px 18px;
    box-shadow:0 2px 12px rgba(190,24,93,0.07); border:1px solid rgba(253,232,243,0.9);
    display:flex; flex-direction:column; align-items:center; flex:1; min-width:90px;
  }
  .chip-val {
    font-family:'Playfair Display',serif; font-size:1.3rem; font-weight:700; color:#1f1535;
  }
  .chip-label { font-size:0.68rem; color:#c084a8; text-transform:uppercase; letter-spacing:0.4px; font-weight:500; margin-top:2px; }

  /* ── CHECKUP BUTTON ── */
  .checkup-btn {
    display:inline-flex; align-items:center; gap:8px;
    background:linear-gradient(135deg,#ec4899,#8b5cf6);
    color:white; border:none; padding:10px 20px; border-radius:13px;
    font-size:0.86rem; font-weight:600; font-family:'DM Sans',sans-serif;
    cursor:pointer; box-shadow:0 4px 14px rgba(236,72,153,0.28);
    transition:transform 0.2s,box-shadow 0.2s;
    margin-bottom:1.2rem; position:relative; z-index:1;
  }
  .checkup-btn:hover { transform:translateY(-2px); box-shadow:0 8px 22px rgba(236,72,153,0.38); }

  /* ── CARDS ── */
  .info-card {
    background:rgba(255,255,255,0.97); border-radius:22px; padding:1.5rem;
    box-shadow:0 4px 24px rgba(190,24,93,0.06); border:1px solid rgba(253,232,243,0.8);
    margin-bottom:1.2rem; position:relative; z-index:1;
  }
  .section-title {
    font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:600;
    color:#1f1535; margin-bottom:1rem; display:flex; align-items:center; gap:8px;
  }
  .section-dot { width:8px; height:8px; border-radius:50%; background:linear-gradient(135deg,#be185d,#7c3aed); flex-shrink:0; }

  /* ── SUMMARY GRID ── */
  .summary-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; }
  .summary-item { border-radius:14px; padding:1.1rem; text-align:center; }
  .summary-item.pink { background:linear-gradient(135deg,#fdf2f8,#fce7f3); }
  .summary-item.blue { background:linear-gradient(135deg,#eff6ff,#dbeafe); }
  .summary-item.gray { background:#f9fafb; }
  .summary-label { font-size:0.68rem; color:#a78baa; font-weight:500; text-transform:uppercase; letter-spacing:0.4px; margin-bottom:6px; }
  .summary-value { font-family:'Playfair Display',serif; font-size:1.4rem; font-weight:700; color:#1f1535; }
  .summary-value.risk-high { color:#ef4444; }
  .summary-value.risk-med { color:#d97706; }
  .summary-value.risk-low { color:#16a34a; }

  /* ── TREND GRAPHS ── */
  .graphs-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
  .graph-card {
    background:white; border-radius:18px; border:1px solid rgba(253,232,243,0.8);
    box-shadow:0 2px 14px rgba(190,24,93,0.05); padding:1.2rem;
  }
  .graph-title { font-size:0.82rem; font-weight:600; color:#6b4a7e; margin-bottom:1rem; text-transform:uppercase; letter-spacing:0.3px; }
  .no-trend {
    background:white; border-radius:18px; border:1.5px dashed #fce7f3;
    padding:2.5rem; text-align:center; color:#c084a8;
  }
  .no-trend-icon {
    width:52px; height:52px; border-radius:16px; background:#fdf2f8;
    display:flex; align-items:center; justify-content:center; margin:0 auto 12px;
  }
  .no-trend-title { font-family:'Playfair Display',serif; font-size:1rem; color:#9ca3af; margin-bottom:4px; }
  .no-trend-sub { font-size:0.8rem; color:#c084a8; }

  /* ── VISIT LIST ── */
  .visit-row {
    display:flex; justify-content:space-between; align-items:center;
    padding:12px 15px; border-radius:14px; margin-bottom:9px;
    border:1.5px solid #fce7f3; cursor:pointer;
    transition:all 0.2s ease; background:white;
  }
  .visit-row:hover { background:#fdf2f8; border-color:#f9a8d4; transform:translateX(4px); box-shadow:0 4px 14px rgba(190,24,93,0.08); }
  .visit-row.latest { border-color:#f9a8d4; background:linear-gradient(135deg,rgba(253,242,248,0.6),white); }
  .visit-num { font-family:'Playfair Display',serif; font-size:0.95rem; font-weight:600; color:#1f1535; }
  .visit-meta { font-size:0.72rem; color:#c084a8; margin-top:2px; }
  .visit-latest-tag {
    font-size:0.65rem; font-weight:700; padding:2px 8px; border-radius:10px;
    background:linear-gradient(135deg,#fce7f3,#ede9fe); color:#be185d; margin-left:8px;
  }
  .risk-badge { font-size:0.72rem; font-weight:700; padding:5px 12px; border-radius:20px; letter-spacing:0.2px; }
  .risk-badge.high { background:#fef2f2; color:#dc2626; }
  .risk-badge.medium { background:#fffbeb; color:#d97706; }
  .risk-badge.low { background:#f0fdf4; color:#16a34a; }

  .no-visits { text-align:center; padding:2rem; color:#c084a8; font-size:0.88rem; }
  .loading-screen { padding:3rem; text-align:center; color:#c084a8; font-family:'DM Sans',sans-serif; font-size:0.9rem; }
  .view-all-btn {
    font-size:0.75rem; color:#be185d; font-weight:600;
    background:none; border:none; cursor:pointer; font-family:'DM Sans',sans-serif;
  }
`;

/* ─── TrendChart component ─── */
function TrendChart({ title, data, lines }) {
  if (!data || data.length === 0) return null;

  if (data.length === 1) {
    return (
      <div className="graph-card">
        <div className="graph-title">{title}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '1rem 0' }}>
          {lines.map(l => (
            <div key={l.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: l.color + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', fontWeight: 700, color: l.color, fontFamily: 'Playfair Display, serif'
              }}>
                {data[0][l.key] || '—'}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 500 }}>{l.name}</span>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#c084a8', marginTop: 4 }}>
          First visit — trend appears after 2+ visits
        </p>
      </div>
    );
  }

  return (
    <div className="graph-card">
      <div className="graph-title">{title}</div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#c084a8' }} />
          <YAxis tick={{ fontSize: 10, fill: '#c084a8' }} />
          <Tooltip
            contentStyle={{
              borderRadius: '14px', border: '1px solid #fce7f3',
              fontFamily: 'DM Sans, sans-serif', fontSize: 12,
              boxShadow: '0 4px 16px rgba(190,24,93,0.08)'
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          {lines.map(l => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.name}
              stroke={l.color}
              strokeWidth={2}
              dot={{ r: 4, fill: l.color, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Info helper ─── */
function Info({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: '0.68rem', color: '#c084a8', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 500, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1f1535' }}>{value || '—'}</p>
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);       // sorted newest → oldest (for display)
  const [chartReports, setChartReports] = useState([]); // sorted oldest → newest (for graphs)
  const [showAll, setShowAll] = useState(false);

  const location = useLocation();
  const patientId = location.state?.patientId || id;
  useEffect(() => {
    const fetchData = async () => {
      try {
        /* patient doc */
        const docRef = doc(db, "mothers", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setPatient(docSnap.data());

        /* assessments */
        const q = query(collection(db, "assessments"), where("motherId", "==", id));
        const snapshot = await getDocs(q);
        const data = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter(r => r.risk || r.vitals); // skip empty rows

        /* newest first for list */
        const newestFirst = [...data].sort((a, b) => {
          const ta = a.createdAt?.toDate?.() || new Date(a.date || 0);
          const tb = b.createdAt?.toDate?.() || new Date(b.date || 0);
          return tb - ta;
        });

        /* oldest first for charts */
        const oldestFirst = [...newestFirst].reverse();

        setReports(newestFirst);
        setChartReports(oldestFirst);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id]);

  if (!patient) return (
    <>
      <style>{injectStyles}</style>
      <div className="loading-screen">🌸 Loading patient details...</div>
    </>
  );

  /* ── derived values ── */
  const latest = reports[0];
  const currentRisk = latest?.risk || "Low";
  const pillClass = currentRisk === "High" ? "high" : currentRisk === "Medium" ? "medium" : "low";
  const riskClass = currentRisk === "High" ? "risk-high" : currentRisk === "Medium" ? "risk-med" : "risk-low";

  const latestWeight = latest?.vitals?.weight || latest?.weight || patient.weight;
  const latestHeight = latest?.vitals?.height || latest?.height || patient.height;

  const initials = patient.name ? patient.name.charAt(0).toUpperCase() : "M";

  /* ── chart data: oldest → newest, label as "V1", "V2" … ── */
  const chartData = chartReports.map((r, i) => ({
    label: `V${i + 1}`,
    systolic:  toNum(r.vitals?.systolic),
    diastolic: toNum(r.vitals?.diastolic),
    sugar:     toNum(r.vitals?.sugar),
    heartrate: toNum(r.vitals?.heartrate),
    weight:    toNum(r.vitals?.weight || r.weight),
  }));

  const displayedReports = showAll ? reports : reports.slice(0, 5);

  return (
    <>
      <style>{injectStyles}</style>
      <div className="pd-root">

       

        {/* ── HERO STRIP ── */}
        <div className="hero-strip">
          <div className="hero-avatar">{initials}</div>

          <div className="hero-info">
            <h2 className="hero-name">{patient.name}</h2>
            <div className="hero-meta-row">
              <span className="hero-meta-item">Age {patient.age}</span>
              <span className="hero-meta-item">📞 {patient.phone}</span>
              <span className="hero-meta-item">📍 {patient.address}</span>
            </div>
          </div>

          <div className="risk-pill-wrap">
            <div className="risk-pill-label">Risk Level</div>
            <span className={`risk-pill ${pillClass}`}>{currentRisk}</span>
          </div>
        </div>

        {/* ── CHIPS ROW: total visits, latest weight, latest height ── */}
        <div className="chips-row">
          <div className="chip">
            <span className="chip-val">{reports.length}</span>
            <span className="chip-label">Total Visits</span>
          </div>
          <div className="chip">
            <span className="chip-val">{latestWeight ? `${latestWeight} kg` : '—'}</span>
            <span className="chip-label">Latest Weight</span>
          </div>
          <div className="chip">
            <span className="chip-val">{latestHeight ? `${latestHeight} cm` : '—'}</span>
            <span className="chip-label">Latest Height</span>
          </div>
          <div className="chip">
            <span className={`chip-val ${riskClass}`}>{currentRisk}</span>
            <span className="chip-label">Current Status</span>
          </div>
        </div>

        {/* ── CHECKUP BUTTON ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.2rem', position: 'relative', zIndex: 1 }}>
          <button className="checkup-btn" onClick={() => navigate(`/checkup/${id}`)}>
            <Stethoscope size={15} /> Checkups
          </button>
        </div>

        {/* ── TREND GRAPHS ── */}
        <div className="info-card">
          <div className="section-title">
            <div className="section-dot"></div>
            Trend Analysis
            <Activity size={14} style={{ color: '#be185d', marginLeft: 'auto' }} />
          </div>

          {chartReports.length < 2 ? (
            <div className="no-trend">
              <div className="no-trend-icon">
                <Activity size={22} color="#f9a8d4" />
              </div>
              <div className="no-trend-title">No Trend Data Yet</div>
              <div className="no-trend-sub">Trend charts appear after 2 or more visits</div>
            </div>
          ) : (
            <div className="graphs-grid">
              <TrendChart
                title="Blood Pressure"
                data={chartData}
                lines={[
                  { key: "systolic",  name: "Systolic",  color: "#ec4899" },
                  { key: "diastolic", name: "Diastolic", color: "#8b5cf6" },
                ]}
              />
              <TrendChart
                title="Blood Sugar (mg/dL)"
                data={chartData}
                lines={[{ key: "sugar", name: "Sugar", color: "#f59e0b" }]}
              />
              <TrendChart
                title="Heart Rate (bpm)"
                data={chartData}
                lines={[{ key: "heartrate", name: "Heart Rate", color: "#14b8a6" }]}
              />
              {chartData.some(d => d.weight > 0) && (
                <TrendChart
                  title="Weight (kg)"
                  data={chartData}
                  lines={[{ key: "weight", name: "Weight", color: "#6366f1" }]}
                />
              )}
            </div>
          )}
        </div>

        {/* ── VISIT HISTORY ── */}
        <div className="info-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="section-title" style={{ margin: 0 }}>
              <div className="section-dot"></div>
              Visit History
            </div>
            {reports.length > 5 && (
              <button className="view-all-btn" onClick={() => setShowAll(!showAll)}>
                {showAll ? 'Show Less ↑' : `View All (${reports.length}) →`}
              </button>
            )}
          </div>

          {displayedReports.length > 0 ? (
            displayedReports.map((r, i) => {
              const isLatest = i === 0;
              const visitNumber = reports.length - i; // Visit N (latest = highest number)
              const badgeClass = r.risk === "High" ? "high" : r.risk === "Medium" ? "medium" : "low";
              const w = r.vitals?.weight || r.weight;
              const h = r.vitals?.height || r.height;

              return (
                <div
                  key={r.id}
                  className={`visit-row${isLatest ? ' latest' : ''}`}
                  onClick={() =>
                    navigate(`/report/${r.id}`, {
                      state: { patientId: id }
                    })
                  }
                >
                  <div>
                    <div className="visit-num">
                      Visit {visitNumber}
                      {isLatest && <span className="visit-latest-tag">Latest</span>}
                    </div>
                    <div className="visit-meta">
                      {fmt(r.createdAt || r.date)}
                      {w ? ` · ${w} kg` : ''}
                      {h ? ` · ${h} cm` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`risk-badge ${badgeClass}`}>{r.risk || 'Low'}</span>
                    <ChevronRight size={14} style={{ color: '#f9a8d4' }} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-visits">
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>🩺</div>
              No visits recorded yet
            </div>
          )}
        </div>

      </div>
    </>
  );
}
