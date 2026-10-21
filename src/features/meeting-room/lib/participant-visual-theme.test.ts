import { describe, expect, test } from "vitest";
import {
  getParticipantVisualTheme,
  participantVisualThemes,
} from "./participant-visual-theme";

const relativeLuminance = (hexColor: string) => {
  const channels = hexColor
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};

const contrastRatio = (firstColor: string, secondColor: string) => {
  const firstLuminance = relativeLuminance(firstColor);
  const secondLuminance = relativeLuminance(secondColor);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
};

describe("getParticipantVisualTheme", () => {
  test("returns the same theme object for the same identity", () => {
    const firstTheme = getParticipantVisualTheme("participant-alex");

    expect(getParticipantVisualTheme("participant-alex")).toBe(firstTheme);
  });

  test("maps different identities deterministically", () => {
    const identities = [
      "participant-alex",
      "participant-maya",
      "participant-lee",
    ];
    const firstMapping = identities.map((identity) =>
      getParticipantVisualTheme(identity),
    );

    expect(
      identities.map((identity) => getParticipantVisualTheme(identity)),
    ).toEqual(firstMapping);
    expect(new Set(firstMapping).size).toBeGreaterThan(1);
  });

  test("uses a stable caller fallback for an empty identity", () => {
    expect(getParticipantVisualTheme("   ", "participant-sid-42")).toBe(
      getParticipantVisualTheme("participant-sid-42"),
    );
    expect(getParticipantVisualTheme("", "")).toBe(
      getParticipantVisualTheme("participant"),
    );
  });

  test("supports Unicode identities without losing determinism", () => {
    const identity = "người-dùng-😀-東京";

    expect(() => getParticipantVisualTheme(identity)).not.toThrow();
    expect(getParticipantVisualTheme(identity)).toBe(
      getParticipantVisualTheme(identity),
    );
  });

  test("always maps into the curated palette", () => {
    for (let index = 0; index < 1_000; index += 1) {
      const selectedTheme = getParticipantVisualTheme(`participant-${index}`);
      const paletteIndex = participantVisualThemes.findIndex(
        (theme) => theme === selectedTheme,
      );

      expect(paletteIndex).toBeGreaterThanOrEqual(0);
      expect(paletteIndex).toBeLessThan(participantVisualThemes.length);
    }
  });

  test("contains 12 unique themes and unique semantic color values", () => {
    expect(participantVisualThemes).toHaveLength(12);
    expect(
      new Set(participantVisualThemes.map((theme) => JSON.stringify(theme)))
        .size,
    ).toBe(participantVisualThemes.length);

    for (const token of [
      "accent",
      "avatarBackground",
      "tileBackground",
    ] as const) {
      expect(
        new Set(participantVisualThemes.map((theme) => theme[token])).size,
      ).toBe(participantVisualThemes.length);
    }
  });

  test("provides accessible foreground and accent contrast", () => {
    for (const theme of participantVisualThemes) {
      expect(
        contrastRatio(theme.foreground, theme.tileBackground),
        `foreground on tile ${theme.tileBackground}`,
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(theme.foreground, theme.avatarBackground),
        `foreground on avatar ${theme.avatarBackground}`,
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(theme.accent, theme.tileBackground),
        `accent ${theme.accent} on tile ${theme.tileBackground}`,
      ).toBeGreaterThanOrEqual(3);
    }
  });
});
