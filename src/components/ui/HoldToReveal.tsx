"use client";

import { useState } from "react";

interface Props {
  value: string;
}

// Press-and-hold to reveal sensitive personal info (phone numbers, emergency
// contacts); releasing re-masks it immediately. No click-to-toggle — the
// value should never stay visible unattended on a shared/glanced-at screen.
export default function HoldToReveal({ value }: Props) {
  const [revealed, setRevealed] = useState(false);

  const mask = "•".repeat(Math.min(Math.max(value.length, 6), 14));

  return (
    <span
      className="select-none cursor-pointer font-mono tracking-wide"
      onMouseDown={() => setRevealed(true)}
      onMouseUp={() => setRevealed(false)}
      onMouseLeave={() => setRevealed(false)}
      onTouchStart={() => setRevealed(true)}
      onTouchEnd={() => setRevealed(false)}
      onTouchCancel={() => setRevealed(false)}
    >
      {revealed ? value : mask}
    </span>
  );
}
