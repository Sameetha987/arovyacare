// ===============================
// 🧠 SAFE RANGES (PREGNANCY-SPECIFIC)
// ===============================
const ranges = {
  systolic: { low: 90, high: 140 },
  diastolic: { low: 60, high: 90 },
  sugar: { low: 70, high: 160 },
  heartrate: { low: 60, high: 100 },
  temp: { low: 96, high: 100.4 },
  weight: { low: 45, high: 90 },
};

// ===============================
// 🧠 VITALS ANALYZER
// ===============================
function analyzeVitals(vitals) {
  const n = (v) => parseFloat(v) || 0;
  return {
    highBP: n(vitals.systolic) > ranges.systolic.high,
    lowBP: n(vitals.systolic) < ranges.systolic.low,
    highDiasBP: n(vitals.diastolic) > ranges.diastolic.high,
    lowDiasBP: n(vitals.diastolic) < ranges.diastolic.low,

    highSugar: n(vitals.sugar) > ranges.sugar.high,
    lowSugar: n(vitals.sugar) < ranges.sugar.low,
    critSugar: n(vitals.sugar) > 250,

    highHR: n(vitals.heartrate) > ranges.heartrate.high,
    lowHR: n(vitals.heartrate) < ranges.heartrate.low,
    critHR: n(vitals.heartrate) > 130,

    highTemp: n(vitals.temp) > 100.4,
    lowTemp: n(vitals.temp) < ranges.temp.low,
    critTemp: n(vitals.temp) > 103,

    lowWeight: vitals.weight && n(vitals.weight) < ranges.weight.low,
    highWeight: vitals.weight && n(vitals.weight) > ranges.weight.high,

    systolic: n(vitals.systolic),
    diastolic: n(vitals.diastolic),
    sugar: n(vitals.sugar),
    heartrate: n(vitals.heartrate),
    temp: n(vitals.temp),
    weight: n(vitals.weight),
  };
}

// ===============================
// 🧠 INITIAL MESSAGES
// ===============================
export function generateInitialMessages(vitals, mother) {
  const f = analyzeVitals(vitals);
  const msgs = [];
  const name = mother?.name || "the patient";

  msgs.push({ text: `I'm reviewing ${name}'s vitals now.`, variant: "info" });

  // Blood Pressure
  if (f.highBP && f.highDiasBP) {
    msgs.push({
      text: `Both systolic (${f.systolic}) and diastolic (${f.diastolic}) blood pressure are elevated. This needs close attention.`,
      variant: "warning",
    });
  } else if (f.highBP) {
    msgs.push({
      text: `Systolic blood pressure is on the higher side at ${f.systolic} mmHg.`,
      variant: "warning",
    });
  } else if (f.lowBP) {
    msgs.push({
      text: `Blood pressure appears low at ${f.systolic}/${f.diastolic} mmHg. This can sometimes cause dizziness or fainting.`,
      variant: "warning",
    });
  } else {
    msgs.push({
      text: `Blood pressure looks stable at ${f.systolic}/${f.diastolic} mmHg.`,
      variant: "safe",
    });
  }

  // Sugar
  if (f.critSugar) {
    msgs.push({
      text: `Blood sugar is critically high at ${f.sugar} mg/dL. This requires immediate attention.`,
      variant: "critical",
    });
  } else if (f.highSugar) {
    msgs.push({
      text: `Blood sugar is elevated at ${f.sugar} mg/dL — this could indicate gestational diabetes risk.`,
      variant: "warning",
    });
  } else if (f.lowSugar) {
    msgs.push({
      text: `Blood sugar is below normal at ${f.sugar} mg/dL. She may be at risk of hypoglycemia.`,
      variant: "warning",
    });
  }

  // Heart Rate
  if (f.critHR) {
    msgs.push({
      text: `Heart rate is very high at ${f.heartrate} bpm. This warrants immediate follow-up.`,
      variant: "critical",
    });
  } else if (f.highHR) {
    msgs.push({
      text: `Heart rate is slightly elevated at ${f.heartrate} bpm.`,
      variant: "warning",
    });
  } else if (f.lowHR) {
    msgs.push({
      text: `Heart rate appears lower than normal at ${f.heartrate} bpm.`,
      variant: "warning",
    });
  }

  // Temperature
  if (f.critTemp) {
    msgs.push({
      text: `Temperature is critically high at ${f.temp}°F. This could indicate a serious infection.`,
      variant: "critical",
    });
  } else if (f.highTemp) {
    msgs.push({
      text: `Temperature is slightly elevated at ${f.temp}°F. She may have a mild fever.`,
      variant: "warning",
    });
  } else if (f.lowTemp) {
    msgs.push({
      text: `Body temperature seems low at ${f.temp}°F. This can indicate poor circulation.`,
      variant: "warning",
    });
  }

  // Weight
  if (f.lowWeight) {
    msgs.push({
      text: `Her weight appears lower than expected. Low body weight during pregnancy can affect fetal growth.`,
      variant: "warning",
    });
  } else if (f.highWeight) {
    msgs.push({
      text: `Weight is on the higher side — excess weight gain during pregnancy can increase the risk of complications.`,
      variant: "warning",
    });
  }

  msgs.push({
    text: `I'll ask a few focused questions to better understand her current condition.`,
    variant: "info",
  });

  return msgs;
}
// ===============================
// FIXED QUESTION BANK
// ===============================
const ALL_QUESTIONS = [
  // ─── Only ask critical questions if vitals warrant it ───
  {
    key: "vaginal_bleeding",
    text: "Has she noticed any vaginal bleeding or spotting?",
    // ✅ Only ask if BP abnormal, sugar abnormal, or temp high
    condition: (f) =>
      f.highBP || f.lowBP || f.highSugar || f.highTemp || f.critTemp,
    priority: 10,
  },
  {
    key: "fetal_movement",
    text: "Has she noticed reduced or absent baby movements?",
    // ✅ Only ask if any vital is abnormal
    condition: (f) =>
      f.highBP || f.lowBP || f.highSugar || f.critSugar || f.highHR || f.critHR,
    priority: 10,
  },
  {
    key: "confusion",
    text: "Has she experienced any confusion or trouble thinking clearly?",
    condition: (f) => f.critSugar || f.critTemp || f.critHR,
    priority: 10,
  },
  {
    key: "fainting",
    text: "Has she fainted or felt close to fainting recently?",
    condition: (f) => f.lowBP || f.lowSugar,
    priority: 10,
  },
  {
    key: "chest_pain",
    text: "Has she experienced any chest pain or tightness?",
    condition: (f) => f.highBP || f.highHR || f.critHR,
    priority: 10,
  },
  {
    key: "headache",
    text: "Has she been experiencing persistent or severe headaches?",
    condition: (f) => f.highBP || f.highDiasBP,
    priority: 9,
  },
  {
    key: "vision",
    text: "Has she noticed any blurred or disturbed vision?",
    condition: (f) => f.highBP || f.highDiasBP,
    priority: 9,
  },
  {
    key: "swelling_face",
    text: "Is there noticeable swelling in her face or hands?",
    condition: (f) => f.highBP || f.highDiasBP,
    priority: 9,
  },
  {
    key: "swelling_legs",
    text: "Is there any swelling in her legs or ankles?",
    condition: (f) => f.highBP || f.highWeight,
    priority: 8,
  },
  {
    key: "abdominal_pain",
    text: "Is she experiencing any abdominal pain or cramping?",
    // ✅ Only ask if something abnormal — not for everyone
    condition: (f) => f.highBP || f.lowBP || f.highSugar || f.highTemp,
    priority: 9,
  },
  {
    key: "palpitations",
    text: "Has she felt her heart beating unusually fast or irregularly?",
    condition: (f) => f.highHR || f.critHR,
    priority: 9,
  },
  {
    key: "breathlessness",
    text: "Is she experiencing difficulty breathing or shortness of breath?",
    condition: (f) => f.highHR || f.highBP,
    priority: 9,
  },
  {
    key: "thirst",
    text: "Is she feeling unusually thirsty?",
    condition: (f) => f.highSugar || f.critSugar,
    priority: 9,
  },
  {
    key: "urination",
    text: "Is she urinating significantly more frequently than usual?",
    condition: (f) => f.highSugar || f.critSugar,
    priority: 9,
  },
  {
    key: "fatigue_sugar",
    text: "Is she feeling extremely tired even after resting?",
    condition: (f) => f.highSugar || f.lowSugar,
    priority: 8,
  },
  {
    key: "chills",
    text: "Has she experienced chills or shivering?",
    condition: (f) => f.highTemp,
    priority: 9,
  },
  {
    key: "body_pain",
    text: "Is she experiencing body ache or muscle pain?",
    condition: (f) => f.highTemp,
    priority: 8,
  },
  {
    key: "cold_exposure",
    text: "Has she been exposed to cold or felt unusually cold?",
    condition: (f) => f.lowTemp,
    priority: 8,
  },
  {
    key: "dizziness",
    text: "Has she experienced dizziness or lightheadedness?",
    condition: (f) => f.lowBP || f.lowSugar || f.lowHR,
    priority: 9,
  },
  {
    key: "appetite",
    text: "Has she noticed a significant decrease in appetite?",
    condition: (f) => f.lowWeight || f.lowSugar,
    priority: 6,
  },

  // ─── GENERAL — asked to everyone, but LOW score weight ───
  {
    key: "fatigue",
    text: "Is she feeling unusually tired or lacking energy lately?",
    condition: () => true,
    priority: 5,
  },
  {
    key: "nausea",
    text: "Has she been experiencing nausea or persistent vomiting?",
    condition: () => true,
    priority: 5,
  },
];

// ===============================
// 🧠 SMART QUESTION ENGINE
// ===============================
export function getNextQuestion(vitals, answers, asked) {
  const f = analyzeVitals(vitals);

  const eligible = ALL_QUESTIONS.filter(
    (q) => !asked.has(q.key) && q.condition(f, answers),
  );

  if (eligible.length === 0) return null;

  // Sort by priority descending, pick highest
  eligible.sort((a, b) => b.priority - a.priority);
  return eligible[0];
}

// ===============================
// 🧠 DOCTOR REACTIONS (CLINICAL + HUMAN)
// ===============================
export function generateDoctorReaction(key, val, vitals, answers) {
  const f = analyzeVitals(vitals);

  if (!val) {
    const negatives = {
      headache: "Good, that's reassuring. No headache is a positive sign.",
      vision: "That's good to hear. Clear vision is an encouraging indicator.",
      swelling_face:
        "Helpful to know — absence of facial swelling is a good sign.",
      swelling_legs:
        "Good. No leg swelling helps reduce concern about fluid retention.",
      chest_pain:
        "That's a relief — no chest pain helps rule out serious cardiovascular concerns.",
      palpitations: "Good. A steady heartbeat is what we want to see.",
      thirst: "Noted. Normal thirst levels suggest better sugar regulation.",
      urination: "That's reassuring regarding blood sugar levels.",
      fatigue_sugar: "Good. Normal energy levels are an encouraging sign.",
      chills:
        "Good — no chills is helpful when evaluating the temperature concern.",
      body_pain:
        "Absence of body pain suggests no systemic infection. That's reassuring.",
      cold_exposure: "Good, that helps narrow down the temperature finding.",
      dizziness:
        "That's reassuring. No dizziness is a positive sign given the vitals.",
      fainting:
        "Very good — that helps rule out a serious circulation concern.",
      fetal_movement:
        "That's very reassuring — regular fetal movement is a healthy sign.",
      abdominal_pain: "Good. No abdominal pain is an encouraging finding.",
      vaginal_bleeding:
        "That's very good to hear. Absence of bleeding is a critical positive sign.",
      breathlessness:
        "That's reassuring. No breathing difficulty is a positive indicator.",
      fatigue: "Good. Normal energy levels are helpful to know.",
      nausea: "Good. Absence of nausea is an encouraging sign.",
      appetite:
        "Good — maintaining appetite supports fetal nutrition and development.",
      confusion:
        "Very reassuring. Mental clarity is an important positive indicator.",
    };
    return negatives[key] || "Alright, that's helpful to know.";
  }

  // Positive responses
  switch (key) {
    case "headache":
      return f.highBP
        ? "That's concerning — headaches combined with high blood pressure can be an early warning sign of preeclampsia. I'm noting this carefully."
        : "Headaches during pregnancy can have several causes. This is an important symptom to track.";

    case "vision":
      return f.highBP
        ? "Blurred vision alongside elevated blood pressure is a significant warning sign — this combination needs prompt medical evaluation."
        : "Blurred vision during pregnancy should never be ignored. This is being factored into the assessment.";

    case "swelling_face":
      return "Facial and hand swelling during pregnancy can indicate preeclampsia, especially when combined with elevated blood pressure. This is important information.";

    case "swelling_legs":
      return f.highBP
        ? "Leg swelling with elevated blood pressure raises concern for preeclampsia — a serious pregnancy complication. This is a critical finding."
        : "Leg swelling can indicate fluid retention. I'm incorporating this into the overall assessment.";

    case "chest_pain":
      return "Chest pain is always taken seriously, particularly during pregnancy. This could indicate cardiovascular or respiratory stress. Immediate medical attention may be needed.";

    case "palpitations":
      return f.highHR
        ? "Palpitations alongside an elevated heart rate suggests the cardiovascular system is under significant strain. This needs careful monitoring."
        : "Palpitations during pregnancy can sometimes be benign, but in context, this warrants attention.";

    case "thirst":
      return f.highSugar
        ? "Excessive thirst combined with elevated blood sugar strongly aligns with gestational diabetes indicators. This is a significant finding."
        : "Increased thirst is noted and will be considered in the overall clinical picture.";

    case "urination":
      return f.highSugar
        ? "Frequent urination with elevated sugar is a classical pattern of blood sugar dysregulation. This is an important finding."
        : "Increased urination is common in pregnancy, but combined with the vitals, this will be factored in.";

    case "fatigue_sugar":
    case "fatigue":
      return "Fatigue during pregnancy can indicate anemia, nutritional deficiency, or metabolic imbalance. Combined with the vitals, this adds weight to the assessment.";

    case "chills":
      return f.critTemp
        ? "Chills with critically high temperature can indicate a serious systemic infection. This requires urgent medical attention."
        : "Chills with elevated temperature suggests the body may be fighting an infection. This is important to note.";

    case "body_pain":
      return f.highTemp
        ? "Body pain combined with fever can indicate a systemic infection — a concerning combination during pregnancy."
        : "Body ache alongside the other findings is noted and factored into the assessment.";

    case "cold_exposure":
      return "Cold exposure contributing to low body temperature can affect circulation and fetal warmth. This is being noted.";

    case "dizziness":
      if (f.lowBP)
        return "Dizziness with low blood pressure suggests inadequate circulation — this can be dangerous during pregnancy and needs prompt attention.";
      if (f.highBP)
        return "Dizziness alongside high blood pressure is a concerning combination that could indicate reduced blood flow to the brain.";
      if (f.lowSugar)
        return "Dizziness with low blood sugar can indicate hypoglycemia — this needs to be addressed promptly.";
      return "Dizziness during pregnancy should always be monitored. I'm factoring this into the risk assessment.";

    case "fainting":
      return "Fainting during pregnancy is a serious symptom related to blood pressure or sugar fluctuations. This significantly impacts the risk assessment.";

    case "fetal_movement":
      return "Reduced fetal movement is one of the most critical warning signs in pregnancy. This requires prompt medical evaluation — please do not delay.";

    case "abdominal_pain":
      return "Abdominal pain during pregnancy has a range of causes, some serious. This is an important symptom that will weigh heavily in the assessment.";

    case "vaginal_bleeding":
      return "Vaginal bleeding during pregnancy always requires immediate medical evaluation. This is being flagged as a high-priority finding.";

    case "breathlessness":
      return f.highHR
        ? "Breathlessness with a high heart rate suggests significant cardiovascular stress. This combination needs urgent clinical evaluation."
        : "Difficulty breathing during pregnancy should never be taken lightly. This is being carefully noted.";

    case "nausea":
      return "Persistent nausea can indicate metabolic imbalance or other concerns. Combined with the current vitals, this adds to the clinical picture.";

    case "appetite":
      return f.lowWeight
        ? "Loss of appetite with already low body weight is concerning for fetal nutrition and development. This is an important factor in the assessment."
        : "Reduced appetite is noted and will be considered in the nutritional assessment.";

    case "confusion":
      return "Confusion or cognitive changes during pregnancy can indicate serious metabolic or neurological stress. This is a high-priority finding that may require urgent attention.";

    default:
      return "That's important clinical information. I'm incorporating this into the assessment.";
  }
}

// ===============================
// 🧠 SMART RISK CALCULATION
// ===============================
export function calculateRisk(vitals, answers) {
  const f = analyzeVitals(vitals);
  let score = 0;

  // ── VITALS (unchanged)
  if (f.critSugar) score += 6;
  else if (f.highSugar || f.lowSugar) score += 3;
  if (f.highBP && f.highDiasBP) score += 6;
  else if (f.highBP || f.lowBP) score += 3;
  if (f.critHR) score += 5;
  else if (f.highHR || f.lowHR) score += 2;
  if (f.critTemp) score += 5;
  else if (f.highTemp || f.lowTemp) score += 2;
  if (f.lowWeight) score += 2;
  if (f.highWeight) score += 1;

  // ── SYMPTOMS — only count if vitals support concern
  const hasAbnormalVitals =
    f.highBP ||
    f.lowBP ||
    f.highSugar ||
    f.highHR ||
    f.highTemp ||
    f.critSugar ||
    f.critHR ||
    f.critTemp;

  // Critical symptoms — only meaningful if vitals back them up
  if (answers.vaginal_bleeding) {
    if (hasCriticalVitals) score += 6;
    else if (hasMildAbnormal) score += 3;
    else score += 2;
  }
  const hasCriticalVitals =
    f.critSugar ||
    f.critHR ||
    f.critTemp ||
    f.highBP ||
    f.highSugar ||
    f.highHR;
  const hasMildAbnormal = f.lowBP || f.lowSugar || f.lowHR || f.highTemp;

  if (answers.fainting) {
    if (hasCriticalVitals)
      score += 5; // truly critical
    else if (hasMildAbnormal)
      score += 2; // mild concern — fainting with low BP
    else score += 1; // no vitals backing it
  }
  if (answers.confusion) score += hasAbnormalVitals ? 5 : 1;
  if (answers.chest_pain) {
    if (hasCriticalVitals) score += 5;
    else if (hasMildAbnormal) score += 2;
    else score += 1;
  }
  if (answers.fetal_movement) {
    if (hasCriticalVitals) score += 5;
    else if (hasMildAbnormal) score += 2;
    else score += 1;
  }

  // High concern
  if (answers.vision) score += hasAbnormalVitals ? 4 : 1;
  if (answers.swelling_face) score += hasAbnormalVitals ? 4 : 1;
  if (answers.abdominal_pain) score += hasAbnormalVitals ? 3 : 1;
  if (answers.breathlessness) score += hasAbnormalVitals ? 3 : 1;
  if (answers.palpitations) score += hasAbnormalVitals ? 3 : 1;

  // Moderate
  if (answers.headache) score += hasAbnormalVitals ? 2 : 0;
  if (answers.swelling_legs) score += hasAbnormalVitals ? 2 : 1;
  if (answers.dizziness) score += hasAbnormalVitals ? 2 : 1;
  if (answers.chills) score += hasAbnormalVitals ? 2 : 1;
  if (answers.body_pain) score += 1;

  // ✅ Mild — these alone can NEVER push to High
  if (answers.thirst) score += 1;
  if (answers.urination) score += 1;
  if (answers.fatigue || answers.fatigue_sugar) score += 1;
  if (answers.nausea) score += 1; // ✅ nausea alone = 1 point max
  if (answers.appetite) score += 1;

  // Combination penalties — only if vitals are already concerning
  if (f.highBP && answers.headache && answers.vision) score += 4;
  if (f.highSugar && answers.thirst && answers.urination) score += 3;
  if (f.highHR && answers.chest_pain && answers.breathlessness) score += 4;

  if (score >= 14) return { risk: "High", score };
  if (score >= 7) return { risk: "Medium", score };
  return { risk: "Low", score };
}

// ===============================
// 🧠 FINAL DOCTOR MESSAGE
// ===============================
export function generateFinalMessage(risk) {
  if (risk === "High") {
    return {
      text: `Based on the vitals and symptoms reported, there is significant concern that places this patient in the high-risk category.\n\nImmediate medical consultation is strongly advised. Please do not delay seeking professional care.`,
      variant: "critical",
    };
  }

  if (risk === "Medium") {
    return {
      text: `The assessment indicates moderate risk based on the combination of vitals and symptoms reported.\n\nI recommend scheduling a doctor's appointment within the next 24–48 hours for a thorough clinical evaluation.`,
      variant: "warning",
    };
  }

  return {
    text: `Based on the current vitals and symptoms, the patient's condition appears generally stable.\n\nContinue regular prenatal monitoring, maintain proper nutrition and hydration, and attend all scheduled check-ups.`,
    variant: "safe",
  };
}
