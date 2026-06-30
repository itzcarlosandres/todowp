import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MarketFlow - Premium Digital Marketplace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(124, 58, 237, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(124, 58, 237, 0.2) 0%, transparent 50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              color: "white",
              fontWeight: "bold",
            }}
          >
            M
          </div>
          <div
            style={{
              fontSize: "60px",
              fontWeight: "bold",
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            MarketFlow
          </div>
        </div>
        <div
          style={{
            fontSize: "32px",
            color: "rgba(255,255,255,0.7)",
            textAlign: "center",
            maxWidth: "900px",
            lineHeight: "1.3",
          }}
        >
          The premium marketplace for digital products
        </div>
        <div
          style={{
            marginTop: "40px",
            fontSize: "18px",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          Themes · Plugins · Templates · SaaS · Scripts
        </div>
      </div>
    ),
    { ...size },
  );
}
