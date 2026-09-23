import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { AppDataProvider } from './data/AppDataProvider';

// Each page loads on demand, so the landing page doesn't download the whole app.
const Landing = lazy(() => import('./pages/landing/Landing'));
const AppLayout = lazy(() => import('./pages/app/AppLayout'));
const Dashboard = lazy(() => import('./pages/app/Dashboard'));
const Plan = lazy(() => import('./pages/app/Plan'));
const Audit = lazy(() => import('./pages/app/Audit'));
const Redemption = lazy(() => import('./pages/app/Redemption'));
const Rewards = lazy(() => import('./pages/app/Rewards'));
const MyCards = lazy(() => import('./pages/app/MyCards'));
const Compare = lazy(() => import('./pages/app/Compare'));
const Admin = lazy(() => import('./pages/admin/Admin'));
const SignIn = lazy(() => import('./pages/auth/SignIn'));
const Privacy = lazy(() => import('./pages/legal/Legal').then((m) => ({ default: m.Privacy })));
const Terms = lazy(() => import('./pages/legal/Legal').then((m) => ({ default: m.Terms })));

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<AppDataProvider><AppLayout /></AppDataProvider>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="plan" element={<Plan />} />
          <Route path="audit" element={<Audit />} />
          <Route path="redemption" element={<Redemption />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="cards" element={<MyCards />} />
          <Route path="compare" element={<Compare />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
        <Route path="/admin" element={<Admin />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
