import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background: "#123f4a",
        color: "#fffaf5",
        fontSize: 28,
        fontWeight: 700,
        letterSpacing: "-0.08em",
      }}
    >
      JB<span style={{ color: "#ff8a68" }}>.</span>
    </div>,
    size,
  );
}
