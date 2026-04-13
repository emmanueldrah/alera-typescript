import { motion } from 'framer-motion';
import { Pill, Package, AlertTriangle, CheckCircle, ArrowRight, Inbox, TrendingDown, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';

const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08 } });

const PharmacyDashboard = () => {
  const { user } = useAuth();
  const { prescriptions, inventoryItems } = useAppData();

  const pendingRx = prescriptions.filter((rx) => rx.status === 'active');
  const dispensedRx = prescriptions.filter((rx) => rx.status === 'dispensed');
  const lowStock = inventoryItems.filter((item) => item.status === 'low-stock');
  const outOfStock = inventoryItems.filter((item) => item.status === 'out-of-stock');
  const criticalStock = [...outOfStock, ...lowStock];

  const recentRx = [...prescriptions].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Pharmacy Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome, {user?.name} — {pendingRx.length} prescription{pendingRx.length !== 1 ? 's' : ''} to dispense</p>
        </div>
        <Link to="/dashboard/prescriptions" className="hidden sm:flex items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/15 transition">
          Rx Queue <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Pill, label: 'Pending Rx', value: pendingRx.length, color: 'text-warning', bg: 'bg-warning/10', ring: 'ring-warning/20' },
          { icon: CheckCircle, label: 'Dispensed', value: dispensedRx.length, color: 'text-success', bg: 'bg-success/10', ring: 'ring-success/20' },
          { icon: Package, label: 'Total Items', value: inventoryItems.length, color: 'text-info', bg: 'bg-info/10', ring: 'ring-info/20' },
          { icon: AlertTriangle, label: 'Critical Stock', value: criticalStock.length, color: 'text-destructive', bg: 'bg-destructive/10', ring: 'ring-destructive/20' },
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
        {/* Pending prescriptions */}
        <motion.div {...card(4)} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
                <Pill className="w-4 h-4" />
              </div>
              <h2 className="text-base font-display font-semibold text-card-foreground">Pending Prescriptions</h2>
            </div>
            <Link to="/dashboard/prescriptions" className="text-sm text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {pendingRx.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <ShoppingCart className="w-9 h-9 mb-2 opacity-40" />
              <p className="text-sm font-medium">No pending prescriptions</p>
              <p className="text-xs mt-1">New e-prescriptions will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRx.slice(0, 4).map((rx) => (
                <div key={rx.id} className="flex items-start justify-between rounded-xl border border-border/50 bg-secondary/40 p-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-card-foreground truncate">{rx.patientName}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {rx.medications[0]?.name ?? 'Medication'}{rx.medications.length > 1 ? ` +${rx.medications.length - 1} more` : ''}
                    </div>
                  </div>
                  <span className="ml-2 flex-shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full bg-warning/10 text-warning">Pending</span>
                </div>
              ))}
              {pendingRx.length > 4 && (
                <Link to="/dashboard/prescriptions" className="block text-center text-xs text-primary hover:underline pt-1">
                  +{pendingRx.length - 4} more waiting
                </Link>
              )}
            </div>
          )}
        </motion.div>

        {/* Inventory alerts */}
        <motion.div {...card(5)} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${criticalStock.length > 0 ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                {criticalStock.length > 0 ? <TrendingDown className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              </div>
              <h2 className="text-base font-display font-semibold text-card-foreground">Stock Alerts</h2>
            </div>
            <Link to="/dashboard/inventory" className="text-sm text-primary hover:underline flex items-center gap-1">Inventory <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {criticalStock.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <CheckCircle className="w-9 h-9 mb-2 text-success" />
              <p className="text-sm font-medium text-success">All items well stocked</p>
              <p className="text-xs mt-1 text-muted-foreground">No alerts at this time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {criticalStock.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-start justify-between rounded-xl border border-border/50 bg-secondary/40 p-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-card-foreground truncate">{item.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.stock} {item.unit} remaining</div>
                  </div>
                  <span className={`ml-2 flex-shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full ${
                    item.status === 'out-of-stock' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
                  }`}>
                    {item.status === 'out-of-stock' ? 'Out of stock' : 'Low stock'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent activity */}
      <motion.div {...card(6)} className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-display font-semibold text-card-foreground">Recent Prescriptions</h2>
          <Link to="/dashboard/prescriptions" className="text-sm text-primary hover:underline flex items-center gap-1">All Rx <ArrowRight className="w-3 h-3" /></Link>
        </div>
        {recentRx.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Inbox className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">No prescriptions yet</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentRx.map((rx) => (
              <div key={rx.id} className="rounded-xl border border-border/50 bg-secondary/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium text-card-foreground truncate">{rx.patientName}</div>
                  <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    rx.status === 'dispensed' ? 'bg-success/10 text-success' : rx.status === 'cancelled' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
                  }`}>{rx.status}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground truncate">
                  {rx.medications[0]?.name ?? 'Medication'}{rx.medications.length > 1 ? ` +${rx.medications.length - 1}` : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PharmacyDashboard;
