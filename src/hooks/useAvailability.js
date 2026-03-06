import { useCallback, useEffect, useRef, useState } from 'react';
import { checkAvailability } from '../api/auth';

const DEBOUNCE_MS = 400;

/**
 * Debounced availability check for a single field.
 * Returns [status, setStatus] where status is one of:
 *   null | 'checking' | 'available' | 'taken' | 'error'
 */
export function useFieldAvailability(field, value, enabled) {
  const [status, setStatus] = useState(null);
  const timerRef = useRef(null);

  const check = useCallback(async (val) => {
    const trimmed = String(val ?? '').trim();
    if (!trimmed) {
      setStatus(null);
      return;
    }
    setStatus('checking');
    try {
      const normalized = field === 'phoneno' ? trimmed.replace(/\D/g, '') : trimmed;
      const res = await checkAvailability(field, normalized);
      setStatus(res?.available === true ? 'available' : 'taken');
    } catch {
      setStatus('error');
    }
  }, [field]);

  useEffect(() => {
    if (!enabled) return;

    clearTimeout(timerRef.current);

    if (field === 'phoneno') {
      const digits = (value ?? '').replace(/\D/g, '');
      if (digits.length >= 10) {
        timerRef.current = setTimeout(() => check(digits), DEBOUNCE_MS);
      } else {
        setStatus(digits.length > 0 ? 'checking' : null);
      }
    } else {
      const trimmed = (value ?? '').trim();
      if (trimmed) {
        timerRef.current = setTimeout(() => check(trimmed), DEBOUNCE_MS);
      } else {
        setStatus(null);
      }
    }

    return () => clearTimeout(timerRef.current);
  }, [enabled, value, field, check]);

  return status;
}
