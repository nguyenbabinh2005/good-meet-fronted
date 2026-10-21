export type ParticipantVisualTheme = Readonly<{
  accent: string;
  avatarBackground: string;
  foreground: string;
  glow: string;
  tileBackground: string;
}>;

export const participantVisualThemes = [
  {
    tileBackground: "#29466b",
    glow: "rgb(65 125 207 / 22%)",
    avatarBackground: "#3f6fa7",
    foreground: "#f8fbff",
    accent: "#86b8f5",
  },
  {
    tileBackground: "#284b4f",
    glow: "rgb(50 144 142 / 22%)",
    avatarBackground: "#337b79",
    foreground: "#f5fffe",
    accent: "#72c9c4",
  },
  {
    tileBackground: "#294b40",
    glow: "rgb(57 147 108 / 22%)",
    avatarBackground: "#397f64",
    foreground: "#f5fff9",
    accent: "#77d0a8",
  },
  {
    tileBackground: "#353d66",
    glow: "rgb(91 107 190 / 23%)",
    avatarBackground: "#5f6bad",
    foreground: "#fafaff",
    accent: "#9eaaef",
  },
  {
    tileBackground: "#433960",
    glow: "rgb(126 91 181 / 22%)",
    avatarBackground: "#7a60a8",
    foreground: "#fdf9ff",
    accent: "#bd9aeb",
  },
  {
    tileBackground: "#4b3850",
    glow: "rgb(151 79 155 / 21%)",
    avatarBackground: "#8b5c90",
    foreground: "#fff8ff",
    accent: "#d493d5",
  },
  {
    tileBackground: "#503945",
    glow: "rgb(178 83 117 / 21%)",
    avatarBackground: "#94586f",
    foreground: "#fff8fb",
    accent: "#e89ab2",
  },
  {
    tileBackground: "#533c35",
    glow: "rgb(188 99 75 / 20%)",
    avatarBackground: "#995f4e",
    foreground: "#fff9f6",
    accent: "#efa08a",
  },
  {
    tileBackground: "#50452c",
    glow: "rgb(181 135 55 / 20%)",
    avatarBackground: "#856635",
    foreground: "#fffbf1",
    accent: "#e2c178",
  },
  {
    tileBackground: "#424933",
    glow: "rgb(126 145 67 / 20%)",
    avatarBackground: "#687440",
    foreground: "#fbfdf5",
    accent: "#bbc984",
  },
  {
    tileBackground: "#294a58",
    glow: "rgb(54 146 173 / 22%)",
    avatarBackground: "#327689",
    foreground: "#f4fcff",
    accent: "#77cada",
  },
  {
    tileBackground: "#35445e",
    glow: "rgb(84 117 166 / 22%)",
    avatarBackground: "#58739a",
    foreground: "#f8fbff",
    accent: "#9ab7df",
  },
] as const satisfies readonly ParticipantVisualTheme[];

const hashIdentity = (identity: string) => {
  let hash = 2_166_136_261;

  for (const character of identity) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16_777_619);
  }

  return hash >>> 0;
};

export const getParticipantVisualTheme = (
  identity: string,
  fallbackIdentity = "participant",
): ParticipantVisualTheme => {
  const stableIdentity =
    identity.trim() || fallbackIdentity.trim() || "participant";
  return participantVisualThemes[
    hashIdentity(stableIdentity) % participantVisualThemes.length
  ];
};
