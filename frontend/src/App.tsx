import { Navigate, Route, Routes } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
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
      <div className="flex h-screen flex-col bg-base-950 text-ink-100">
        <Header />
        <main className="min-h-0 flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/dash" replace />} />
            <Route path="/dash" element={<DashboardPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/alert" element={<AlertsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<Navigate to="/dash" replace />} />
          </Routes>
        </main>
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
