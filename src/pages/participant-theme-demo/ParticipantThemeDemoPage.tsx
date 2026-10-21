import type { CSSProperties } from "react";
import { MicOff } from "lucide-react";
import {
  participantVisualThemes,
  type ParticipantVisualTheme,
} from "../../features/meeting-room/lib/participant-visual-theme";
import tileStyles from "../../features/meeting-room/ui/ParticipantVisualTile.module.scss";
import styles from "./ParticipantThemeDemoPage.module.scss";

const themeNames = [
  "Blue",
  "Teal",
  "Emerald",
  "Indigo",
  "Violet",
  "Plum",
  "Rose",
  "Terracotta",
  "Amber",
  "Olive",
  "Cyan",
  "Slate blue",
] as const;

const participantStyle = (
  theme: ParticipantVisualTheme,
  audioLevel: number,
) => {
  return {
    "--audio-level": audioLevel.toString(),
    "--participant-accent": theme.accent,
    "--participant-avatar": theme.avatarBackground,
    "--participant-background": theme.tileBackground,
    "--participant-foreground": theme.foreground,
    "--participant-glow": theme.glow,
  } as CSSProperties;
};

type ThemeTileProps = {
  index: number;
  sidebar?: boolean;
  forceSpeaking?: boolean;
};

const ThemeTile = ({
  index,
  sidebar = false,
  forceSpeaking,
}: ThemeTileProps) => {
  const theme = participantVisualThemes[index];
  const speaking = forceSpeaking ?? (index === 1 || index === 7);

  const initials = themeNames[index]
    .split(" ")
    .map((word) => word[0])
    .join("");

  return (
    <article
      className={`${tileStyles.participantTile} ${
        tileStyles.participantTileCameraOff
      } ${sidebar ? styles.sidebarTile : styles.gridTile}`}
      data-speaking={speaking}
      style={participantStyle(theme, speaking ? 0.72 : 0)}
    >
      <span className={tileStyles.avatar}>{initials}</span>

      <div className={tileStyles.remoteMeta}>
        <strong>
          {index === 0
            ? "Alexandra Montgomery with a long participant name"
            : `${themeNames[index]} participant`}
        </strong>

        <span aria-label="Muted">
          <MicOff size={14} />
        </span>
      </div>
    </article>
  );
};

const ParticipantThemeDemoPage = () => (
  <main className={styles.page}>
    <header>
      <span>Development visual check</span>
      <h1>Participant visual themes</h1>
      <p>
        All camera-off themes use the same gradient, glow, muted state and
        speaking treatment.
      </p>
    </header>

    <section aria-labelledby="active-speaker">
      <div className={styles.sectionHeader}>
        <div>
          <h2 id="active-speaker">Active speaker visual</h2>
          <p>
            The active speaker receives a tile highlight and an avatar ring
            whose intensity follows the LiveKit audio level.
          </p>
        </div>

        <span className={styles.activeSpeakerBadge}>Speaking</span>
      </div>

      <div className={styles.activeSpeakerPreview}>
        <ThemeTile index={1} forceSpeaking />
      </div>
    </section>

    <section aria-labelledby="grid-themes">
      <h2 id="grid-themes">Grid tiles</h2>

      <div className={styles.themeGrid}>
        {participantVisualThemes.map((theme, index) => (
          <ThemeTile index={index} key={theme.tileBackground} />
        ))}
      </div>
    </section>

    <section aria-labelledby="sidebar-themes">
      <h2 id="sidebar-themes">Compact sidebar tiles</h2>

      <div className={styles.sidebarPreview}>
        {[2, 5, 8, 11].map((index) => (
          <ThemeTile index={index} key={index} sidebar />
        ))}
      </div>
    </section>
  </main>
);

export default ParticipantThemeDemoPage;
