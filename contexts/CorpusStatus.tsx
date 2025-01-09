"use client";

import React, { createContext, useContext, useState } from "react";

// 定义上下文的类型
interface CorpusStatusContextType {
  currentFileName: string;
  setCurrentFileName: React.Dispatch<React.SetStateAction<string>>;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  totalCorpus: number;
  setTotalCorpus: React.Dispatch<React.SetStateAction<number>>;
}

// 创建上下文
const CorpusStatusContext = createContext<CorpusStatusContextType | undefined>(
  undefined
);

// 创建 Provider
export const CorpusStatusProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentFileName, setCurrentFileName] = useState<string>(""); // 当前文件名
  const [currentIndex, setCurrentIndex] = useState<number>(0); // 当前索引
  const [totalCorpus, setTotalCorpus] = useState<number>(0); // 总文件数

  return (
    <CorpusStatusContext.Provider
      value={{
        currentFileName,
        setCurrentFileName,
        currentIndex,
        setCurrentIndex,
        totalCorpus,
        setTotalCorpus,
      }}
    >
      {children}
    </CorpusStatusContext.Provider>
  );
};

// 自定义 Hook 方便使用
export const useCorpusStatusContext = () => {
  const context = useContext(CorpusStatusContext);
  if (!context) {
    throw new Error("useCorpusStatusContext must be used within a CorpusStatusProvider");
  }
  return context;
};
