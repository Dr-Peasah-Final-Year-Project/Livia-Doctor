import { createFileRoute } from "@tanstack/react-router";
import { LiverScanPage } from "@/features/ai-tools/components/LiverScanPage";
import { predictSmcLud } from "@/features/ai-tools/services/prediction";

export const Route = createFileRoute("/_authenticated/ai-tools/liver/smc-lud")({
  component: SmcLudPage,
});

function SmcLudPage() {
  return (
    <LiverScanPage
      title="Liver Lesion/Tumor Detection"
      description="Upload a liver ultrasound scan to detect HCC or Hemangioma"
      predictFn={predictSmcLud}
    />
  );
}
