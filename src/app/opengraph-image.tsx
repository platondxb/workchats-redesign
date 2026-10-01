import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { MARK_PATH, WORDMARK_PATH } from "@/components/layout/Logo";
import { heroDemo, people, type PersonId } from "@/content/demo";
import { home } from "@/content/home";

/*
 * Link preview image, generated at build time. It renders in Satori, outside the browser, so it can't
 * read CSS custom properties: the colours below mirror src/styles/tokens.css and must be kept in step.
 */
const color = {
  canvas: "#f6f8fb",
  surface: "#ffffff",
  tint: "#eef2f8",
  ink: "#0e1626",
  inkMuted: "#475467",
  inkSubtle: "#667085",
  line: "#e3e8ef",
  brand: "#0077ff",
  accent: "#0068e6",
  success: "#12805c",
  onAccent: "#ffffff",
  avatar: {
    blue: ["#dbe7ff", "#1f4fbf"],
    green: ["#d9f2e4", "#17603a"],
    amber: ["#fbecc8", "#7d4508"],
    rose: ["#fbe1e7", "#9c1a3f"],
    violet: ["#ebe4ff", "#5a2bb0"],
  },
};

export const alt = home.og.alt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontDir = join(process.cwd(), "src/assets/fonts");

function Avatar({ person }: { person: PersonId }) {
  const [background, foreground] = color.avatar[people[person].tone];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: 20,
        background,
        color: foreground,
        fontSize: 15,
        fontWeight: 600,
      }}
    >
      {people[person].initials}
    </div>
  );
}

export default async function OpenGraphImage() {
  const [headline, text, textSemibold] = await Promise.all([
    readFile(join(fontDir, "StackSansHeadline-Bold.ttf")),
    readFile(join(fontDir, "StackSansText-Regular.ttf")),
    readFile(join(fontDir, "StackSansText-SemiBold.ttf")),
  ]);
  const [first] = heroDemo.earlier;
  const { next, call } = heroDemo;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: color.canvas,
        fontFamily: "Stack Sans Text",
        color: color.ink,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 620,
          padding: "60px 0 52px 68px",
        }}
      >
        <svg width={186} height={40} viewBox="0 0 586 126">
          <path d={MARK_PATH} fill={color.brand} />
          <path d={WORDMARK_PATH} fill={color.ink} />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{ fontFamily: "Stack Sans Headline", fontSize: 64, lineHeight: 1.02, letterSpacing: -2 }}
          >
            {home.hero.title}
          </div>
          <div style={{ marginTop: 26, fontSize: 26, lineHeight: 1.4, color: color.inkMuted }}>
            {home.og.subline}
          </div>
        </div>
        <div style={{ fontSize: 20, color: color.inkSubtle }}>workchats.com</div>
      </div>

      <div
        style={{
          display: "flex",
          position: "relative",
          flex: 1,
          margin: "40px 40px 0 0",
          padding: "56px 0 0 44px",
          borderRadius: "28px 28px 0 0",
          background: color.accent,
          overflow: "hidden",
        }}
      >
        <svg
          width={420}
          height={420}
          viewBox="0 0 126 126"
          style={{ position: "absolute", left: -90, bottom: -150 }}
        >
          <path d={MARK_PATH} fill={color.brand} />
        </svg>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 480,
            borderRadius: "16px 0 0 0",
            background: color.surface,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "18px 24px",
              borderBottom: `2px solid ${color.line}`,
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 600 }}>{`# ${heroDemo.channel}`}</div>
            <div style={{ fontSize: 15, color: color.inkSubtle }}>{`${heroDemo.members} members`}</div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "18px 24px 0",
              padding: "14px 18px",
              borderRadius: 14,
              border: `2px solid ${color.line}`,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{call.title}</div>
              <div style={{ fontSize: 14, color: color.inkMuted }}>
                {`Started by ${people[call.startedBy].name} · ${call.joined.length} in the call`}
              </div>
            </div>
            <div
              style={{
                marginLeft: "auto",
                padding: "8px 18px",
                borderRadius: 999,
                background: color.success,
                color: color.onAccent,
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              Join
            </div>
          </div>
          {[first, next].map((message) => (
            <div key={message.time} style={{ display: "flex", gap: 14, padding: "20px 24px 0" }}>
              <Avatar person={message.person} />
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                  <div style={{ fontSize: 17, fontWeight: 600 }}>{people[message.person].name}</div>
                  <div style={{ fontSize: 14, color: color.inkSubtle }}>{message.time}</div>
                </div>
                <div style={{ fontSize: 17, lineHeight: 1.4 }}>{message.text}</div>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", height: 40 }} />
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Stack Sans Headline", data: headline, weight: 700, style: "normal" },
        { name: "Stack Sans Text", data: text, weight: 400, style: "normal" },
        { name: "Stack Sans Text", data: textSemibold, weight: 600, style: "normal" },
      ],
    },
  );
}
