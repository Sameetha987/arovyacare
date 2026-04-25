import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";

import ChatWindow from "../components/assessment/ChatWindow";
import AIResultPanel from "../components/assessment/AIResultPanel";
import Timeline from "../components/assessment/Timeline";

export default function MotherAssessment() {
  const { id } = useParams();

  const [mother, setMother] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [vitals, setVitals] = useState({});
  const [answers, setAnswers] = useState({});
  const [risk, setRisk] = useState("Low");
  const [condition, setCondition] = useState("Normal");
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    const fetchMother = async () => {
      const snap = await getDoc(doc(db, "mothers", id));
      if (snap.exists()) {
        setMother(snap.data());
        startConversation(snap.data());
      }
    };
    fetchMother();
  }, [id]);

  const startConversation = (m) => {
    setConversation([
      {
        type: "doctor",
        text: `Hi 👋 I'm reviewing ${m.name}'s condition. Let's begin with her vitals.`,
        key: "intro",
      },
      { type: "doctor", text: "What is her current weight?", key: "weight", input: "slider" },
    ]);
  };

  // 🔥 AI CALL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (vitals.systolic !== undefined && vitals.diastolic !== undefined && vitals.sugar !== undefined
){
        callAI();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [vitals, answers]);

  const callAI = async () => {
    const res = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age: Number(mother.age),
        systolic: vitals.systolic,
        diastolic: vitals.diastolic,
        sugar: vitals.sugar,
        temp: vitals.temp || 98.6,
        heartrate: vitals.heartrate || 75,
      }),
    });

    const data = await res.json();

    const cond = detectCondition();
    setRisk(data.risk || "Low");
    setCondition(cond);
    setExplanation(generateExplanation(data.risk, cond));
  };

  const detectCondition = () => {
    if (vitals.systolic > 140 && answers.swelling) return "Preeclampsia Risk";
    if (vitals.sugar > 160) return "Gestational Diabetes Risk";
    return "General Monitoring";
  };

  const generateExplanation = (r, c) =>
    `AI detects ${c} with ${r} risk based on real-time vitals and symptoms.`;

  const handleAnswer = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));

    // 🧠 FLOW ENGINE
    let next = [];

    if (key === "weight") {
      next.push({ type: "doctor", text: "Pregnancy weeks?", key: "weeks", input: "slider" });
    }

    if (key === "weeks") {
      next.push({ type: "doctor", text: "Systolic BP?", key: "systolic", input: "slider" });
    }

    if (key === "systolic") {
      next.push({ type: "doctor", text: "Diastolic BP?", key: "diastolic", input: "slider" });
    }

    if (key === "diastolic") {
      next.push({ type: "doctor", text: "Blood sugar level?", key: "sugar", input: "slider" });
    }

    if (key === "sugar") {
      next.push({ type: "doctor", text: "Body temperature?", key: "temp", input: "slider" });
    }

    if (key === "temp") {
      next.push({ type: "doctor", text: "Heart rate?", key: "heartrate", input: "slider" });
    }

    // 🔥 CONDITIONAL QUESTIONS
    if (key === "systolic" && value > 140) {
      next.push({ type: "doctor", text: "Is she having headache?", key: "headache", input: "yesno" });
      next.push({ type: "doctor", text: "Any swelling?", key: "swelling", input: "yesno" });
    }

    if (key === "swelling" && value === true) {
      next.push({ type: "doctor", text: "Face swelling?", key: "faceSwelling", input: "yesno" });
      next.push({ type: "doctor", text: "Hand swelling?", key: "handSwelling", input: "yesno" });
    }

    setConversation((prev) => [
      ...prev,
      { type: "user", text: value.toString() },
      ...next,
    ]);

    if (["systolic","diastolic","sugar","temp","heartrate"].includes(key)) {
      setVitals((v) => ({ ...v, [key]: value }));
    }
  };

  const saveAssessment = async () => {
   await addDoc(collection(db, "assessments"), {
      motherId: id,
      vitals,
      symptoms: answers,
      risk,
      condition,
      explanation,
      date: new Date(),   
    });
    alert("Saved 🚀");
  };

  if (!mother) return <div>Loading...</div>;

  return (
    <div className="h-screen grid grid-cols-3 bg-gray-50">

      {/* LEFT CHAT */}
      <div className="col-span-2 flex flex-col">
        <ChatWindow conversation={conversation} onAnswer={handleAnswer} />
        <button
          onClick={saveAssessment}
          className="m-4 bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 rounded-xl shadow-lg"
        >
          Finish Assessment
        </button>
      </div>

      {/* RIGHT AI PANEL */}
      <AIResultPanel
        risk={risk}
        condition={condition}
        explanation={explanation}
      />

      {/* TIMELINE */}
      <div className="col-span-3">
        <Timeline motherId={id} />
      </div>
    </div>
  );
}