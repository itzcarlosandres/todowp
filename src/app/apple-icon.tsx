import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = process.env.NEXT_PUBLIC_APP_NAME ?? "TodoWP";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
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
          color: "white",
          fontSize: "120px",
          fontWeight: "bold",
        }}
      >
        M
      </div>
    ),
    { ...size },
  );
}
