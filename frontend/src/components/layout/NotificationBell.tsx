import { useNotificationCenter } from '@/hooks/useNotificationCenter';
import { cn } from '@/lib/utils';

// The bell is the entry point into the SOS alert queue modal. Idle, it's a
// plain neutral control; while there is an unread alert it shakes briefly
// and shows a count badge, and calms down once the person has opened the
// SOS queue (see useNotificationCenter). It never animates when there is
// nothing new, and no longer relies on a glow effect to read as "urgent" —
// the badge count and shake are enough.
export function NotificationBell() {
  const { hasUnread, unreadCount, acknowledged, openSosModal } = useNotificationCenter();
  const isAlerting = hasUnread && !acknowledged;

  return (
    <button
      type="button"
      onClick={openSosModal}
      aria-label={isAlerting ? `${unreadCount} new critical thermal alert — open SOS Alerts` : 'Open SOS Alerts'}
      className={cn(
        'relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border transition-colors',
        'border-base-600 bg-base-900 text-ink-200 hover:border-ink-400 hover:text-ink-100'
      )}
    >
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className={cn('origin-top', isAlerting && 'animate-bell-shake')}
      >
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {hasUnread && unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-thermal px-1 font-mono text-[10px] font-bold leading-none text-white">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
