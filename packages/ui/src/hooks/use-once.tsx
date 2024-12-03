"use client";

import { useEffect, useRef } from "react";

export function useOnce(effect: () => void) {
  const countRef = useRef(0);

  useEffect(() => {
    countRef.current += 1;

    if (countRef.current === 1) {
      effect();
    }
  }, []);
}

export function useOnceWhen(condition: boolean, effect: () => void) {
  const countRef = useRef(0);

  useEffect(() => {
    if (countRef.current === 0 && condition) {
      countRef.current += 1;
      effect();
    }
  }, [condition]);
}
