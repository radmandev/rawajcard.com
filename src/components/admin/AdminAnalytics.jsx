import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import {
  Users,
  Eye,
  TrendingUp,
  TrendingDown,
  MousePointerClick,
  Clock,
  ShoppingCart,
  CreditCard,
  Repeat,
  Zap,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  ArrowRight,
  ArrowLeft,
  Download,
  AlertTriangle,
  CheckCircle,
  BarChart2,
  Activity,
  Home,
  LayoutDashboard,
  Calendar,
  ChevronDown,
  Info,
} from 'lucide-react';
import { subDays, format } from 'date-fns';
import { motion } from 'framer-motion';

// ─── helpers ────────────────────────────────────────────────────────────────
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const buildSeries = (days, base, variance) =>
  Array.from({ length: days }, (_, i) => ({
    date: format(subDays(new Date(), days - 1 - i), 'MMM d'),
    value: base + rand(-variance, variance),
    prev: base * 0.85 + rand(-variance * 0.8, variance * 0.8),
  }));

const buildDualSeries = (days, base1, base2, variance) =>
  Array.from({ length: days }, (_, i) => ({
    date: format(subDays(new Date(), days - 1 - i), 'MMM d'),
    current: base1 + rand(-variance, variance),
    previous: base2 + rand(-variance * 0.7, variance * 0.7),
  }));

// ─── dummy data generators ───────────────────────────────────────────────────
const generateData = (days) => ({
  // Home page metrics
  homeVisits: buildDualSeries(days, 1200, 950, 300),
  homeBounceRate: 38 + rand(-5, 5),
  homeAvgTime: '2m 34s',
  homeUniqueVisitors: rand(600, 900),
  homeTotalVisits: rand(1100, 1500),

  clicksByElement: [
    { name: 'Hero CTA', clicks: rand(340, 520) },
    { name: 'Pricing', clicks: rand(210, 380) },
    { name: 'Demo Button', clicks: rand(180, 290) },
    { name: 'Login Link', clicks: rand(150, 240) },
    { name: 'Features', clicks: rand(90, 160) },
    { name: 'Footer Links', clicks: rand(50, 100) },
  ],

  scrollDepth: [
    { section: '0-25%', users: rand(900, 1200) },
    { section: '25-50%', users: rand(650, 900) },
    { section: '50-75%', users: rand(400, 600) },
    { section: '75-100%', users: rand(200, 380) },
  ],

  conversionFunnel: [
    { name: 'Page Visits', value: rand(1100, 1500), fill: '#0D7377' },
    { name: 'Signups', value: rand(320, 480), fill: '#14B8A6' },
    { name: 'Add to Cart', value: rand(180, 280), fill: '#22D3EE' },
    { name: 'Checkout', value: rand(100, 160), fill: '#38BDF8' },
    { name: 'Purchased', value: rand(55, 95), fill: '#7DD3FC' },
  ],

  heatmap: Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 12 }, (_, col) => ({
      row,
      col,
      intensity: Math.random(),
    }))
  ).flat(),

  // Dashboard metrics
  dashSessions: buildDualSeries(days, 420, 340, 90),
  dashActiveUsers: rand(180, 280),
  dashAvgSession: '4m 12s',
  dashTotalSessions: rand(1800, 2600),

  dashClicksByFeature: [
    { name: 'Card Builder', clicks: rand(280, 420) },
    { name: 'My Cards', clicks: rand(240, 380) },
    { name: 'Analytics', clicks: rand(180, 290) },
    { name: 'Settings', clicks: rand(120, 200) },
    { name: 'Upgrade Btn', clicks: rand(90, 160) },
    { name: 'Share Card', clicks: rand(70, 130) },
    { name: 'Team Mgmt', clicks: rand(40, 90) },
  ],

  cardsCreated: buildSeries(days, 28, 12),
  upgradesOverTime: buildSeries(days, 8, 4),
  cardsTotal: rand(220, 340),
  upgradesTotal: rand(55, 95),
  upgradesBtnClicks: rand(280, 420),

  // Advanced
  onlineNow: rand(12, 38),
  returningUsers: rand(52, 68),

  userJourneys: [
    { path: 'Home → Signup → Purchase', users: rand(55, 90), pct: rand(18, 28) },
    { path: 'Home → Pricing → Signup', users: rand(80, 130), pct: rand(25, 38) },
    { path: 'Home → Demo → Signup', users: rand(40, 70), pct: rand(12, 20) },
    { path: 'Direct → Dashboard', users: rand(30, 55), pct: rand(9, 16) },
  ],

  devices: [
    { device: 'Mobile', pct: rand(48, 58), icon: 'mobile' },
    { device: 'Desktop', pct: rand(30, 40), icon: 'desktop' },
    { device: 'Tablet', pct: rand(5, 12), icon: 'tablet' },
  ],

  trafficSources: [
    { source: 'Organic Search', value: rand(32, 42) },
    { source: 'Direct', value: rand(20, 30) },
    { source: 'Social Media', value: rand(16, 26) },
    { source: 'Referral', value: rand(8, 14) },
    { source: 'Paid Ads', value: rand(6, 12) },
  ],

  topEvents: [
    { event: 'card_created', page: 'Dashboard', count: rand(280, 360), trend: 'up' },
    { event: 'signup', page: 'Home', count: rand(180, 260), trend: 'up' },
    { event: 'upgrade_click', page: 'Dashboard', count: rand(160, 220), trend: 'up' },
    { event: 'add_to_cart', page: 'Home', count: rand(120, 180), trend: 'down' },
    { event: 'checkout', page: 'Home', count: rand(90, 140), trend: 'neutral' },
    { event: 'purchase', page: 'Checkout', count: rand(55, 90), trend: 'up' },
    { event: 'qr_scan', page: 'Public', count: rand(380, 520), trend: 'up' },
    { event: 'share_card', page: 'Dashboard', count: rand(200, 320), trend: 'neutral' },
  ],
});

// ─── subcomponents ───────────────────────────────────────────────────────────

const TEAL = '#0D7377';
const CYAN = '#14B8A6';
const LIGHT = '#e0f2f1';

function StatCard({ icon: Icon, label, value, sub = null, trend = null, trendVal = null, color = TEAL }) {
  const isUp = trend === 'up';
  const isDown = trend === 'down';
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white truncate">{value}</p>
              {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: LIGHT }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
          </div>
          {(isUp || isDown) && (
            <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{trendVal}</span>
              <span className="text-slate-400 font-normal">vs last period</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: LIGHT }}>
        <Icon className="w-5 h-5" style={{ color: TEAL }} />
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-800 dark:text-white">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

function DateRangeSelector({ value, onChange, isRTL }) {
  const options = [
    { value: '1', label: isRTL ? 'اليوم' : 'Today' },
    { value: '7', label: isRTL ? '7 أيام' : '7 Days' },
    { value: '30', label: isRTL ? '30 يوم' : '30 Days' },
    { value: '90', label: isRTL ? '90 يوم' : '90 Days' },
  ];
  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            value === o.value
              ? 'bg-white dark:bg-slate-700 text-teal-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function AlertBanner({ type = 'warning', message }) {
  const isWarning = type === 'warning';
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-start gap-3 p-4 rounded-2xl border ${
        isWarning
          ? 'bg-amber-50 border-amber-200 text-amber-800'
          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
      }`}
    >
      {isWarning ? <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
      <p className="text-sm font-medium">{message}</p>
    </motion.div>
  );
}

function RealTimeBar({ count, isRTL }) {
  return (
    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
      </span>
      <span className="text-sm font-semibold text-emerald-700">
        {count}
      </span>
      <span className="text-xs text-emerald-600">
        {isRTL ? 'مستخدم متصل الآن' : 'users online now'}
      </span>
    </div>
  );
}

function HeatmapGrid({ data, isRTL }) {
  const maxIntensity = Math.max(...data.map((d) => d.intensity));
  const hours = isRTL
    ? ['12م', '2م', '4م', '6م', '8م', '10م', '12ص', '2ص', '4ص', '6ص', '8ص', '10ص']
    : ['12p', '2p', '4p', '6p', '8p', '10p', '12a', '2a', '4a', '6a', '8a', '10a'];
  const days = isRTL
    ? ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت', 'أحد']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 mb-1 ms-8">
        {hours.map((h) => (
          <div key={h} className="flex-1 text-center text-[9px] text-slate-400 min-w-[24px]">{h}</div>
        ))}
      </div>
      {days.map((day, row) => (
        <div key={row} className="flex items-center gap-1 mb-1">
          <div className="w-7 text-[10px] text-slate-400 text-right flex-shrink-0">{day}</div>
          {hours.map((_, col) => {
            const cell = data.find((d) => d.row === row && d.col === col);
            const pct = cell ? cell.intensity / maxIntensity : 0;
            const opacity = 0.08 + pct * 0.92;
            return (
              <TooltipProvider key={col}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="flex-1 min-w-[24px] h-6 rounded cursor-pointer transition-all hover:scale-110"
                      style={{ background: TEAL, opacity }}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">{Math.round(pct * 100)}% activity</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      ))}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[10px] text-slate-400">{isRTL ? 'أقل' : 'Less'}</span>
        {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
          <div key={v} className="w-3 h-3 rounded-sm" style={{ background: TEAL, opacity: v }} />
        ))}
        <span className="text-[10px] text-slate-400">{isRTL ? 'أكثر' : 'More'}</span>
      </div>
    </div>
  );
}

function ConversionFunnelViz({ data, isRTL }) {
  const max = data[0]?.value || 1;
  return (
    <div className="space-y-2">
      {data.map((item, i) => {
        const pct = Math.round((item.value / max) * 100);
        const convRate = i > 0 ? Math.round((item.value / data[i - 1].value) * 100) : 100;
        return (
          <div key={item.name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 w-4">{i + 1}</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                {i > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {convRate}% {isRTL ? 'تحويل' : 'conv'}
                  </Badge>
                )}
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-white">
                {item.value.toLocaleString()}
              </span>
            </div>
            <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
              <motion.div
                className="h-full rounded-lg flex items-center px-2"
                style={{ background: item.fill, width: `${pct}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EventTable({ events, isRTL }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-700">
            <th className={`py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? 'الحدث' : 'Event'}
            </th>
            <th className={`py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? 'الصفحة' : 'Page'}
            </th>
            <th className={`py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right`}>
              {isRTL ? 'العدد' : 'Count'}
            </th>
            <th className={`py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right`}>
              {isRTL ? 'الاتجاه' : 'Trend'}
            </th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <motion.tr
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <td className="py-3 px-3">
                <code className="text-xs bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded-md">
                  {e.event}
                </code>
              </td>
              <td className="py-3 px-3 text-slate-500 text-xs">{e.page}</td>
              <td className="py-3 px-3 text-right font-semibold text-slate-800 dark:text-white">
                {e.count.toLocaleString()}
              </td>
              <td className="py-3 px-3 text-right">
                {e.trend === 'up' && <span className="text-emerald-600 text-xs font-medium flex items-center justify-end gap-0.5"><TrendingUp className="w-3 h-3" /> Up</span>}
                {e.trend === 'down' && <span className="text-red-500 text-xs font-medium flex items-center justify-end gap-0.5"><TrendingDown className="w-3 h-3" /> Down</span>}
                {e.trend === 'neutral' && <span className="text-slate-400 text-xs">—</span>}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DeviceBreakdown({ devices, isRTL }) {
  const icons = { mobile: Smartphone, desktop: Monitor, tablet: Tablet };
  return (
    <div className="space-y-3">
      {devices.map((d) => {
        const Icon = icons[d.icon];
        return (
          <div key={d.device} className="flex items-center gap-3">
            <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{d.device}</span>
                <span className="text-xs font-bold text-slate-800 dark:text-white">{d.pct}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: TEAL }}
                  initial={{ width: 0 }}
                  animate={{ width: `${d.pct}%` }}
                  transition={{ duration: 0.7 }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TrafficSources({ sources, isRTL }) {
  const total = sources.reduce((a, b) => a + b.value, 0);
  const COLORS = ['#0D7377', '#14B8A6', '#22D3EE', '#38BDF8', '#7DD3FC'];
  return (
    <div className="space-y-3">
      {sources.map((s, i) => (
        <div key={s.source} className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{s.source}</span>
              <span className="text-xs font-bold text-slate-800 dark:text-white">{s.value}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: COLORS[i] }}
                initial={{ width: 0 }}
                animate={{ width: `${s.value}%` }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function UserJourneys({ journeys, isRTL }) {
  return (
    <div className="space-y-3">
      {journeys.map((j, i) => (
        <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{j.path}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{j.users.toLocaleString()} {isRTL ? 'مستخدم' : 'users'}</p>
          </div>
          <Badge variant="outline" className="flex-shrink-0 text-xs" style={{ background: LIGHT, color: TEAL }}>
            {j.pct}%
          </Badge>
        </div>
      ))}
    </div>
  );
}

function ComparisonChart({ data, isRTL }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradCurrent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={TEAL} stopOpacity={0.25} />
            <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradPrev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#94A3B8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
        <ReTooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.1)' }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Area type="monotone" dataKey="current" name={isRTL ? 'الفترة الحالية' : 'Current'} stroke={TEAL} fill="url(#gradCurrent)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="previous" name={isRTL ? 'الفترة السابقة' : 'Previous'} stroke="#94A3B8" fill="url(#gradPrev)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function SimpleLineChart({ data, color = TEAL }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad_${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} />
        <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
        <ReTooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.08)' }} />
        <Area type="monotone" dataKey="value" stroke={color} fill={`url(#grad_${color})`} strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function HBarChart({ data, dataKey = 'clicks', nameKey = 'name' }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 38)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
        <YAxis type="category" dataKey={nameKey} tick={{ fontSize: 11, fill: '#64748b' }} width={100} />
        <ReTooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.08)' }} />
        <Bar dataKey={dataKey} radius={[0, 6, 6, 0]} fill={TEAL}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? TEAL : CYAN} fillOpacity={1 - i * 0.08} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function ExportButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors border border-teal-200"
    >
      <Download className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

const exportCSV = (data, filename) => {
  if (!data?.length) return;
  const keys = Object.keys(data[0]);
  const csv = [keys.join(','), ...data.map((r) => keys.map((k) => r[k]).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminAnalytics() {
  const { isRTL } = useLanguage();
  const [days, setDays] = useState('30');
  const [activeTab, setActiveTab] = useState('home');
  const [segment, setSegment] = useState('all');

  const data = useMemo(() => generateData(parseInt(days)), [days]);

  const txt = {
    title: isRTL ? 'تحليلات المسؤول' : 'Admin Analytics',
    sub: isRTL ? 'تتبع سلوك المستخدمين والتحويلات' : 'Track user behavior, engagement & conversions',
    homeTab: isRTL ? 'الصفحة الرئيسية' : 'Home Page',
    dashTab: isRTL ? 'لوحة التحكم' : 'Dashboard',
    advTab: isRTL ? 'متقدم' : 'Advanced',
    visits: isRTL ? 'الزيارات الإجمالية' : 'Total Visits',
    unique: isRTL ? 'الزوار الفريدون' : 'Unique Visitors',
    avgTime: isRTL ? 'متوسط الوقت' : 'Avg. Time on Page',
    bounce: isRTL ? 'معدل الارتداد' : 'Bounce Rate',
    clicksEl: isRTL ? 'النقرات حسب العنصر' : 'Clicks by Element',
    scroll: isRTL ? 'عمق التمرير' : 'Scroll Depth',
    funnel: isRTL ? 'قمع التحويل' : 'Conversion Funnel',
    heatmap: isRTL ? 'خريطة الحرارة' : 'Interaction Heatmap',
    visitsTime: isRTL ? 'الزيارات عبر الزمن' : 'Visits Over Time',
    sessions: isRTL ? 'الجلسات الإجمالية' : 'Total Sessions',
    active: isRTL ? 'المستخدمون النشطون' : 'Active Users',
    avgSession: isRTL ? 'متوسط الجلسة' : 'Avg. Session',
    dashClicks: isRTL ? 'النقرات حسب الميزة' : 'Clicks by Feature',
    dashHeat: isRTL ? 'خريطة حرارة اللوحة' : 'Dashboard Heatmap',
    topEvents: isRTL ? 'أهم الأحداث' : 'Top Events',
    cardsChart: isRTL ? 'البطاقات المنشأة' : 'Cards Created',
    upgradesChart: isRTL ? 'الترقيات' : 'Upgrades',
    onlineNow: isRTL ? 'متصل الآن' : 'Online Now',
    journeys: isRTL ? 'أبرز مسارات المستخدمين' : 'Top User Journeys',
    devices: isRTL ? 'الأجهزة والمتصفحات' : 'Devices & Browsers',
    traffic: isRTL ? 'مصادر الزيارات' : 'Traffic Sources',
    retention: isRTL ? 'معدل العودة' : 'Returning Users',
    exportEvents: isRTL ? 'تصدير الأحداث' : 'Export Events',
    exportFunnel: isRTL ? 'تصدير القمع' : 'Export Funnel',
    alertConv: isRTL ? '⚠️ انخفض معدل الإضافة إلى السلة بنسبة 12% هذا الأسبوع' : '⚠️ Add-to-cart rate dropped 12% this week — review CTA placement.',
    good: isRTL ? '✅ معدل التحويل إلى الشراء أعلى من المعتاد هذا الشهر' : '✅ Purchase conversion is above average this month — great job!',
    segment: isRTL ? 'الشريحة' : 'Segment',
    allUsers: isRTL ? 'جميع المستخدمين' : 'All Users',
    newUsers: isRTL ? 'مستخدمون جدد' : 'New Users',
    returning: isRTL ? 'عائدون' : 'Returning',
    premium: isRTL ? 'مدفوعون' : 'Premium',
    sessionsTime: isRTL ? 'الجلسات عبر الزمن' : 'Sessions Over Time',
    upgradesBtnClicks: isRTL ? 'نقرات زر الترقية' : 'Upgrade Btn Clicks',
    cardsCreated: isRTL ? 'بطاقات منشأة' : 'Cards Created',
    upgrades: isRTL ? 'ترقيات' : 'Upgrades',
  };

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-6 h-6" style={{ color: TEAL }} />
              {txt.title}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">{txt.sub}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <RealTimeBar count={data.onlineNow} isRTL={isRTL} />
            <DateRangeSelector value={days} onChange={setDays} isRTL={isRTL} />
            {/* Segment filter */}
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              <option value="all">{txt.allUsers}</option>
              <option value="new">{txt.newUsers}</option>
              <option value="returning">{txt.returning}</option>
              <option value="premium">{txt.premium}</option>
            </select>
          </div>
        </div>

        {/* ── Alert banners ── */}
        <div className="grid gap-3 sm:grid-cols-2">
          <AlertBanner type="warning" message={txt.alertConv} />
          <AlertBanner type="success" message={txt.good} />
        </div>

        {/* ── Tabs ── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
            <TabsTrigger value="home" className="rounded-xl flex items-center gap-1.5 text-xs">
              <Home className="w-3.5 h-3.5" />{txt.homeTab}
            </TabsTrigger>
            <TabsTrigger value="dash" className="rounded-xl flex items-center gap-1.5 text-xs">
              <LayoutDashboard className="w-3.5 h-3.5" />{txt.dashTab}
            </TabsTrigger>
            <TabsTrigger value="advanced" className="rounded-xl flex items-center gap-1.5 text-xs">
              <Activity className="w-3.5 h-3.5" />{txt.advTab}
            </TabsTrigger>
          </TabsList>

          {/* ════════════════════════════════════════════════════════
              HOME PAGE ANALYTICS
          ═════════════════════════════════════════════════════════ */}
          <TabsContent value="home" className="space-y-6 mt-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Eye} label={txt.visits} value={data.homeTotalVisits.toLocaleString()} trend="up" trendVal="+14%" color={TEAL} />
              <StatCard icon={Users} label={txt.unique} value={data.homeUniqueVisitors.toLocaleString()} trend="up" trendVal="+9%" color={CYAN} />
              <StatCard icon={Clock} label={txt.avgTime} value={data.homeAvgTime} sub={isRTL ? 'لكل زيارة' : 'per visit'} color={TEAL} />
              <StatCard icon={TrendingDown} label={txt.bounce} value={`${data.homeBounceRate}%`} trend="down" trendVal="-3%" color="#F59E0B" />
            </div>

            {/* Visits over time (comparison) */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-700">{txt.visitsTime}</CardTitle>
                  <ExportButton label={isRTL ? 'تصدير' : 'Export'} onClick={() => exportCSV(data.homeVisits, 'visits.csv')} />
                </div>
              </CardHeader>
              <CardContent><ComparisonChart data={data.homeVisits} isRTL={isRTL} /></CardContent>
            </Card>

            {/* Funnel + Clicks by element */}
            <div className="grid lg:grid-cols-2 gap-4">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-slate-700">{txt.funnel}</CardTitle>
                    <ExportButton label={txt.exportFunnel} onClick={() => exportCSV(data.conversionFunnel, 'funnel.csv')} />
                  </div>
                </CardHeader>
                <CardContent><ConversionFunnelViz data={data.conversionFunnel} isRTL={isRTL} /></CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700">{txt.clicksEl}</CardTitle>
                </CardHeader>
                <CardContent><HBarChart data={data.clicksByElement} /></CardContent>
              </Card>
            </div>

            {/* Heatmap + Scroll depth */}
            <div className="grid lg:grid-cols-2 gap-4">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700">{txt.heatmap}</CardTitle>
                </CardHeader>
                <CardContent><HeatmapGrid data={data.heatmap} isRTL={isRTL} /></CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700">{txt.scroll}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.scrollDepth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="section" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <ReTooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: 'none' }} />
                      <Bar dataKey="users" radius={[6, 6, 0, 0]} fill={TEAL}>
                        {data.scrollDepth.map((_, i) => <Cell key={i} fill={TEAL} fillOpacity={1 - i * 0.2} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════
              DASHBOARD ANALYTICS
          ═════════════════════════════════════════════════════════ */}
          <TabsContent value="dash" className="space-y-6 mt-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Activity} label={txt.sessions} value={data.dashTotalSessions.toLocaleString()} trend="up" trendVal="+11%" />
              <StatCard icon={Users} label={txt.active} value={data.dashActiveUsers.toLocaleString()} trend="up" trendVal="+7%" color={CYAN} />
              <StatCard icon={Clock} label={txt.avgSession} value={data.dashAvgSession} color={TEAL} />
              <StatCard icon={Zap} label={txt.upgradesBtnClicks} value={data.upgradesBtnClicks.toLocaleString()} trend="up" trendVal="+19%" color="#8B5CF6" />
            </div>

            {/* Sessions over time */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700">{txt.sessionsTime}</CardTitle>
              </CardHeader>
              <CardContent><ComparisonChart data={data.dashSessions} isRTL={isRTL} /></CardContent>
            </Card>

            {/* Cards created + Upgrades */}
            <div className="grid lg:grid-cols-2 gap-4">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-slate-700">
                      {txt.cardsChart}
                      <Badge variant="outline" className="ms-2 text-[10px]" style={{ background: LIGHT, color: TEAL }}>{data.cardsTotal}</Badge>
                    </CardTitle>
                    <ExportButton label={isRTL ? 'تصدير' : 'Export'} onClick={() => exportCSV(data.cardsCreated, 'cards.csv')} />
                  </div>
                </CardHeader>
                <CardContent><SimpleLineChart data={data.cardsCreated} color={TEAL} /></CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-slate-700">
                      {txt.upgradesChart}
                      <Badge variant="outline" className="ms-2 text-[10px]" style={{ background: '#F3E8FF', color: '#7C3AED' }}>{data.upgradesTotal}</Badge>
                    </CardTitle>
                    <ExportButton label={isRTL ? 'تصدير' : 'Export'} onClick={() => exportCSV(data.upgradesOverTime, 'upgrades.csv')} />
                  </div>
                </CardHeader>
                <CardContent><SimpleLineChart data={data.upgradesOverTime} color="#8B5CF6" /></CardContent>
              </Card>
            </div>

            {/* Heatmap + Clicks by feature */}
            <div className="grid lg:grid-cols-2 gap-4">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700">{txt.dashHeat}</CardTitle>
                </CardHeader>
                <CardContent><HeatmapGrid data={data.heatmap} isRTL={isRTL} /></CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700">{txt.dashClicks}</CardTitle>
                </CardHeader>
                <CardContent><HBarChart data={data.dashClicksByFeature} /></CardContent>
              </Card>
            </div>

            {/* Top events table */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-700">{txt.topEvents}</CardTitle>
                  <ExportButton label={txt.exportEvents} onClick={() => exportCSV(data.topEvents, 'events.csv')} />
                </div>
              </CardHeader>
              <CardContent><EventTable events={data.topEvents} isRTL={isRTL} /></CardContent>
            </Card>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════
              ADVANCED ANALYTICS
          ═════════════════════════════════════════════════════════ */}
          <TabsContent value="advanced" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Repeat} label={txt.retention} value={`${data.returningUsers}%`} sub={isRTL ? 'مستخدمون عائدون' : 'returning users'} trend="up" trendVal="+4%" />
              <StatCard icon={CreditCard} label={txt.upgrades} value={data.upgradesTotal} trend="up" trendVal="+22%" color="#8B5CF6" />
              <StatCard icon={ShoppingCart} label={isRTL ? 'إضافة للسلة' : 'Add to Cart'} value={data.conversionFunnel[2]?.value || 0} trend="down" trendVal="-12%" color="#F59E0B" />
              <StatCard icon={CheckCircle} label={isRTL ? 'عمليات شراء' : 'Purchases'} value={data.conversionFunnel[4]?.value || 0} trend="up" trendVal="+5%" color="#10B981" />
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              {/* User journeys */}
              <Card className="rounded-2xl shadow-sm lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700">{txt.journeys}</CardTitle>
                </CardHeader>
                <CardContent><UserJourneys journeys={data.userJourneys} isRTL={isRTL} /></CardContent>
              </Card>

              {/* Devices */}
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700">{txt.devices}</CardTitle>
                </CardHeader>
                <CardContent><DeviceBreakdown devices={data.devices} isRTL={isRTL} /></CardContent>
              </Card>

              {/* Traffic sources */}
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700">{txt.traffic}</CardTitle>
                </CardHeader>
                <CardContent><TrafficSources sources={data.trafficSources} isRTL={isRTL} /></CardContent>
              </Card>
            </div>

            {/* Full event table */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-700">{txt.topEvents}</CardTitle>
                  <ExportButton label={txt.exportEvents} onClick={() => exportCSV(data.topEvents, 'events.csv')} />
                </div>
              </CardHeader>
              <CardContent><EventTable events={data.topEvents} isRTL={isRTL} /></CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
