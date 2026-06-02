"use client";

import { motion } from "framer-motion";

// Premium sayfa geçişi: hafif fade + 12px yukarı kayma, 300ms ease-out.
// template.tsx her gezinmede yeniden monte olur → geçiş animasyonu verir.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
