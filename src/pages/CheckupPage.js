import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

import VitalsForm from "../components/assessment/VitalsForm";
import ChatWindow from "../components/assessment/ChatWindow";

export default function CheckupPage() {
  const { id } = useParams();

  const [mother, setMother] = useState(null);
  const [phase, setPhase] = useState("form");
  const [vitalsData, setVitalsData] = useState(null);

  useEffect(() => {
    const fetchMother = async () => {
      const snap = await getDoc(doc(db, "mothers", id));
      if (snap.exists()) {
        setMother({
  id: snap.id,      
  ...snap.data(),
});
      }
    };
    fetchMother();
  }, [id]);

  const handleFormComplete = (data) => {
    setVitalsData(data);
    setPhase("loading");
    setTimeout(() => {
      setPhase("chat");
    }, 1500);
  };

  if (!mother) {
    return (
      <div className="h-full flex items-center justify-center">
        Loading patient...
      </div>
    );
  }

  return (
    // ✅ h-full instead of h-screen — fills whatever Layout gives us
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 to-white">

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">

          {phase === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="h-full flex items-center justify-center"
            >
              <VitalsForm motherId={id} onComplete={handleFormComplete} />
            </motion.div>
          )}

          {phase === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center gap-4"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
              <p className="text-gray-600 text-lg">🤖 Analyzing vitals...</p>
              <p className="text-sm text-gray-400">AI is preparing personalized questions</p>
            </motion.div>
          )}

          {phase === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <ChatWindow initialVitals={vitalsData} mother={mother} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}