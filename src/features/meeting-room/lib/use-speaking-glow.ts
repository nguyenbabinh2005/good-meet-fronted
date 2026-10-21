import type { Participant } from "livekit-client";
import { useEffect, useRef, type RefObject } from "react";

const ATTACK = 0.25;
const RELEASE = 0.06;
const NOISE_FLOOR = 0.01;
const MAX_USEFUL_LEVEL = 0.5;
const REST_THRESHOLD = 0.001;
const UPDATE_THRESHOLD = 0.0005;

export const normalizeAudioLevel = (level: number) => {
  if (level <= NOISE_FLOOR) return 0;

  const normalized = (level - NOISE_FLOOR) / (MAX_USEFUL_LEVEL - NOISE_FLOOR);
  return Math.min(1, Math.max(0, normalized));
};

type UseSpeakingGlowOptions = {
  elementRef: RefObject<HTMLElement | null>;
  participant: Participant;
};

export const useSpeakingGlow = ({
  elementRef,
  participant,
}: UseSpeakingGlowOptions) => {
  const smoothedLevelRef = useRef(0);
  const renderedLevelRef = useRef(-1);

  useEffect(() => {
    const element = elementRef.current;
    let animationFrame = 0;
    smoothedLevelRef.current = 0;
    renderedLevelRef.current = -1;

    const updateGlow = () => {
      const targetLevel = participant.isSpeaking
        ? normalizeAudioLevel(participant.audioLevel)
        : 0;
      const currentLevel = smoothedLevelRef.current;
      const smoothingFactor = targetLevel > currentLevel ? ATTACK : RELEASE;
      const nextLevel =
        currentLevel + (targetLevel - currentLevel) * smoothingFactor;
      const finalLevel = nextLevel < REST_THRESHOLD ? 0 : nextLevel;

      smoothedLevelRef.current = finalLevel;

      if (Math.abs(finalLevel - renderedLevelRef.current) >= UPDATE_THRESHOLD) {
        element?.style.setProperty("--audio-level", finalLevel.toFixed(4));
        renderedLevelRef.current = finalLevel;
      }

      animationFrame = requestAnimationFrame(updateGlow);
    };

    animationFrame = requestAnimationFrame(updateGlow);

    return () => {
      cancelAnimationFrame(animationFrame);
      element?.style.removeProperty("--audio-level");
    };
  }, [elementRef, participant]);
};
