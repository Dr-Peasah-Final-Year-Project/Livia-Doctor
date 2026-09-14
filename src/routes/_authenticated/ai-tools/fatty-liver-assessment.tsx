import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateFib4,
  type Fib4Result,
} from "@/features/ai-tools/services/prediction";

export const Route = createFileRoute(
  "/_authenticated/ai-tools/fatty-liver-assessment"
)({
  component: FattyLiverAssessmentPage,
});

const formSchema = z.object({
  age: z.number().min(1).max(120),
  ast: z.number().min(0).max(2000),
  alt: z.number().min(0).max(2000),
  platelets: z.number().min(0).max(1000),
});

type FormValues = z.infer<typeof formSchema>;

function FattyLiverAssessmentPage() {
  const [result, setResult] = useState<Fib4Result | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      age: 40,
      ast: 25,
      alt: 30,
      platelets: 250,
    },
  });

  function onSubmit(data: FormValues) {
    setLoading(true);
    setTimeout(() => {
      setResult(calculateFib4(data));
      setLoading(false);
    }, 500);
  }

  const interpretationConfig = {
    low: {
      bg: "bg-emerald-500/10 border-emerald-500/20",
      text: "text-emerald-600",
      label: "Low Fibrosis",
      description: "Advanced fibrosis unlikely. Consider routine follow-up.",
    },
    indeterminate: {
      bg: "bg-amber-500/10 border-amber-500/20",
      text: "text-amber-600",
      label: "Indeterminate",
      description: "Further evaluation may be needed (e.g., elastography or NFS).",
    },
    advanced: {
      bg: "bg-red-500/10 border-red-500/20",
      text: "text-red-600",
      label: "Advanced Fibrosis",
      description: "Consider liver biopsy for confirmation unless other clinical signs are present.",
    },
  };

  return (
    <div className="py-10 px-8 space-y-6 bg-accent min-h-full">
      <div className="flex items-center gap-3">
        <Link to="/ai-tools">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-2xl">FIB-4 Index Calculator</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Noninvasive estimate of liver fibrosis using standard blood work
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="lg:col-span-2 border rounded-lg bg-white p-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age (years)</Label>
              <Input
                id="age"
                type="number"
                {...register("age", { valueAsNumber: true })}
              />
              {errors.age && (
                <p className="text-xs text-destructive">Required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="platelets">Platelet Count (× 10⁹/L)</Label>
              <Input
                id="platelets"
                type="number"
                step="1"
                {...register("platelets", { valueAsNumber: true })}
              />
              {errors.platelets && (
                <p className="text-xs text-destructive">Required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ast">AST (U/L)</Label>
              <Input
                id="ast"
                type="number"
                step="0.1"
                {...register("ast", { valueAsNumber: true })}
              />
              {errors.ast && (
                <p className="text-xs text-destructive">Required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="alt">ALT (U/L)</Label>
              <Input
                id="alt"
                type="number"
                step="0.1"
                {...register("alt", { valueAsNumber: true })}
              />
              {errors.alt && (
                <p className="text-xs text-destructive">Required</p>
              )}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full md:w-auto">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Calculating...
              </>
            ) : (
              "Calculate FIB-4"
            )}
          </Button>
        </form>

        <div className="border rounded-lg bg-white p-6 h-fit space-y-4">
          <h2 className="font-heading font-medium">Result</h2>

          {result ? (
            <>
              <div
                className={`rounded-lg p-4 border ${
                  interpretationConfig[result.interpretation].bg
                }`}
              >
                <p className="text-sm text-muted-foreground">FIB-4 Score</p>
                <p
                  className={`text-2xl font-heading font-semibold ${
                    interpretationConfig[result.interpretation].text
                  }`}
                >
                  {result.score}
                </p>
                <p
                  className={`text-sm font-medium mt-1 ${
                    interpretationConfig[result.interpretation].text
                  }`}
                >
                  {interpretationConfig[result.interpretation].label}
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Interpretation</p>
                <p className="text-sm mt-1">
                  {interpretationConfig[result.interpretation].description}
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Score Ranges</p>
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-emerald-600">&lt; 1.45</span>
                    <span>Low fibrosis</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-600">1.45 – 3.25</span>
                    <span>Indeterminate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">&gt; 3.25</span>
                    <span>Advanced fibrosis</span>
                  </div>
                </div>
              </div>

              {result.ageWarning && (
                <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-500/10 rounded-lg p-3">
                  <AlertTriangle className="size-4 mt-0.5 shrink-0" />
                  <span>
                    FIB-4 is less reliable for patients under 35 or over 65 years old.
                  </span>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                FIB-4 Index — validated clinical scoring tool. Source:{" "}
                <a
                  href="https://www.mdcalc.com/calc/2200/fibrosis-4-fib-4-index-liver-fibrosis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  MDCalc
                </a>
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <p className="text-sm">
                Fill in the form and click Calculate to see results
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
