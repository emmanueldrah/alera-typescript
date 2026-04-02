import { motion } from 'framer-motion';
import { Ambulance, AlertTriangle, CheckCircle, ArrowRight, Truck, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';

const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08 } });

const AmbulanceDashboard = () => {
  const { user } = useAuth();
  const { ambulanceRequests, ambulances } = useAppData();
  const activeRequests = ambulanceRequests.filter((request) => request.status !== 'completed');
  const availableUnits = ambulances.filter((vehicle) => vehicle.status === 'available');
  const dispatchedUnits = ambulances.filter((vehicle) => vehicle.status === 'dispatched' || vehicle.status === 'in-transit' || vehicle.status === 'on-scene');
  const completedToday = ambulanceRequests.filter((request) => request.status === 'completed' && request.date === new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Ambulance Control Center</h1>
        <p className="text-muted-foreground mt-1">Welcome, {user?.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <AlertTriangle className="w-5 h-5" />, label: 'Active Requests', value: activeRequests.length, color: 'text-destructive', bg: 'bg-destructive/10' },
          { icon: <Truck className="w-5 h-5" />, label: 'Available Units', value: availableUnits.length, color: 'text-success', bg: 'bg-success/10' },
          { icon: <Ambulance className="w-5 h-5" />, label: 'Dispatched', value: dispatchedUnits.length, color: 'text-warning', bg: 'bg-warning/10' },
          { icon: <CheckCircle className="w-5 h-5" />, label: 'Completed Today', value: completedToday.length, color: 'text-info', bg: 'bg-info/10' },
        ].map((s, i) => (
          <motion.div key={i} {...card(i)} className="p-5 rounded-2xl bg-card border border-border">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
            <div className="text-2xl font-display font-bold text-card-foreground">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div {...card(4)} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-card-foreground">Emergency Requests</h2>
            <Link to="/dashboard/requests" className="text-sm text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {ambulanceRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Inbox className="w-8 h-8 mb-2" />
              <p className="text-sm">No emergency requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ambulanceRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="rounded-lg border border-border/50 bg-secondary/50 p-3">
                  <div className="text-sm font-medium text-card-foreground">{request.patientName}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{request.location} • {request.status}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div {...card(5)} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-card-foreground">Fleet Status</h2>
            <Link to="/dashboard/vehicles" className="text-sm text-primary hover:underline flex items-center gap-1">Manage <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {ambulances.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Inbox className="w-8 h-8 mb-2" />
              <p className="text-sm">No vehicles registered</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ambulances.slice(0, 3).map((vehicle) => (
                <div key={vehicle.id} className="rounded-lg border border-border/50 bg-secondary/50 p-3">
                  <div className="text-sm font-medium text-card-foreground">{vehicle.callSign}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{vehicle.status} • fuel {vehicle.fuel}%</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AmbulanceDashboard;
