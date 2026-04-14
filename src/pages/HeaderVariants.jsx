import React, { useState } from 'react';

const navItems = ['Products', 'Card Samples', 'Solutions', 'How It Works?', 'Pricing'];

const utilityItems = ['Cart', 'Theme', 'EN', 'AR'];

function Brand({ dark = false }) {
  return (
    <div className={`shrink-0 font-black tracking-wide ${dark ? 'text-white' : 'text-slate-900'}`}>
      RAWAJCARD
    </div>
  );
}

function NavPills({ dark = false, compact = false }) {
  return (
    <nav className="flex items-center gap-2 flex-wrap">
      {navItems.map((item) => (
        <span
          key={item}
          className={`shrink-0 rounded-full border px-3 py-1 text-xs md:text-sm whitespace-nowrap ${
            dark
              ? 'border-slate-600 text-slate-200'
              : 'border-slate-300 text-slate-700 bg-white'
          } ${compact ? 'px-2.5 py-1 text-xs' : ''}`}
        >
          {item}
        </span>
      ))}
    </nav>
  );
}

function UtilityChips({ dark = false }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {utilityItems.map((item) => (
        <span
          key={item}
          className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
            dark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
          }`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function CtaPair({ dark = false }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button className="shrink-0 px-3 py-2 rounded-lg bg-teal-600 text-white text-xs md:text-sm whitespace-nowrap">Buy NFC Card</button>
      <button className={`shrink-0 px-3 py-2 rounded-lg text-xs md:text-sm whitespace-nowrap ${dark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}>
        Create Digital Card
      </button>
    </div>
  );
}

function VariantCard({ id, title, selected, onSelect, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">v{id} — {title}</h2>
        <button
          onClick={() => onSelect(id)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selected
              ? 'bg-teal-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'
          }`}
        >
          {selected ? 'Selected' : 'Select this'}
        </button>
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

export default function HeaderVariants() {
  const [selectedVersion, setSelectedVersion] = useState(1);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 px-4 py-8 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Temporary Header Lab</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            10 new no-shrink variants (all header items fit using wrap/stack/scroll). Current pick: <span className="font-semibold text-teal-600 dark:text-teal-400">Version {selectedVersion}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <VariantCard id={1} title="Two Rows Balanced" selected={selectedVersion === 1} onSelect={setSelectedVersion}>
            <header className="rounded-xl bg-white border border-slate-200 p-3 space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <Brand />
                <UtilityChips />
              </div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <NavPills />
                <CtaPair />
              </div>
            </header>
          </VariantCard>

          <VariantCard id={2} title="Three Zone Grid" selected={selectedVersion === 2} onSelect={setSelectedVersion}>
            <header className="rounded-xl bg-white border border-slate-200 p-3 grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-3 items-center">
              <Brand />
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  <NavPills compact />
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap justify-start lg:justify-end">
                <UtilityChips />
                <CtaPair />
              </div>
            </header>
          </VariantCard>

          <VariantCard id={3} title="Dark Stacked Pro" selected={selectedVersion === 3} onSelect={setSelectedVersion}>
            <header className="rounded-xl bg-slate-950 border border-slate-800 p-3 space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <Brand dark />
                <UtilityChips dark />
              </div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <NavPills dark />
                <CtaPair dark />
              </div>
            </header>
          </VariantCard>

          <VariantCard id={4} title="Announcement + Main" selected={selectedVersion === 4} onSelect={setSelectedVersion}>
            <header className="rounded-xl overflow-hidden border border-slate-200 bg-white">
              <div className="px-3 py-2 bg-slate-900 text-white text-xs">Free shipping for NFC orders this week</div>
              <div className="p-3 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <Brand />
                  <div className="flex items-center gap-3 flex-wrap">
                    <UtilityChips />
                    <CtaPair />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-max">
                    <NavPills />
                  </div>
                </div>
              </div>
            </header>
          </VariantCard>

          <VariantCard id={5} title="Pill Navigation Rail" selected={selectedVersion === 5} onSelect={setSelectedVersion}>
            <header className="rounded-xl bg-white border border-slate-200 p-3 space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <Brand />
                <CtaPair />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="rounded-2xl bg-slate-100 p-2 flex-1 min-w-[260px] overflow-x-auto">
                  <div className="min-w-max">
                    <NavPills compact />
                  </div>
                </div>
                <UtilityChips />
              </div>
            </header>
          </VariantCard>

          <VariantCard id={6} title="Compact No-Shrink Strip" selected={selectedVersion === 6} onSelect={setSelectedVersion}>
            <header className="rounded-xl bg-white border border-slate-200 p-3">
              <div className="flex items-center gap-3 overflow-x-auto">
                <div className="shrink-0"><Brand /></div>
                <div className="shrink-0"><NavPills compact /></div>
                <div className="shrink-0"><UtilityChips /></div>
                <div className="shrink-0"><CtaPair /></div>
              </div>
            </header>
          </VariantCard>

          <VariantCard id={7} title="Bold Marketing 2-Tier" selected={selectedVersion === 7} onSelect={setSelectedVersion}>
            <header className="rounded-xl p-3 bg-gradient-to-r from-slate-900 to-slate-700 text-white space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="shrink-0">
                  <div className="font-bold">Rawajcard</div>
                  <div className="text-xs text-slate-300">Tap • Share • Connect</div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <UtilityChips dark />
                  <CtaPair dark />
                </div>
              </div>
              <div className="rounded-xl bg-white/10 p-2 overflow-x-auto">
                <div className="min-w-max">
                  <NavPills dark />
                </div>
              </div>
            </header>
          </VariantCard>

          <VariantCard id={8} title="RTL Wide Layout" selected={selectedVersion === 8} onSelect={setSelectedVersion}>
            <header dir="rtl" className="rounded-xl bg-white border border-slate-200 p-3 space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="font-black text-slate-900 shrink-0">رواج كارد</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {['السلة', 'الثيم', 'EN', 'AR'].map((item) => (
                    <span key={item} className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 whitespace-nowrap">{item}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <nav className="flex items-center gap-2 flex-wrap">
                  {['المنتجات', 'نماذج البطاقات', 'الحلول', 'كيف يعمل؟', 'الأسعار'].map((item) => (
                    <span key={item} className="shrink-0 rounded-full border border-slate-300 px-3 py-1 text-xs md:text-sm whitespace-nowrap bg-white text-slate-700">{item}</span>
                  ))}
                </nav>
                <div className="flex items-center gap-2 flex-wrap">
                  <button className="shrink-0 px-3 py-2 rounded-lg bg-teal-600 text-white text-xs md:text-sm whitespace-nowrap">اشتر بطاقة NFC</button>
                  <button className="shrink-0 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs md:text-sm whitespace-nowrap">أنشئ بطاقة رقمية</button>
                </div>
              </div>
            </header>
          </VariantCard>

          <VariantCard id={9} title="Soft Neon Full Fit" selected={selectedVersion === 9} onSelect={setSelectedVersion}>
            <header className="rounded-xl bg-slate-900 border border-teal-400/30 shadow-[0_0_30px_rgba(45,212,191,0.15)] p-3 space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <Brand dark />
                <UtilityChips dark />
              </div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="rounded-xl bg-slate-800 p-2 overflow-x-auto">
                  <div className="min-w-max">
                    <NavPills dark compact />
                  </div>
                </div>
                <CtaPair dark />
              </div>
            </header>
          </VariantCard>

          <VariantCard id={10} title="Centered Brand + Dual Rows" selected={selectedVersion === 10} onSelect={setSelectedVersion}>
            <header className="rounded-xl border border-slate-200 bg-white p-3 space-y-3">
              <div className="text-center font-black text-xl text-slate-900">RAWAJCARD</div>
              <div className="flex items-center justify-center">
                <div className="overflow-x-auto max-w-full">
                  <div className="min-w-max">
                    <NavPills />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <UtilityChips />
                <CtaPair />
              </div>
            </header>
          </VariantCard>
        </div>
      </div>
    </div>
  );
}
