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

  PlayButtonPressed: boolean;
  setPlayButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
  PitchButtonPressed: boolean;
  setPitchButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
  SwitchButtonPressed: boolean;
  setSwitchButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
  RecordButtonPressed: boolean;
  setRecordButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
  TraceButtonPressed: boolean;
  setTraceButtonPressed: React.Dispatch<React.SetStateAction<boolean>>;
}

// 创建上下文
const CorpusStatusContext = createContext<CorpusStatusContextType | undefined>(
  undefined
);

// 创建 Provider
export const CorpusStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentFileName, setCurrentFileName] = useState<string>(""); 
  const [currentIndex, setCurrentIndex] = useState<number>(0); 
  const [totalCorpus, setTotalCorpus] = useState<number>(0); 

  const [PlayButtonPressed, setPlayButtonPressed] = useState<boolean>(false);
  const [PitchButtonPressed, setPitchButtonPressed] = useState<boolean>(false);
  const [SwitchButtonPressed, setSwitchButtonPressed] = useState<boolean>(false);
  const [RecordButtonPressed, setRecordButtonPressed] = useState<boolean>(false);
  const [TraceButtonPressed, setTraceButtonPressed] = useState<boolean>(false);

  return (
    <CorpusStatusContext.Provider
      value={{
        currentFileName,
        setCurrentFileName,
        currentIndex,
        setCurrentIndex,
        totalCorpus,
        setTotalCorpus,
        PlayButtonPressed,
        setPlayButtonPressed,
        PitchButtonPressed,
        setPitchButtonPressed,
        SwitchButtonPressed,
        setSwitchButtonPressed,
        RecordButtonPressed,
        setRecordButtonPressed,
        TraceButtonPressed,
        setTraceButtonPressed,
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
