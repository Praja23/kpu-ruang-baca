// app/context/ToastContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info";

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("success");

  const showToast = useCallback((msg: string, t: ToastType = "success") => {
    setMessage(msg);
    setType(t);
    setVisible(true);
    setTimeout(() => {
      setVisible(false);
    }, 3000);
  }, []);

  const hideToast = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {visible && (
        <div
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[999] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-300 animate-slide-up"
          style={{
            backgroundColor: type === "success" ? "#065f46" : "#991b1b",
            color: "#ffffff",
            maxWidth: "90%",
            border:
              type === "success" ? "2px solid #10b981" : "2px solid #dc2626",
          }}
        >
          <span className="material-symbols-outlined">
            {type === "success" ? "check_circle" : "error"}
          </span>
          <span className="font-medium">{message}</span>
          <button
            onClick={hideToast}
            className="ml-4 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
