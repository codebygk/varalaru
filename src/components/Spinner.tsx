"use client";

interface SpinnerProps {
  color: string;
}

export default function Spinner({ color }: SpinnerProps) {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: color,
            animation: `pulse 1s ${i * 0.15}s infinite ease-in-out`,
          }}
        />
      ))}
    </div>
  );
}
