import { useState, useRef, useCallback } from "react";

/**
 * Bot protection using honeypot fields + time-based detection.
 * Bots fill hidden fields and submit forms too fast.
 */
export function useBotProtection(minSubmitTimeMs = 2000) {
  const [honeypot, setHoneypot] = useState("");
  const mountTime = useRef(Date.now());

  const isBot = useCallback(() => {
    // Honeypot filled = bot
    if (honeypot.length > 0) return true;
    // Submitted too fast = bot
    if (Date.now() - mountTime.current < minSubmitTimeMs) return true;
    return false;
  }, [honeypot, minSubmitTimeMs]);

  const resetTimer = useCallback(() => {
    mountTime.current = Date.now();
  }, []);

  return { honeypot, setHoneypot, isBot, resetTimer };
}

/**
 * Client-side rate limiter for form submissions.
 */
export function useFormRateLimit(maxAttempts = 5, windowMs = 60000) {
  const attemptsRef = useRef<number[]>([]);

  const checkLimit = useCallback(() => {
    const now = Date.now();
    attemptsRef.current = attemptsRef.current.filter((t) => now - t < windowMs);
    if (attemptsRef.current.length >= maxAttempts) return true; // rate limited
    attemptsRef.current.push(now);
    return false;
  }, [maxAttempts, windowMs]);

  return { checkLimit };
}
