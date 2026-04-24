import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppDataProvider } from "@/contexts/AppDataContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import RouteLoader from "./components/RouteLoader";
import { featureRouteKeys } from "@/app/featureRegistry";

const MainLayout = lazy(() => import("./components/MainLayout"));
const LandingHome = lazy(() => import("./pages/Landing/Home"));
const LandingHowItWorks = lazy(() => import("./pages/Landing/HowItWorks"));
const LandingFeatures = lazy(() => import("./pages/Landing/Features"));
const LandingTrust = lazy(() => import("./pages/Landing/Trust"));
const LandingWhoWeServe = lazy(() => import("./pages/Landing/WhoWeServe"));
const LandingWhyAlera = lazy(() => import("./pages/Landing/WhyAlera"));
const PrivacyPolicy = lazy(() => import("./pages/Landing/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/Landing/TermsOfService"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const DashboardHome = lazy(() => import("./pages/DashboardHome"));
const FeatureWrapper = lazy(() => import("./pages/FeatureWrapper"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Don't redirect from auth pages - allow authenticated users to access login/signup if needed
  const isOnAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'].includes(location.pathname);

  // Only redirect from landing pages if authenticated
  const isOnLandingPage = ['/', '/how-it-works', '/features', '/trust', '/who-we-serve', '/why-alera', '/privacy-policy', '/terms'].includes(location.pathname);

  if (!isLoading && isAuthenticated && isOnLandingPage) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const App = () => {
  try {
    return (
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
          <AppDataProvider>
            <NotificationProvider>
              <ChatProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Suspense fallback={<RouteLoader />}>
                      <Routes>
                        <Route element={<AuthRedirect><MainLayout /></AuthRedirect>}>
                          <Route path="/" element={<LandingHome />} />
                          <Route path="/how-it-works" element={<LandingHowItWorks />} />
                          <Route path="/features" element={<LandingFeatures />} />
                          <Route path="/trust" element={<LandingTrust />} />
                          <Route path="/who-we-serve" element={<LandingWhoWeServe />} />
                          <Route path="/why-alera" element={<LandingWhyAlera />} />
                          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                          <Route path="/terms" element={<TermsOfService />} />
                          <Route path="/cookies" element={<PrivacyPolicy />} />
                        </Route>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
                        {featureRouteKeys.map(page => (
                          <Route key={page} path={`/dashboard/${page}`} element={<ProtectedRoute><FeatureWrapper page={page} /></ProtectedRoute>} />
                        ))}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </BrowserRouter>
                </TooltipProvider>
              </ChatProvider>
            </NotificationProvider>
          </AppDataProvider>
        </AuthProvider>
      </QueryClientProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    return <div style={{ color: 'red', padding: '20px' }}>ERROR: {String(error)}</div>;
  }
};

export default App;
