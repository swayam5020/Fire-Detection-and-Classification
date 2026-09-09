import { useNavigate } from 'react-router-dom';
import { useNotificationCenter } from '@/hooks/useNotificationCenter';
import { cn } from '@/lib/utils';

// The bell is a fire/emergency alert mechanism, not a subtle notification
// icon. Idle, it's a solid, high-contrast block — deliberately one of the
// most visually dominant elements in the header, not a thin outline that
// blends in. While an alert is unread it shakes, glows, and shows an
// unmistakable red indicator, and only calms down once the person has
// actually opened /alert (see useNotificationCenter). It never animates
// when there is nothing new.
export function NotificationBell() {
  const navigate = useNavigate();
  const { hasUnread, acknowledged } = useNotificationCenter();
  const isAlerting = hasUnread && !acknowledged;

  return (
    <button
      type="button"
      onClick={() => navigate('/alert')}
      aria-label={isAlerting ? 'New critical thermal alert — open SOS Alerts' : 'Open SOS Alerts'}
      className={cn(
        'relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-sm border-2 transition-colors',
        isAlerting
          ? 'border-thermal bg-thermal/20 text-thermal shadow-[0_0_24px_4px_rgba(224,64,47,0.5)]'
          : 'border-ink-300 bg-base-800 text-ink-100 hover:border-ink-100 hover:bg-base-700'
      )}
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={cn('origin-top', isAlerting && 'animate-bell-shake')}
      >
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {isAlerting && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5">
          <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-thermal" />
          <span className="relative inline-flex h-5 w-5 rounded-full border-2 border-base-950 bg-thermal" />
        </span>
      )}
    </button>
  );
}
