import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
} from "firebase/firestore";
import MedicalInsightsEngine from "../components/MedicalInsightsEngine";
import {
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
import jsPDF from "jspdf";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const toNum = (v) => parseFloat(v) || 0;

const riskConfig = {
  High: {
    badge: "bg-red-100 text-red-700 border-red-300",
    dot: "bg-red-500",
    label: "High Risk",
  },
  Medium: {
    badge: "bg-amber-100 text-amber-700 border-amber-300",
    dot: "bg-amber-500",
    label: "Medium Risk",
  },
  Low: {
    badge: "bg-blue-100 text-blue-700 border-blue-300",
    dot: "bg-blue-400",
    label: "Low Risk",
  },
  Healthy: {
    badge: "bg-emerald-100 text-emerald-700 border-emerald-300",
    dot: "bg-emerald-500",
    label: "Healthy",
  },
};

const RISK_ORDER = { Healthy: 0, Low: 1, Medium: 2, High: 3 };

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
// FIXED TREND ANALYSIS — distance from ideal + range check
// ─────────────────────────────────────────────
const VITAL_IDEALS = {
  systolic: { ideal: 110, range: [90, 140] },
  diastolic: { ideal: 75, range: [60, 90] },
  sugar: { ideal: 110, range: [70, 160] },
  heartrate: { ideal: 78, range: [60, 100] },
  temp: { ideal: 98.2, range: [96, 100.4] },
};

function analyzeTrend(reports) {
  if (!reports || reports.length < 2) return null;
  const curr = reports[reports.length - 1];
  const prev = reports[reports.length - 2];

  let improved = 0,
    worsened = 0;
  const details = [];

  Object.entries(VITAL_IDEALS).forEach(([key, { ideal, range }]) => {
    const c = toNum(curr.vitals?.[key]);
    const p = toNum(prev.vitals?.[key]);
    if (c === 0 || p === 0) return;

    const cInRange = c >= range[0] && c <= range[1];
    const pInRange = p >= range[0] && p <= range[1];
    const cDist = Math.abs(c - ideal);
    const pDist = Math.abs(p - ideal);

    let status;
    if (!pInRange && cInRange) {
      improved++;
      status = "improved";
    } else if (pInRange && !cInRange) {
      worsened++;
      status = "worsened";
    } else if (cDist < pDist - 2) {
      improved++;
      status = "improved";
    } else if (cDist > pDist + 2) {
      worsened++;
      status = "worsened";
    } else {
      status = "neutral";
    }

    details.push({ key, current: c, previous: p, status });
  });

  // Risk level change weighted heavily
  const currLevel = RISK_ORDER[curr.risk] ?? 1;
  const prevLevel = RISK_ORDER[prev.risk] ?? 1;
  if (currLevel < prevLevel) improved += 2;
  if (currLevel > prevLevel) worsened += 2;

  const isStable = improved === 0 && worsened === 0;
  const isImproving = improved > worsened;

  return { isImproving, isStable, improved, worsened, details };
}

// ─────────────────────────────────────────────
// MEDICAL PDF — Black & White Clinical Format
// ─────────────────────────────────────────────
function generateMedicalPDF(mother, report, prevReport, allReports) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const M = 15;
  let y = 0;
  const PAGE_HEIGHT = 297;
  const BOTTOM_MARGIN = 10;

  const checkPageBreak = (requiredHeight = 10) => {
    if (y + requiredHeight > PAGE_HEIGHT - BOTTOM_MARGIN) {
      pdf.addPage();
      y = 20; // reset top margin
    }
  };

  const ln = (x1, y1, x2, y2, c = [180, 180, 180]) => {
    pdf.setDrawColor(...c);
    pdf.line(x1, y1, x2, y2);
  };
  const b = (s = 10) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(s);
  };
  const n = (s = 10) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(s);
  };
  const clr = (...rgb) => pdf.setTextColor(...rgb);

  // ── HEADER
  pdf.setFillColor(30, 30, 30);
  pdf.rect(0, 0, W, 30, "F");

  clr(255, 255, 255);
  b(20);
  pdf.text("ArovyaCare", M, 14);
  n(9);
  clr(180, 180, 180);
  pdf.text(
    "AI-Assisted Maternal Health System  |  Confidential Medical Report",
    M,
    21,
  );

  clr(160, 160, 160);
  n(8);
  pdf.text(`Report ID: ${report.id?.slice(0, 12) || "—"}`, W - M, 12, {
    align: "right",
  });
  pdf.text(`Generated: ${new Date().toLocaleString("en-IN")}`, W - M, 18, {
    align: "right",
  });
  pdf.text(`Visit Date: ${fmt(report.createdAt)}`, W - M, 24, {
    align: "right",
  });

  y = 38;

  // ── PATIENT INFO
  pdf.setFillColor(245, 245, 245);
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(M, y, W - M * 2, 28, "FD");

  clr(30, 30, 30);
  b(9);
  pdf.text("PATIENT INFORMATION", M + 4, y + 7);
  ln(M + 4, y + 9, W - M - 4, y + 9);

  n(8.5);
  clr(60, 60, 60);
  pdf.text(`Name:    ${mother?.name || "—"}`, M + 4, y + 16);
  pdf.text(`Age:     ${mother?.age || "—"} years`, 80, y + 16);
  pdf.text(`Weeks:   ${mother?.weeks || "—"} weeks`, 140, y + 16);
  pdf.text(`Phone:   ${mother?.phone || "—"}`, M + 4, y + 23);
  pdf.text(`Weight:  ${mother?.weight || "—"} kg`, 80, y + 23);
  pdf.text(`Height:  ${mother?.height || "—"} cm`, 140, y + 23);

  y += 36;

  // ── RISK BAND
  const riskBW = {
    High: {
      fill: [30, 30, 30],
      text: [255, 255, 255],
      desc: "CRITICAL — Immediate medical attention required",
    },
    Medium: {
      fill: [80, 80, 80],
      text: [255, 255, 255],
      desc: "MODERATE — Doctor consultation needed within 24-48 hours",
    },
    Low: {
      fill: [120, 120, 120],
      text: [255, 255, 255],
      desc: "MILD CONCERN — Regular monitoring recommended",
    },
    Healthy: {
      fill: [200, 200, 200],
      text: [30, 30, 30],
      desc: "HEALTHY — Continue routine prenatal care",
    },
  };
  const rb = riskBW[report.risk] || riskBW.Healthy;
  pdf.setFillColor(...rb.fill);
  pdf.rect(M, y, W - M * 2, 16, "F");
  clr(...rb.text);
  b(11);
  pdf.text(`RISK LEVEL: ${(report.risk || "—").toUpperCase()}`, M + 4, y + 7);
  n(8);
  clr(...rb.text);
  pdf.text(rb.desc, M + 4, y + 13);

  y += 23;

  // ── VITALS TABLE
  clr(30, 30, 30);
  b(10);
  pdf.text("CLINICAL VITALS", M, y);
  y += 4;

  const vRows = [
    ["Vital Sign", "Value", "Normal Range", "Status"],
    [
      "Systolic BP",
      `${toNum(report.vitals?.systolic)} mmHg`,
      "90 – 140 mmHg",
      toNum(report.vitals?.systolic) >= 90 &&
      toNum(report.vitals?.systolic) <= 140
        ? "NORMAL"
        : "ABNORMAL",
    ],
    [
      "Diastolic BP",
      `${toNum(report.vitals?.diastolic)} mmHg`,
      "60 – 90 mmHg",
      toNum(report.vitals?.diastolic) >= 60 &&
      toNum(report.vitals?.diastolic) <= 90
        ? "NORMAL"
        : "ABNORMAL",
    ],
    [
      "Blood Sugar",
      `${toNum(report.vitals?.sugar)} mg/dL`,
      "70 – 160 mg/dL",
      toNum(report.vitals?.sugar) >= 70 && toNum(report.vitals?.sugar) <= 160
        ? "NORMAL"
        : "ABNORMAL",
    ],
    [
      "Body Temperature",
      `${toNum(report.vitals?.temp)} °F`,
      "96 – 100.4 °F",
      toNum(report.vitals?.temp) >= 96 && toNum(report.vitals?.temp) <= 100.4
        ? "NORMAL"
        : "ABNORMAL",
    ],
    [
      "Heart Rate",
      `${toNum(report.vitals?.heartrate)} bpm`,
      "60 – 100 bpm",
      toNum(report.vitals?.heartrate) >= 60 &&
      toNum(report.vitals?.heartrate) <= 100
        ? "NORMAL"
        : "ABNORMAL",
    ],
  ];
  const tCols = [M, M + 50, M + 100, M + 152];
  const rowH = 8;

  vRows.forEach((row, ri) => {
    const ry = y + ri * rowH + 3;
    if (ri === 0) {
      pdf.setFillColor(50, 50, 50);
      pdf.rect(M, ry - 5, W - M * 2, rowH, "F");
      clr(255, 255, 255);
      b(8.5);
    } else {
      pdf.setFillColor(
        ri % 2 === 0 ? 248 : 255,
        ri % 2 === 0 ? 248 : 255,
        ri % 2 === 0 ? 248 : 255,
      );
      pdf.rect(M, ry - 5, W - M * 2, rowH, "F");
      const ok = row[3] === "NORMAL";
      clr(60, 60, 60);
      n(8.5);
      pdf.text(row[0], tCols[0] + 2, ry);
      pdf.text(row[1], tCols[1] + 2, ry);
      pdf.text(row[2], tCols[2] + 2, ry);
      clr(ok ? 30 : 180, ok ? 120 : 30, ok ? 30 : 30);
      b(8.5);
      pdf.text(row[3], tCols[3] + 2, ry);
      ln(M, ry + 3, W - M, ry + 3);
      return;
    }
    row.slice(0, 3).forEach((cell, ci) => pdf.text(cell, tCols[ci] + 2, ry));
    pdf.text(row[3], tCols[3] + 2, ry);
  });

  y += vRows.length * rowH + 10;

  // ── SYMPTOMS
  clr(30, 30, 30);
  b(10);
  pdf.text("REPORTED SYMPTOMS", M, y);
  y += 5;

  const pos = Object.entries(report.answers || {})
    .filter(([, v]) => v)
    .map(([k]) => k.replace(/_/g, " "));
  const neg = Object.entries(report.answers || {})
    .filter(([, v]) => !v)
    .map(([k]) => k.replace(/_/g, " "));
  const symH = Math.max(pos.length, neg.length) * 5.5 + 16;

  pdf.setFillColor(250, 250, 250);
  pdf.setDrawColor(180, 180, 180);
  pdf.rect(M, y, (W - M * 2) / 2 - 2, symH, "FD");
  pdf.rect(M + (W - M * 2) / 2 + 2, y, (W - M * 2) / 2 - 2, symH, "FD");
  checkPageBreak(symH + 20);
  b(8);
  clr(50, 50, 50);
  pdf.text("Present Symptoms", M + 3, y + 7);
  pdf.text("Absent / Not Reported", M + (W - M * 2) / 2 + 5, y + 7);
  ln(M + 3, y + 9, M + (W - M * 2) / 2 - 5, y + 9);
  ln(M + (W - M * 2) / 2 + 5, y + 9, W - M - 3, y + 9);

  n(8);
  clr(80, 80, 80);
  if (pos.length === 0) {
    pdf.text("None reported", M + 3, y + 15);
  } else
    pos.forEach((s, i) => {
      clr(30, 30, 30);
      pdf.text(`• ${s}`, M + 3, y + 15 + i * 5.5);
    });
  neg.slice(0, 10).forEach((s, i) => {
    clr(120, 120, 120);
    pdf.text(`• ${s}`, M + (W - M * 2) / 2 + 5, y + 15 + i * 5.5);
  });

  y += symH + 10;

  // ── PREVIOUS VISIT COMPARISON
  if (prevReport) {
    checkPageBreak(40);
    clr(30, 30, 30);
    b(10);
    pdf.text("COMPARISON WITH PREVIOUS VISIT", M, y);
    y += 8;
    const cFields = [
      { label: "Systolic BP", key: "systolic", unit: "mmHg" },
      { label: "Diastolic BP", key: "diastolic", unit: "mmHg" },
      { label: "Blood Sugar", key: "sugar", unit: "mg/dL" },
      { label: "Heart Rate", key: "heartrate", unit: "bpm" },
    ];
    cFields.forEach((f, i) => {
      const cv = toNum(report.vitals?.[f.key]);
      const pv = toNum(prevReport.vitals?.[f.key]);
      const df = cv - pv;
      const cx = M + i * 44;
      pdf.setFillColor(245, 245, 245);
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(cx, y, 41, 22, "FD");
      b(7.5);
      clr(80, 80, 80);
      pdf.text(f.label, cx + 2, y + 7);
      b(12);
      clr(30, 30, 30);
      pdf.text(`${cv}`, cx + 2, y + 15);
      n(7.5);
      clr(
        df < 0 ? 30 : df > 0 ? 160 : 100,
        df < 0 ? 120 : df > 0 ? 30 : 100,
        30,
      );
      pdf.text(
        `${df > 0 ? "+" : ""}${df.toFixed(1)} ${f.unit}`,
        cx + 2,
        y + 20,
      );
    });
    y += 32;
  }

  // ── RECOMMENDATIONS

  b(10);
  pdf.text("DOCTOR RECOMMENDATIONS", M, y);
  y += 6;

  const recs =
    {
      High: [
        "URGENT: Visit nearest hospital or maternity ward immediately.",
        "Continuous monitoring of BP and fetal movement is required.",
        "Strict bed rest — avoid any physical exertion.",
        "Inform emergency contact and healthcare provider right away.",
        "Do not consume any unprescribed medication.",
      ],
      Medium: [
        "Schedule a doctor appointment within the next 24-48 hours.",
        "Monitor vitals (BP, sugar, temp) at least twice daily.",
        "Avoid salty/high-sugar foods. Eat balanced nutrition.",
        "Track fetal movement and report changes immediately.",
        "Adequate rest — avoid strenuous activity.",
      ],
      Low: [
        "Attend next scheduled prenatal check-up as planned.",
        "Monitor vitals once daily and note any new symptoms.",
        "Maintain hydration (8-10 glasses water/day).",
        "Follow prescribed supplements (iron, folic acid, calcium).",
        "Report any worsening symptoms to your doctor promptly.",
      ],
      Healthy: [
        "Continue routine prenatal care as scheduled.",
        "Balanced diet: fruits, vegetables, lean proteins, whole grains.",
        "Stay hydrated and get adequate rest (7-8 hours/night).",
        "Light exercise such as walking 20-30 minutes is beneficial.",
        "Attend all scheduled prenatal appointments without skip.",
      ],
    }[report.risk] || [];
  const recHeight = recs.length * 7 + 8;

  if (y + recHeight > PAGE_HEIGHT - 40) {
    pdf.addPage();
    y = 20;
  }

  pdf.setFillColor(245, 245, 245);
  pdf.setDrawColor(180, 180, 180);

  pdf.rect(M, y, W - M * 2, recHeight, "FD");
  n(8.5);
  clr(50, 50, 50);
  recs.forEach((r, i) => {
    pdf.text(`${i + 1}. ${r}`, M + 4, y + 7 + i * 7);
  });

  y += recs.length * 7 + 14;

  // ── FOOTER
  // ✅ Dynamic footer placement
  if (y > PAGE_HEIGHT - 30) {
    pdf.addPage();
    y = 20;
  }

  ln(M, y + 5, W - M, y + 5);

  n(7.5);
  clr(130, 130, 130);
  pdf.text(
    "This report is AI-generated and intended to assist healthcare professionals only.",
    M,
    y + 10,
  );
  pdf.text(
    "It does not replace clinical diagnosis. Always consult a qualified physician.",
    M,
    y + 15,
  );

  b(8);
  clr(50, 50, 50);
  pdf.text("ArovyaCare Maternal Health AI", W - M, y + 10, { align: "right" });

  n(7.5);
  clr(130, 130, 130);
  pdf.text("Confidential Patient Record", W - M, y + 15, { align: "right" });
  pdf.save(
    `ArovyaCare_${mother?.name || "Patient"}_${fmt(report.createdAt)}.pdf`,
  );
}

// ─────────────────────────────────────────────
// SAVE REPORT SNAPSHOT TO FIRESTORE
// ─────────────────────────────────────────────
async function saveReportSnapshot(report, mother, allReports) {
  try {
    const trendResult = analyzeTrend(allReports);
    const currIdx = allReports.findIndex((r) => r.id === report.id);
    const prevReport = currIdx > 0 ? allReports[currIdx - 1] : null;

    await setDoc(
      doc(db, "reportSnapshots", report.id),
      {
        reportId: report.id,
        motherId: report.motherId,
        motherName: mother?.name || "Unknown",
        weekNumber: mother?.weeks || null,
        risk: report.risk,
        vitals: report.vitals,
        answers: report.answers,
        createdAt: report.createdAt,
        savedAt: new Date(),
        visitNumber: currIdx + 1,
        totalVisits: allReports.length,
        analysis: {
          isImproving: trendResult?.isImproving ?? null,
          isStable: trendResult?.isStable ?? true,
          improved: trendResult?.improved ?? 0,
          worsened: trendResult?.worsened ?? 0,
          trendDetails: trendResult?.details ?? [],
        },
        previousReport: prevReport
          ? {
              reportId: prevReport.id,
              risk: prevReport.risk,
              vitals: prevReport.vitals,
              createdAt: prevReport.createdAt,
            }
          : null,
      },
      { merge: true },
    );

    console.log("✅ Report snapshot saved");
  } catch (err) {
    console.error("❌ Snapshot save failed:", err);
  }
}

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────
function PatientHeader({ mother, report }) {
  const navigate = useNavigate();
  const rc = riskConfig[report?.risk] || riskConfig.Low;
  return (
    <div className="rounded-3xl bg-gradient-to-r from-pink-500 via-pink-400 to-pink-600 p-8 text-white overflow-hidden relative shadow-2xl shadow-pink-200">
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
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
                <User size={13} />
                {mother?.age} yrs
              </span>
              <span className="flex items-center gap-1">
                <Baby size={13} />
                {mother?.weeks} weeks
              </span>
              <span className="flex items-center gap-1">
                <Phone size={13} />
                {mother?.phone}
              </span>
              {mother?.address && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} />
                  {mother.address}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border bg-white/15 backdrop-blur border-white/30 text-white font-bold text-lg shadow-lg">
            <span className={`w-3 h-3 rounded-full ${rc.dot} animate-pulse`} />
            {rc.label}
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
  );
}

function AlertCard({ icon: Icon, title, detail, color }) {
  const colors = {
    red: "bg-red-50 border-red-300 text-red-700",
    amber: "bg-amber-50 border-amber-300 text-amber-700",
    orange: "bg-orange-50 border-orange-300 text-orange-700",
  };
  return (
    <div
      className={`flex items-start gap-4 p-5 rounded-2xl border-2 shadow-lg ${colors[color]}`}
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

function ComparisonCard({
  label,
  icon: Icon,
  current,
  previous,
  unit,
  lowerIsBetter = false,
}) {
  const curr = toNum(current),
    prev = toNum(previous);
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
            className={`flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-xl ${improved === true ? "bg-emerald-50 text-emerald-600" : improved === false ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-500"}`}
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

function RiskEvolution({ prevRisk, currRisk }) {
  if (!prevRisk) return null;
  const prev_ = riskConfig[prevRisk] || riskConfig.Healthy;
  const curr_ = riskConfig[currRisk] || riskConfig.Healthy;
  const pL = RISK_ORDER[prevRisk] ?? 0,
    cL = RISK_ORDER[currRisk] ?? 0;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
        Risk Evolution
      </h3>
      <div className="flex items-center gap-4 justify-center flex-wrap">
        <div
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-sm font-bold ${prev_.badge}`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${prev_.dot}`} />
          {prev_.label}
        </div>
        <ChevronRight size={20} className="text-gray-400" />
        <div
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-sm font-bold ${curr_.badge} shadow-md`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${curr_.dot} animate-pulse`}
          />
          {curr_.label}
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-3">
        {cL < pL
          ? " Health status has improved"
          : cL > pL
            ? " Risk level has increased"
            : "→ Health level unchanged"}
      </p>
    </div>
  );
}

function TrendStatement({ trendResult }) {
  if (!trendResult) return null;
  const { isImproving, isStable, improved, worsened } = trendResult;
  if (isStable)
    return (
      <div className="rounded-2xl p-5 border-2 bg-gray-50 border-gray-200 text-gray-700 flex items-start gap-4">
        <div className="p-2 rounded-xl bg-white/70">
          <Minus size={22} className="text-gray-500" />
        </div>
        <div>
          <p className="font-bold text-base">Condition is Stable</p>
          <p className="text-sm opacity-80 mt-1">
            Vitals remain consistent compared to the last visit. Continue
            current care plan.
          </p>
        </div>
      </div>
    );
  return (
    <div
      className={`rounded-2xl p-5 border-2 flex items-start gap-4 ${isImproving ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}
    >
      <div className="p-2 rounded-xl bg-white/70">
        {isImproving ? (
          <TrendingDown size={22} className="text-emerald-600" />
        ) : (
          <TrendingUp size={22} className="text-rose-600" />
        )}
      </div>
      <div>
        <p className="font-bold text-base">
          {isImproving ? "Condition is Improving" : "Condition is Worsening"}
        </p>
        <p className="text-sm opacity-80 mt-1">
          {isImproving
            ? `${improved} health indicator${improved !== 1 ? "s have" : " has"} shown positive improvement compared to the last visit.`
            : `${worsened} health indicator${worsened !== 1 ? "s have" : " has"} deteriorated. Closer monitoring is advised.`}
        </p>
      </div>
    </div>
  );
}

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

function AISummary({ report, prevReport, alerts }) {
  const risk = report?.risk || "Healthy";
  const hasAlerts = alerts.length > 0;
  const pL = RISK_ORDER[prevReport?.risk] ?? -1,
    cL = RISK_ORDER[risk] ?? 0;
  const worsening = prevReport && cL > pL,
    improving = prevReport && cL < pL;

  const summary =
    risk === "High" && hasAlerts
      ? "Patient condition is critical. Multiple vital signs are outside safe ranges. Immediate medical intervention is strongly recommended."
      : risk === "High"
        ? "Patient is categorized as High Risk. Close monitoring and urgent follow-up with a qualified physician is advised immediately."
        : risk === "Medium" && worsening
          ? "Patient condition has escalated to Medium Risk. Preventive care and a doctor visit within 24-48 hours is strongly advised."
          : risk === "Medium"
            ? "Patient is at moderate risk. Some vital indicators require attention. Regular check-ins and lifestyle modifications are recommended."
            : risk === "Low" && worsening
              ? "Patient shows mild concern with some indicators moving in the wrong direction. Continue monitoring and report changes to the doctor."
              : risk === "Low"
                ? "Patient shows mild concern but is generally stable. Routine prenatal monitoring and a follow-up appointment are advised."
                : improving
                  ? "Patient condition is improving and now in the healthy range. Continue current care plan and scheduled prenatal check-ups."
                  : "Patient is in good health. All vitals are within normal ranges. Continue routine prenatal care as scheduled.";

  const bg =
    risk === "High"
      ? "from-red-50 to-rose-50 border-red-200"
      : risk === "Medium"
        ? "from-amber-50 to-orange-50 border-amber-200"
        : risk === "Low"
          ? "from-blue-50 to-cyan-50 border-blue-200"
          : "from-emerald-50 to-teal-50 border-emerald-200";

  return (
    <div className={`rounded-2xl border-2 bg-gradient-to-br p-6 ${bg}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shadow-sm">
          <Stethoscope size={20} className="text-pink-500" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            AI Doctor Summary
          </p>
          <p className="text-sm font-bold text-gray-700">
            {" "}
            {riskConfig[risk]?.label || risk} Assessment
          </p>
        </div>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed">{summary}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
export default function ReportPage() {
  const { id } = useParams();
  const location = useLocation();
  const patientId = location.state?.patientId;
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [mother, setMother] = useState(null);

  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const snapshotSaved = useRef(false);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const rSnap = await getDoc(doc(db, "assessments", id));
        if (!rSnap.exists()) return;
        const rData = { id: rSnap.id, ...rSnap.data() };
        setReport(rData);

        const mSnap = await getDoc(doc(db, "mothers", rData.motherId));
        const mData = mSnap.exists() ? mSnap.data() : {};
        setMother(mData);

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

        if (!snapshotSaved.current) {
          snapshotSaved.current = true;
          saveReportSnapshot(rData, mData, reports);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [id]);

  if (loading)
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-400">
        <div className="w-12 h-12 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin" />
        <p className="text-sm font-medium">Loading report...</p>
      </div>
    );

  if (!report)
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
        Report not found.
      </div>
    );

  const vitals = report.vitals || {};
  const currIdx = allReports.findIndex((r) => r.id === id);
  const prevReport = currIdx > 0 ? allReports[currIdx - 1] : null;
  const prevVitals = prevReport?.vitals || {};
  const trendResult = analyzeTrend(allReports);

  const alerts = [];
  if (toNum(vitals.sugar) > 160)
    alerts.push({
      icon: Droplets,
      title: "High Blood Sugar",
      detail: `Sugar: ${vitals.sugar} mg/dL (Normal < 160)`,
      color: "red",
    });
  if (toNum(vitals.sugar) > 250)
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
    alerts.push({
      icon: Activity,
      title: "High Blood Pressure",
      detail: `Systolic: ${vitals.systolic} mmHg (Normal ≤ 140)`,
      color: "red",
    });
  if (toNum(vitals.diastolic) > 90)
    alerts.push({
      icon: Heart,
      title: "High Diastolic BP",
      detail: `Diastolic: ${vitals.diastolic} mmHg (Normal ≤ 90)`,
      color: "red",
    });
  if (toNum(vitals.temp) > 100.4)
    alerts.push({
      icon: Thermometer,
      title: "Fever Detected",
      detail: `Temp: ${vitals.temp}°F (Normal ≤ 100.4°F)`,
      color: "orange",
    });
  if (toNum(vitals.temp) > 103)
    alerts.push({
      icon: Thermometer,
      title: "Critical Fever",
      detail: `Temp: ${vitals.temp}°F — Dangerously High`,
      color: "red",
    });
  if (toNum(vitals.heartrate) > 100)
    alerts.push({
      icon: Activity,
      title: "High Heart Rate",
      detail: `HR: ${vitals.heartrate} bpm (Normal ≤ 100)`,
      color: "amber",
    });

  return (
    <div className="min-h-full bg-[#faf8ff] px-4 py-6 md:px-8">
      <button
        onClick={() =>
          navigate(patientId ? `/patient/${patientId}` : "/dashboard")
        }
        className="mb-4 text-sm text-gray-500 hover:text-pink-600 flex items-center gap-1"
      >
        <ArrowLeft size={14} /> Back
      </button>

      {/* 🔥 Top Right Buttons */}
      <div className="flex justify-end gap-3 mb-4">
        {/* 🏥 Nearby Hospitals */}
        <button
          onClick={() => navigate("/emergency-map")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm shadow-lg bg-red-500 text-white hover:scale-105 active:scale-95 transition-all duration-200"
        >
          🏥 Nearby Hospitals
        </button>

          <button
            onClick={() => {
              setDownloading(true);
              generateMedicalPDF(mother, report, prevReport, allReports);
              setDownloading(false);
            }}
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
        <div  className="space-y-6 bg-[#faf8ff] p-2">
          {/* A — PATIENT HEADER */}
          <PatientHeader mother={mother} report={report} />

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

          <TrendStatement trendResult={trendResult} />
          {prevReport && (
            <RiskEvolution prevRisk={prevReport.risk} currRisk={report.risk} />
          )}
          <AISummary report={report} prevReport={prevReport} alerts={alerts} />

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
                normal="90–140"
              />
              <VitalCard
                label="Diastolic"
                value={toNum(vitals.diastolic)}
                unit="mmHg"
                icon={Heart}
                color="bg-purple-500"
                normal="60–90"
              />
              <VitalCard
                label="Sugar"
                value={toNum(vitals.sugar)}
                unit="mg/dL"
                icon={Droplets}
                color="bg-amber-500"
                normal="70–160"
              />
              <VitalCard
                label="Temperature"
                value={toNum(vitals.temp)}
                unit="°F"
                icon={Thermometer}
                color="bg-orange-500"
                normal="96–100.4"
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
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${v ? "bg-red-50 border-red-200 text-red-600" : "bg-gray-50 border-gray-200 text-gray-400"}`}
                    >
                      {v ? "✓" : "✗"} {k.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Medical Insights
            </h2>
            <MedicalInsightsEngine
              vitals={report.vitals}
              answers={report.answers}
              risk={report.risk}
            />
          </section>
        </div>
      </div>
  );
}
