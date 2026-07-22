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
    { label: 'Ambulance Dispatch', icon: <Ambulance className="w-4 h-4" />, path: '/dashboard/ambulance' },
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">

      {/* Handcrafted Professional Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full justify-between">
          <div>

            {/* Header / Brand */}
            <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200">
              <Link to="/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-slate-800" />
                </div>
                <span className="text-xs font-bold tracking-widest text-slate-900 group-hover:text-slate-700 transition-colors uppercase">ALERA OS</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Signpost */}
            <div className="px-4 py-4 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-3 p-2.5 rounded border border-slate-200 bg-white">
                <div className="w-9 h-9 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-800">
                  {roleIcons[roleKey]}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5 tracking-wider uppercase">{roleLabels[roleKey]}</div>

                  {/* Verification Status */}
                  <div
                    data-testid="sidebar-professional-verification"
                    className={`mt-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider ${
                      professionalVerificationStatus === 'verified'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : professionalVerificationStatus === 'pending'
                        ? 'bg-amber-50 border border-amber-200 text-amber-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
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
                    className={`flex items-center gap-3 px-3 py-2 rounded text-[11px] font-mono font-bold uppercase tracking-wider transition-all ${
                      active
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
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
          <div className="p-3 border-t border-slate-200 bg-slate-50">
            <button
              onClick={() => void handleSignOut()}
              className="flex items-center gap-3 px-3 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider text-slate-500 hover:bg-red-50 hover:text-red-700 transition-all w-full"
            >
              <LogOut className="w-4 h-4" />
              <span>De-auth Node</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay backdrop */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-xs lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Console Deck */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

        {/* Top Control Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white/95 backdrop-blur flex items-center justify-between px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-900">
            <Menu className="w-5 h-5" />
          </button>

          {/* Secure Network Telemetry Status */}
          <div className="hidden lg:flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-mono text-slate-600">
            <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`} />
            <span>{isLive ? `SECURE DISPATCH NODE ACTIVE · ${feedLabel.toUpperCase()}` : 'TELEMETRY OFFLINE'}</span>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/profile"
              className="w-9 h-9 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </Link>

            {/* Notifications Terminal */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-9 h-9 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
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
            <div className="rounded border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500" />
                  <div>
                    <p className="font-bold text-slate-950">Ecosystem Verification Unresolved</p>
                    <p className="text-xs text-slate-500">Please verify your email coordinates to activate safe patient encryption.</p>
                    {verificationNotice && <p className="mt-2 text-xs text-slate-700 font-mono">{verificationNotice}</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void handleResendVerification()}
                  disabled={sendingVerification}
                  className="inline-flex items-center justify-center rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  {sendingVerification ? 'Transmitting...' : 'Re-issue Token'}
                </button>
              </div>
            </div>
          )}
          {isPendingVerification && (
            <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-mono uppercase tracking-wider text-amber-800">
              [NOTICE] Clinical node verification in progress. Restricted capabilities remain inactive until credential validation completes.
            </div>
          )}
        </div>

        {/* Workspace Core Area */}
        <main className="flex-1 p-6 relative">
          {children}
        </main>
      </div>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </div>
  );
});

export default memo(DashboardLayout);
