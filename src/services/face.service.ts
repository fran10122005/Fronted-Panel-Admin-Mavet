import * as faceapi from "face-api.js";

let modelsLoaded = false;

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

export async function extractDescriptor(
  video: HTMLVideoElement
): Promise<Float32Array | null> {
  const detection = await faceapi
    .detectSingleFace(video)
    .withFaceLandmarks()
    .withFaceDescriptor();
  return detection?.descriptor || null;
}

export function compareDescriptors(
  desc1: Float32Array,
  desc2: Float32Array,
  threshold: number = 0.6
): boolean {
  const dist = faceapi.euclideanDistance(desc1, desc2);
  return dist < threshold;
}

export function distance(desc1: Float32Array, desc2: Float32Array): number {
  return faceapi.euclideanDistance(desc1, desc2);
}

export function parseDescriptor(json: string): Float32Array {
  const arr = JSON.parse(json);
  return new Float32Array(arr);
}

export function serializeDescriptor(desc: Float32Array): string {
  return JSON.stringify(Array.from(desc));
}
