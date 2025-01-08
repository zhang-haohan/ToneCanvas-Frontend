// src/sharedStatus.js

export const sharedStatus = {
  currentPosition: { x: 0, y: 0 },
  drawing: false,
  currentStatus: 'NotDrawing', // 初始状态
  isInTheButton: false, // 是否在按钮内
  subscribers: []
};

export const frequencyRange = {
  minFrequency: 85, // 默认最小频率
  maxFrequency: 400 // 默认最大频率
};

export function updatePosition(x, y) {
  if (sharedStatus.currentPosition.x !== x || sharedStatus.currentPosition.y !== y) {
    sharedStatus.currentPosition.x = x;
    sharedStatus.currentPosition.y = y;
    notifySubscribers();
  }
}

export function setDrawingStatus(isDrawing) {
  if (sharedStatus.drawing !== isDrawing) {
    sharedStatus.drawing = isDrawing;
    notifySubscribers();
  }
}

export function setCurrentStatus(status) {
  if (sharedStatus.currentStatus !== status) {
    sharedStatus.currentStatus = status;
    notifySubscribers();
  }
}

export function setIsInTheButton(isInTheButton) {
  if (sharedStatus.isInTheButton !== isInTheButton) {
    sharedStatus.isInTheButton = isInTheButton;
    notifySubscribers();
  }
}

export function subscribe(callback) {
  sharedStatus.subscribers.push(callback);
}

function notifySubscribers() {
  sharedStatus.subscribers.forEach(callback => callback(sharedStatus));
}

export function initializeStatus() {
  setCurrentStatus('NotDrawing');
}

export function resetPosition() {
  sharedStatus.currentPosition = { x: 0, y: 0 };
  notifySubscribers();
}

// 新增的get方法
export function getCurrentPosition() {
  return sharedStatus.currentPosition;
}

export function isDrawing() {
  return sharedStatus.drawing;
}

export function getCurrentStatus() {
  return sharedStatus.currentStatus;
}

export function getIsInTheButton() {
  return sharedStatus.isInTheButton;
}

// 新增的频率范围相关的getter和setter
export function getMinFrequency() {
  return frequencyRange.minFrequency;
}

export function setMinFrequency(value) {
  frequencyRange.minFrequency = value;
  notifySubscribers();
}

export function getMaxFrequency() {
  return frequencyRange.maxFrequency;
}

export function setMaxFrequency(value) {
  frequencyRange.maxFrequency = value;
  notifySubscribers();
}
