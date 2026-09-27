import { useEffect, useState } from "react";
import { checkHealth } from "../api.js";

export default function StatusIndicator() {
  const [state, setState] = useState("checking"); // checking | online | offline

  useEffect(() => {
    let cancelled = false;
    checkHealth()
      .then((data) => {
        if (!cancelled) setState(data.model_loaded ? "online" : "offline");
      })
      .catch(() => {
        if (!cancelled) setState("offline");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const label =
    state === "checking" ? "Checking backend…" : state === "online" ? "Engine online" : "Engine offline";

  return (
    <span className="nav__status">
      <span className={`nav__status-dot${state === "online" ? " is-online" : ""}${state === "offline" ? " is-offline" : ""}`} />
      {label}
    </span>
  );
}
