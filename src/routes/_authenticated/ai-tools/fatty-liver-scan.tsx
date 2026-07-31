import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { predictFromImage } from "@/features/ai-tools/services/prediction";
import type { PredictionResult } from "@/features/ai-tools/services/prediction";

export const Route = createFileRoute("/_authenticated/ai-tools/fatty-liver-scan")({
  component: FattyLiverScanPage,
});

function FattyLiverScanPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
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
      const prediction = await predictFromImage(file);
      setResult(prediction);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-10 px-8 space-y-6 bg-accent min-h-full">
      <div className="flex items-center gap-3">
        <Link to="/ai-tools">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-2xl">Fatty Liver Detector</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Upload a liver ultrasound scan for AI analysis
          </p>
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

          {result ? (
            <div className="space-y-4">
              <div
                className={`rounded-lg p-4 ${result.fattyLiver
                  ? "bg-amber-500/10 border border-amber-500/20"
                  : "bg-emerald-500/10 border border-emerald-500/20"
                  }`}
              >
                <p className="text-sm text-muted-foreground">Diagnosis</p>
                <p
                  className={`text-lg font-heading font-medium ${result.fattyLiver ? "text-amber-600" : "text-emerald-600"
                    }`}
                >
                  {result.fattyLiver ? "Fatty Liver Detected" : "No Fatty Liver Detected"}
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Confidence</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${result.fattyLiver ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                      style={{ width: `${result.probability * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {(result.probability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Threshold: {(result.threshold * 100).toFixed(0)}% — Values at or
                above this threshold indicate fatty liver.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <p className="text-sm">Upload a scan and click 'Analyze' to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
