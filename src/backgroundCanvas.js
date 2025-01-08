// src/backgroundCanvas.js

import { getTrajectoryData } from './frequencyUpdater.js';

const backgroundCanvas = document.getElementById('background-canvas');
const backgroundContext = backgroundCanvas.getContext('2d');

function resizeBackgroundCanvas() {
  backgroundCanvas.width = window.innerWidth;
  backgroundCanvas.height = window.innerHeight;
}

function drawReferenceLines() {
  clearBackgroundCanvas();

  const trajectoryData = getTrajectoryData();

  backgroundContext.strokeStyle = 'rgba(192, 192, 192, 1)';  // 不透明浅灰色
  backgroundContext.lineWidth = 100;

  trajectoryData.forEach(segment => {
    if (segment.length > 0) {
      backgroundContext.beginPath();
      backgroundContext.moveTo(segment[0].x, segment[0].y);
      for (let i = 1; i < segment.length; i++) {
        backgroundContext.lineTo(segment[i].x, segment[i].y);
      }
      backgroundContext.stroke();

      // 绘制端点的圆形
      backgroundContext.beginPath();
      backgroundContext.arc(segment[0].x, segment[0].y, 50, 0, 2 * Math.PI);  // 圆形半径50
      backgroundContext.arc(segment[segment.length - 1].x, segment[segment.length - 1].y, 50, 0, 2 * Math.PI);  // 圆形半径50
      backgroundContext.fillStyle = 'rgba(192, 192, 192, 1)';
      backgroundContext.fill();
    }
  });
}

function clearBackgroundCanvas() {
  backgroundContext.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
}

function initializeBackgroundCanvas() {
  resizeBackgroundCanvas();
  drawReferenceLines();

  window.addEventListener('resize', resizeBackgroundCanvas);
}

export { initializeBackgroundCanvas, drawReferenceLines, clearBackgroundCanvas };
