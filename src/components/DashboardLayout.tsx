import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useNotifications } from '@/contexts/useNotifications';
import NotificationCenter from '@/components/NotificationCenter';
import ChatWidget from '@/components/ChatWidget';
import { normalizeUserRole } from '@/lib/roleUtils';
import {
  getProfessionalVerificationStatus,
  getVerificationStatusLabel,
} from '@/lib/verificationStatus';
import {
  Heart, LayoutDashboard, Calendar, FileText, FlaskConical, ScanLine,
  Pill, Ambulance, Users, Building2, ShieldCheck, Activity, Bell, AlertCircle,
  LogOut, Menu, X, Clock, MessageSquare, Settings, HeartPulse, Mail, Terminal
} from 'lucide-react';
import { memo } from 'react';

const roleNavItems: Record<string, { label: string; icon: React.ReactNode; path: string }[]> = {
  patient: [
    { label: 'Dashboard Console', icon: <LayoutDashboard className="w-4 h-4" />, path: '/dashboard' },
    { label: 'Visits Calendar', icon: <Calendar className="w-4 h-4" />, path: '/dashboard/appointments' },
    { label: 'Node Alerts', icon: <Bell className="w-4 h-4" />, path: '/dashboard/appointment-reminders' },
    { label: 'Biometrics Feed', icon: <HeartPulse className="w-4 h-4" />, path: '/dashboard/health-metrics' },
    { label: 'Prescriptions Node', icon: <Pill className="w-4 h-4" />, path: '/dashboard/prescriptions' },
    { label: 'Lab Telemetry', icon: <FlaskConical className="w-4 h-4" />, path: '/dashboard/lab-results' },
    { label: 'Scan Modality', icon: <ScanLine className="w-4 h-4" />, path: '/dashboard/imaging' },
    { label: 'Ambulance dispatch', icon: <Ambulance className="w-4 h-4" />, path: '/dashboard/ambulance' },
    { label: 'Ecosystem Trace', icon: <Clock className="w-4 h-4" />, path: '/dashboard/timeline' },
    { label: 'Secure Terminal', icon: <MessageSquare className="w-4 h-4" />, path: '/dashboard/messages' },
  ],
  doctor: [
    { label: 'Dashboard Console', icon: <LayoutDashboard className="w-4 h-4" />, path: '/dashboard' },
    { label: 'Visits Calendar', icon: <Calendar className="w-4 h-4" />, path: '/dashboard/appointments' },
    { label: 'Node Alerts', icon: <Bell className="w-4 h-4" />, path: '/dashboard/appointment-reminders' },
    { label: 'Patient Register', icon: <Users className="w-4 h-4" />, path: '/dashboard/patients' },
    { label: 'Prescriptions Node', icon: <FileText className="w-4 h-4" />, path: '/dashboard/prescriptions' },
    { label: 'Lab Dispatch', icon: <FlaskConical className="w-4 h-4" />, path: '/dashboard/lab-referrals' },
    { label: 'Scan Dispatch', icon: <ScanLine className="w-4 h-4" />, path: '/dashboard/imaging-referrals' },
    { label: 'Pharmacy Dispatch', icon: <Pill className="w-4 h-4" />, path: '/dashboard/pharmacy-referrals' },
    { label: 'Outbound Referrals', icon: <FileText className="w-4 h-4" />, path: '/dashboard/referrals' },
    { label: 'Ambulance Tracking', icon: <Ambulance className="w-4 h-4" />, path: '/dashboard/requests' },
    { label: 'Ecosystem Trace', icon: <Clock className="w-4 h-4" />, path: '/dashboard/timeline' },
    { label: 'Secure Terminal', icon: <MessageSquare className="w-4 h-4" />, path: '/dashboard/messages' },
  ],
  physiotherapist: [
    { label: 'Dashboard Console', icon: <LayoutDashboard className="w-4 h-4" />, path: '/dashboard' },
    { label: 'Visits Calendar', icon: <Calendar className="w-4 h-4" />, path: '/dashboard/appointments' },
    { label: 'Patient Register', icon: <Users className="w-4 h-4" />, path: '/dashboard/patients' },
    { label: 'Therapy Regimes', icon: <FileText className="w-4 h-4" />, path: '/dashboard/clinical-notes' },
    { label: 'Specialist Referrals', icon: <Activity className="w-4 h-4" />, path: '/dashboard/referrals' },
    { label: 'Ecosystem Trace', icon: <Clock className="w-4 h-4" />, path: '/dashboard/timeline' },
    { label: 'Pricing Matrix', icon: <Pill className="w-4 h-4" />, path: '/dashboard/pricing-settings' },
    { label: 'Secure Terminal', icon: <MessageSquare className="w-4 h-4" />, path: '/dashboard/messages' },
  ],
  hospital: [
    { label: 'Dashboard Console', icon: <LayoutDashboard className="w-4 h-4" />, path: '/dashboard' },
    { label: 'Patient Register', icon: <Users className="w-4 h-4" />, path: '/dashboard/patients' },
    { label: 'Ambulance Tracking', icon: <Ambulance className="w-4 h-4" />, path: '/dashboard/requests' },
    { label: 'Outbound Referrals', icon: <FileText className="w-4 h-4" />, path: '/dashboard/referrals' },
    { label: 'Clinical Roster', icon: <Heart className="w-4 h-4" />, path: '/dashboard/doctors' },
    { label: 'Secure Terminal', icon: <MessageSquare className="w-4 h-4" />, path: '/dashboard/messages' },
  ],
  laboratory: [
    { label: 'Dashboard Console', icon: <LayoutDashboard className="w-4 h-4" />, path: '/dashboard' },
    { label: 'Assay Backlog', icon: <FlaskConical className="w-4 h-4" />, path: '/dashboard/test-requests' },
    { label: 'Assay Results', icon: <FileText className="w-4 h-4" />, path: '/dashboard/results' },
    { label: 'Upload Module', icon: <FileText className="w-4 h-4" />, path: '/dashboard/lab-results-management' },
    { label: 'Secure Terminal', icon: <MessageSquare className="w-4 h-4" />, path: '/dashboard/messages' },
  ],
  imaging: [
    { label: 'Dashboard Console', icon: <LayoutDashboard className="w-4 h-4" />, path: '/dashboard' },
    { label: 'DICOM Requests', icon: <ScanLine className="w-4 h-4" />, path: '/dashboard/scan-requests' },
    { label: 'Inbound Referrals', icon: <ScanLine className="w-4 h-4" />, path: '/dashboard/imaging-referrals' },
    { label: 'Scan Results', icon: <FileText className="w-4 h-4" />, path: '/dashboard/results' },
    { label: 'Secure Terminal', icon: <MessageSquare className="w-4 h-4" />, path: '/dashboard/messages' },
  ],
  pharmacy: [
    { label: 'Dashboard Console', icon: <LayoutDashboard className="w-4 h-4" />, path: '/dashboard' },
    { label: 'Dispense Queue', icon: <Pill className="w-4 h-4" />, path: '/dashboard/prescriptions' },
    { label: 'Outbound Referrals', icon: <FileText className="w-4 h-4" />, path: '/dashboard/pharmacy-referrals' },
    { label: 'Safe Inventory', icon: <Activity className="w-4 h-4" />, path: '/dashboard/inventory' },
    { label: 'Secure Terminal', icon: <MessageSquare className="w-4 h-4" />, path: '/dashboard/messages' },
  ],
  ambulance: [
    { label: 'Dashboard Console', icon: <LayoutDashboard className="w-4 h-4" />, path: '/dashboard' },
    { label: 'Trauma Alerts', icon: <Ambulance className="w-4 h-4" />, path: '/dashboard/requests' },
    { label: 'Fleet Telemetry', icon: <Activity className="w-4 h-4" />, path: '/dashboard/vehicles' },
    { label: 'Secure Terminal', icon: <MessageSquare className="w-4 h-4" />, path: '/dashboard/messages' },
  ],
  admin: [
    { label: 'Dashboard Console', icon: <LayoutDashboard className="w-4 h-4" />, path: '/dashboard' },
    { label: 'Identity Nodes', icon: <Users className="w-4 h-4" />, path: '/dashboard/users' },
    { label: 'Credential Audit', icon: <ShieldCheck className="w-4 h-4" />, path: '/dashboard/verifications' },
    { label: 'Ecosystem Analytics', icon: <Activity className="w-4 h-4" />, path: '/dashboard/analytics' },
    { label: 'Node Alerts', icon: <Bell className="w-4 h-4" />, path: '/dashboard/notifications' },
  ],
  super_admin: [
    { label: 'Dashboard Console', icon: <LayoutDashboard className="w-4 h-4" />, path: '/dashboard' },
    { label: 'Identity Nodes', icon: <Users className="w-4 h-4" />, path: '/dashboard/users' },
    { label: 'Credential Audit', icon: <ShieldCheck className="w-4 h-4" />, path: '/dashboard/verifications' },
    { label: 'Ecosystem Analytics', icon: <Activity className="w-4 h-4" />, path: '/dashboard/analytics' },
    { label: 'Node Alerts', icon: <Bell className="w-4 h-4" />, path: '/dashboard/notifications' },
    { label: 'Global Billing', icon: <FileText className="w-4 h-4" />, path: '/dashboard/admin-billing' },
    { label: 'Immutable Logs', icon: <AlertCircle className="w-4 h-4" />, path: '/dashboard/audit' },
    { label: 'Generate Admin', icon: <ShieldCheck className="w-4 h-4" />, path: '/dashboard/admin/create' },
  ],
};

const roleLabels: Record<string, string> = {
  patient: 'Patient Node', doctor: 'Clinician Node', hospital: 'Hospital Node', laboratory: 'Laboratory Node',
  imaging: 'Imaging Center', pharmacy: 'Pharmacy Node', ambulance: 'Emergency Unit', physiotherapist: 'Physiotherapist', admin: 'Security Admin', super_admin: 'Supreme Cockpit',
};

const roleIcons: Record<string, React.ReactNode> = {
  patient: <Users className="w-4 h-4" />, doctor: <Heart className="w-4 h-4" />,
  hospital: <Building2 className="w-4 h-4" />, laboratory: <FlaskConical className="w-4 h-4" />,
  imaging: <ScanLine className="w-4 h-4" />, pharmacy: <Pill className="w-4 h-4" />,
  ambulance: <Ambulance className="w-4 h-4" />, physiotherapist: <Activity className="w-4 h-4" />, admin: <ShieldCheck className="w-4 h-4" />, super_admin: <ShieldCheck className="w-4 h-4" />,
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = memo(({ children }: DashboardLayoutProps) => {
  const { user, logout, resendEmailVerification } = useAuth();
  const { unreadCount, feedLabel, isLive } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState('');
  const [sendingVerification, setSendingVerification] = useState(false);

  if (!user) return null;

  const roleKey = normalizeUserRole(user.role) ?? user.role;
  const navItems = roleNavItems[roleKey] || [];
  const professionalVerificationStatus = getProfessionalVerificationStatus(user.isVerified, user.isActive ?? true);
  const isPendingVerification = professionalVerificationStatus === 'pending';
  const isEmailUnverified = user.role !== 'admin' && user.emailVerified === false;

  const handleSignOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleResendVerification = async () => {
    setVerificationNotice('');
    setSendingVerification(true);
    try {
      await resendEmailVerification();
      setVerificationNotice('A fresh verification token has been generated & delivered.');
    } catch (error) {
      setVerificationNotice(error instanceof Error ? error.message : 'Failed to generate token');
    } finally {
      setSendingVerification(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050709] text-slate-100 flex font-sans">

      {/* Sci-fi Sidebar Panel */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-white/5 bg-[#07090d] transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full justify-between">
          <div>

            {/* Header / Brand */}
            <div className="flex items-center justify-between h-16 px-5 border-b border-white/5">
              <Link to="/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-xl border border-teal-500/20 bg-teal-950/30 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-teal-400 animate-pulse" />
                </div>
                <span className="text-sm font-bold tracking-widest text-white group-hover:text-teal-300 transition-colors">ALERA CARE OS</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Signpost */}
            <div className="px-4 py-4 border-b border-white/5 bg-slate-950/40">
              <div className="flex items-center gap-3 p-2.5 rounded-xl border border-white/5 bg-slate-900/40">
                <div className="w-9 h-9 rounded-xl border border-teal-500/10 bg-teal-950/20 flex items-center justify-center text-teal-400">
                  {roleIcons[roleKey]}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{user.name}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5 tracking-wider uppercase">{roleLabels[roleKey]}</div>

                  {/* Verification Status */}
                  <div
                    data-testid="sidebar-professional-verification"
                    className={`mt-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider ${
                      professionalVerificationStatus === 'verified'
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        : professionalVerificationStatus === 'pending'
                        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 animate-pulse'
                        : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}
                  >
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>{getVerificationStatusLabel(professionalVerificationStatus)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Deck */}
            <nav className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                      active
                        ? 'bg-teal-500/10 border border-teal-500/20 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.1)]'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

          </div>

          {/* Bottom Actions */}
          <div className="p-3 border-t border-white/5 bg-slate-950/20">
            <button
              onClick={() => void handleSignOut()}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full"
            >
              <LogOut className="w-4 h-4" />
              <span>De-auth Node</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay backdrop */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-md lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Console Deck */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

        {/* Top Control Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-white/5 bg-[#050709]/80 backdrop-blur-xl flex items-center justify-between px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white hover:text-teal-400">
            <Menu className="w-5 h-5" />
          </button>

          {/* Secure Network Telemetry Status */}
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-teal-500/15 bg-teal-950/25 px-3 py-1 text-[10px] font-mono text-teal-400">
            <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span>{isLive ? `SECURE DISPATCH NODE ACTIVE · ${feedLabel.toUpperCase()}` : 'TELEMETRY DISCONNECTED'}</span>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/profile"
              className="w-9 h-9 rounded-xl border border-white/5 bg-slate-900/60 flex items-center justify-center text-slate-300 hover:bg-white/5 hover:text-teal-400 transition-all"
            >
              <Settings className="w-4 h-4" />
            </Link>

            {/* Notifications Terminal */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-9 h-9 rounded-xl border border-white/5 bg-slate-900/60 flex items-center justify-center text-slate-300 hover:bg-white/5 hover:text-teal-400 transition-all"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <NotificationCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>
          </div>
        </header>

        {/* Notices */}
        <div className="mx-6 mt-4 space-y-3">
          {isEmailUnverified && (
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 px-4 py-3 text-sm text-cyan-400 backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div>
                    <p className="font-bold">Ecosystem Verification Unresolved</p>
                    <p className="text-xs text-slate-400">Please verify your email coordinates to activate safe patient encryption.</p>
                    {verificationNotice && <p className="mt-2 text-xs text-cyan-200 font-mono">{verificationNotice}</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void handleResendVerification()}
                  disabled={sendingVerification}
                  className="inline-flex items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-950/40 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 hover:bg-cyan-400 hover:text-slate-950 transition-all disabled:opacity-50"
                >
                  {sendingVerification ? 'Transmitting...' : 'Re-issue Token'}
                </button>
              </div>
            </div>
          )}
          {isPendingVerification && (
            <div className="rounded-2xl border border-amber-500/25 bg-amber-950/20 px-4 py-3 text-xs font-mono uppercase tracking-wider text-amber-400 backdrop-blur-md animate-pulse">
              [NOTICE] Clinical node verification in progress. Restricted capabilities remain inactive until credential validation completes.
            </div>
          )}
        </div>

        {/* Workspace Core Area */}
        <main className="flex-1 p-6 relative">
          <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-teal-500/[0.01] blur-[150px] rounded-full pointer-events-none" />
          {children}
        </main>
      </div>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </div>
  );
});

export default memo(DashboardLayout);
