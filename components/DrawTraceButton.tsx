"use client";

import React, { useState, useEffect } from "react";
import config from "../public/config.json";
import { usePointerContext } from "../contexts/PointerContext";
import { useCorpusStatusContext } from "../contexts/CorpusStatus";

export default function DrawTraceButton() {
  const { audioIsInitialized } = usePointerContext();
  const { SwitchButtonPressed } = useCorpusStatusContext();

  const [isDisabled, setIsDisabled] = useState(false);

  const getHeaders = (extraHeaders: Record<string, string> = {}) => ({
    ...config.headers,
    ...extraHeaders,
  });

  const logButtonPress = async (buttonName: string) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/send-button-log`, {
        method: "POST",
        headers: getHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ button_name: buttonName }),
      });

      if (!response.ok) throw new Error("Failed to log button press");
      const result = await response.json();
      console.log("Button press logged:", result.message);
    } catch (error) {
      console.error("Error logging button press:", error);
    }
  };

  const handleClick = async () => {
    setIsDisabled(true);
    await logButtonPress("DrawTrace");
  };

  // 监听SwitchButtonPressed状态，重新启用按钮
  useEffect(() => {
    if (SwitchButtonPressed) {
      setIsDisabled(false);
    }
  }, [SwitchButtonPressed]);

  return (
    <>
      {audioIsInitialized && (
        <button
          onClick={handleClick}
          disabled={isDisabled}
          style={{
            position: "absolute",
            top: "50vh",
            left: "5vw",
            width: "20vw",
            height: "10vh",
            fontSize: "16px",
            cursor: isDisabled ? "not-allowed" : "pointer",
            backgroundColor: isDisabled ? "gray" : "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "5px",
            zIndex: 1000,
          }}
        >
          {isDisabled ? "Drawing..." : "Draw Trace"}
        </button>
      )}
    </>
  );
}
