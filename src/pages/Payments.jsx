import React from 'react';

export default function Payments() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Payments Policy</h1>
        <p className="text-slate-600 dark:text-slate-300">Last updated: April 2026</p>
      </div>

      <section className="rounded-2xl border border-blue-200/60 dark:border-blue-800/40 bg-blue-50/60 dark:bg-blue-950/20 p-6">
        <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-3">Payment Timing</h2>
        <p className="text-blue-700 dark:text-blue-200 leading-relaxed">
          Payments are made before customizing items or shipping them to customers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Customizable Products</h2>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
          <li>No return for customizable items.</li>
          <li>No refund for customizable products after being sent to printing.</li>
          <li>Please review all customization details carefully before confirming payment.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Non-Customized Products</h2>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          Return is only accepted for non-customized items, subject to our return eligibility rules and condition checks.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Refund Processing</h2>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          Approved refunds are processed to the original payment method after return inspection. Processing times may vary
          based on your payment provider.
        </p>
      </section>
    </div>
  );
}
