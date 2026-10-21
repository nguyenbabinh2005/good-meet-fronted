import { act, renderHook } from "@testing-library/react";
import type { Participant } from "livekit-client";
import { createRef } from "react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { normalizeAudioLevel, useSpeakingGlow } from "./use-speaking-glow";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("normalizeAudioLevel", () => {
  test("filters the configured noise floor", () => {
    expect(normalizeAudioLevel(0)).toBe(0);
    expect(normalizeAudioLevel(0.01)).toBe(0);
  });

  test("normalizes useful audio levels linearly", () => {
    expect(normalizeAudioLevel(0.255)).toBeCloseTo(0.5);
  });

  test("clamps values to the supported range", () => {
    expect(normalizeAudioLevel(-1)).toBe(0);
    expect(normalizeAudioLevel(0.5)).toBe(1);
    expect(normalizeAudioLevel(2)).toBe(1);
  });
});

describe("useSpeakingGlow", () => {
  test("updates the DOM variable without a React render loop and cleans up", () => {
    let frameCallback: FrameRequestCallback | undefined;
    const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      frameCallback = callback;
      return 17;
    });
    const cancelAnimationFrame = vi.fn();
    vi.stubGlobal("requestAnimationFrame", requestAnimationFrame);
    vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrame);

    const element = document.createElement("article");
    const elementRef = createRef<HTMLElement>();
    elementRef.current = element;
    const participant = {
      audioLevel: 0.255,
      isSpeaking: true,
    } as Participant;

    const { unmount } = renderHook(() =>
      useSpeakingGlow({ elementRef, participant }),
    );

    act(() => frameCallback?.(0));

    expect(element.style.getPropertyValue("--audio-level")).toBe("0.1250");

    unmount();

    expect(cancelAnimationFrame).toHaveBeenCalledWith(17);
    expect(element.style.getPropertyValue("--audio-level")).toBe("");
  });
});
