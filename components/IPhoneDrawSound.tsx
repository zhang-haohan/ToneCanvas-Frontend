"use client";

import { useEffect, useRef } from "react";
import { useAudioRangeContext } from "../contexts/AudioRange";
import { usePointerContext } from "../contexts/PointerContext";
import {
  isIPhoneAudioDevice,
  playIPhoneDrawTone,
  stopIPhoneDrawTone,
} from "./iPhoneAudio";

const MIN_FREQUENCY = 60;
const MAX_FREQUENCY = 1200;

export default function IPhoneDrawSound() {
  const { frequencyRange } = useAudioRangeContext();
  const { audioIsInitialized } = usePointerContext();
  const frequencyRangeRef = useRef(frequencyRange);
  const audioIsInitializedRef = useRef(audioIsInitialized);
  const isTouchingRef = useRef(false);

  useEffect(() => {
    frequencyRangeRef.current = frequencyRange;
  }, [frequencyRange]);

  useEffect(() => {
    audioIsInitializedRef.current = audioIsInitialized;
  }, [audioIsInitialized]);

  const yToFrequency = (clientY: number) => {
    const height = window.visualViewport?.height || window.innerHeight || 1;
    const yPercent = 1 - clientY / height;
    const clampedY = Math.max(0, Math.min(1, yPercent));
    const { min, max } = frequencyRangeRef.current;
    const frequency = min + clampedY * (max - min);
    return Math.max(MIN_FREQUENCY, Math.min(MAX_FREQUENCY, frequency));
  };

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return false;
    return Boolean(target.closest("button, input, textarea, select, a"));
  };

  const playAtY = (clientY: number) => {
    const frequency = yToFrequency(clientY);
    playIPhoneDrawTone(frequency);
  };

  useEffect(() => {
    if (!isIPhoneAudioDevice()) return;

    const startFromPoint = (clientY: number) => {
      isTouchingRef.current = true;
      playAtY(clientY);
    };

    const moveFromPoint = (clientY: number) => {
      if (!isTouchingRef.current) return;
      playAtY(clientY);
    };

    const stopFromPoint = () => {
      isTouchingRef.current = false;
      stopIPhoneDrawTone();
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (isInteractiveTarget(event.target)) return;
      const touch = event.touches[0];
      if (!touch) return;
      startFromPoint(touch.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      startFromPoint(touch.clientY);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (isInteractiveTarget(event.target)) return;
      startFromPoint(event.clientY);
    };

    const handlePointerMove = (event: PointerEvent) => {
      moveFromPoint(event.clientY);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopFromPoint();
      }
    };

    document.addEventListener("touchstart", handleTouchStart, { capture: true, passive: true });
    document.addEventListener("touchmove", handleTouchMove, { capture: true, passive: true });
    document.addEventListener("touchend", stopFromPoint, { capture: true, passive: true });
    document.addEventListener("touchcancel", stopFromPoint, { capture: true, passive: true });
    document.addEventListener("pointerdown", handlePointerDown, { capture: true, passive: true });
    document.addEventListener("pointermove", handlePointerMove, { capture: true, passive: true });
    document.addEventListener("pointerup", stopFromPoint, { capture: true, passive: true });
    document.addEventListener("pointercancel", stopFromPoint, { capture: true, passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart, { capture: true });
      document.removeEventListener("touchmove", handleTouchMove, { capture: true });
      document.removeEventListener("touchend", stopFromPoint, { capture: true });
      document.removeEventListener("touchcancel", stopFromPoint, { capture: true });
      document.removeEventListener("pointerdown", handlePointerDown, { capture: true });
      document.removeEventListener("pointermove", handlePointerMove, { capture: true });
      document.removeEventListener("pointerup", stopFromPoint, { capture: true });
      document.removeEventListener("pointercancel", stopFromPoint, { capture: true });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopIPhoneDrawTone();
    };
  }, []);

  return null;
}
