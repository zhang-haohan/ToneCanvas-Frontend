// src/frequencyUpdater.js

import { setMinFrequency, setMaxFrequency } from './sharedStatus.js';

let trajectoryData = [];

export function updateFrequenciesFromJson(jsonData) {
  const { max_frequency, min_frequency } = jsonData;

  // 更新 sharedStatus 中的频率范围
  setMinFrequency(min_frequency);
  setMaxFrequency(max_frequency);

  // 记录频率范围的变化
  console.log(`Frequency range updated: min_frequency = ${min_frequency}, max_frequency = ${max_frequency}`);
}

export function clearTrajectoryData() {
  trajectoryData = [];
}

export function drawFrequencyTrajectory(jsonData) {
  const { data, max_frequency, min_frequency } = jsonData;

  const xMin = 0.15;
  const xMax = 0.95;
  const yMin = 0.1;
  const yMax = 0.9;

  let isDrawing = false;
  let trajectorySegment = [];

  data.forEach(point => {
    const { time, frequency } = point;
    if (frequency !== "NaN") {
      const x = xMin + (xMax - xMin) * time;
      const y = yMin + (yMax - yMin) * (1 - (Math.log(frequency) - Math.log(min_frequency)) / (Math.log(max_frequency) - Math.log(min_frequency)));

      if (isDrawing) {
        trajectorySegment.push({ x: x * window.innerWidth, y: y * window.innerHeight });
      } else {
        isDrawing = true;
        trajectorySegment.push({ x: x * window.innerWidth, y: y * window.innerHeight });
      }
    } else {
      if (isDrawing) {
        trajectoryData.push(trajectorySegment);
        trajectorySegment = [];
      }
      isDrawing = false;
    }
  });

  if (trajectorySegment.length > 0) {
    trajectoryData.push(trajectorySegment);
  }
}

export function getTrajectoryData() {
  return trajectoryData;
}
