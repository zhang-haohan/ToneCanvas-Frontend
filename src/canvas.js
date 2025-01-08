// src/canvas.js

import { sharedStatus, subscribe, getIsInTheButton, getCurrentPosition } from './sharedStatus.js';
import { initializeButton } from './buttonComponent.js';
import { getTrajectoryData } from './frequencyUpdater.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

let sparkles = [];
let trailsPool = [];
let currentTrail = [];
let lastTrailTime = 0;
const FPS = 60;

function createSparkles(x, y) {
  const radius = 20;
  for (let i = 0; i < 15; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radius;
    const initialX = x * canvas.width + Math.cos(angle) * distance;
    const initialY = y * canvas.height + Math.sin(angle) * distance;
    const speed = Math.random() * 4;
    sparkles.push({
      x: initialX,
      y: initialY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1
    });
  }

  if (sparkles.length > 50) {
    sparkles.splice(0, sparkles.length - 50);
  }
}

function createTrail(x, y) {
  const trailSegment = { x1: x * canvas.width, y1: y * canvas.height, x2: x * canvas.width, y2: y * canvas.height, alpha: 1 };
  if (currentTrail.length > 0) {
    const lastSegment = currentTrail[currentTrail.length - 1];
    trailSegment.x1 = lastSegment.x2;
    trailSegment.y1 = lastSegment.y2;
  }
  currentTrail.push(trailSegment);
}

function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function updateAndDrawSparkles() {
  for (let i = sparkles.length - 1; i >= 0; i--) {
    const p = sparkles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.02;
    context.globalAlpha = p.alpha;
    context.fillStyle = `rgba(255, 165, 0, ${p.alpha})`;
    context.beginPath();
    context.arc(p.x, p.y, 3, 0, Math.PI * 2);
    context.fill();
    if (p.alpha <= 0) {
      sparkles.splice(i, 1);
    }
  }
}

function updateAndDrawTrails() {
  for (let j = trailsPool.length - 1; j >= 0; j--) {
    const trail = trailsPool[j];
    for (let i = trail.length - 1; i >= 0; i--) {
      const t = trail[i];
      context.globalAlpha = t.alpha;
      context.strokeStyle = `rgba(0, 0, 255, ${t.alpha})`;
      context.lineWidth = 5;
      context.shadowBlur = 20;
      context.shadowColor = 'rgba(0, 0, 255, 1)';
      context.beginPath();
      context.moveTo(t.x1, t.y1);
      context.lineTo(t.x2, t.y2);
      context.stroke();
      t.alpha -= 0.01;
      if (t.alpha <= 0) {
        trail.splice(i, 1);
      }
    }
    if (trail.length === 0) {
      trailsPool.splice(j, 1);
    }
  }
}

const drawButton = initializeButton(canvas, context);

function update() {
  clearCanvas();

  const currentTime = performance.now();

  if (sharedStatus.drawing && !getIsInTheButton()) {
    createSparkles(sharedStatus.currentPosition.x, sharedStatus.currentPosition.y);

    if (currentTrail.length === 0) {
      currentTrail = [];
      trailsPool.push(currentTrail);
    }

    if (currentTime - lastTrailTime > 10) {
      createTrail(sharedStatus.currentPosition.x, sharedStatus.currentPosition.y);
      lastTrailTime = currentTime;
    }
  } else if (currentTrail.length > 0) {
    currentTrail = [];
  }

  updateAndDrawSparkles();
  updateAndDrawTrails();

  context.globalAlpha = 1.0;
  context.shadowBlur = 0;

  drawButton();
}

function initializeCanvas() {
  setInterval(() => {
    update();
  }, 1000 / FPS);
}

initializeCanvas();
