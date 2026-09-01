import { createFileRoute } from "@tanstack/react-router";
import { LiverScanPage } from "@/features/ai-tools/components/LiverScanPage";
import { predictSteatosis } from "@/features/ai-tools/services/prediction";

export const Route = createFileRoute("/_authenticated/ai-tools/liver/steatosis")({
  component: SteatosisPage,
});

function SteatosisPage() {
  return (
    <LiverScanPage
      title="Steatosis Detection"
      description="Upload a liver ultrasound scan to detect steatosis (fatty liver)"
      predictFn={predictSteatosis}
    />
  );
}
