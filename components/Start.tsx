"use client";

import React, { useState } from "react";

export default function Start() {
  const [isVisible, setIsVisible] = useState(true);

  const handleStart = () => {
    setIsVisible(false); // 隐藏按钮
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen(); // 设置全屏
    } else if ((document.documentElement as any).webkitRequestFullscreen) {
      (document.documentElement as any).webkitRequestFullscreen(); // Safari 兼容
    } else if ((document.documentElement as any).msRequestFullscreen) {
      (document.documentElement as any).msRequestFullscreen(); // IE 兼容
    }
  };

  return (
    isVisible && (
      <button
        onClick={handleStart}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          padding: "10px 20px",
          fontSize: "18px",
          cursor: "pointer",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Start
      </button>
    )
  );
}
