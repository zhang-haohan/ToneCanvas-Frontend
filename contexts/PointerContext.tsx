"use client";

import React, { createContext, useContext, useState } from "react";

// 定义上下文类型
interface PointerContextType {
  position: { x: number; y: number };
  setPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  isDrawing: boolean;
  setIsDrawing: React.Dispatch<React.SetStateAction<boolean>>;
  audioIsInitialized: boolean; // 新增变量类型
  setAudioIsInitialized: React.Dispatch<React.SetStateAction<boolean>>; // 新增状态 setter
}

// 创建上下文
const PointerContext = createContext<PointerContextType | undefined>(undefined);

// 创建 Provider
export const PointerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [audioIsInitialized, setAudioIsInitialized] = useState(false); // 新增状态

  return (
    <PointerContext.Provider
      value={{
        position,
        setPosition,
        isDrawing,
        setIsDrawing,
        audioIsInitialized, // 新增变量
        setAudioIsInitialized, // 新增 setter
      }}
    >
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
