import { Navigate, Route, Routes } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { DashboardPage } from '@/pages/DashboardPage';
import { MapPage } from '@/pages/MapPage';
import { AlertsPage } from '@/pages/AlertsPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { NotificationProvider } from '@/hooks/useNotificationCenter';

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
      </div>
    </NotificationProvider>
  );
}
