"use client";

import React from "react";
import config from "../public/config.json";
import { usePointerContext } from "../contexts/PointerContext"; // 可选，保留以便后续扩展

export default function DrawTraceButton() {
  const { audioIsInitialized } = usePointerContext(); // 如有需要可以根据状态显示按钮

  const getHeaders = (extraHeaders: Record<string, string> = {}) => {
    return {
      ...config.headers,
      ...extraHeaders,
    };
  };

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
    await logButtonPress("DrawTrace");
  };

  return (
    <>
      {audioIsInitialized && (
        <button
          onClick={handleClick}
          style={{
            position: "absolute",
            top: "20vh",
            left: "5vw",
            width: "20vw",
            height: "10vh",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "5px",
            zIndex: 1000,
          }}
        >
          Draw Trace
        </button>
      )}
    </>
  );
}
