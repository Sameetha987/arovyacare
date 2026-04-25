import { motion } from "framer-motion";

export default function UserBubble({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="flex justify-end"
    >
      <div className="
  max-w-[60%] ml-auto
  bg-pink-500 text-white
  px-4 py-2.5 rounded-2xl
  shadow-sm
">
        {text}
      </div>
    </motion.div>
  );
}