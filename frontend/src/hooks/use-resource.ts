"use client";

import { useCallback, useEffect, useState } from "react";

type State<T> = { key: string; data?: T; error?: string };

export function useResource<T>(key: string | null, load: (key: string) => Promise<T>) {
  const [state, setState] = useState<State<T> | null>(null);

  useEffect(() => {
    if (!key) return;
    let active = true;
    load(key).then(
      (data) => active && setState({ key, data }),
      (err: Error) => active && setState({ key, error: err.message })
    );
    return () => { active = false; };
  }, [key, load]);

  const update = useCallback((change: (data: T) => T) => setState((prev) =>
    (prev?.data === undefined ? prev : { ...prev, data: change(prev.data) })), []);

  const current = state?.key === key ? state : null;
  return {
    data: current?.data,
    error: current?.error ?? null,
    loading: !!key && !current,
    update
  };
}
