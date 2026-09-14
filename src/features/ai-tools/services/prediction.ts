const API_BASE = import.meta.env.VITE_LIVIA_AI_API_URL as string;

export interface ModelResult {
  prediction: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export interface SingleModelResult {
  prediction: string;
  confidence: number;
  probabilities: Record<string, number>;
  model: string;
}

export interface LiverPredictionResult {
  steatosis: ModelResult;
  fibrosis: ModelResult;
  smc_lud: ModelResult;
}

async function predictFromFile<T>(endpoint: string, file: File, isLiver: boolean): Promise<T> {
  const formData = new FormData();
  formData.append("file", file);

  const basePath = isLiver ? "/api/ai/liver" : "/api/ai";
  const response = await fetch(`${API_BASE}${basePath}/${endpoint}`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Prediction failed");
  }

  return data as T;
}

export async function predictSteatosis(file: File): Promise<SingleModelResult> {
  return predictFromFile<SingleModelResult>("steatosis", file, false);
}

export async function predictFibrosis(file: File): Promise<SingleModelResult> {
  return predictFromFile<SingleModelResult>("fibrosis", file, false);
}

export async function predictSmcLud(file: File): Promise<SingleModelResult> {
  return predictFromFile<SingleModelResult>("smc-lud", file, false);
}

export async function predictAll(file: File): Promise<LiverPredictionResult> {
  return predictFromFile<LiverPredictionResult>("predict", file, true);
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
