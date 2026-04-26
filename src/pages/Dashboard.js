import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Users, AlertTriangle, Activity, Shield, MapPin, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const injectStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

  .d-root {
    font-family: 'DM Sans', sans-serif;
    background: #fdf6f9;
    min-height: 100vh;
    padding: 2.2rem 2.5rem;
    position: relative;
  }
  .d-root::before {
    content:''; position:fixed; top:-200px; right:-200px;
    width:600px; height:600px; pointer-events:none; z-index:0;
    background: radial-gradient(circle, rgba(255,182,213,0.18) 0%, transparent 70%);
  }
  .d-root::after {
    content:''; position:fixed; bottom:-150px; left:-150px;
    width:500px; height:500px; pointer-events:none; z-index:0;
    background: radial-gradient(circle, rgba(196,181,253,0.13) 0%, transparent 70%);
  }
  .d-header { position:relative; z-index:1; margin-bottom:2rem; display:flex; align-items:flex-start; justify-content:space-between; }
  .d-title {
    font-family:'Playfair Display',serif; font-size:2rem; font-weight:700; margin:0;
    background:linear-gradient(135deg,#be185d 0%,#7c3aed 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  .d-subtitle { font-size:0.82rem; color:#c084a8; font-weight:400; margin-top:4px; }
  .d-date {
    font-size:0.78rem; color:#c084a8; background:rgba(255,255,255,0.85);
    border:1px solid #f3d0e7; padding:6px 14px; border-radius:20px; font-weight:500; white-space:nowrap;
  }

  .stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1.2rem; margin-bottom:1.6rem; position:relative; z-index:1; }
  .stat-card {
    background:white; border-radius:20px; padding:1.3rem 1.5rem;
    display:flex; align-items:center; justify-content:space-between;
    box-shadow:0 2px 20px rgba(190,24,93,0.07);
    border:1px solid rgba(255,255,255,0.9);
    transition:transform 0.25s ease,box-shadow 0.25s ease;
    position:relative; overflow:hidden;
  }
  .stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:20px 20px 0 0; }
  .stat-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(190,24,93,0.13); }
  .stat-card.blue::before { background:linear-gradient(90deg,#60a5fa,#3b82f6); }
  .stat-card.red::before  { background:linear-gradient(90deg,#fb7185,#ef4444); }
  .stat-card.yellow::before { background:linear-gradient(90deg,#fbbf24,#f59e0b); }
  .stat-card.green::before { background:linear-gradient(90deg,#4ade80,#22c55e); }
  .stat-label { font-size:0.72rem; color:#9ca3af; font-weight:500; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:5px; }
  .stat-value { font-family:'Playfair Display',serif; font-size:2.1rem; font-weight:700; line-height:1; }
  .stat-card.blue .stat-value { color:#2563eb; }
  .stat-card.red .stat-value { color:#dc2626; }
  .stat-card.yellow .stat-value { color:#d97706; }
  .stat-card.green .stat-value { color:#16a34a; }
  .stat-icon { width:46px; height:46px; border-radius:13px; display:flex; align-items:center; justify-content:center; }
  .stat-card.blue .stat-icon { background:rgba(59,130,246,0.1); color:#3b82f6; }
  .stat-card.red .stat-icon  { background:rgba(239,68,68,0.1); color:#ef4444; }
  .stat-card.yellow .stat-icon { background:rgba(245,158,11,0.1); color:#f59e0b; }
  .stat-card.green .stat-icon { background:rgba(34,197,94,0.1); color:#22c55e; }

  .emerg-btn {
    display:inline-flex; align-items:center; gap:8px;
    background:linear-gradient(135deg,#ef4444 0%,#be123c 100%);
    color:white; border:none; padding:11px 22px; border-radius:14px;
    font-size:0.88rem; font-weight:600; font-family:'DM Sans',sans-serif;
    cursor:pointer; box-shadow:0 4px 16px rgba(239,68,68,0.35);
    transition:transform 0.2s,box-shadow 0.2s; margin-bottom:1.6rem; position:relative; z-index:1;
  }
  .emerg-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(239,68,68,0.45); }

  .content-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.4rem; position:relative; z-index:1; }
  .glass-card {
    background:rgba(255,255,255,0.97); border-radius:24px; padding:1.7rem;
    box-shadow:0 4px 24px rgba(190,24,93,0.06); border:1px solid rgba(253,232,243,0.8);
  }
  .urgent-card { border-left:4px solid #ef4444; background:linear-gradient(135deg,rgba(255,246,248,0.97),rgba(255,255,255,0.97)); }
  .card-title {
    font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:600; color:#1f1535;
    margin-bottom:1.1rem; display:flex; align-items:center; gap:8px;
  }
  .title-dot { width:8px; height:8px; border-radius:50%; }

  .urgent-row {
    display:flex; justify-content:space-between; align-items:center;
    padding:11px 15px; background:white; border-radius:13px; margin-bottom:9px;
    border:1px solid rgba(254,202,202,0.5); cursor:pointer;
    transition:all 0.2s ease; box-shadow:0 1px 6px rgba(239,68,68,0.05);
  }
  .urgent-row:hover { background:#fff5f5; border-color:#fca5a5; transform:translateX(4px); box-shadow:0 4px 12px rgba(239,68,68,0.1); }
  .urgent-name { font-weight:600; font-size:0.88rem; color:#1f1535; }
  .urgent-sub { font-size:0.72rem; color:#9ca3af; margin-top:2px; }
  .urgent-badge {
    background:linear-gradient(135deg,#ef4444,#be123c); color:white;
    font-size:0.7rem; font-weight:700; padding:4px 11px; border-radius:20px; letter-spacing:0.3px;
  }
  .no-urgent { text-align:center; padding:1.8rem; color:#9ca3af; font-size:0.88rem; }
  .no-urgent-icon { font-size:1.8rem; margin-bottom:6px; }

  .pie-legend { display:flex; flex-direction:column; gap:13px; }
  .legend-item { display:flex; align-items:center; gap:10px; }
  .legend-dot { width:11px; height:11px; border-radius:50%; flex-shrink:0; }
  .legend-label { font-size:0.83rem; font-weight:500; color:#374151; flex:1; }
  .legend-count { font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:700; }

  .insight-bar {
    background:linear-gradient(135deg,rgba(252,231,243,0.6),rgba(237,233,254,0.6));
    border:1px solid rgba(251,207,232,0.8); border-radius:16px;
    padding:1rem 1.4rem; display:flex; align-items:center; gap:12px;
    position:relative; z-index:1; margin-top:1.4rem;
  }
  .insight-icon { font-size:1.3rem; }
  .insight-text { font-size:0.86rem; color:#6b21a8; font-weight:500; }
`;

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background:'white', border:'1px solid #f3d0e7', borderRadius:'10px', padding:'8px 14px', fontSize:'0.82rem', boxShadow:'0 4px 16px rgba(0,0,0,0.08)', fontFamily:'DM Sans,sans-serif' }}>
        <strong>{payload[0].name}</strong>: {payload[0].value}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "mothers"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPatients(data);
    });
    return () => unsubscribe();
  }, []);

  const total = patients.length;
  const high = patients.filter(p => p.risk === "High").length;
  const medium = patients.filter(p => p.risk === "Medium").length;
  const low = patients.filter(p => !p.risk || p.risk === "Low").length;

  const data = [
    { name: "High", value: high },
    { name: "Medium", value: medium },
    { name: "Low", value: low },
  ];
  const COLORS = ["#ef4444", "#f59e0b", "#22c55e"];
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <style>{injectStyles}</style>
      <div className="d-root">
        <div className="d-header">
          <div>
            <h1 className="d-title">ArovyaCare Dashboard</h1>
            <p className="d-subtitle">Maternal health monitoring &amp; risk management</p>
          </div>
          <span className="d-date">📅 {today}</span>
        </div>

        <div className="stat-grid">
          {[
            { title: "Women Under Care", value: total, color: "blue", icon: <Users size={20} /> },
            { title: "High Risk", value: high, color: "red", icon: <AlertTriangle size={20} /> },
            { title: "Medium Risk", value: medium, color: "yellow", icon: <Activity size={20} /> },
            { title: "Low Risk", value: low, color: "green", icon: <Shield size={20} /> },
          ].map(c => (
            <div key={c.title} className={`stat-card ${c.color}`}>
              <div>
                <p className="stat-label">{c.title}</p>
                <h2 className="stat-value">{c.value}</h2>
              </div>
              <div className="stat-icon">{c.icon}</div>
            </div>
          ))}
        </div>

        <button className="emerg-btn" onClick={() => navigate("/emergency-map")}>
          <MapPin size={15} /> Find Nearby Hospitals
        </button>

        <div className="content-grid">
          {/* URGENT */}
          <div className="glass-card urgent-card">
            <div className="card-title">
              <div className="title-dot" style={{ background: '#ef4444' }}></div>
              Urgent Cases
            </div>
            {patients.filter(p => p.risk === "High").length === 0 ? (
              <div className="no-urgent">
                <div className="no-urgent-icon">🎉</div>
                <p>No urgent cases right now</p>
              </div>
            ) : (
              patients.filter(p => p.risk === "High").map(p => (
                <div key={p.id} className="urgent-row" onClick={() => navigate(`/patient/${p.id}`)}>
                  <div>
                    <div className="urgent-name">{p.name}</div>
                    <div className="urgent-sub">Tap to view details →</div>
                  </div>
                  <span className="urgent-badge">HIGH RISK</span>
                </div>
              ))
            )}
          </div>

          {/* PIE */}
          <div className="glass-card">
            <div className="card-title">
              <div className="title-dot" style={{ background: 'linear-gradient(135deg,#be185d,#7c3aed)' }}></div>
              Risk Distribution
              <TrendingUp size={14} style={{ color: '#be185d', marginLeft: 'auto' }} />
            </div>
            {total === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>No data available</p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <PieChart width={190} height={190}>
                  <Pie data={data} cx="50%" cy="50%" outerRadius={78} innerRadius={36} dataKey="value" strokeWidth={2} stroke="white">
                    {data.map((entry, index) => <Cell key={index} fill={COLORS[index]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
                <div className="pie-legend">
                  {[
                    { label: 'High Risk', count: high, color: '#ef4444' },
                    { label: 'Medium Risk', count: medium, color: '#f59e0b' },
                    { label: 'Low Risk', count: low, color: '#22c55e' },
                  ].map(item => (
                    <div key={item.label} className="legend-item">
                      <div className="legend-dot" style={{ background: item.color }}></div>
                      <span className="legend-label">{item.label}</span>
                      <span className="legend-count" style={{ color: item.color }}>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="insight-bar">
          <span className="insight-icon">✨</span>
          <span className="insight-text">
            {high > 0
              ? `${high} mother${high > 1 ? 's' : ''} require immediate attention — please review urgent cases.`
              : "All mothers are currently stable. Great work! Keep monitoring regularly."}
          </span>
        </div>
      </div>
    </>
  );
}
