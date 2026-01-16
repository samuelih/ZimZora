// ID generation
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Delay promise
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Clamp value
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Linear interpolation
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Map value from one range to another
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// Class name helper
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Culinary terms for strength
export const culinaryTerms = [
  { min: 0, max: 10, term: 'A whisper', midpoint: 5 },
  { min: 11, max: 25, term: 'A pinch', midpoint: 18 },
  { min: 26, max: 40, term: 'A dash', midpoint: 33 },
  { min: 41, max: 55, term: 'A spoonful', midpoint: 48 },
  { min: 56, max: 70, term: 'A portion', midpoint: 63 },
  { min: 71, max: 85, term: 'A generous helping', midpoint: 78 },
  { min: 86, max: 100, term: 'The whole thing', midpoint: 93 },
];

export function getCulinaryTerm(value: number): string {
  const term = culinaryTerms.find(t => value >= t.min && value <= t.max);
  return term?.term || 'A portion';
}

export function getTermValue(term: string): number {
  const found = culinaryTerms.find(t => t.term === term);
  return found?.midpoint || 50;
}

// Image utilities
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function generateThumbnail(
  src: string,
  size: { width: number; height: number }
): Promise<string> {
  const img = await loadImage(src);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const ratio = Math.min(size.width / img.width, size.height / img.height);
  const width = img.width * ratio;
  const height = img.height * ratio;

  canvas.width = size.width;
  canvas.height = size.height;

  const x = (size.width - width) / 2;
  const y = (size.height - height) / 2;

  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, size.width, size.height);
  ctx.drawImage(img, x, y, width, height);

  return canvas.toDataURL('image/jpeg', 0.8);
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Polar coordinate utilities
// Simple version: convert angle/distance to x/y offset from origin
export function polarToCartesian(
  angle: number,
  radius: number
): { x: number; y: number } {
  const radians = (angle * Math.PI) / 180;
  return {
    x: Math.cos(radians) * radius,
    y: Math.sin(radians) * radius,
  };
}

// Full version with center point
export function polarToCartesianFull(
  polar: { angle: number; distance: number },
  center: { x: number; y: number },
  radius: number
): { x: number; y: number } {
  const radians = (polar.angle * Math.PI) / 180;
  return {
    x: center.x + Math.cos(radians) * polar.distance * radius,
    y: center.y + Math.sin(radians) * polar.distance * radius,
  };
}

export function cartesianToPolar(
  point: { x: number; y: number },
  center: { x: number; y: number },
  radius: number
): { angle: number; distance: number } {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const distance = Math.sqrt(dx * dx + dy * dy) / radius;
  let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (angle < 0) angle += 360;
  return { angle, distance: Math.min(distance, 1) };
}
