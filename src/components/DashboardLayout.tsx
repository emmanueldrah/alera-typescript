import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useNotifications } from '@/contexts/useNotifications';
import NotificationCenter from '@/components/NotificationCenter';
import ChatWidget from '@/components/ChatWidget';
import { normalizeUserRole } from '@/lib/roleUtils';
import {
  Heart, LayoutDashboard, Calendar, FileText, FlaskConical, ScanLine,
  Pill, Ambulance, Users, Building2, ShieldCheck, Activity, Bell,
  LogOut, Menu, X, Clock, MessageSquare, Settings, HeartPulse
} from 'lucide-react';

const roleNavItems: Record<string, { label: string; icon: React.ReactNode; path: string }[]> = {
  patient: [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
    { label: 'Appointments', icon: <Calendar className="w-5 h-5" />, path: '/dashboard/appointments' },
    { label: 'Reminders', icon: <Bell className="w-5 h-5" />, path: '/dashboard/appointment-reminders' },
    { label: 'Health Metrics', icon: <HeartPulse className="w-5 h-5" />, path: '/dashboard/health-metrics' },
    { label: 'Prescriptions', icon: <Pill className="w-5 h-5" />, path: '/dashboard/prescriptions' },
    { label: 'Lab Results', icon: <FlaskConical className="w-5 h-5" />, path: '/dashboard/lab-results' },
    { label: 'Imaging', icon: <ScanLine className="w-5 h-5" />, path: '/dashboard/imaging' },
    { label: 'Ambulance', icon: <Ambulance className="w-5 h-5" />, path: '/dashboard/ambulance' },
    { label: 'Timeline', icon: <Clock className="w-5 h-5" />, path: '/dashboard/timeline' },
    { label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/dashboard/messages' },
  ],
  doctor: [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
    { label: 'Appointments', icon: <Calendar className="w-5 h-5" />, path: '/dashboard/appointments' },
    { label: 'Reminders', icon: <Bell className="w-5 h-5" />, path: '/dashboard/appointment-reminders' },
    { label: 'Patients', icon: <Users className="w-5 h-5" />, path: '/dashboard/patients' },
    { label: 'Prescriptions', icon: <FileText className="w-5 h-5" />, path: '/dashboard/prescriptions' },
    { label: 'Lab Referrals', icon: <FlaskConical className="w-5 h-5" />, path: '/dashboard/lab-referrals' },
    { label: 'Imaging Referrals', icon: <ScanLine className="w-5 h-5" />, path: '/dashboard/imaging-referrals' },
    { label: 'Patient Timeline', icon: <Clock className="w-5 h-5" />, path: '/dashboard/timeline' },
    { label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/dashboard/messages' },
  ],
  hospital: [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
    { label: 'Patients', icon: <Users className="w-5 h-5" />, path: '/dashboard/patients' },
    { label: 'Referrals', icon: <FileText className="w-5 h-5" />, path: '/dashboard/referrals' },
    { label: 'Doctors', icon: <Heart className="w-5 h-5" />, path: '/dashboard/doctors' },
  ],
  laboratory: [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
    { label: 'Test Requests', icon: <FlaskConical className="w-5 h-5" />, path: '/dashboard/test-requests' },
    { label: 'Results', icon: <FileText className="w-5 h-5" />, path: '/dashboard/results' },
  ],
  imaging: [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
    { label: 'Scan Requests', icon: <ScanLine className="w-5 h-5" />, path: '/dashboard/scan-requests' },
    { label: 'Results', icon: <FileText className="w-5 h-5" />, path: '/dashboard/results' },
  ],
  pharmacy: [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
    { label: 'Prescriptions', icon: <Pill className="w-5 h-5" />, path: '/dashboard/prescriptions' },
    { label: 'Inventory', icon: <Activity className="w-5 h-5" />, path: '/dashboard/inventory' },
  ],
  ambulance: [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
    { label: 'Requests', icon: <Ambulance className="w-5 h-5" />, path: '/dashboard/requests' },
    { label: 'Vehicles', icon: <Activity className="w-5 h-5" />, path: '/dashboard/vehicles' },
  ],
  admin: [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
    { label: 'Users', icon: <Users className="w-5 h-5" />, path: '/dashboard/users' },
    { label: 'Verifications', icon: <ShieldCheck className="w-5 h-5" />, path: '/dashboard/verifications' },
    { label: 'Analytics', icon: <Activity className="w-5 h-5" />, path: '/dashboard/analytics' },
    { label: 'Notifications', icon: <Bell className="w-5 h-5" />, path: '/dashboard/notifications' },
  ],
};

const roleLabels: Record<string, string> = {
  patient: 'Patient', doctor: 'Doctor', hospital: 'Hospital', laboratory: 'Laboratory',
  imaging: 'Imaging Center', pharmacy: 'Pharmacy', ambulance: 'Ambulance', admin: 'Admin',
};

const roleIcons: Record<string, React.ReactNode> = {
  patient: <Users className="w-5 h-5" />, doctor: <Heart className="w-5 h-5" />,
  hospital: <Building2 className="w-5 h-5" />, laboratory: <FlaskConical className="w-5 h-5" />,
  imaging: <ScanLine className="w-5 h-5" />, pharmacy: <Pill className="w-5 h-5" />,
  ambulance: <Ambulance className="w-5 h-5" />, admin: <ShieldCheck className="w-5 h-5" />,
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const { unreadCount, feedLabel, isLive } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  if (!user) return null;

  const roleKey = normalizeUserRole(user.role) ?? user.role;
  const navItems = roleNavItems[roleKey] || [];
  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-5">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-display font-bold text-sidebar-foreground">ALERA</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sidebar-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-4 mb-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent">
              <div className="w-9 h-9 rounded-lg bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary">
                {roleIcons[roleKey]}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</div>
                <div className="text-xs text-sidebar-muted">{roleLabels[roleKey]}</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  }`}>
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3">
            <button onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition w-full">
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 h-16 glass flex items-center justify-between px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-success animate-pulse' : 'bg-muted'}`} />
            <span className="text-xs text-muted-foreground">{isLive ? `${feedLabel} live` : 'Realtime feed offline'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard/profile" className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground hover:bg-muted transition">
              <Settings className="w-5 h-5" />
            </Link>
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground hover:bg-muted transition">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <NotificationCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>

      {/* Chat Widget for patient/doctor */}
      <ChatWidget />
    </div>
  );
};

export default DashboardLayout;
