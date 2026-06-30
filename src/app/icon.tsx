import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MarketFlow";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
          borderRadius: "8px",
          color: "white",
          fontSize: "20px",
          fontWeight: "bold",
        }}
      >
        M
      </div>
    ),
    { ...size },
  );
}
