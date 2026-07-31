const API_BASE = import.meta.env.VITE_LIVIA_AI_API_URL as string;

export interface PredictionResult {
  fattyLiver: boolean;
  probability: number;
  threshold: number;
}

export interface PredictionError {
  error: string;
}

export async function predictFromImage(file: File): Promise<PredictionResult> {
  const response = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": file.type || "image/jpeg",
    },
    body: file,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Prediction failed");
  }

  return data as PredictionResult;
}

export interface Fib4Input {
  age: number;
  ast: number;
  alt: number;
  platelets: number;
}

export interface Fib4Result {
  score: number;
  interpretation: "low" | "indeterminate" | "advanced";
  ageWarning: boolean;
}

export function calculateFib4(input: Fib4Input): Fib4Result {
  if (input.alt <= 0) {
    return { score: 0, interpretation: "low", ageWarning: false };
  }

  const score =
    (input.age * input.ast) / (input.platelets * Math.sqrt(input.alt));

  const rounded = Math.round(score * 100) / 100;

  let interpretation: Fib4Result["interpretation"];
  if (rounded < 1.45) {
    interpretation = "low";
  } else if (rounded <= 3.25) {
    interpretation = "indeterminate";
  } else {
    interpretation = "advanced";
  }

  const ageWarning = input.age < 35 || input.age > 65;

  return { score: rounded, interpretation, ageWarning };
}
