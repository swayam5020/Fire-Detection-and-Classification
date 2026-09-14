import { Navigate, Route, Routes } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardPage } from '@/pages/DashboardPage';
import { MapPage } from '@/pages/MapPage';
import { AlertsPage } from '@/pages/AlertsPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { NotificationProvider, useNotificationCenter } from '@/hooks/useNotificationCenter';
import { SosArrivalBanner } from '@/components/alerts/SosArrivalBanner';
import { SosAlertModal } from '@/components/alerts/SosAlertModal';

export default function App() {
  return (
    <NotificationProvider>
      {/* Deep-teal frame around a single rounded shell: masthead across the
          full width, then the nav rail beside the routed page. */}
      <div className="flex h-screen flex-col bg-accent-dark p-2.5 text-ink-100">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl">
          <Header />
          <div className="flex min-h-0 flex-1">
            <Sidebar />
            <main className="min-h-0 min-w-0 flex-1">
              <Routes>
                <Route path="/" element={<Navigate to="/dash" replace />} />
                <Route path="/dash" element={<DashboardPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/alert" element={<AlertsPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="*" element={<Navigate to="/dash" replace />} />
              </Routes>
            </main>
          </div>
        </div>
        <SosOverlays />
      </div>
    </NotificationProvider>
  );
}

// Rendered once, above every route, so a new-alert banner and the SOS queue
// modal work identically regardless of which page is currently active.
function SosOverlays() {
  const { latestArrival } = useNotificationCenter();
  return (
    <>
      {latestArrival && <SosArrivalBanner alert={latestArrival} />}
      <SosAlertModal />
    </>
  );
}
