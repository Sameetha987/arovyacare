import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  AlertTriangle,
  Heart,
  Thermometer,
  Droplets,
  Activity,
  User,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Baby,
  ChevronRight,
  Stethoscope,
  Download,
} from "lucide-react";
// Add these imports at the top of ReportPage.jsx
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const toNum = (v) => parseFloat(v) || 0;

const riskConfig = {
  High:    {
    bg:    "from-red-500 to-rose-600",
    badge: "bg-red-100 text-red-700 border-red-300",
    dot:   "bg-red-500",
    label: "High Risk",
   
  },
  Medium:  {
    bg:    "from-amber-400 to-orange-500",
    badge: "bg-amber-100 text-amber-700 border-amber-300",
    dot:   "bg-amber-500",
    label: "Medium Risk",
 
  },
  Low:     {
    bg:    "from-blue-400 to-cyan-500",
    badge: "bg-blue-100 text-blue-700 border-blue-300",
    dot:   "bg-blue-400",
    label: "Low Risk",

  },
  Healthy: {
    bg:    "from-emerald-400 to-teal-500",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-300",
    dot:   "bg-emerald-500",
    label: "Healthy",

  },
};

const fmt = (d) => {
  if (!d) return "—";
  const date = d?.toDate ? d.toDate() : new Date(d);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

// 🔥 A — PATIENT HEADER
function PatientHeader({ mother, report }) {
  const rc = riskConfig[report?.risk] || riskConfig.Low;
  return (
    <div
      className={`relative rounded-3xl bg-gradient-to-r from-pink-500 via-pink-400 to-pink-600 p-[2px] shadow-2xl shadow-pink-200`}
    >
      <div className="rounded-3xl bg-gradient-to-r from-pink-500 via-pink-400 to-pink-600 p-8 text-white overflow-hidden relative">
        {/* decorative blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* LEFT */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold shadow-lg">
              {mother?.name?.[0] || "M"}
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium tracking-widest uppercase">
                Patient
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight">
                {mother?.name || "—"}
              </h1>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <User size={13} /> {mother?.age} yrs
                </span>
                <span className="flex items-center gap-1">
                  <Baby size={13} /> {mother?.weeks} weeks
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={13} /> {mother?.phone}
                </span>
                {mother?.address && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} /> {mother.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col items-end gap-2">
            <div
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border bg-white/15 backdrop-blur border-white/30 text-white font-bold text-lg shadow-lg`}
            >
              <span
                className={`w-3 h-3 rounded-full ${rc.dot} animate-pulse`}
              />
              {report?.risk || "—"} Risk
            </div>
            <p className="text-white/60 text-xs">
              <Calendar size={11} className="inline mr-1" />
              Report: {fmt(report?.createdAt)}
            </p>
            <p className="text-white/60 text-xs">
              {mother?.weight && `${mother.weight} kg`}
              {mother?.height && ` · ${mother.height} cm`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🔥 B — ALERT CARD
function AlertCard({ icon: Icon, title, detail, color }) {
  const colors = {
    red: "bg-red-50 border-red-300 text-red-700 shadow-red-100",
    amber: "bg-amber-50 border-amber-300 text-amber-700 shadow-amber-100",
    orange: "bg-orange-50 border-orange-300 text-orange-700 shadow-orange-100",
  };
  return (
    <div
      className={`flex items-start gap-4 p-5 rounded-2xl border-2 shadow-lg ${colors[color]} animate-pulse-once`}
    >
      <div className="mt-0.5 p-2 rounded-xl bg-white/60">
        <Icon size={20} />
      </div>
      <div>
        <p className="font-bold text-base">{title}</p>
        <p className="text-sm opacity-80 mt-0.5">{detail}</p>
      </div>
    </div>
  );
}

// 🔥 C — COMPARISON CARD
function ComparisonCard({
  label,
  icon: Icon,
  current,
  previous,
  unit,
  lowerIsBetter = false,
}) {
  const curr = toNum(current);
  const prev = toNum(previous);
  const hasPrev = previous !== undefined && previous !== null;
  const diff = hasPrev ? curr - prev : null;
  const improved = diff === null ? null : lowerIsBetter ? diff < 0 : diff > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold">
        <Icon size={15} className="text-pink-400" />
        {label}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-extrabold text-gray-800">
          {curr}
          <span className="text-sm text-gray-400 font-normal ml-1">{unit}</span>
        </span>
        {diff !== null && (
          <div
            className={`flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-xl ${
              improved === true
                ? "bg-emerald-50 text-emerald-600"
                : improved === false
                  ? "bg-red-50 text-red-500"
                  : "bg-gray-100 text-gray-500"
            }`}
          >
            {diff === 0 ? (
              <Minus size={14} />
            ) : diff > 0 ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            {diff > 0 ? "+" : ""}
            {diff.toFixed(1)}
          </div>
        )}
        {!hasPrev && (
          <span className="text-xs text-gray-400 italic">No prior data</span>
        )}
      </div>
      {hasPrev && (
        <p className="text-xs text-gray-400">
          Previous:{" "}
          <span className="font-semibold text-gray-500">
            {prev} {unit}
          </span>
        </p>
      )}
    </div>
  );
}

// 🔥 D — RISK EVOLUTION
function RiskEvolution({ prevRisk, currRisk }) {
  if (!prevRisk) return null;
  const prev = riskConfig[prevRisk] || riskConfig.Low;
  const curr = riskConfig[currRisk] || riskConfig.Low;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
        Risk Evolution
      </h3>
      <div className="flex items-center gap-4 justify-center flex-wrap">
        <div
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-sm font-bold ${prev.badge}`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${prev.dot}`} />
          {prevRisk}
        </div>
        <ChevronRight size={20} className="text-gray-400" />
        <div
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-sm font-bold ${curr.badge} shadow-md`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${curr.dot} animate-pulse`}
          />
          {currRisk}
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-3">
        {prevRisk === currRisk
          ? "Health level unchanged"
          : (prevRisk === "High" && currRisk !== "High") ||
              (prevRisk === "Medium" && currRisk === "Low")
            ? " Health has improved"
            : " Risk has increased"}
      </p>
    </div>
  );
}

// 🔥 E — TREND STATEMENT
function TrendStatement({ reports }) {
  if (!reports || reports.length < 2) return null;

  const last = reports[reports.length - 1];
  const prev = reports[reports.length - 2];

  // ✅ Define normal midpoint for each vital
  // "Better" = closer to the healthy midpoint
  const vitalMidpoints = {
    systolic:  110,  // midpoint of 90–130
    diastolic: 75,   // midpoint of 60–90
    sugar:     115,  // midpoint of 70–160
    heartrate: 80,   // midpoint of 60–100
  };

  let improved = 0, worsened = 0;

  Object.entries(vitalMidpoints).forEach(([key, ideal]) => {
    const curr = toNum(last.vitals?.[key]);
    const prev_ = toNum(prev.vitals?.[key]);

    if (curr === 0 || prev_ === 0) return; // skip missing data

    const currDist = Math.abs(curr  - ideal);
    const prevDist = Math.abs(prev_ - ideal);

    if (currDist < prevDist) improved++;       // closer to ideal = improved
    else if (currDist > prevDist) worsened++;  // further from ideal = worsened
    // equal = neutral, don't count
  });

  // ✅ Also factor in risk level change
  const riskLevel = { Low: 0, Medium: 1, High: 2 };
  const lastRiskLevel = riskLevel[last.risk]  ?? 0;
  const prevRiskLevel = riskLevel[prev.risk]  ?? 0;

  if (lastRiskLevel < prevRiskLevel) improved++;   // risk went down = good
  if (lastRiskLevel > prevRiskLevel) worsened++;   // risk went up = bad

  const isImproving = improved >= worsened;

  return (
    <div className={`rounded-2xl p-5 border-2 flex items-start gap-4 ${
      isImproving
        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
        : "bg-rose-50 border-rose-200 text-rose-800"
    }`}>
      <div className="p-2 rounded-xl bg-white/70">
        {isImproving
          ? <TrendingDown size={22} className="text-emerald-600" />
          : <TrendingUp   size={22} className="text-rose-600"    />}
      </div>
      <div>
        <p className="font-bold text-base">
          {isImproving ? "Condition is Improving" : "Condition is Worsening"}
        </p>
        <p className="text-sm opacity-80 mt-1">
          {isImproving
            ? `${improved} out of ${improved + worsened} indicators have shown positive improvement compared to the last visit.`
            : `${worsened} out of ${improved + worsened} indicators have deteriorated compared to the last visit. Monitoring is advised.`}
        </p>
      </div>
    </div>
  );
}


// 🔥 F — VITAL CARD
function VitalCard({ label, value, unit, icon: Icon, color, normal }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center gap-2 text-center">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}
      >
        <Icon size={22} className="text-white" />
      </div>
      <p className="text-2xl font-extrabold text-gray-800">
        {value}
        <span className="text-xs text-gray-400 font-normal ml-1">{unit}</span>
      </p>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      {normal && <p className="text-xs text-gray-400">Normal: {normal}</p>}
    </div>
  );
}

// 🔥 G — TREND CHART
const CHART_COLORS = {
  primary: "#ec4899",
  secondary: "#8b5cf6",
  tertiary: "#14b8a6",
};

function TrendChart({ title, data, lines }) {
  // ✅ Show single report as a simple stat display instead of empty chart
  if (!data || data.length === 0) return null;

  if (data.length === 1) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4">{title}</h3>
        <div className="flex items-center justify-center gap-6 py-4">
          {lines.map((l) => (
            <div key={l.key} className="flex flex-col items-center gap-2">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold shadow-md"
                style={{ backgroundColor: l.color }}
              >
                {data[0][l.key] || 0}
              </div>
              <p className="text-xs text-gray-500 font-semibold">{l.name}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          First visit — trend will appear after next checkup
        </p>
      </div>
    );
  }

  // normal chart for 2+ reports
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-sm font-bold text-gray-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} />
          <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              fontSize: 12,
            }}
            cursor={{ stroke: "#e5e7eb" }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {lines.map((l, i) => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.name}
              stroke={l.color || Object.values(CHART_COLORS)[i]}
              strokeWidth={2.5}
              dot={{ r: 4, fill: l.color || Object.values(CHART_COLORS)[i] }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// 🔥 H — AI SUMMARY
function AISummary({ report, prevReport, alerts }) {
  const risk = report?.risk || "Low";
  const hasAlerts = alerts.length > 0;
  const prevRisk = prevReport?.risk;

  const worsening =
    prevRisk &&
    ((prevRisk === "Low" && risk !== "Low") ||
      (prevRisk === "Medium" && risk === "High"));
  const improving =
    prevRisk &&
    ((prevRisk === "High" && risk !== "High") ||
      (prevRisk === "Medium" && risk === "Low"));

  let summary = "";
  if (risk === "High" && hasAlerts) {
    summary = "Patient condition is critical. Multiple vital signs are outside safe ranges. Immediate medical intervention is strongly recommended.";
  } else if (risk === "High") {
    summary = "Patient is categorized as High Risk. Close monitoring and urgent follow-up with a qualified physician is advised immediately.";
  } else if (risk === "Medium" && worsening) {
    summary = "Patient condition has escalated to Medium Risk. Preventive care and a doctor visit within 24–48 hours is strongly advised.";
  } else if (risk === "Medium") {
    summary = "Patient is at moderate risk. Some vital indicators require attention. Regular check-ins and lifestyle modifications are recommended.";
  } else if (risk === "Low" && worsening) {
    summary = "Patient shows mild concern with some indicators moving in the wrong direction. Continue monitoring and report changes to the doctor.";
  } else if (risk === "Low") {
    summary = "Patient shows mild concern but is generally stable. Routine prenatal monitoring and a follow-up appointment are advised.";
  } else if (improving) {
    summary = "Patient condition is improving and now in the healthy range. Continue current care plan and scheduled prenatal check-ups.";
  } else {
    summary = "Patient is in good health. All vitals are within normal ranges. Continue routine prenatal care as scheduled.";
  }

  const icon = riskConfig[risk]?.icon || "✅";
  const bg =
    risk === "High"    ? "from-red-50 to-rose-50 border-red-200"       :
    risk === "Medium"  ? "from-amber-50 to-orange-50 border-amber-200" :
    risk === "Low"     ? "from-blue-50 to-cyan-50 border-blue-200"     :
    "from-emerald-50 to-teal-50 border-emerald-200";

  return (
    <div className={`rounded-2xl border-2 bg-gradient-to-br p-6 ${bg}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center text-xl shadow-sm">
          <Stethoscope size={20} className="text-pink-500" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            AI Doctor Summary
          </p>
          <p className="text-sm font-bold text-gray-700">
            {icon} {risk} Risk Assessment
          </p>
        </div>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed">{summary}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function ReportPage() {
  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [mother, setMother] = useState(null);
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null); // ✅ ADD THIS
  const [downloading, setDownloading] = useState(false);
  useEffect(() => {
    const fetch_ = async () => {
      try {
        // 1. Fetch current report
        const rSnap = await getDoc(doc(db, "assessments", id));
        if (!rSnap.exists()) return;
        const rData = { id: rSnap.id, ...rSnap.data() };
        setReport(rData);

        // 2. Fetch mother
        const mSnap = await getDoc(doc(db, "mothers", rData.motherId));
        if (mSnap.exists()) setMother(mSnap.data());

        // 3. Fetch all reports for this mother
        const q = query(
          collection(db, "assessments"),
          where("motherId", "==", rData.motherId),
        );
        const qSnap = await getDocs(q);
        const reports = qSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const ta = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
            const tb = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
            return ta - tb;
          });
        setAllReports(reports);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-400">
        <div className="w-12 h-12 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin" />
        <p className="text-sm font-medium">Loading report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
        Report not found.
      </div>
    );
  }

  const vitals = report.vitals || {};
  const currIdx = allReports.findIndex((r) => r.id === id);
  const prevReport = currIdx > 0 ? allReports[currIdx - 1] : null;
  const prevVitals = prevReport?.vitals || {};

  const alerts = [];
  if (toNum(vitals.sugar) > 160)
    // match DoctorEngine
    alerts.push({
      icon: Droplets,
      title: "High Blood Sugar",
      detail: `Sugar: ${vitals.sugar} mg/dL (Normal < 160)`,
      color: "red",
    });

  if (toNum(vitals.sugar) > 250)
    // add critical sugar separately
    alerts.push({
      icon: Droplets,
      title: "Critical Blood Sugar",
      detail: `Sugar: ${vitals.sugar} mg/dL — Critically High`,
      color: "red",
    });

  if (toNum(vitals.systolic) < 90)
    alerts.push({
      icon: Activity,
      title: "Low Blood Pressure",
      detail: `Systolic: ${vitals.systolic} mmHg (Normal ≥ 90)`,
      color: "amber",
    });

  if (toNum(vitals.systolic) > 140)
    // ❌ missing! high BP not alerted
    alerts.push({
      icon: Activity,
      title: "High Blood Pressure",
      detail: `Systolic: ${vitals.systolic} mmHg (Normal ≤ 140)`,
      color: "red",
    });

  if (toNum(vitals.diastolic) > 90)
    // ❌ missing! high diastolic not alerted
    alerts.push({
      icon: Heart,
      title: "High Diastolic BP",
      detail: `Diastolic: ${vitals.diastolic} mmHg (Normal ≤ 90)`,
      color: "red",
    });

  if (toNum(vitals.temp) > 100)
    alerts.push({
      icon: Thermometer,
      title: "Fever Detected",
      detail: `Temp: ${vitals.temp}°F (Normal ≤ 100°F)`,
      color: "orange",
    });

  if (toNum(vitals.temp) > 103)
    // add critical temp
    alerts.push({
      icon: Thermometer,
      title: "Critical Fever",
      detail: `Temp: ${vitals.temp}°F — Dangerously High`,
      color: "red",
    });

  if (toNum(vitals.heartrate) > 100)
    // ❌ missing! high HR not alerted
    alerts.push({
      icon: Activity,
      title: "High Heart Rate",
      detail: `Heart Rate: ${vitals.heartrate} bpm (Normal ≤ 100)`,
      color: "amber",
    });
  // ── Chart data
  const chartData = allReports.map((r, i) => ({
    label: `V${i + 1}`,
    systolic: toNum(r.vitals?.systolic),
    diastolic: toNum(r.vitals?.diastolic),
    sugar: toNum(r.vitals?.sugar),
    heartrate: toNum(r.vitals?.heartrate),
    weight: toNum(r.vitals?.weight || r.weight),
  }));
  const downloadPDF = async () => {
    if (!reportRef.current) return;
    setDownloading(true);

    try {
      const element = reportRef.current;
      element.querySelectorAll('[class*="animate-"]').forEach((el) => {
        el.style.animation = "none";
      });
      const canvas = await html2canvas(element, {
        scale: 2, // high resolution
        useCORS: true,
        backgroundColor: "#faf8ff",
        scrollY: -window.scrollY,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        logging: false,
      });
      element.querySelectorAll('[class*="animate-"]').forEach((el) => {
        el.style.animation = "";
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // ✅ First page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // ✅ Extra pages if content is long
      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `ArovyaCare_Report_${mother?.name || "Patient"}_${id}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#faf8ff] px-4 py-6 md:px-8">
      {/* ✅ DOWNLOAD BUTTON — sticky top right */}
      <div className="flex justify-end mb-4">
        <button
          onClick={downloadPDF}
          disabled={downloading}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm
            shadow-lg transition-all duration-200
            ${
              downloading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : " bg-blue-500 text-white hover:shadow-pink-200 hover:scale-105 active:scale-95"
            }
          `}
        >
          {downloading ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download size={16} />
              Download Report PDF
            </>
          )}
        </button>
      </div>
      {/* ✅ WRAP ALL REPORT CONTENT WITH THIS REF DIV */}
      <div ref={reportRef} className="space-y-6 bg-[#faf8ff] p-2">
        {/* A — PATIENT HEADER */}
        <PatientHeader mother={mother} report={report} />

        {/* B — ALERTS */}
        {alerts.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              ⚠ Critical Alerts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alerts.map((a, i) => (
                <AlertCard key={i} {...a} />
              ))}
            </div>
          </section>
        )}

        {/* E — TREND STATEMENT */}
        <TrendStatement reports={allReports} />

        {/* D — RISK EVOLUTION */}
        {prevReport && (
          <RiskEvolution prevRisk={prevReport.risk} currRisk={report.risk} />
        )}

        {/* H — AI SUMMARY */}
        <AISummary report={report} prevReport={prevReport} alerts={alerts} />

        {/* F — VITAL CARDS */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Current Vitals
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <VitalCard
              label="Systolic"
              value={toNum(vitals.systolic)}
              unit="mmHg"
              icon={Activity}
              color="bg-pink-500"
              normal="90–120"
            />
            <VitalCard
              label="Diastolic"
              value={toNum(vitals.diastolic)}
              unit="mmHg"
              icon={Heart}
              color="bg-purple-500"
              normal="60–80"
            />
            <VitalCard
              label="Sugar"
              value={toNum(vitals.sugar)}
              unit="mg/dL"
              icon={Droplets}
              color="bg-amber-500"
              normal="< 180"
            />
            <VitalCard
              label="Temperature"
              value={toNum(vitals.temp)}
              unit="°F"
              icon={Thermometer}
              color="bg-orange-500"
              normal="97–99"
            />
            <VitalCard
              label="Heart Rate"
              value={toNum(vitals.heartrate)}
              unit="bpm"
              icon={Activity}
              color="bg-teal-500"
              normal="60–100"
            />
          </div>
        </section>

        {/* C — COMPARISON */}
        {prevReport && (
          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Compared to Last Visit
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ComparisonCard
                label="Systolic"
                icon={Activity}
                current={vitals.systolic}
                previous={prevVitals.systolic}
                unit="mmHg"
                lowerIsBetter
              />
              <ComparisonCard
                label="Diastolic"
                icon={Heart}
                current={vitals.diastolic}
                previous={prevVitals.diastolic}
                unit="mmHg"
                lowerIsBetter
              />
              <ComparisonCard
                label="Sugar"
                icon={Droplets}
                current={vitals.sugar}
                previous={prevVitals.sugar}
                unit="mg/dL"
                lowerIsBetter
              />
              <ComparisonCard
                label="Heart Rate"
                icon={Activity}
                current={vitals.heartrate}
                previous={prevVitals.heartrate}
                unit="bpm"
              />
            </div>
          </section>
        )}

        {/* G — CHARTS */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Trend Analysis
          </h2>
          {allReports.length < 2 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center">
                <Activity size={28} className="text-pink-400" />
              </div>
              <p className="text-gray-600 font-semibold">No Trend Data Yet</p>
              <p className="text-sm text-gray-400 max-w-sm">
                Trend charts will appear once this patient has 2 or more
                assessments.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TrendChart
                title="Blood Pressure Trend"
                data={chartData}
                lines={[
                  { key: "systolic", name: "Systolic", color: "#ec4899" },
                  { key: "diastolic", name: "Diastolic", color: "#8b5cf6" },
                ]}
              />
              <TrendChart
                title="Blood Sugar Trend"
                data={chartData}
                lines={[
                  { key: "sugar", name: "Sugar (mg/dL)", color: "#f59e0b" },
                ]}
              />
              <TrendChart
                title="Heart Rate Trend"
                data={chartData}
                lines={[
                  { key: "heartrate", name: "Heart Rate", color: "#14b8a6" },
                ]}
              />
              {chartData.some((d) => d.weight > 0) && (
                <TrendChart
                  title="Weight Trend"
                  data={chartData}
                  lines={[
                    { key: "weight", name: "Weight (kg)", color: "#6366f1" },
                  ]}
                />
              )}
            </div>
          )}
        </section>

        {/* SYMPTOMS */}
        {report.answers && Object.keys(report.answers).length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Reported Symptoms
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-wrap gap-2">
                {Object.entries(report.answers).map(([k, v]) => (
                  <span
                    key={k}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                      v
                        ? "bg-red-50 border-red-200 text-red-600"
                        : "bg-gray-50 border-gray-200 text-gray-400"
                    }`}
                  >
                    {v ? "✓" : "✗"} {k.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>{" "}
      {/* ← end of reportRef div */}
    </div>
  );
}
