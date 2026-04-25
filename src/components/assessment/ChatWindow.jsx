import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import DoctorBubble from "./DoctorBubble";
import UserBubble from "./UserBubble";
import InputControls from "./InputControls";
import ResultModal from "./ResultModal";

import {
  generateInitialMessages,
  getNextQuestion,
  generateDoctorReaction,
  calculateRisk,
  generateFinalMessage,
} from "./DoctorEngine";

// ─────────────────────────────────────────────
// Risk level helpers
// ─────────────────────────────────────────────
const RISK_LEVEL = { Healthy: 0, Low: 1, Medium: 2, High: 3 };
const LEVEL_RISK = ["Healthy", "Low", "Medium", "High"];

const normalizeRisk = (raw) => {
  const r = (raw || "").toLowerCase().trim();
  if (r.includes("high"))              return "High";
  if (r.includes("medium") || r.includes("mid")) return "Medium";
  if (r.includes("low"))               return "Low";
  return "Healthy";
};

const combineRisks = (ruleRisk, mlRisk, ruleScore = 0) => {
  const ruleLevel = RISK_LEVEL[ruleRisk] ?? 0;
  const mlLevel   = RISK_LEVEL[mlRisk]   ?? 0;

  // ✅ Truly normal vitals + no symptoms → always Healthy, ignore ML
  if (ruleScore <= 2 && mlLevel >= 2) {
    console.log(`⚠️ Vitals normal (score=${ruleScore}), ignoring ML=${mlRisk} → Healthy`);
    return "Healthy";
  }

  // Mild score but ML says higher → cap at Low
  if (ruleScore <= 4 && mlLevel >= 3) {
    console.log(`⚠️ Mild score (${ruleScore}), capping ML High → Low`);
    return "Low";
  }

  // Rule says High → always High
  if (ruleLevel === 3) return "High";

  // They agree → use it
  if (ruleLevel === mlLevel) return LEVEL_RISK[ruleLevel];

  // Within 1 step → take higher
  if (Math.abs(ruleLevel - mlLevel) === 1) {
    return LEVEL_RISK[Math.max(ruleLevel, mlLevel)];
  }

  // Strongly disagree → rule wins, ML nudges +1 max
  const final = Math.min(ruleLevel + 1, 3);
  return LEVEL_RISK[final];
};

export default function ChatWindow({ initialVitals, mother }) {
  const [conversation, setConversation] = useState([]);
  const [answers, setAnswers]           = useState({});
  const [currentQ, setCurrentQ]         = useState(null);
  const [finished, setFinished]         = useState(false);
  const [asked, setAsked]               = useState(new Set());
  const [showModal, setShowModal]       = useState(false);
  const [finalRisk, setFinalRisk]       = useState(null);
  const [reportId, setReportId]         = useState(null);

  const bottomRef   = useRef(null);
  const initialized = useRef(false);
  const navigate    = useNavigate();

  // ── Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  // ── Typing-aware message pusher
  const typingPhrases = [
    "Reviewing...", "Analyzing...", "Processing...",
    "Considering...", "Assessing...",
  ];

  const pushDoctorMessage = (msg, delay = 700) => {
    return new Promise((resolve) => {
      const phrase = typingPhrases[Math.floor(Math.random() * typingPhrases.length)];

      setConversation((prev) => [
        ...prev,
        { type: "doctor", text: phrase, isTyping: true },
      ]);

      setTimeout(() => {
        setConversation((prev) => prev.filter((m) => !m.isTyping));
        setConversation((prev) => [
          ...prev,
          {
            type:    "doctor",
            text:    typeof msg === "string" ? msg : msg.text,
            variant: typeof msg === "string" ? "normal" : (msg.variant || "normal"),
          },
        ]);
        resolve();
      }, delay);
    });
  };

  // ── Initial flow
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const run = async () => {
      const msgs = generateInitialMessages(initialVitals, mother);
      for (let m of msgs) {
        await pushDoctorMessage(m, 800);
      }
      const q = getNextQuestion(initialVitals, {}, new Set());
      if (q) {
        await pushDoctorMessage(q.text, 700);
        setCurrentQ(q);
      }
    };

    run();
  }, [initialVitals, mother]);

  // ── ML API call
  const callMLModel = async (vitals) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          age:       Number(mother?.age)        || 25,
          systolic:  Number(vitals.systolic)    || 110,
          diastolic: Number(vitals.diastolic)   || 70,
          sugar:     Number(vitals.sugar)       || 100,
          temp:      Number(vitals.temp)        || 98,
          heartrate: Number(vitals.heartrate)   || 75,
        }),
      });

      clearTimeout(timeout);

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      console.log("🤖 ML Response:", data);

      return normalizeRisk(data.risk);

    } catch (err) {
      console.warn("⚠️ ML API unavailable, using rule engine only:", err.message);
      return null; // null = ML unavailable, don't use it
    }
  };

  // ── Handle answer
  const handleAnswer = async (val) => {
    if (!currentQ) return;

    const key        = currentQ.key;
    const newAnswers = { ...answers, [key]: val };
    const newAsked   = new Set(asked);
    newAnswers && setAnswers(newAnswers);
    newAsked.add(key);
    setAsked(newAsked);

    // User bubble
    setConversation((prev) => [
      ...prev,
      { type: "user", text: val ? "Yes" : "No" },
    ]);

    // Doctor reaction
    const reaction = generateDoctorReaction(key, val, initialVitals, newAnswers);
    await pushDoctorMessage(reaction, 700);

    // Next question
    const next = getNextQuestion(initialVitals, newAnswers, newAsked);

    if (next) {
      await pushDoctorMessage(next.text, 700);
      setCurrentQ(next);
    } else {
  await pushDoctorMessage("Finalizing assessment...", 900);

  // ✅ Now returns { risk, score }
  const { risk: ruleRisk, score: ruleScore } = calculateRisk(initialVitals, newAnswers);
  console.log("📋 Rule Risk:", ruleRisk, "Score:", ruleScore);

  const mlRisk = await callMLModel(initialVitals);
  console.log("🤖 ML Risk:", mlRisk);

  let computedRisk;
  if (!mlRisk) {
    computedRisk = ruleRisk; // ML unavailable
  } else {
    computedRisk = combineRisks(ruleRisk, mlRisk, ruleScore); // ✅ score passed
  }

  console.log("✅ Final Risk:", computedRisk);

  const finalMsg = generateFinalMessage(computedRisk);
  await pushDoctorMessage(finalMsg, 1000);

  const docId = await saveAssessment(computedRisk, newAnswers);
  setFinalRisk(computedRisk);
  setFinished(true);
  setReportId(docId);
  setTimeout(() => setShowModal(true), 50);
}
};

  // ── Save to Firestore
  const saveAssessment = async (risk, latestAnswers) => {
    try {
      if (!mother?.id) {
        console.error("❌ motherId missing");
        return null;
      }

      const docRef = await addDoc(collection(db, "assessments"), {
        motherId:    mother.id,
        motherName:  mother.name || "Unknown",
        vitals:      initialVitals,
        answers:     latestAnswers,
        risk,
        createdAt:   new Date(),
      });

      return docRef.id;
    } catch (err) {
      console.error("❌ Error saving assessment:", err);
      return null;
    }
  };

  // ── UI
  return (
    <div
      className="h-full w-full overflow-hidden relative"
      style={{
        backgroundImage:    "url('/images/medical-bg.png')",
        backgroundSize:     "cover",
        backgroundPosition: "left bottom",
        backgroundAttachment: "fixed",
        backgroundRepeat:   "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-white/10 pointer-events-none" />

      <div className="relative flex h-full w-full items-center justify-center px-4">
        <div className="
          w-full max-w-2xl h-[85%]
          bg-white/85 backdrop-blur-xl
          border border-gray-200 rounded-3xl
          shadow-[0_25px_80px_rgba(0,0,0,0.15)]
          flex flex-col overflow-hidden
        ">

          {/* HEADER */}
          <div className="px-6 py-4 border-b bg-white/70 flex justify-between items-center flex-shrink-0">
            <div>
              <span className="text-sm font-semibold text-gray-600">AI Health Assistant</span>
              {asked.size > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1 w-24 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((asked.size / 12) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{asked.size} questions answered</span>
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400">Live Assessment</span>
          </div>

          {/* CHAT */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scrollbar-hide min-h-0">
            {conversation.map((msg, i) =>
              msg.type === "doctor" ? (
                <DoctorBubble
                  key={i}
                  text={msg.text}
                  isTyping={msg.isTyping}
                  variant={msg.variant}
                />
              ) : (
                <UserBubble key={i} text={msg.text} />
              )
            )}
            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          {!finished && currentQ && (
            <div className="border-t bg-white/80 px-6 py-4 flex-shrink-0">
              <InputControls type="yesno" onSubmit={handleAnswer} />
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ResultModal
          risk={finalRisk}
          reportId={reportId}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
