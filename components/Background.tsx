"use client";

import React from "react";

const Background: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "white", // 纯白背景
        zIndex: -100, // 足够低的 z-index
      }}
    ></div>
  );
};

export default Background;
