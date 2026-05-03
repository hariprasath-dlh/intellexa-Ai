import { motion } from "framer-motion";
import { Hexagon, User } from "lucide-react";
import type { Message } from "@/data/sessions";

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div className={`h-8 w-8 shrink-0 rounded-lg grid place-items-center ${isUser ? "bg-white/5 border border-white/10" : "bg-gradient-primary text-primary-foreground"}`}>
        {isUser ? <User className="h-4 w-4" /> : <Hexagon className="h-4 w-4" />}
      </div>
      <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? "bg-white/[0.04] border border-white/10" : "glass"}`}>
        {message.content}
      </div>
    </motion.div>
  );
}