import { motion } from 'framer-motion';
import { Ambulance, AlertTriangle, CheckCircle, ArrowRight, Truck, Inbox, Radio, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';

const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08 } });

const priorityStyles: Record<string, string> = {
  critical: 'bg-destructive/10 text-destructive',
  high: 'bg-warning/10 text-warning',
  medium: 'bg-info/10 text-info',
  low: 'bg-secondary text-muted-foreground',
};

const statusStyles: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  dispatched: 'bg-info/10 text-info',
  'in-transit': 'bg-primary/10 text-primary',
  'on-scene': 'bg-accent/10 text-accent-foreground',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

const vehicleStatusStyles: Record<string, string> = {
  available: 'bg-success/10 text-success',
  dispatched: 'bg-warning/10 text-warning',
  'in-transit': 'bg-info/10 text-info',
  'on-scene': 'bg-primary/10 text-primary',
  maintenance: 'bg-muted text-muted-foreground',
};

const AmbulanceDashboard = () => {
  const { user } = useAuth();
  const { ambulanceRequests, ambulances } = useAppData();

  const activeRequests = ambulanceRequests.filter((r) => !['completed', 'cancelled'].includes(r.status));
  const criticalRequests = activeRequests.filter((r) => r.priority === 'critical');
  const availableUnits = ambulances.filter((v) => v.status === 'available');
  const dispatchedUnits = ambulances.filter((v) => ['dispatched', 'in-transit', 'on-scene'].includes(v.status));
  const todayStr = new Date().toISOString().split('T')[0];
  const completedToday = ambulanceRequests.filter((r) => r.status === 'completed' && r.date === todayStr);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Ambulance Control Center</h1>
            <p className="text-muted-foreground mt-1">Welcome, {user?.name} — {activeRequests.length} active emergency{activeRequests.length !== 1 ? 'requests' : ' request'}</p>
          </div>
          {criticalRequests.length > 0 && (
            <span className="flex items-center gap-1.5 rounded-xl bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive animate-pulse">
              <Radio className="w-3 h-3" />
              {criticalRequests.length} CRITICAL
            </span>
          )}
        </div>
        <Link to="/dashboard/requests" className="hidden sm:flex items-center gap-1.5 rounded-xl bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/15 transition">
          Dispatch Queue <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: AlertTriangle, label: 'Active Requests', value: activeRequests.length, color: 'text-destructive', bg: 'bg-destructive/10', ring: 'ring-destructive/20' },
          { icon: Truck, label: 'Available Units', value: availableUnits.length, color: 'text-success', bg: 'bg-success/10', ring: 'ring-success/20' },
          { icon: Ambulance, label: 'Dispatched', value: dispatchedUnits.length, color: 'text-warning', bg: 'bg-warning/10', ring: 'ring-warning/20' },
          { icon: CheckCircle, label: 'Completed Today', value: completedToday.length, color: 'text-info', bg: 'bg-info/10', ring: 'ring-info/20' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={i} {...card(i)} className="p-5 rounded-2xl bg-card border border-border hover:shadow-sm transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} ring-1 ${s.ring} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-display font-bold text-card-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{s.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Emergency queue */}
        <motion.div {...card(4)} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="text-base font-display font-semibold text-card-foreground">Emergency Requests</h2>
            </div>
            <Link to="/dashboard/requests" className="text-sm text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {ambulanceRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Inbox className="w-9 h-9 mb-2 opacity-40" />
              <p className="text-sm font-medium">No emergency requests</p>
              <p className="text-xs mt-1">Active dispatches will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ambulanceRequests.slice(0, 4).map((req) => (
                <div key={req.id} className="flex items-start gap-3 rounded-xl border border-border/50 bg-secondary/40 p-3">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium text-card-foreground truncate">{req.patientName}</div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        {req.priority && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${priorityStyles[req.priority] ?? 'bg-muted text-muted-foreground'}`}>
                            {req.priority}
                          </span>
                        )}
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[req.status] ?? 'bg-muted text-muted-foreground'}`}>
                          {req.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{req.location}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Fleet status */}
        <motion.div {...card(5)} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-info/10 text-info flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <h2 className="text-base font-display font-semibold text-card-foreground">Fleet Status</h2>
            </div>
            <Link to="/dashboard/vehicles" className="text-sm text-primary hover:underline flex items-center gap-1">Manage <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {ambulances.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Truck className="w-9 h-9 mb-2 opacity-40" />
              <p className="text-sm font-medium">No vehicles registered</p>
              <p className="text-xs mt-1">Add your fleet to begin dispatching</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ambulances.slice(0, 4).map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/40 p-3">
                  <div className="flex items-center gap-3">
                    <Ambulance className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium text-card-foreground">{v.callSign}</div>
                      <div className="text-xs text-muted-foreground">Fuel: {v.fuel}%</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${vehicleStatusStyles[v.status] ?? 'bg-muted text-muted-foreground'}`}>
                    {v.status}
                  </span>
                </div>
              ))}
              {ambulances.length > 4 && (
                <Link to="/dashboard/vehicles" className="block text-center text-xs text-primary hover:underline pt-1">
                  +{ambulances.length - 4} more units
                </Link>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AmbulanceDashboard;
