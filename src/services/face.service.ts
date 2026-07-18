import * as faceapi from "face-api.js";

let modelsLoaded = false;

const THRESHOLD = Number(import.meta.env.VITE_FACIAL_THRESHOLD) || 0.45;
const MIN_AREA_PERCENT = Number(import.meta.env.VITE_FACIAL_MIN_AREA_PERCENT) || 12;
const MIN_CONFIDENCE = Number(import.meta.env.VITE_FACIAL_MIN_CONFIDENCE) || 0.7;
const FRAMES_TO_CAPTURE = Number(import.meta.env.VITE_FACIAL_FRAMES_TO_CAPTURE) || 3;

export interface DetectionQuality {
  ok: boolean;
  areaPercent: number;
  confidence: number;
  reason?: string;
}

export async function loadModels(): Promise<void> {
  if (modelsLoaded) return;
  const MODEL_URL = "/models";
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  modelsLoaded = true;
}

export async function getDetectionWithQuality(
  video: HTMLVideoElement
): Promise<{ detection: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>> | null; quality: DetectionQuality }> {
  const result = await faceapi
    .detectSingleFace(video)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!result) {
    return {
      detection: null,
      quality: { ok: false, areaPercent: 0, confidence: 0, reason: "No se detecta rostro" },
    };
  }

  const { detection } = result;
  const box = detection.box;
  const videoWidth = video.videoWidth || 1;
  const videoHeight = video.videoHeight || 1;
  const areaPercent = ((box.width * box.height) / (videoWidth * videoHeight)) * 100;
  const confidence = detection.score;

  let ok = true;
  let reason: string | undefined;

  if (areaPercent < MIN_AREA_PERCENT) {
    ok = false;
    reason = "Acérquese a la cámara";
  } else if (confidence < MIN_CONFIDENCE) {
    ok = false;
    reason = "Mejor iluminación";
  }

  return {
    detection: result,
    quality: { ok, areaPercent: Math.round(areaPercent * 10) / 10, confidence, reason },
  };
}

export async function extractDescriptor(
  video: HTMLVideoElement
): Promise<Float32Array | null> {
  const detection = await faceapi
    .detectSingleFace(video)
    .withFaceLandmarks()
    .withFaceDescriptor();
  return detection?.descriptor || null;
}

export async function captureMultipleDescriptors(
  video: HTMLVideoElement,
  count: number = FRAMES_TO_CAPTURE
): Promise<Float32Array[]> {
  const descriptors: Float32Array[] = [];
  for (let i = 0; i < count; i++) {
    const { detection, quality } = await getDetectionWithQuality(video);
    if (detection && quality.ok) {
      descriptors.push(detection.descriptor);
    }
    if (i < count - 1) {
      await new Promise((r) => setTimeout(r, 150));
    }
  }
  return descriptors;
}

export function compareDescriptors(
  desc1: Float32Array,
  desc2: Float32Array,
  threshold: number = THRESHOLD
): boolean {
  const dist = faceapi.euclideanDistance(desc1, desc2);
  return dist < threshold;
}

export function distance(desc1: Float32Array, desc2: Float32Array): number {
  return faceapi.euclideanDistance(desc1, desc2);
}

export function findBestMatch(
  capturedDescriptors: Float32Array[],
  storedDescriptors: Float32Array[],
  threshold: number = THRESHOLD
): { match: boolean; minDistance: number; avgDistance: number } {
  if (capturedDescriptors.length === 0 || storedDescriptors.length === 0) {
    return { match: false, minDistance: Infinity, avgDistance: Infinity };
  }

  let minDist = Infinity;
  let totalDist = 0;
  let comparisons = 0;

  for (const cap of capturedDescriptors) {
    for (const stored of storedDescriptors) {
      const d = faceapi.euclideanDistance(cap, stored);
      if (d < minDist) minDist = d;
      totalDist += d;
      comparisons++;
    }
  }

  const avgDist = totalDist / comparisons;
  return {
    match: minDist < threshold,
    minDistance: minDist,
    avgDistance: avgDist,
  };
}

export function parseDescriptor(json: string): Float32Array {
  const arr = JSON.parse(json);
  return new Float32Array(arr);
}

export function serializeDescriptor(desc: Float32Array): string {
  return JSON.stringify(Array.from(desc));
}

export function parseDescriptorArray(jsonArray: string[]): Float32Array[] {
  return jsonArray.map((j) => parseDescriptor(j));
}
