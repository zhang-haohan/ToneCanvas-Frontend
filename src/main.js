// src/main.js

import { updatePosition, setDrawingStatus, setCurrentStatus, initializeStatus, sharedStatus, resetPosition, setIsInTheButton } from './sharedStatus.js';
import './canvas.js';
import './audioProcessing.js';
import { initializeButton } from './buttonComponent.js';
import { initializeBackgroundCanvas } from './backgroundCanvas.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// 初始化背景画布
initializeBackgroundCanvas();

// 初始化按钮，并获取重新绘制按钮的函数
const drawButton = initializeButton(canvas, context);

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawButton();  // 每次调整画布大小时重新绘制按钮
}

window.addEventListener('load', () => {
  resizeCanvas();
  initializeStatus();
});
window.addEventListener('resize', resizeCanvas);

function getRelativePosition(event) {
  const rect = canvas.getBoundingClientRect();
  let x, y;
  if (event.touches && event.touches.length > 0) {
    x = (event.touches[0].clientX - rect.left) / rect.width;
    y = (event.touches[0].clientY - rect.top) / rect.height;
  } else {
    x = (event.clientX - rect.left) / rect.width;
    y = (event.clientY - rect.top) / rect.height;
  }
  return { x, y };
}

function startDrawing(event) {
  event.preventDefault();
  resetPosition();
  setDrawingStatus(true);
  setCurrentStatus('StartDrawing');
  const { x, y } = getRelativePosition(event);
  updatePosition(x, y);
  setTimeout(() => setCurrentStatus('Drawing'), 10);  // 10毫秒后设置为Drawing状态
}

function draw(event) {
  if (!sharedStatus.drawing) return;
  event.preventDefault();
  const { x, y } = getRelativePosition(event);
  updatePosition(x, y);
}

function endDrawing(event) {
  event.preventDefault();
  setDrawingStatus(false);
  setCurrentStatus('EndDrawing');
  setIsInTheButton(false);  // 结束绘图时将isInTheButton置为false
  resetPosition();
  setTimeout(() => setCurrentStatus('NotDrawing'), 0);
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('touchstart', startDrawing, { passive: false });
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('mouseup', endDrawing);
canvas.addEventListener('mouseout', endDrawing);
canvas.addEventListener('touchend', endDrawing);
canvas.addEventListener('touchcancel', endDrawing); // 处理触摸取消事件

// 初始调用
resizeCanvas();
initializeStatus();
