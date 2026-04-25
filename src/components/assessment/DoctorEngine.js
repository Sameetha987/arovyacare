// ===============================
// 🧠 SAFE RANGES
// ===============================
const ranges = {
  systolic: { low: 90, high: 140 },
  sugar: { low: 70, high: 160 },
  heartrate: { low: 60, high: 100 },
  temp: { low: 96, high: 100 },
};

// ===============================
// 🧠 HELPER: CONDITION FLAGS
// ===============================
function analyzeVitals(vitals) {
  return {
    highBP: vitals.systolic > ranges.systolic.high,
    lowBP: vitals.systolic < ranges.systolic.low,

    highSugar: vitals.sugar > ranges.sugar.high,
    lowSugar: vitals.sugar < ranges.sugar.low,

    highHR: vitals.heartrate > ranges.heartrate.high,
    lowHR: vitals.heartrate < ranges.heartrate.low,

    highTemp: vitals.temp > ranges.temp.high,
    lowTemp: vitals.temp < ranges.temp.low,
  };
}

// ===============================
// 🧠 INITIAL CONVERSATION (HUMAN STYLE)
// ===============================
export function generateInitialMessages(vitals, mother) {
  const flags = analyzeVitals(vitals);
  const msgs = [];

  msgs.push({
    text: `I'm reviewing ${mother.name}'s vitals now.`,
    type: "info",
  });

  // Natural explanation instead of robotic logs
  if (flags.highBP) {
    msgs.push({
      text: "Her blood pressure seems a bit higher than expected.",
      type: "warning",
    });
  } else if (flags.lowBP) {
    msgs.push({
      text: "Her blood pressure looks slightly on the lower side.",
      type: "warning",
    });
  } else {
    msgs.push({
      text: "Blood pressure looks stable.",
      type: "safe",
    });
  }

  if (flags.highSugar) {
    msgs.push({
      text: "Her blood sugar is elevated.",
      type: "warning",
    });
  } else if (flags.lowSugar) {
    msgs.push({
      text: "Her blood sugar appears lower than normal.",
      type: "warning",
    });
  }

  if (flags.highHR) {
    msgs.push({
      text: "Heart rate is a little higher than usual.",
      type: "warning",
    });
  }

  msgs.push({
    text: "I'll ask a few quick questions to understand her condition better.",
    type: "info",
  });

  return msgs;
}

// ===============================
// 🧠 QUESTION ENGINE (SMART FLOW)
// ===============================
export function getNextQuestion(vitals, answers, asked) {
  const flags = analyzeVitals(vitals);

  // 🔥 PRIORITY QUESTIONS FIRST
  if (flags.highBP || flags.lowBP) {
    if (!asked.has("headache"))
      return { key: "headache", text: "Has she been experiencing headaches?" };

    if (!asked.has("vision"))
      return { key: "vision", text: "Any issues with blurred vision?" };

    if (!asked.has("swelling"))
      return { key: "swelling", text: "Have you noticed swelling in hands or legs?" };
  }

  if (flags.highSugar || flags.lowSugar) {
    if (!asked.has("urination"))
      return { key: "urination", text: "Is she urinating more frequently than usual?" };

    if (!asked.has("thirst"))
      return { key: "thirst", text: "Is she feeling unusually thirsty?" };
  }

  // 🔥 GENERAL FOLLOW-UP
  if (!asked.has("fatigue"))
    return { key: "fatigue", text: "Is she feeling unusually tired or weak?" };

  if (!asked.has("dizziness"))
    return { key: "dizziness", text: "Has she experienced any dizziness recently?" };

  return null;
}

// ===============================
// 🧠 DOCTOR REACTION (CONTEXTUAL)
// ===============================
export function generateDoctorReaction(key, val, vitals, answers) {
  const flags = analyzeVitals(vitals);

  if (!val) {
    return "Alright, that's helpful to know.";
  }

  switch (key) {
    case "headache":
      return flags.highBP
        ? "Headaches along with high blood pressure can be a concern."
        : "Noted. We'll keep that in mind.";

    case "vision":
      return "Blurred vision is something we should monitor carefully.";

    case "swelling":
      return "Swelling could indicate fluid retention or pressure imbalance.";

    case "urination":
      return flags.highSugar
        ? "That aligns with elevated sugar levels."
        : "Noted, we'll consider that.";

    case "thirst":
      return "That can often be related to blood sugar imbalance.";

    case "fatigue":
      return "Fatigue may indicate reduced energy or nutritional imbalance.";

    case "dizziness":
      if (flags.lowBP)
        return "Dizziness with low blood pressure needs attention.";
      if (flags.highBP)
        return "Dizziness along with high blood pressure is concerning.";
      return "Dizziness during pregnancy should be monitored.";

    default:
      return "Okay, understood.";
  }
}

// ===============================
// 🧠 RISK CALCULATION (IMPROVED)
// ===============================
export function calculateRisk(vitals, answers) {
  const flags = analyzeVitals(vitals);

  let score = 0;

  if (flags.highBP || flags.lowBP) score += 3;
  if (flags.highSugar || flags.lowSugar) score += 3;
  if (flags.highHR || flags.lowHR) score += 1;
  if (flags.highTemp || flags.lowTemp) score += 1;

  if (answers.headache) score += 1;
  if (answers.dizziness) score += 1;
  if (answers.swelling) score += 2;
  if (answers.vision) score += 2;
  if (answers.urination) score += 1;
  if (answers.thirst) score += 1;

  if (score >= 7) return "High";
  if (score >= 4) return "Medium";
  return "Low";
}

// ===============================
// 🧠 FINAL MESSAGE (HUMAN)
// ===============================
export function generateFinalMessage(risk) {
  if (risk === "High") {
    return {
      text: `Based on her vitals and symptoms, she falls under a high-risk category.

It would be best to seek medical attention as soon as possible.`,
      type: "critical",
    };
  }

  if (risk === "Medium") {
    return {
      text: `She appears to be at moderate risk.

I recommend monitoring her closely and consulting a doctor soon.`,
      type: "warning",
    };
  }

  return {
    text: `Her condition appears stable at the moment.

Continue regular monitoring, proper nutrition, and hydration.`,
    type: "safe",
  };
}