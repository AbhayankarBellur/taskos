"use client";

import { useCallback, useState } from "react";

export function useAsyncAction() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (action: () => Promise<unknown>) => {
    setPending(true);
    setError(null);
    try {
      await action();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      return false;
    } finally {
      setPending(false);
    }
  }, []);

  return { run, pending, error };
}
