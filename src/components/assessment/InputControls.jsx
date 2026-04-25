import { motion } from "framer-motion";
import { useState } from "react";

export default function InputControls({ type, onSubmit }) {
  const [loading, setLoading] = useState(false);

  const handleClick = (val) => {
    if (loading) return;
    setLoading(true);

    setTimeout(() => {
      onSubmit(val);
      setLoading(false);
    }, 200); // prevents spam clicking
  };

  if (type === "yesno") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-4"
      >
        <button
          onClick={() => handleClick(true)}
          disabled={loading}
          className={`
            px-6 py-3 rounded-full font-medium shadow-md
            transition-all duration-200
            ${
              loading
                ? "bg-gray-300"
                : "bg-green-500 hover:bg-green-600 text-white hover:scale-105"
            }
          `}
        >
          Yes
        </button>

        <button
          onClick={() => handleClick(false)}
          disabled={loading}
          className={`
            px-6 py-3 rounded-full font-medium shadow-md
            transition-all duration-200
            ${
              loading
                ? "bg-gray-200"
                : "bg-gray-100 hover:bg-gray-200 hover:scale-105"
            }
          `}
        >
          No
        </button>
      </motion.div>
    );
  }

  return null;
}