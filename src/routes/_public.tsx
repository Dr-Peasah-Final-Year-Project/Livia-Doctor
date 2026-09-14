import { Button } from "@/components/ui/button";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowRight, BrainCircuit, Calendar, Shield, Smartphone, Users } from "lucide-react";

export const Route = createFileRoute("/_public")({
  component: HomePage,
});

function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <Link to="/">
          <div className="flex items-center gap-1">

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 28 28"
              className="text-primary"
            >
              <path
                fill="currentColor"
                d="M10.75 2.998A1.75 1.75 0 0 0 9 4.748V9H4.75A1.75 1.75 0 0 0 3 10.75v6.5c0 .966.784 1.75 1.75 1.75H9v4.251c0 .967.784 1.75 1.75 1.75h6.5a1.75 1.75 0 0 0 1.75-1.75V19h4.25A1.75 1.75 0 0 0 25 17.25v-6.5A1.75 1.75 0 0 0 23.25 9H19V4.748a1.75 1.75 0 0 0-1.75-1.75z"
              />
            </svg>
            <h1 className="text-xl font-bold text-primary">Livia Health</h1>
          </div>
        </Link>
        <Button onClick={() => router.navigate({ to: "/sign-in" })}>
          Doctor sign in
        </Button>
      </header >

      <section className="px-6 py-24 max-w-5xl mx-auto text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Smarter healthcare,{" "}
          <span className="text-primary">better outcomes</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Livia Health connects doctors and patients through AI-powered diagnostics,
          appointment scheduling, and comprehensive health records.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button size="lg" onClick={() => router.navigate({ to: "/sign-in" })}>
            Doctor dashboard
            <ArrowRight className="size-4 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.open("https://github.com/Dr-Peasah-Final-Year-Project/Livia-Health", "_blank")}
          >
            <Smartphone className="size-4 mr-2" />
            Get the app
          </Button>
        </div>
      </section>

      <section className="px-6 py-20 border-t">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">
            For doctors
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={Users}
              title="Patient Records"
              description="Access patient details, visit history, and appointment records from a single dashboard."
            />
            <FeatureCard
              icon={Calendar}
              title="Appointment Management"
              description="Track appointments with real-time status updates, notes, and analytics charts."
            />
            <FeatureCard
              icon={BrainCircuit}
              title="AI Liver Analysis"
              description="Upload liver ultrasound scans for instant AI-powered steatosis, fibrosis, and lesion detection."
            />
            <FeatureCard
              icon={Shield}
              title="Secure & Private"
              description="Your data is protected with industry-standard encryption and privacy controls."
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-20 border-t bg-muted/30">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center size-14 rounded-full bg-primary/10">
            <Smartphone className="size-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">For patients</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Download the Livia Health app to book appointments, view your health records,
            and stay connected with your doctor.
          </p>
          <Button
            size="lg"
            onClick={() => window.open("https://github.com/Dr-Peasah-Final-Year-Project/Livia-Health", "_blank")}
          >
            <Smartphone className="size-4 mr-2" />
            Get the app
          </Button>
        </div>
      </section>

      <footer className="px-6 py-8 border-t text-center text-sm text-muted-foreground">
        <p>&copy; 2026 Livia Health. All rights reserved.</p>
      </footer>
    </div >
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3">
      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="size-5 text-primary" />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
