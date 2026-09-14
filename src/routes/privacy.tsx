import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/">
          <header className="flex items-center gap-1 mb-10">
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
          </header>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Last updated: September 14, 2026
        </p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Livia Health ("we," "our," or "us"). We are committed to protecting your
              personal information and your right to privacy. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you use our web application
              and mobile application (collectively, the "Service").
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              By using the Service, you agree to the collection and use of information in accordance
              with this policy. If you do not agree with the terms of this policy, please do not
              access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
              <li>Account information (name, email address, password)</li>
              <li>Medical and health information you voluntarily provide</li>
              <li>Profile information and preferences</li>
              <li>Communications you send to us (e.g., support requests)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
              <li>Provide, maintain, and improve our Service</li>
              <li>Process and manage your account</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Monitor and analyze trends, usage, and activities in connection with the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. How We Share Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell your personal information. We may share your information only in the
              following circumstances:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
              <li>With your consent or at your direction</li>
              <li>To comply with legal obligations or respond to lawful requests</li>
              <li>To protect the rights, property, or safety of Livia Health, our users, or the public</li>
              <li>In connection with a merger, acquisition, or sale of all or a portion of our assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational measures to protect the security
              of your personal information. However, please be aware that no method of transmission
              over the Internet or method of electronic storage is 100% secure, and we cannot
              guarantee the absolute security of your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Depending on your location, you may have the following rights regarding your personal
              information:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
              <li>Access and receive a copy of your personal data</li>
              <li>Correct inaccurate or incomplete personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to or restrict the processing of your personal data</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our Service is not intended for individuals under the age of 18. We do not knowingly
              collect personal information from children under 18. If we become aware that we have
              collected personal information from a child under 18, we will take steps to delete
              such information promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new policy on this page and updating the "Last updated" date.
              You are advised to review this policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions or concerns about this Privacy Policy, please contact us at{" "}
              <a
                href="mailto:privacy@liviahealth.com"
                className="text-primary hover:underline"
              >
                privacy@liviahealth.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
