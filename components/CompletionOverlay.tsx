"use client";

import React from "react";
import { useCorpusStatusContext } from "../contexts/CorpusStatus";

export default function CompletionOverlay() {
  const { isFinished, totalCorpus } = useCorpusStatusContext();

  if (!isFinished || totalCorpus === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
        zIndex: 10000,
      }}
    >
      <div
        style={{
          textAlign: "center",
          color: "black",
          fontWeight: "bold",
          lineHeight: 1.25,
          textShadow: "0 2px 12px rgba(255, 255, 255, 0.9)",
        }}
      >
        <div style={{ fontSize: "min(7vw, 7vh)" }}>Experiment Complete</div>
        <div style={{ fontSize: "min(5vw, 5vh)", marginTop: "1vh" }}>
          Thank you!
        </div>
      </div>
    </div>
  );
}
