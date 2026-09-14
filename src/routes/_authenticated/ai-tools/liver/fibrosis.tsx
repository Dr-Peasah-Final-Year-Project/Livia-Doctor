import { createFileRoute } from "@tanstack/react-router";
import { LiverScanPage } from "@/features/ai-tools/components/LiverScanPage";
import { predictFibrosis } from "@/features/ai-tools/services/prediction";

export const Route = createFileRoute("/_authenticated/ai-tools/liver/fibrosis")({
  component: FibrosisPage,
});

function FibrosisPage() {
  return (
    <LiverScanPage
      title="Fibrosis Detection"
      description="Upload a liver ultrasound scan to detect fibrosis stage (F0-F4)"
      predictFn={predictFibrosis}
    />
  );
}
