import {
  AlertTriangle, ShieldCheck, ShieldAlert, Shield,
  TrendingUp, Activity, Droplets, Thermometer, Heart,
  Stethoscope, ClipboardList, Lightbulb, FlaskConical,
  CircleDot, BadgeAlert, Pill, Dumbbell,
  Salad, BedDouble, Phone, Zap, Eye,
} from "lucide-react";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const toNum = (v) => parseFloat(v) || 0;

const RANGES = {
  systolic:  { low: 90,  high: 140 },
  diastolic: { low: 60,  high: 90  },
  sugar:     { low: 70,  high: 140 },
  temp:      { low: 96,  high: 100.4 },
  heartrate: { low: 60,  high: 100 },
};

// ─────────────────────────────────────────────
// 1. FUTURE DISEASE PREDICTION
// ─────────────────────────────────────────────
export function generatePredictions(vitals = {}, answers = {}) {
  const s  = toNum(vitals.systolic);
  const d  = toNum(vitals.diastolic);
  const su = toNum(vitals.sugar);
  const t  = toNum(vitals.temp);
  const hr = toNum(vitals.heartrate);

  const hasFatigue   = !!answers.fatigue;
  const hasHeadache  = !!answers.headache;
  const hasDizziness = !!answers.dizziness;
  const hasSwelling  = !!answers.swelling || !!answers.swollen_feet;
  const hasNausea    = !!answers.nausea;
  const hasBlurVis   = !!answers.blurred_vision || !!answers.visual_disturbance;
  const hasShortnessOfBreath = !!answers.shortness_of_breath || !!answers.breathing_difficulty;

  const predictions = [];

  // ── Gestational Diabetes
  if (su > 140) {
    let prob = 50;
    if (su > 180) prob = 75;
    if (su > 220) prob = 85;
    if (hasFatigue) prob = Math.min(prob + 8, 90);
    if (hasNausea)  prob = Math.min(prob + 5, 90);
    predictions.push({
      disease: "Gestational Diabetes",
      probability: `${prob}%`,
      severity: su > 200 ? "High" : su > 160 ? "Medium" : "Low",
      reason: `Blood sugar at ${su} mg/dL (normal < 140)${hasFatigue ? ", accompanied by fatigue" : ""}${hasNausea ? " and nausea" : ""}.`,
      icon: Droplets,
    });
  }

  // ── Gestational Hypertension / Preeclampsia
  if (s > 140 || (s > 130 && d > 85) || hasSwelling) {
    let prob = 45;
    if (s > 155) prob = 70;
    if (s > 160 && d > 100) prob = 85;
    if (hasSwelling) prob = Math.min(prob + 10, 90);
    if (hasHeadache) prob = Math.min(prob + 8, 90);
    if (hasBlurVis)  prob = Math.min(prob + 10, 92);
    const isPreeclampsia = s > 140 && (hasSwelling || hasBlurVis || hasHeadache);
    predictions.push({
      disease: isPreeclampsia ? "Preeclampsia" : "Gestational Hypertension",
      probability: `${prob}%`,
      severity: s > 160 ? "High" : s > 145 ? "Medium" : "Low",
      reason: `Systolic BP at ${s} mmHg${hasSwelling ? ", with edema/swelling" : ""}${hasHeadache ? ", persistent headache" : ""}${hasBlurVis ? ", visual disturbances" : ""}.`,
      icon: Activity,
    });
  }

  // ── Hypotension / Syncope Risk
  if (s < 90 || hasDizziness) {
    let prob = 40;
    if (s < 80)       prob = 65;
    if (hasDizziness) prob = Math.min(prob + 15, 80);
    if (hasFatigue)   prob = Math.min(prob + 8, 80);
    predictions.push({
      disease: "Maternal Hypotension",
      probability: `${prob}%`,
      severity: s < 80 ? "High" : "Medium",
      reason: `Systolic BP at ${s} mmHg${hasDizziness ? ", dizziness reported" : ""}${hasFatigue ? ", fatigue present" : ""}.`,
      icon: TrendingUp,
    });
  }

  // ── Infection / Fever Risk
  if (t > 100.4) {
    let prob = 55;
    if (t > 101.5) prob = 70;
    if (t > 103)   prob = 88;
    predictions.push({
      disease: t > 103 ? "Severe Maternal Infection" : "Maternal Infection / UTI",
      probability: `${prob}%`,
      severity: t > 103 ? "High" : t > 101.5 ? "Medium" : "Low",
      reason: `Body temperature at ${t}°F (normal < 100.4°F). Fever in pregnancy warrants immediate evaluation.`,
      icon: Thermometer,
    });
  }

  // ── Anemia
  if (hasFatigue && hasHeadache) {
    let prob = 50;
    if (hr > 95)           prob = Math.min(prob + 12, 75);
    if (hasDizziness)      prob = Math.min(prob + 10, 78);
    if (hasShortnessOfBreath) prob = Math.min(prob + 10, 82);
    predictions.push({
      disease: "Iron-Deficiency Anemia",
      probability: `${prob}%`,
      severity: prob > 70 ? "Medium" : "Low",
      reason: `Fatigue and headache combination${hasDizziness ? ", dizziness" : ""}${hasShortnessOfBreath ? ", shortness of breath" : ""} — classical anemia triad.`,
      icon: Heart,
    });
  }

  // ── Tachycardia / Cardiac Stress
  if (hr > 100) {
    let prob = 40;
    if (hr > 115) prob = 62;
    if (hr > 130) prob = 80;
    if (hasShortnessOfBreath) prob = Math.min(prob + 12, 85);
    predictions.push({
      disease: "Cardiac Stress / Tachycardia",
      probability: `${prob}%`,
      severity: hr > 120 ? "High" : hr > 110 ? "Medium" : "Low",
      reason: `Heart rate at ${hr} bpm (normal 60–100 bpm)${hasShortnessOfBreath ? ", shortness of breath noted" : ""}.`,
      icon: Heart,
    });
  }

  return predictions;
}

// ─────────────────────────────────────────────
// 2. RISK EXPLANATION
// ─────────────────────────────────────────────
export function generateRiskExplanation(vitals = {}, answers = {}, risk = "Healthy") {
  const s  = toNum(vitals.systolic);
  const d  = toNum(vitals.diastolic);
  const su = toNum(vitals.sugar);
  const t  = toNum(vitals.temp);
  const hr = toNum(vitals.heartrate);

  const abnormalVitals = [];
  const presentSymptoms = [];

  if (s > RANGES.systolic.high)    abnormalVitals.push(`elevated systolic BP (${s} mmHg)`);
  if (s < RANGES.systolic.low)     abnormalVitals.push(`low systolic BP (${s} mmHg)`);
  if (d > RANGES.diastolic.high)   abnormalVitals.push(`elevated diastolic BP (${d} mmHg)`);
  if (su > RANGES.sugar.high)      abnormalVitals.push(`high blood sugar (${su} mg/dL)`);
  if (su < RANGES.sugar.low)       abnormalVitals.push(`low blood sugar (${su} mg/dL)`);
  if (t > RANGES.temp.high)        abnormalVitals.push(`fever (${t}°F)`);
  if (t < RANGES.temp.low)         abnormalVitals.push(`low body temperature (${t}°F)`);
  if (hr > RANGES.heartrate.high)  abnormalVitals.push(`elevated heart rate (${hr} bpm)`);
  if (hr < RANGES.heartrate.low)   abnormalVitals.push(`low heart rate (${hr} bpm)`);

  const symptomMap = {
    fatigue: "fatigue", headache: "headache", dizziness: "dizziness",
    swelling: "swelling", nausea: "nausea", blurred_vision: "blurred vision",
    shortness_of_breath: "shortness of breath", chest_pain: "chest pain",
    abdominal_pain: "abdominal pain", vomiting: "vomiting",
  };
  Object.entries(answers || {}).forEach(([k, v]) => {
    if (v && symptomMap[k]) presentSymptoms.push(symptomMap[k]);
  });

  if (risk === "Healthy" && abnormalVitals.length === 0) {
    return "All vitals are within normal clinical ranges. No symptoms of concern are reported. Patient is stable with no immediate risk indicators.";
  }
  if (risk === "Low") {
    const parts = [];
    if (abnormalVitals.length > 0) parts.push(`mild abnormalities noted: ${abnormalVitals.join(", ")}`);
    if (presentSymptoms.length > 0) parts.push(`reported symptoms include ${presentSymptoms.join(", ")}`);
    return `Risk is LOW — ${parts.join("; ")}. Values are outside optimal range but not critically dangerous. Monitoring is advised.`;
  }
  if (risk === "Medium") {
    const vitPart = abnormalVitals.length > 0 ? `abnormal vitals: ${abnormalVitals.join(", ")}` : "";
    const symPart = presentSymptoms.length > 0 ? `symptoms: ${presentSymptoms.join(", ")}` : "";
    const combined = [vitPart, symPart].filter(Boolean).join("; ");
    return `Risk is MEDIUM — ${combined}. The combination of these factors suggests a moderate health concern requiring medical attention within 24-48 hours.`;
  }
  if (risk === "High") {
    const vitPart = abnormalVitals.length > 0 ? `critically abnormal vitals: ${abnormalVitals.join(", ")}` : "severely abnormal vital signs";
    const symPart = presentSymptoms.length > 0 ? `active symptoms: ${presentSymptoms.join(", ")}` : "";
    const combined = [vitPart, symPart].filter(Boolean).join("; with ");
    return `Risk is HIGH — ${combined}. This presentation warrants immediate medical evaluation. Delay in care may pose risk to mother and fetus.`;
  }
  return "Risk assessment completed. Please consult a healthcare provider for interpretation.";
}

// ─────────────────────────────────────────────
// 3. AI MEDICAL SUMMARY
// ─────────────────────────────────────────────
export function generateSummary(vitals = {}, answers = {}, risk = "Healthy") {
  const s  = toNum(vitals.systolic);
  const su = toNum(vitals.sugar);
  const t  = toNum(vitals.temp);
  const hr = toNum(vitals.heartrate);

  const hasFatigue  = !!answers.fatigue;
  const hasHeadache = !!answers.headache;
  const hasSwelling = !!answers.swelling || !!answers.swollen_feet;
  const hasBlurVis  = !!answers.blurred_vision;

  if (risk === "High") {
    if (s > 160 && hasSwelling) return "Patient presents with dangerously elevated blood pressure and peripheral edema — a clinical picture consistent with preeclampsia. Combined with reported symptoms, this requires immediate hospital evaluation. Delay in treatment could pose significant risk to maternal and fetal wellbeing.";
    if (su > 220) return `Patient shows critically elevated blood glucose at ${su} mg/dL, indicating severe hyperglycemia. This level of dysregulation during pregnancy demands urgent endocrinological assessment. Fetal macrosomia and metabolic complications are a concern if left unaddressed.`;
    if (t > 103)  return `Patient presents with high-grade fever at ${t}°F in a pregnant state, which is a medical emergency. Systemic infection or sepsis cannot be ruled out without laboratory workup. Immediate hospitalization, blood cultures, and empirical antibiotic therapy should be initiated promptly.`;
    return "Patient exhibits multiple high-risk indicators across vitals and reported symptoms. The overall clinical picture is consistent with an acute obstetric concern. Immediate physician consultation and hospital evaluation are strongly recommended without further delay.";
  }
  if (risk === "Medium") {
    if (su > 140) return `Patient's blood glucose is elevated at ${su} mg/dL, raising concern for gestational diabetes mellitus. Combined with ${hasFatigue ? "fatigue and " : ""}the current metabolic pattern, close dietary monitoring and a formal glucose tolerance test (GTT) are recommended. Early intervention prevents progression to frank GDM.`;
    if (s > 130)  return `Patient presents with borderline elevated blood pressure (${s}/${toNum(vitals.diastolic)} mmHg)${hasHeadache ? ", persistent headache" : ""}${hasSwelling ? ", and visible edema" : ""}. This warrants close observation for gestational hypertension progression. Daily home BP monitoring and a follow-up within 48 hours are advised.`;
    return "Patient shows moderate clinical concern with a combination of vital sign deviations and reported symptoms. While not immediately critical, the current trajectory requires medical review within the next 24–48 hours to prevent escalation.";
  }
  if (risk === "Low") {
    return `Patient's vitals are near normal range with${hasFatigue ? " mild fatigue and" : ""} minor deviations. The presentation is stable and does not indicate imminent risk. Continued prenatal monitoring with lifestyle optimization is sufficient at this stage. Next scheduled check-up should proceed as planned.`;
  }
  return "Patient demonstrates excellent vital sign stability across all measured parameters — blood pressure, glucose, temperature, and heart rate are all within normal pregnancy ranges. No symptoms of concern are reported. Continue current prenatal care regimen and maintain scheduled follow-ups.";
}

// ─────────────────────────────────────────────
// 4. SMART RECOMMENDATIONS
// ─────────────────────────────────────────────
export function generateRecommendations(vitals = {}, answers = {}, risk = "Healthy", predictions = []) {
  const base = {
    Healthy: [
      { icon: Droplets,  text: "Drink 8–10 glasses of water daily to maintain optimal hydration and amniotic fluid levels." },
      { icon: Dumbbell,  text: "30 minutes of gentle walking or prenatal yoga daily is beneficial for circulation and mood." },
      { icon: Salad,     text: "Follow a balanced diet rich in iron, folate, calcium, and omega-3 fatty acids." },
      { icon: BedDouble, text: "Maintain 7–9 hours of sleep. Sleep on your left side to improve fetal blood flow." },
    ],
    Low: [
      { icon: Droplets,  text: "Increase daily fluid intake. Mild dehydration can affect both vitals and fetal health." },
      { icon: Eye,       text: "Monitor vitals once daily at home. Note any new symptoms and report immediately." },
      { icon: Salad,     text: "Avoid processed foods. Focus on iron-rich foods, leafy greens, and whole grains." },
      { icon: BedDouble, text: "Adequate rest is essential. Avoid strenuous activities until next check-up." },
    ],
    Medium: [
      { icon: Phone,     text: "Schedule a doctor consultation within 24–48 hours. Do not delay." },
      { icon: Activity,  text: "Monitor blood pressure, sugar, and temperature at least twice daily." },
      { icon: Salad,     text: "Avoid high-sodium and high-sugar foods. Prefer home-cooked, low-GI meals." },
      { icon: BedDouble, text: "Strict rest. Reduce physical exertion and stress until medical review." },
      { icon: Eye,       text: "Track fetal movement. Report any reduction or absence immediately." },
    ],
    High: [
      { icon: BadgeAlert, text: "Proceed to the nearest hospital or maternity ward immediately. This is urgent." },
      { icon: Phone,      text: "Notify your emergency contact and primary OB/GYN physician right away." },
      { icon: BedDouble,  text: "Strict bed rest. Avoid any physical exertion or emotional stress." },
      { icon: Pill,       text: "Do not take any unprescribed medication. Inform doctors of all current medications." },
      { icon: Activity,   text: "Continuous fetal heart rate and BP monitoring required until stabilized." },
    ],
  };

  const recommendations = [...(base[risk] || base.Healthy)];
  const diseaseNames = predictions.map(p => p.disease);

  if (diseaseNames.some(d => d.includes("Diabetes"))) {
    recommendations.push({ icon: Salad, text: "Gestational Diabetes: Eliminate refined sugars and white carbohydrates. Eat small meals every 2–3 hours." });
    recommendations.push({ icon: Dumbbell, text: "Gestational Diabetes: 15-minute post-meal walks significantly reduce postprandial glucose spikes." });
  }
  if (diseaseNames.some(d => d.includes("Hypertension") || d.includes("Preeclampsia"))) {
    recommendations.push({ icon: Salad, text: "Hypertension: Limit sodium intake to under 1,500 mg/day. Avoid pickles, chips, and canned foods." });
    recommendations.push({ icon: Eye,  text: "Preeclampsia watch: Report sudden severe headache, vision changes, or upper abdominal pain immediately." });
  }
  if (diseaseNames.some(d => d.includes("Anemia"))) {
    recommendations.push({ icon: Pill, text: "Anemia: Ensure daily iron supplement intake. Consume vitamin C alongside iron-rich foods to aid absorption." });
  }
  if (diseaseNames.some(d => d.includes("Infection"))) {
    recommendations.push({ icon: Thermometer, text: "Infection: Monitor temperature every 4 hours. Stay hydrated and seek fever management guidance from your doctor." });
  }
  if (diseaseNames.some(d => d.includes("Hypotension"))) {
    recommendations.push({ icon: Zap, text: "Hypotension: Rise slowly from sitting or lying positions. Increase fluid and salt intake as directed by your doctor." });
  }

  return recommendations;
}

// ─────────────────────────────────────────────
// RISK CONFIG
// ─────────────────────────────────────────────
const RISK_STYLE = {
  High:    { bg: "bg-red-50",     border: "border-red-200",     text: "text-red-700",     badge: "bg-red-100 text-red-700 border-red-200",     icon: ShieldAlert  },
  Medium:  { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-100 text-amber-700 border-amber-200", icon: Shield       },
  Low:     { bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700",    badge: "bg-blue-100 text-blue-700 border-blue-200",    icon: ShieldCheck  },
  Healthy: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: ShieldCheck },
};

const SEVERITY_BAR = {
  High:   "bg-red-400",
  Medium: "bg-amber-400",
  Low:    "bg-blue-400",
};

const SEVERITY_BADGE = {
  High:   "bg-red-100 text-red-700 border-red-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low:    "bg-blue-100 text-blue-700 border-blue-200",
};

// ─────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle, color = "text-pink-500" }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0">
        <Icon size={18} className={color} />
      </div>
      <div>
        <h2 className="text-sm font-bold text-gray-800 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PREDICTION CARD
// ─────────────────────────────────────────────
function PredictionsCard({ predictions }) {
  if (predictions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <SectionHeader icon={FlaskConical} title="Future Risk Predictions" subtitle="Based on current vitals and symptoms" color="text-violet-500" />
        <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <ShieldCheck size={24} className="text-emerald-500" />
          </div>
          <p className="text-sm font-semibold text-gray-600">No Elevated Disease Risks Detected</p>
          <p className="text-xs text-gray-400 max-w-xs">Vitals and symptoms are within normal ranges. Continue routine prenatal care.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <SectionHeader icon={FlaskConical} title="Future Risk Predictions" subtitle="Probability based on vitals and symptom patterns" color="text-violet-500" />
      <div className="space-y-4">
        {predictions.map((p, i) => {
          const probNum   = parseInt(p.probability);
          const sStyle    = SEVERITY_BADGE[p.severity] || SEVERITY_BADGE.Low;
          const barColor  = SEVERITY_BAR[p.severity]   || SEVERITY_BAR.Low;
          const Icon      = p.icon;
          return (
            <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800">{p.disease}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{p.reason}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-xl font-extrabold text-gray-800">{p.probability}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${sStyle}`}>{p.severity} Severity</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${probNum}%`, transition: "width 0.7s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// RISK EXPLANATION CARD
// ─────────────────────────────────────────────
function RiskExplanationCard({ explanation, risk }) {
  const rs    = RISK_STYLE[risk] || RISK_STYLE.Healthy;
  const RIcon = rs.icon;
  return (
    <div className={`rounded-2xl border-2 p-6 ${rs.bg} ${rs.border}`}>
      <SectionHeader icon={AlertTriangle} title="Risk Explanation" subtitle="Clinical reasoning behind the current risk level" color={rs.text} />
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center flex-shrink-0 shadow-sm">
          <RIcon size={20} className={rs.text} />
        </div>
        <div className="flex-1">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold mb-3 border ${rs.badge}`}>
            <CircleDot size={11} />
            {risk} Risk Level
          </div>
          <p className={`text-sm leading-relaxed font-medium ${rs.text}`}>{explanation}</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// AI SUMMARY CARD
// ─────────────────────────────────────────────
function AISummaryCard({ summary, risk }) {
  const rs = RISK_STYLE[risk] || RISK_STYLE.Healthy;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <SectionHeader icon={Stethoscope} title="AI Medical Summary" subtitle="Clinical assessment generated from current data" color="text-pink-500" />
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${rs.bg} border ${rs.border}`}>
          <Stethoscope size={18} className={rs.text} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${rs.badge}`}>
              AI Assessment — {risk} Risk
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// RECOMMENDATIONS CARD
// ─────────────────────────────────────────────
function RecommendationsCard({ recommendations, risk }) {
  const rs = RISK_STYLE[risk] || RISK_STYLE.Healthy;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <SectionHeader icon={ClipboardList} title="Personalized Recommendations" subtitle="Tailored to current risk and predicted conditions" color="text-teal-500" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {recommendations.map((rec, i) => {
          const Icon = rec.icon;
          return (
            <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${rs.bg} border ${rs.border}`}>
                <Icon size={15} className={rs.text} />
              </div>
              <p className="text-xs text-gray-600 leading-relaxed pt-0.5">{rec.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MedicalInsightsEngine({ vitals = {}, answers = {}, risk = "Healthy" }) {
  const predictions     = generatePredictions(vitals, answers);
  const explanation     = generateRiskExplanation(vitals, answers, risk);
  const summary         = generateSummary(vitals, answers, risk);
  const recommendations = generateRecommendations(vitals, answers, risk, predictions);

  return (
    <div className="space-y-5">
      {/* Module header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-pink-500 via-pink-400 to-pink-600 flex items-center justify-center shadow-md">
          <Lightbulb size={16} className="text-white" />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-gray-800 tracking-tight">Medical Insights Engine</h2>
          <p className="text-xs text-gray-400">AI-assisted clinical analysis — not a substitute for medical advice</p>
        </div>
      </div>

      <PredictionsCard predictions={predictions} />
      <RiskExplanationCard explanation={explanation} risk={risk} />
      <AISummaryCard summary={summary} risk={risk} />
      <RecommendationsCard recommendations={recommendations} risk={risk} />
    </div>
  );
}
