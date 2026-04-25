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

export default function ChatWindow({ initialVitals, mother }) {
  const [conversation, setConversation] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(null);
  const [finished, setFinished] = useState(false);
  const [asked, setAsked] = useState(new Set());

  const bottomRef = useRef(null);
  const initialized = useRef(false);

  const [showModal, setShowModal] = useState(false);
  const [finalRisk, setFinalRisk] = useState(null);
  const [reportId, setReportId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const pushDoctorMessage = (msg, delay = 700) => {
    return new Promise((resolve) => {
      setConversation((prev) => [
        ...prev,
        { type: "doctor", text: "Analyzing...", isTyping: true },
      ]);

      setTimeout(() => {
        setConversation((prev) => prev.filter((m) => !m.isTyping));
        setConversation((prev) => [
          ...prev,
          {
            type: "doctor",
            text: typeof msg === "string" ? msg : msg.text,
            variant: msg.variant || "normal",
          },
        ]);
        resolve();
      }, delay);
    });
  };

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

  const callMLModel = async (vitals) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: mother.age,
          systolic: vitals.systolic,
          diastolic: vitals.diastolic,
          sugar: vitals.sugar,
          temp: vitals.temp || 98,
          heartrate: vitals.heartrate || 75,
        }),
      });
      const data = await res.json();
      return data.risk;
    } catch (err) {
      console.error("ML API error:", err);
      return "Low";
    }
  };

  const handleAnswer = async (val) => {
    if (!currentQ) return;

    const key = currentQ.key;
    const newAnswers = { ...answers, [key]: val };
    setAnswers(newAnswers);

    const newAsked = new Set(asked);
    newAsked.add(key);
    setAsked(newAsked);

    setConversation((prev) => [
      ...prev,
      { type: "user", text: val ? "Yes" : "No" },
    ]);

    const reaction = generateDoctorReaction(
      key,
      val,
      initialVitals,
      newAnswers,
    );
    await pushDoctorMessage(reaction, 700);

    const next = getNextQuestion(initialVitals, newAnswers, newAsked);

    if (next) {
      await pushDoctorMessage(next.text, 700);
      setCurrentQ(next);
    } else {
      await pushDoctorMessage("Finalizing assessment...", 900);

      const ruleRisk = calculateRisk(initialVitals, newAnswers);
      const mlRisk = await callMLModel(initialVitals);

      let finalRisk = mlRisk;
      if (ruleRisk === "High") finalRisk = "High";
      if (ruleRisk === "Medium" && mlRisk === "Low") finalRisk = "Medium";

      const finalMsg = generateFinalMessage(finalRisk);
      await pushDoctorMessage(finalMsg, 1000);

      const docId = await saveAssessment(finalRisk, newAnswers);

      setFinalRisk(finalRisk);
setFinished(true);

// ✅ ensure ID is set before modal opens
setReportId(docId);

setTimeout(() => {
  setShowModal(true);
}, 50);
    }
  };
  const saveAssessment = async (risk, latestAnswers) => {
  try {
    if (!mother?.id) {
      console.error("❌ motherId missing");
      return null;
    }

    const docRef = await addDoc(collection(db, "assessments"), {
      motherId: mother.id,
      motherName: mother.name || "Unknown",
      vitals: initialVitals,
      answers: latestAnswers, // ✅ FIXED
      risk,
      createdAt: new Date(),
    });

    return docRef.id;
  } catch (err) {
    console.error("Error saving:", err);
    return null;
  }
};

  return (
    <div
      className="h-full w-full overflow-hidden relative"
      style={{
        // ✅ Background fixed to viewport — won't scroll at all
        backgroundImage: "url('/images/medical-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "left bottom",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Optional soft overlay */}
      <div className="absolute inset-0 bg-white/10 pointer-events-none" />

      {/* Chat card centered in remaining space */}
      <div className="relative flex h-full w-full items-center justify-center px-4">
        <div
          className="
          w-full max-w-2xl
          h-[85%]
          bg-white/85 backdrop-blur-xl
          border border-gray-200
          rounded-3xl
          shadow-[0_25px_80px_rgba(0,0,0,0.15)]
          flex flex-col overflow-hidden
        "
        >
          {/* HEADER */}
          <div className="px-6 py-4 border-b bg-white/70 flex justify-between flex-shrink-0">
            <span className="text-sm text-gray-600">AI Health Assistant</span>
            <span className="text-xs text-gray-400">Live Assessment</span>
          </div>

          {/* CHAT — only this scrolls */}
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
              ),
            )}
            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          {!finished && currentQ && (
            <div className="border-t bg-white/80 px-6 py-4 flex-shrink-0">
              <InputControls type="yesno" onSubmit={handleAnswer} />
            </div>
          )}

          {/* RESULT */}
          {finished && (
            <div className="border-t px-6 py-4 flex justify-center flex-shrink-0">
              <button className="px-5 py-2 bg-green-500 text-white rounded-xl">
                View Full Report →
              </button>
            </div>
          )}
        </div>
      </div>
      {showModal && (
        <ResultModal
  risk={finalRisk}
  reportId={reportId } // fallback safety
  onClose={() => setShowModal(false)}
/>
      )}
    </div>
  );
}
