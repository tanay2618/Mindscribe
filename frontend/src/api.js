const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function parseError(res) {
  try {
    const body = await res.json();
    return body.detail || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export async function checkHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function analyzeEntry(text) {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
