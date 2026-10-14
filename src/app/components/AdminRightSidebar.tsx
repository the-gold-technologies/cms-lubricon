import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface ActivityItem {
  type: string;
  text: string;
  time: string;
}

interface AdminRightSidebarProps {
  stats?: {
    activities?: ActivityItem[];
  };
  loading?: boolean;
}

function getRelativeTime(timeStr: string) {
  try {
    const date = new Date(timeStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    if (diffMs < 0) return 'Just now';

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  } catch {
    return 'Recent';
  }
}

export function AdminRightSidebar({ stats, loading }: AdminRightSidebarProps) {
  const activities = stats?.activities || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Dark Promo Card */}
      <div className="bg-[#0b1329] rounded-[2rem] p-7 text-white relative overflow-hidden shadow-xl border border-white/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffe000]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex items-center gap-2 font-bold tracking-tight text-zinc-300 mb-6">
          <div className="w-6 h-6 rounded-lg bg-[#ffe000] text-black flex items-center justify-center font-black italic text-xs">
            L
          </div>
          Lubricon Specialities
        </div>
        <h2 className="text-[24px] font-black leading-[1.15] mb-3 text-white">
          Australian <br />
          Formulation Tech
        </h2>
        <p className="text-xs font-medium text-zinc-300 leading-relaxed max-w-[220px] mb-6">
          Manage product specs, ISO grades, GeM/IREPS credentials, and client audit submissions in
          real time.
        </p>
        <Link
          href="/seo/global"
          className="inline-block bg-[#ffe000] text-black px-6 py-2.5 rounded-full text-xs font-extrabold hover:bg-white transition-all transform hover:scale-105 shadow-md relative z-10"
        >
          Configure Global SEO
        </Link>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-extrabold text-base text-zinc-900">Recent Activity</h3>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-6 flex justify-center items-center border border-zinc-200">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-800" />
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 text-center text-zinc-400 text-xs italic border border-zinc-200">
            No recent activity tracked yet.
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-zinc-200 space-y-3.5">
            {activities.map((activity, idx) => {
              const isEnquiry = activity.type === 'enquiry';
              const relativeTime = getRelativeTime(activity.time);

              return (
                <div key={idx} className="flex items-start gap-3 text-[13px]">
                  <div
                    className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                      isEnquiry ? 'bg-emerald-500 animate-pulse' : 'bg-[#e5c700]'
                    }`}
                  ></div>
                  <div className="flex flex-col flex-1 leading-snug">
                    <span className="font-bold text-zinc-800">{activity.text}</span>
                    <span className="text-[11px] text-zinc-400 font-semibold mt-0.5">
                      {relativeTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
