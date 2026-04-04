import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
        <p className="text-slate-600 dark:text-slate-300">Last updated: April 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Information We Collect</h2>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
          <li>Account and profile data (name, email, phone, business details).</li>
          <li>Order and payment metadata (excluding full card details).</li>
          <li>Card interactions and analytics (views, scans, clicks).</li>
          <li>Support and contact form submissions.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">How We Use Information</h2>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
          <li>To provide and improve Rawajcard services.</li>
          <li>To process orders and deliver products/services.</li>
          <li>To send important updates related to your account or orders.</li>
          <li>To protect platform security and prevent fraud.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Data Sharing</h2>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          We do not sell personal data. We only share information with trusted service providers when needed
          to operate payments, hosting, analytics, and support.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Data Retention & Rights</h2>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          We retain data only as needed for service delivery, legal compliance, and security. You may request
          access, correction, or deletion of your personal data by contacting support.
        </p>
      </section>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        By using Rawajcard, you agree to this Privacy Policy.
      </p>
    </div>
  );
}
