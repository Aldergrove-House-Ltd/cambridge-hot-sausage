import { ImageResponse } from "next/og";

export const alt = "The Hot Sausage Company — Hot Dogs on Fitzroy Street since 1986";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand palette (matches tailwind globals)
const COLORS = {
  maroon: "#5A1F1F",
  cream: "#F5F1E8",
  gold: "#ECD691",
  sage: "#4F6B58",
};

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: COLORS.maroon,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: COLORS.cream,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Decorative blur orbs */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -80,
            width: 420,
            height: 420,
            borderRadius: "9999px",
            background: COLORS.gold,
            opacity: 0.18,
            filter: "blur(40px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            right: -100,
            width: 480,
            height: 480,
            borderRadius: "9999px",
            background: COLORS.sage,
            opacity: 0.2,
            filter: "blur(40px)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "9999px",
              background: COLORS.gold,
              display: "flex",
            }}
          />
          <span
            style={{
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: COLORS.gold,
            }}
          >
            Est. 1986 · Fitzroy Street · Cambridge
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 108,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: -2,
              color: COLORS.cream,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>The Hot Sausage</span>
            <span style={{ color: COLORS.gold }}>Company</span>
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 32,
              lineHeight: 1.3,
              maxWidth: 880,
              color: "rgba(245,241,232,0.85)",
              display: "flex",
            }}
          >
            Cambridge&apos;s famous hot dogs — served fresh from a Victorian-style barrow on Fitzroy Street.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            color: "rgba(245,241,232,0.6)",
            letterSpacing: 1,
          }}
        >
          <span>hotsausagecompany.com</span>
          <span style={{ color: COLORS.gold, fontWeight: 600 }}>Order · Book · Visit</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
