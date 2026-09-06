import Link from 'next/link';
import AppShell from '@/components/AppShell';

export default function PrivacyPage() {
  return (
    <AppShell>
      <div className="min-h-screen bg-[#FFF8F0] p-6 pb-20 md:p-12 relative overflow-hidden">
        {/* Background blobs for visual interest */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-coral/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-golden/5 rounded-full blur-3xl -z-10 -translate-x-1/4 translate-y-1/4" />

        <div className="max-w-3xl mx-auto relative z-10">
          <Link href="/settings" className="inline-flex items-center text-sm font-medium text-coral hover:text-coral/80 transition-colors mb-8" style={{ fontFamily: 'var(--font-body)' }}>
            ← Back to Settings
          </Link>

          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-near-black mb-4" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
              Privacy Policy
            </h1>
            <p className="text-near-black/60 text-sm md:text-base" style={{ fontFamily: 'var(--font-body)' }}>
              Last updated: March 2026
            </p>
          </header>

          <div className="prose prose-stone prose-lg max-w-none text-near-black/80" style={{ fontFamily: 'var(--font-body)', lineHeight: '1.8' }}>
            <p className="lead text-lg mb-8">
              Your privacy is fundamental to how we build Capy. Our business model is based on subscriptions, not selling your data or showing you ads. Here is exactly how we handle your information.
            </p>

            <section className="mb-10 bg-white/40 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-near-black/5" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <h2 className="text-2xl font-bold text-near-black mb-4" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                1. Information We Collect
              </h2>
              <p className="mb-4">We only collect what&apos;s necessary to provide the Capy service:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Your email address and basic profile information via Firebase Auth.</li>
                <li><strong>Session Data:</strong> The context text, study duration, and proof/context images you upload during a timer session.</li>
                <li><strong>App State:</strong> Your capybara&apos;s XP, level, inventory items, and local preferences (like sound settings).</li>
                <li><strong>Quiz Answers:</strong> Your responses during the onboarding personality quiz to assign your specific capy color.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-near-black mb-4" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                2. How We Use Your Data
              </h2>
              <p className="mb-4">Your data is used strictly to make the app work:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>To maintain your account and save your progress across devices.</li>
                <li>To evaluate your study proof using AI and accurately award XP.</li>
                <li>To provide customer support and troubleshoot issues.</li>
              </ul>
              <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200 text-green-800">
                <p className="font-semibold mb-1">What we DON&apos;T do:</p>
                <p className="text-sm">We do not sell your data to data brokers. We do not use your data to serve targeted advertisements.</p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-near-black mb-4" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                3. AI Processing & Data Sharing
              </h2>
              <p className="mb-4">
                The core magic of Capy requires sending your proof images and context text to Anthropic (the makers of the Claude AI model).
              </p>
              <p className="mb-4">
                <strong>Crucially: Anthropic does not use your images or text to train their fundamental AI models.</strong> Your data is processed ephemerally to generate an evaluation and then discarded from their active memory according to their API terms.
              </p>
              <p>
                Beyond Anthropic, we only share data with Firebase (Google) which hosts our databases and authentication systems.
              </p>
            </section>

            <section className="mb-10 bg-white/40 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-near-black/5" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <h2 className="text-2xl font-bold text-near-black mb-4" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                4. Data Storage & Local Data
              </h2>
              <p className="mb-4">
                Your core state is saved in the cloud via Firebase Firestore. However, we also use local browser storage for performance and privacy:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>localStorage:</strong> Used for non-sensitive preferences like your `capy_preferences` (sound toggles) and authentication tokens.</li>
                <li><strong>sessionStorage:</strong> Used to temporarily hold proof images and timer state during an active study session. This data is cleared when the tab is closed.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-near-black mb-4" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                5. Your Rights
              </h2>
              <p>
                You have the right to access, export, and delete your data at any time. You can delete your account and all associated data directly from the Data & Privacy section of the Settings page. This action is irreversible and immediately wipes your account from our Firestore database.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-near-black mb-4" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                6. Contact Us
              </h2>
              <p>
                For any privacy-related inquiries or data export requests, please email us at <a href="mailto:privacy@capyapp.com" className="text-coral hover:underline">privacy@capyapp.com</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
