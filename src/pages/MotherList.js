import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Search, SlidersHorizontal, ChevronRight, Users } from "lucide-react";

const injectStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

  .ml-root {
    font-family: 'DM Sans', sans-serif;
    background: #fdf6f9;
    min-height: 100vh;
    padding: 2.2rem 2.5rem;
    position: relative;
  }
  .ml-root::before {
    content:''; position:fixed; top:-200px; right:-200px;
    width:600px; height:600px; pointer-events:none; z-index:0;
    background: radial-gradient(circle, rgba(255,182,213,0.18) 0%, transparent 70%);
  }
  .ml-root::after {
    content:''; position:fixed; bottom:-150px; left:-150px;
    width:500px; height:500px; pointer-events:none; z-index:0;
    background: radial-gradient(circle, rgba(196,181,253,0.13) 0%, transparent 70%);
  }

  .ml-header { position:relative; z-index:1; margin-bottom:1.6rem; }
  .ml-title {
    font-family:'Playfair Display',serif; font-size:2rem; font-weight:700; margin:0;
    background:linear-gradient(135deg,#be185d 0%,#7c3aed 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  .ml-subtitle { font-size:0.82rem; color:#c084a8; font-weight:400; margin-top:4px; }

  /* ── FILTER CHIPS ── */
  .filter-chips {
    display:flex; gap:10px; margin-bottom:1.4rem;
    position:relative; z-index:1; flex-wrap:wrap;
  }
  .chip {
    display:inline-flex; align-items:center; gap:7px;
    padding:8px 16px; border-radius:30px; cursor:pointer;
    font-family:'DM Sans',sans-serif; font-size:0.82rem; font-weight:500;
    border:1.5px solid transparent; transition:all 0.2s ease;
    user-select:none;
  }
  .chip-count {
    font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; line-height:1;
  }
  .chip-label { font-size:0.78rem; }

  .chip.all         { background:#fdf2f8; border-color:#f9a8d4; color:#be185d; }
  .chip.all.active  { background:linear-gradient(135deg,#be185d,#7c3aed); border-color:transparent; color:white; box-shadow:0 4px 14px rgba(190,24,93,0.28); }

  .chip.high        { background:#fef2f2; border-color:#fca5a5; color:#dc2626; }
  .chip.high.active { background:linear-gradient(135deg,#ef4444,#dc2626); border-color:transparent; color:white; box-shadow:0 4px 14px rgba(239,68,68,0.28); }

  .chip.medium        { background:#fffbeb; border-color:#fcd34d; color:#d97706; }
  .chip.medium.active { background:linear-gradient(135deg,#f59e0b,#d97706); border-color:transparent; color:white; box-shadow:0 4px 14px rgba(245,158,11,0.28); }

  .chip.low        { background:#f0fdf4; border-color:#86efac; color:#16a34a; }
  .chip.low.active { background:linear-gradient(135deg,#22c55e,#16a34a); border-color:transparent; color:white; box-shadow:0 4px 14px rgba(34,197,94,0.28); }

  .chip:hover:not(.active) { transform:translateY(-1px); }

  /* ── TOOLBAR ── */
  .ml-toolbar {
    display:flex; gap:1rem; margin-bottom:1.2rem; align-items:center;
    position:relative; z-index:1; flex-wrap:wrap;
  }
  .search-wrap { position:relative; flex:1; min-width:200px; }
  .search-icon {
    position:absolute; left:14px; top:50%; transform:translateY(-50%);
    color:#d4a8c4; pointer-events:none;
  }
  .search-input {
    width:100%; padding:11px 14px 11px 42px;
    border:1.5px solid #f3d0e7; border-radius:14px;
    font-size:0.86rem; font-family:'DM Sans',sans-serif;
    background:white; color:#1f1535; outline:none;
    transition:border-color 0.2s, box-shadow 0.2s; box-sizing:border-box;
  }
  .search-input:focus { border-color:#f472b6; box-shadow:0 0 0 3px rgba(244,114,182,0.12); }
  .search-input::placeholder { color:#d4a8c4; }

  .sort-wrap { position:relative; }
  .sort-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#d4a8c4; pointer-events:none; }
  .sort-select {
    appearance:none; padding:11px 36px 11px 38px;
    border:1.5px solid #f3d0e7; border-radius:14px;
    font-size:0.86rem; font-family:'DM Sans',sans-serif;
    background:white; color:#6b4a7e; outline:none; cursor:pointer;
    transition:border-color 0.2s; font-weight:500;
  }
  .sort-select:focus { border-color:#f472b6; }

  /* ── RESULTS COUNT ── */
  .ml-count {
    font-size:0.82rem; color:#a78baa; font-weight:500;
    margin-bottom:1.4rem; position:relative; z-index:1;
    display:flex; align-items:center; gap:8px;
  }
  .ml-count-badge {
    background:linear-gradient(135deg,#be185d,#7c3aed);
    color:white; font-size:0.75rem; font-weight:700;
    padding:2px 9px; border-radius:20px;
  }

  /* ── CARDS ── */
  .cards-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.2rem; position:relative; z-index:1; }

  .mother-card {
    background:white; border-radius:20px; padding:1.4rem;
    box-shadow:0 2px 16px rgba(190,24,93,0.06);
    border:1.5px solid rgba(253,232,243,0.9);
    cursor:pointer; transition:all 0.25s ease;
    position:relative; overflow:hidden;
  }
  .mother-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
    background:linear-gradient(90deg,#f9a8d4,#c084fc);
    border-radius:20px 20px 0 0;
    transform:scaleX(0); transform-origin:left;
    transition:transform 0.3s ease;
  }
  .mother-card:hover { transform:translateY(-5px); box-shadow:0 14px 36px rgba(190,24,93,0.13); border-color:#fce7f3; }
  .mother-card:hover::before { transform:scaleX(1); }

  .card-avatar {
    width:42px; height:42px; border-radius:14px;
    background:linear-gradient(135deg,#fce7f3,#ede9fe);
    display:flex; align-items:center; justify-content:center;
    font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:700;
    color:#be185d; margin-bottom:0.9rem;
  }
  .mother-name {
    font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:600;
    color:#1f1535; margin-bottom:4px;
  }
  .mother-addr { font-size:0.75rem; color:#a78baa; margin-bottom:1rem; line-height:1.4; }

  .mother-meta {
    display:flex; justify-content:space-between; align-items:center;
    padding-top:10px; border-top:1px solid #fce7f3;
  }
  .meta-age { font-size:0.75rem; font-weight:500; color:#9ca3af; }
  .meta-age span { color:#be185d; font-weight:600; }

  .risk-pill-card {
    font-size:0.68rem; font-weight:700; padding:4px 11px; border-radius:20px; letter-spacing:0.2px;
  }
  .risk-pill-card.high   { background:#fef2f2; color:#dc2626; }
  .risk-pill-card.medium { background:#fffbeb; color:#d97706; }
  .risk-pill-card.low    { background:#f0fdf4; color:#16a34a; }

  .card-arrow { color:#f9a8d4; transition:transform 0.2s, color 0.2s; }
  .mother-card:hover .card-arrow { transform:translateX(3px); color:#be185d; }

  /* ── EMPTY ── */
  .empty-state {
    text-align:center; padding:4rem 2rem; position:relative; z-index:1; color:#c084a8;
  }
  .empty-icon { font-size:3rem; margin-bottom:1rem; }
  .empty-title { font-family:'Playfair Display',serif; font-size:1.2rem; color:#9ca3af; }
  .empty-sub { font-size:0.82rem; color:#d4a8c4; margin-top:6px; }
`;

export default function MotherList() {
  const [search, setSearch]       = useState("");
  const [sortType, setSortType]   = useState("default");
  const [riskFilter, setRiskFilter] = useState("all"); // "all" | "High" | "Medium" | "Low"
  const navigate = useNavigate();
  const [patients, setPatients]   = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      const snapshot = await getDocs(collection(db, "mothers"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPatients(data);
    };
    fetchPatients();
  }, []);

  /* ── counts for chips ── */
  const total  = patients.length;
  const high   = patients.filter(p => p.risk === "High").length;
  const medium = patients.filter(p => p.risk === "Medium").length;
  const low    = patients.filter(p => !p.risk || p.risk === "Low").length;

  /* ── filter + search + sort ── */
  const filtered = patients.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchRisk =
      riskFilter === "all"    ? true :
      riskFilter === "Low"    ? (!p.risk || p.risk === "Low") :
      p.risk === riskFilter;
    return matchSearch && matchRisk;
  });

  const sorted = [...filtered].sort((a, b) => {
    const priority = { High: 3, Medium: 2, Low: 1 };
    if (sortType === "high") return priority[b.risk] - priority[a.risk];
    if (sortType === "low")  return priority[a.risk] - priority[b.risk];
    if (sortType === "az")   return a.name.localeCompare(b.name);
    return 0;
  });

  const chipData = [
    { key: "all",    label: "All",    count: total,  cls: "all"    },
    { key: "High",   label: "High",   count: high,   cls: "high"   },
    { key: "Medium", label: "Medium", count: medium, cls: "medium" },
    { key: "Low",    label: "Low",    count: low,    cls: "low"    },
  ];

  return (
    <>
      <style>{injectStyles}</style>
      <div className="ml-root">

        {/* HEADER */}
        <div className="ml-header">
          <h1 className="ml-title">Maternal Health Dashboard</h1>
          <p className="ml-subtitle">Monitor health status, risks, and checkups</p>
        </div>

        {/* FILTER CHIPS */}
        <div className="filter-chips">
          {chipData.map(c => (
            <button
              key={c.key}
              className={`chip ${c.cls}${riskFilter === c.key ? " active" : ""}`}
              onClick={() => setRiskFilter(c.key)}
            >
              <span className="chip-count">{c.count}</span>
              <span className="chip-label">{c.label}</span>
            </button>
          ))}
        </div>

        {/* SEARCH + SORT */}
        <div className="ml-toolbar">
          <div className="search-wrap">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="sort-wrap">
            <SlidersHorizontal size={14} className="sort-icon" />
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="sort-select"
            >
              <option value="default">Sort By</option>
              <option value="high">High → Low Risk</option>
              <option value="low">Low → High Risk</option>
              <option value="az">Name A → Z</option>
            </select>
          </div>
        </div>

        {/* RESULT COUNT */}
        <div className="ml-count">
          <Users size={14} />
          {riskFilter === "all" ? "Total Mothers" : `${riskFilter} Risk`}:
          <span className="ml-count-badge">{sorted.length}</span>
        </div>

        {/* CARDS / EMPTY */}
        {sorted.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌸</div>
            <div className="empty-title">No mothers found</div>
            <div className="empty-sub">Try a different name or filter</div>
          </div>
        ) : (
          <div className="cards-grid">
            {sorted.map((p) => {
              const riskCls = p.risk === "High" ? "high" : p.risk === "Medium" ? "medium" : "low";
              return (
                <div
                  key={p.id}
                  className="mother-card"
                  onClick={() => navigate(`/patient/${p.id}`)}
                >
                  <div className="card-avatar">
                    {p.name ? p.name.charAt(0).toUpperCase() : "M"}
                  </div>
                  <div className="mother-name">{p.name}</div>
                  <div className="mother-addr">{p.address || "No address"}</div>
                  <div className="mother-meta">
                    <span className="meta-age">Age <span>{p.age || "—"}</span></span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`risk-pill-card ${riskCls}`}>{p.risk || "Low"}</span>
                      <ChevronRight size={15} className="card-arrow" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </>
  );
}