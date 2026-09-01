import { useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ModelResult, SingleModelResult, LiverPredictionResult } from "../services/prediction";

interface LiverScanPageProps {
  title: string;
  description: string;
  predictFn: (file: File) => Promise<SingleModelResult | LiverPredictionResult>;
  showAllResults?: boolean;
  backTo?: string;
}

function ModelResultCard({ label, result }: { label: string; result: SingleModelResult | ModelResult }) {
  const isPositive = result.confidence > 0.5;
  
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-medium">{label}</h3>
        <span className={`text-sm font-medium ${isPositive ? "text-amber-600" : "text-emerald-600"}`}>
          {result.prediction}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Confidence</span>
          <span className="font-medium">{(result.confidence * 100).toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${isPositive ? "bg-amber-500" : "bg-emerald-500"}`}
            style={{ width: `${result.confidence * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">Probabilities</p>
        {Object.entries(result.probabilities).map(([cls, prob]) => (
          <div key={cls} className="flex items-center justify-between text-xs">
            <span className={cls === result.prediction ? "font-medium" : "text-muted-foreground"}>
              {cls}
            </span>
            <span>{(prob * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LiverScanPage({
  title,
  description,
  predictFn,
  showAllResults = false,
  backTo = "/ai-tools",
}: LiverScanPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<SingleModelResult | LiverPredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(selected);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (!dropped || !dropped.type.startsWith("image/")) return;

    setFile(dropped);
    setResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(dropped);
  }

  function handleRemove() {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handlePredict() {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const prediction = await predictFn(file);
      setResult(prediction);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed");
    } finally {
      setLoading(false);
    }
  }

  const isSingleResult = result && "model" in result;
  const isAllResults = result && !("model" in result);

  return (
    <div className="py-10 px-8 space-y-6 bg-accent min-h-full">
      <div className="flex items-center gap-3">
        <Link to={backTo}>
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-2xl">{title}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg bg-white p-6 space-y-4">
          <h2 className="font-heading font-medium">Upload Scan</h2>

          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Scan preview"
                className="w-full rounded-lg border object-contain max-h-80"
              />
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow hover:bg-white"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-accent transition-colors"
            >
              <Upload className="size-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPEG, BMP up to 25MB
                </p>
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/bmp"
            onChange={handleFileChange}
            className="hidden"
          />

          <Button
            onClick={handlePredict}
            disabled={!file || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Scan"
            )}
          </Button>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
              {error}
            </div>
          )}
        </div>

        <div className="border rounded-lg bg-white p-6">
          <h2 className="font-heading font-medium mb-4">Results</h2>

          {isSingleResult && (
            <div className="space-y-4">
              <div
                className={`rounded-lg p-4 ${
                  result.prediction !== "No Steatosis" && result.prediction !== "F0"
                    ? "bg-amber-500/10 border border-amber-500/20"
                    : "bg-emerald-500/10 border border-emerald-500/20"
                }`}
              >
                <p className="text-sm text-muted-foreground">Diagnosis</p>
                <p
                  className={`text-lg font-heading font-medium ${
                    result.prediction !== "No Steatosis" && result.prediction !== "F0"
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}
                >
                  {result.prediction}
                </p>
              </div>

              <ModelResultCard label="Model Result" result={result as SingleModelResult} />
            </div>
          )}

          {isAllResults && showAllResults && (
            <div className="space-y-4">
              <ModelResultCard label="Steatosis" result={(result as LiverPredictionResult).steatosis} />
              <ModelResultCard label="Fibrosis" result={(result as LiverPredictionResult).fibrosis} />
              <ModelResultCard label="SMC-LUD" result={(result as LiverPredictionResult).smc_lud} />
            </div>
          )}

          {!result && (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <p className="text-sm">Upload a scan and click 'Analyze' to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
