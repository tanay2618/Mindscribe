import { createContext, useCallback, useContext, useState } from "react";
import { analyzeEntry } from "../api.js";

const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  const [entryText, setEntryText] = useState("");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [error, setError] = useState(null);

  const runAnalysis = useCallback(async (text) => {
    setStatus("loading");
    setError(null);
    try {
      const data = await analyzeEntry(text);
      setEntryText(text);
      setResult(data);
      setStatus("idle");
      return data;
    } catch (err) {
      setStatus("error");
      setError(err.message || "Something went wrong while analyzing this entry.");
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setEntryText("");
    setResult(null);
    setStatus("idle");
    setError(null);
  }, []);

  return (
    <AnalysisContext.Provider
      value={{ entryText, result, status, error, runAnalysis, reset }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}
