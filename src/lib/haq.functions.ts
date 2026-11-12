import { createServerFn } from "@tanstack/react-start";
import fixture from "./demo-sweep.json";
import type { SweepResult } from "./haq-types";

const BASE = "https://haq-api-u3pz.onrender.com";

/** Runs the sample-inbox sweep on the Haq API; falls back to a bundled copy if the API is asleep. */
export const runDemoSweep = createServerFn({ method: "POST" }).handler(async (): Promise<SweepResult & { source: "live-api" | "bundled" }> => {
  try {
    const res = await fetch(`${BASE}/v1/gmail/demo`, { method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
    return { ...((await res.json()) as SweepResult), source: "live-api" };
  } catch (e) {
    console.error("Demo sweep API unavailable, using bundled sample", e);
    return { ...(fixture as unknown as SweepResult), source: "bundled" };
  }
});

export type Classification = {
  category: "failed_payment" | "msme_dues" | "unclaimed_wealth" | "general_rights";
  confidence: number;
  title: string;
  summary: string;
  statutory_law: string;
  suggested_route: string;
  extracted_entities: Record<string, string | number | boolean | null>;
};

/** Sends a plain-language description of the problem to the Haq API to identify which right applies. */
export const classifyClaim = createServerFn({ method: "POST" })
  .inputValidator((d: { prompt: string }) => {
    const prompt = String(d?.prompt ?? "").trim();
    if (prompt.length < 10 || prompt.length > 4000) throw new Error("Please describe the problem in 10–4000 characters.");
    return { prompt };
  })
  .handler(async ({ data }): Promise<Classification> => {
    const res = await fetch(`${BASE}/v1/classify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`The Haq service couldn't read this (${res.status}). It may be waking up — try again in a moment.`);
    return (await res.json()) as Classification;
  });
