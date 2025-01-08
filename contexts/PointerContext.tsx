"use client";

import React, { createContext, useContext, useState, useRef } from "react";

// 定义上下文类型
interface PointerContextType {
  position: { x: number; y: number };
  setPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  isDrawing: React.MutableRefObject<boolean>; // 添加 isDrawing 的类型定义
}

// 创建上下文
const PointerContext = createContext<PointerContextType | undefined>(undefined);

// 创建 Provider
export const PointerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDrawing = useRef(false); // 全局绘制状态

  return (
    <PointerContext.Provider value={{ position, setPosition, isDrawing }}>
      {children}
    </PointerContext.Provider>
  );
};

// 自定义 Hook 方便使用
export const usePointerContext = () => {
  const context = useContext(PointerContext);
  if (!context) {
    throw new Error("usePointerContext must be used within a PointerProvider");
  }
  return context;
};
