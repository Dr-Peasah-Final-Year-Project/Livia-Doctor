import { createFileRoute } from "@tanstack/react-router";
import { LiverScanPage } from "@/features/ai-tools/components/LiverScanPage";
import { predictAll } from "@/features/ai-tools/services/prediction";

export const Route = createFileRoute("/_authenticated/ai-tools/liver/predict")({
  component: PredictAllPage,
});

function PredictAllPage() {
  return (
    <LiverScanPage
      title="Full Liver Analysis"
      description="Upload a liver ultrasound scan for comprehensive AI analysis"
      predictFn={predictAll}
      showAllResults={true}
    />
  );
}
