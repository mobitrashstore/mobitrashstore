import React from 'react';
import { UsersIcon } from '../components/icons/UsersIcon';
import { CubeIcon } from '../components/icons/CubeIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { Cog6ToothIcon } from '../components/icons/Cog6ToothIcon';
import { EnvelopeIcon } from '../components/icons/EnvelopeIcon';
import { PhotoIcon } from '../components/icons/PhotoIcon';
import { ArchiveBoxIcon } from '../components/icons/ArchiveBoxIcon';
import { LockClosedIcon } from '../components/icons/LockClosedIcon';
import { CpanelIcon } from '../components/icons/CpanelIcon';

interface AdminWorkflowPageProps {
  navigate: (path: string) => void;
}

const SummaryCard: React.FC<{
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}> = ({ icon: Icon, title, children }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-lg backdrop-blur-sm">
    <div className="pointer-events-none absolute inset-px rounded-2xl bg-gradient-to-br from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40" />
    <div className="relative mb-2 flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-slate-900/80">
        <Icon className="h-5 w-5 text-cyan-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-50">{title}</h3>
    </div>
    <p className="text-sm text-slate-400">{children}</p>
  </div>
);

const statusStyles: Record<
  string,
  { badge: string; dot: string; label: string }
> = {
  online: {
    badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300/90',
    dot: 'bg-emerald-400',
    label: 'Online',
  },
  active: {
    badge: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300/90',
    dot: 'bg-cyan-400',
    label: 'Active',
  },
  secure: {
    badge: 'border-violet-500/40 bg-violet-500/10 text-violet-300/90',
    dot: 'bg-violet-400',
    label: 'Secure',
  },
};

const Node: React.FC<{
  icon: React.ElementType;
  title: string;
  subtitle: string;
  status?: keyof typeof statusStyles;
  isPulsing?: boolean;
  metricLabel?: string;
  className?: string;
}> = ({
  icon: Icon,
  title,
  subtitle,
  status,
  isPulsing,
  metricLabel,
  className = '',
}) => {
  const statusStyle = status ? statusStyles[status] : undefined;

  const defaultMetric =
    title === 'User / Web App'
      ? '124 live users'
      : title === 'Firebase Firestore'
      ? '3.1k ops/min'
      : title === 'Google Gemini API'
      ? 'AI inferences'
      : title === 'ImageKit CDN'
      ? '89% cache hit'
      : title === 'EmailJS'
      ? '52 emails/min'
      : title === 'cPanel Hosting'
      ? 'Deploy: green'
      : 'Healthy';

  return (
    <div
      className={`group relative z-10 flex w-full max-w-xs items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-xl shadow-black/60 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 hover:border-cyan-500/60 ${className}`}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,_rgba(8,145,178,0.35),transparent_50%),radial-gradient(circle_at_bottom,_rgba(217,70,239,0.25),transparent_55%)]" />

      <div
        className={`relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 ${
          isPulsing ? 'pulse-glow-animation' : ''
        }`}
      >
        <Icon className="h-7 w-7 text-cyan-400" />
        {isPulsing && (
          <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-cyan-400/40" />
        )}
      </div>

      <div className="relative flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-slate-50">{title}</h4>
          {statusStyle && (
            <div
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusStyle.badge}`}
            >
              <span
                className={`relative inline-flex h-1.5 w-1.5 rounded-full ${statusStyle.dot} ping-slow`}
              />
              <span>{statusStyle.label}</span>
            </div>
          )}
        </div>
        <p className="text-[11px] leading-snug text-slate-400">{subtitle}</p>
      </div>

      {/* metric chip */}
      <div className="absolute -right-1 top-1 rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] text-slate-400/90">
        {metricLabel ?? defaultMetric}
      </div>
    </div>
  );
};

const Connector: React.FC<{ height?: string }> = ({ height = 'h-16' }) => (
  <div className={`relative flex items-center justify-center ${height}`}>
    <div className="relative flex-1 overflow-hidden bg-transparent">
      <div className="mx-auto h-px w-px bg-slate-800/70" />
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-slate-800/70">
        <div className="absolute top-[-100%] h-full w-full bg-gradient-to-b from-transparent via-cyan-400/80 to-transparent animate-flow-down" />
      </div>
    </div>
    {/* moving packet dot */}
    <div className="absolute h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)] animate-packet-down" />
  </div>
);

const HorizontalConnector: React.FC = () => (
  <div className="relative mt-4 w-full max-w-3xl">
    <div className="relative h-px w-full overflow-hidden bg-slate-800/70">
      <div className="absolute left-[-30%] top-0 h-full w-[60%] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent animate-flow-right" />
    </div>
    {/* moving packets */}
    <div className="pointer-events-none absolute left-1/3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.9)] animate-packet-right" />
    <div className="pointer-events-none absolute left-2/3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-fuchsia-300 shadow-[0_0_8px_rgba(217,70,239,0.9)] animate-packet-right-slow" />
  </div>
);

const Gear: React.FC<{
  size?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ size = 'w-6 h-6', className = '', style }) => (
  <Cog6ToothIcon
    className={`${size} text-slate-500/80 animate-spin-slow drop-shadow-[0_0_10px_rgba(148,163,184,0.4)] ${className}`}
    style={style}
  />
);

const AdminWorkflowPage: React.FC<AdminWorkflowPageProps> = () => {
  return (
    <div className="relative min-h-[80vh] overflow-hidden rounded-xl border border-slate-900 bg-black text-white shadow-2xl shadow-cyan-500/20">
      {/* custom animations */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.4); }
          40% { box-shadow: 0 0 24px 8px rgba(34, 211, 238, 0); }
        }
        .pulse-glow-animation { animation: pulse-glow 3s ease-in-out infinite; }

        @keyframes flow-down {
          from { transform: translateY(-100%); }
          to { transform: translateY(100%); }
        }
        .animate-flow-down {
          animation: flow-down 1.4s linear infinite;
        }

        @keyframes flow-right {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        .animate-flow-right {
          animation: flow-right 2.2s linear infinite;
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }

        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          60% { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .ping-slow::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          animation: ping-slow 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes packet-down {
          0% { transform: translateY(-120%); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(120%); opacity: 0; }
        }
        .animate-packet-down {
          animation: packet-down 1.8s linear infinite;
        }

        @keyframes packet-right {
          0% { transform: translateX(-60%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(60%); opacity: 0; }
        }
        .animate-packet-right {
          animation: packet-right 2.1s linear infinite;
        }
        .animate-packet-right-slow {
          animation: packet-right 3.1s linear infinite;
        }

        @keyframes shimmer-strip {
          0% { background-position: 0% 0; }
          100% { background-position: 200% 0; }
        }
        .activity-shimmer {
          background-size: 200% 100%;
          animation: shimmer-strip 9s linear infinite;
        }
      `}</style>

      {/* background grid & glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#0f172a_0,_transparent_55%),radial-gradient(circle_at_bottom,_#0f172a_0,_transparent_55%)] opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:32px_32px] opacity-25" />
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black" />

      <div className="relative z-10 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        {/* Header + live status */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-50 sm:text-3xl">
              Application Workflow
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Live view of how your PWA, services, and APIs work together in production.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.25)]">
              <span className="relative inline-flex h-2.5 w-2.5 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/40" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="font-medium">All systems operational</span>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-slate-300">
              <UsersIcon className="h-3.5 w-3.5 text-cyan-300" />
              <span>Current traffic: 124 active users</span>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-slate-300">
              <CubeIcon className="h-3.5 w-3.5 text-fuchsia-300" />
              <span>Region: Asia / Multi-zonal</span>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard icon={Cog6ToothIcon} title="Admins can...">
            Manage database collections, view system health, and monitor real-time sales
            performance.
          </SummaryCard>
          <SummaryCard icon={UsersIcon} title="Users can...">
            Buy &amp; sell devices, book repairs, get instant quotes, and manage profiles
            and orders from the PWA.
          </SummaryCard>
          <SummaryCard icon={CubeIcon} title="System can...">
            Authenticate users, sync data in real-time, and orchestrate background jobs
            across your stack.
          </SummaryCard>
          <SummaryCard icon={SparklesIcon} title="AI can...">
            Detect devices from photos and compare phone specifications live using Google
            Gemini.
          </SummaryCard>
        </div>

        {/* Main Diagram */}
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2">
          {/* Level 1: PWA */}
          <Node
            icon={UsersIcon}
            title="User / Web App"
            subtitle="React PWA interface running on cPanel hosting"
            isPulsing
            status="online"
            metricLabel="124 users · 98.7% uptime"
          />

          <Connector height="h-10" />

          {/* Level 2: Auth + AI */}
          <div className="relative flex w-full flex-col items-center gap-8 px-4 md:flex-row md:justify-center md:gap-20">
            {/* crosshair */}
            <div className="pointer-events-none absolute top-1/2 left-0 hidden h-px w-full bg-slate-800/80 md:block" />
            <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px bg-slate-800/80" />
            <Gear
              size="w-9 h-9"
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            />

            <Node
              icon={LockClosedIcon}
              title="Firebase Auth"
              subtitle="JWT-based email/password & social login"
              status="secure"
              metricLabel="32 logins/min"
            />
            <Node
              icon={SparklesIcon}
              title="Google Gemini API"
              subtitle="AI engine used for device understanding & pricing"
              isPulsing
              status="active"
              metricLabel="38 inferences/min"
            />
          </div>

          <Connector height="h-8" />

          {/* Level 3: Database */}
          <Node
            icon={ArchiveBoxIcon}
            title="Firebase Firestore"
            subtitle="Core database for users, devices, orders & reports"
            isPulsing
            status="active"
            metricLabel="3.1k reads/writes/min"
          />

          <Connector height="h-8" />

          {/* Level 4: Outbound services */}
          <div className="relative flex w-full flex-col items-center gap-8 px-4 md:flex-row md:justify-center md:gap-12">
            <div className="pointer-events-none absolute top-1/2 left-0 hidden h-px w-full bg-slate-800/80 md:block" />
            <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px bg-slate-800/80" />
            <Gear
              size="w-11 h-11"
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ animationDuration: '18s' }}
            />

            <Node
              icon={EnvelopeIcon}
              title="EmailJS"
              subtitle="Transactional emails for OTPs, confirmations & alerts"
              metricLabel="Latency: 210 ms"
            />
            <Node
              icon={PhotoIcon}
              title="ImageKit CDN"
              subtitle="Optimized device photos & PWA assets worldwide"
              metricLabel="89% cache hit"
            />
            <Node
              icon={CpanelIcon}
              title="cPanel Hosting"
              subtitle="Frontend hosting & deployment pipeline"
              status="online"
              metricLabel="Build: passing"
            />
          </div>

          {/* Horizontal traffic line between services */}
          <HorizontalConnector />

          {/* Foot metrics */}
          <div className="mt-6 grid w-full max-w-4xl grid-cols-1 gap-3 text-xs text-slate-300 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                Avg response time
              </p>
              <p className="mt-1 text-sm font-semibold text-cyan-300">142 ms</p>
              <p className="text-[11px] text-slate-500">
                From user tap to Firestore read
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                AI usage
              </p>
              <p className="mt-1 text-sm font-semibold text-fuchsia-300">
                38 inferences / min
              </p>
              <p className="text-[11px] text-slate-500">
                Device detection &amp; pricing suggestions
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                Error rate
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-300">0.3%</p>
              <p className="text-[11px] text-slate-500">Aggregated across all services</p>
            </div>
          </div>

          {/* Live activity strip */}
          <div className="mt-6 w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/90">
            <div className="activity-shimmer flex items-center gap-4 px-4 py-3 text-[11px] text-slate-200 bg-[linear-gradient(110deg,rgba(15,23,42,0.9),rgba(8,47,73,0.95),rgba(30,64,175,0.7),rgba(15,23,42,0.9))]">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/70 px-2 py-0.5 text-[10px] uppercase tracking-wide text-cyan-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live traffic feed
              </span>
              <span>· User #543 requested price suggestion</span>
              <span>· Gemini scored device condition: GOOD</span>
              <span>· Firestore wrote new order document</span>
              <span>· EmailJS sent OTP to +977 *** 575</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWorkflowPage;
