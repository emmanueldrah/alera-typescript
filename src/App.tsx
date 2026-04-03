import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppDataProvider } from "@/contexts/AppDataContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "./components/MainLayout";
import LandingHome from "./pages/Landing/Home";
import LandingHowItWorks from "./pages/Landing/HowItWorks";
import LandingFeatures from "./pages/Landing/Features";
import LandingTrust from "./pages/Landing/Trust";
import LandingWhoWeServe from "./pages/Landing/WhoWeServe";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashboardHome from "./pages/DashboardHome";
import FeatureWrapper from "./pages/FeatureWrapper";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const featureRoutes = [
  'appointments', 'prescriptions', 'lab-results', 'lab-referrals', 'test-requests', 'lab-results-management',
  'imaging', 'imaging-referrals', 'scan-requests', 'ambulance', 'requests',
  'timeline', 'inventory', 'vehicles', 'users', 'verifications', 'analytics',
  'patients', 'doctors', 'referrals', 'results', 'messages', 'profile',
  'health-metrics', 'notifications', 'appointment-reminders', 'smart-appointment-reminders',
  'allergies', 'prescription-refills', 'medical-history', 'consent',
  'clinical-notes', 'problem-list', 'medication-adherence',
  'pricing-settings', 'billing', 'admin-billing',
];

const App = () => {
  try {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppDataProvider>
            <NotificationProvider>
              <ChatProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Routes>
                      <Route path="/test" element={<div className="p-10 bg-blue-500 text-white text-4xl">TEST PAGE - React is working!</div>} />
                      <Route element={<AuthRedirect><MainLayout /></AuthRedirect>}>
                        <Route path="/" element={<LandingHome />} />
                        <Route path="/how-it-works" element={<LandingHowItWorks />} />
                        <Route path="/features" element={<LandingFeatures />} />
                        <Route path="/trust" element={<LandingTrust />} />
                        <Route path="/who-we-serve" element={<LandingWhoWeServe />} />
                      </Route>
                      <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
                      <Route path="/signup" element={<AuthRedirect><Signup /></AuthRedirect>} />
                      <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
                      {featureRoutes.map(page => (
                        <Route key={page} path={`/dashboard/${page}`} element={<ProtectedRoute><FeatureWrapper page={page} /></ProtectedRoute>} />
                      ))}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </ChatProvider>
            </NotificationProvider>
          </AppDataProvider>
        </AuthProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    return <div style={{ color: 'red', padding: '20px' }}>ERROR: {String(error)}</div>;
  }
};

export default App;
