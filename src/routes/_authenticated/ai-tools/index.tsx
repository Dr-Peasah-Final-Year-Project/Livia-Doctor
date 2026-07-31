import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanLine, ClipboardCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/ai-tools/")({
  component: AIToolsPage,
});

const tools = [
  {
    title: "Fatty Liver Detector",
    description:
      "Upload a liver ultrasound scan to detect fatty liver using our AI model.",
    icon: ScanLine,
    to: "/ai-tools/fatty-liver-scan",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "FIB-4 Index Calculator",
    description:
      "Noninvasive estimate of liver fibrosis using age, AST, ALT, and platelet count.",
    icon: ClipboardCheck,
    to: "/ai-tools/fatty-liver-assessment",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
];

function AIToolsPage() {
  return (
    <div className="py-10 px-8 space-y-6 bg-accent min-h-full">
      <div>
        <h1 className="font-heading text-2xl">AI Tools</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          AI-powered diagnostic assistance tools
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.to} to={tool.to}>
              <div className="border rounded-lg bg-white p-6 hover:shadow-sm transition-shadow cursor-pointer h-full">
                <div className={`inline-flex items-center justify-center rounded-lg p-3 ${tool.bgColor} mb-4`}>
                  <Icon className={`size-6 ${tool.color}`} />
                </div>
                <h2 className="font-heading text-lg font-medium">
                  {tool.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {tool.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
