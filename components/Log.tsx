"use client";

import React, { useEffect } from "react";
import { usePointerContext } from "../contexts/PointerContext";
import { useAudioRangeContext } from "../contexts/AudioRange";
import { useCorpusStatusContext } from "../contexts/CorpusStatus";

export default function Log() {
  const { position, isDrawing } = usePointerContext();
  const { frequencyRange } = useAudioRangeContext();
  const { currentFileName, currentIndex, totalCorpus } = useCorpusStatusContext();

  useEffect(() => {
    console.log(
      `Context State Updated: X=${position.x}, Y=${position.y}, isDrawing=${isDrawing}`
    );
  }, [position, isDrawing]);

  useEffect(() => {
    if (isDrawing) {
      console.log("%cDrawing started in Log", "color: green; font-weight: bold;");
    } else {
      console.log("%cDrawing stopped in Log", "color: red; font-weight: bold;");
    }
  }, [isDrawing]);

  useEffect(() => {
    console.log(
      `%cAudioRange Updated: Min=${frequencyRange.min}, Max=${frequencyRange.max}`,
      "color: yellow; font-weight: bold;"
    );
  }, [frequencyRange]);

  useEffect(() => {
    console.log(
      `%cCorpusStatus Updated: File=${currentFileName}, Index=${currentIndex}, Total=${totalCorpus}`,
      "color: purple; font-weight: bold;"
    );
  }, [currentFileName, currentIndex, totalCorpus]);

  return null;
}
