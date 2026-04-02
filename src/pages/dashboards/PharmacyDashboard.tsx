import { motion } from 'framer-motion';
import { Pill, Package, AlertTriangle, CheckCircle, ArrowRight, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';

const card = (i: number) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08 } });

const PharmacyDashboard = () => {
  const { user } = useAuth();
  const { prescriptions, inventoryItems } = useAppData();
  const pendingPrescriptions = prescriptions.filter((prescription) => prescription.status === 'active');
  const dispensedPrescriptions = prescriptions.filter((prescription) => prescription.status === 'dispensed');
  const lowStockItems = inventoryItems.filter((item) => item.status === 'low-stock' || item.status === 'out-of-stock');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Pharmacy Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome, {user?.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Pill className="w-5 h-5" />, label: 'Pending Rx', value: pendingPrescriptions.length, color: 'text-warning', bg: 'bg-warning/10' },
          { icon: <CheckCircle className="w-5 h-5" />, label: 'Dispensed', value: dispensedPrescriptions.length, color: 'text-success', bg: 'bg-success/10' },
          { icon: <Package className="w-5 h-5" />, label: 'Total Items', value: inventoryItems.length, color: 'text-info', bg: 'bg-info/10' },
          { icon: <AlertTriangle className="w-5 h-5" />, label: 'Low Stock', value: lowStockItems.length, color: 'text-destructive', bg: 'bg-destructive/10' },
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
            <h2 className="text-lg font-display font-semibold text-card-foreground">Pending Prescriptions</h2>
            <Link to="/dashboard/prescriptions" className="text-sm text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {pendingPrescriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Inbox className="w-8 h-8 mb-2" />
              <p className="text-sm">No pending prescriptions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPrescriptions.slice(0, 3).map((prescription) => (
                <div key={prescription.id} className="rounded-lg border border-border/50 bg-secondary/50 p-3">
                  <div className="text-sm font-medium text-card-foreground">{prescription.patientName}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{prescription.medications[0]?.name ?? 'Medication'} • active</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div {...card(5)} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-card-foreground">Low Stock Alert</h2>
            <Link to="/dashboard/inventory" className="text-sm text-primary hover:underline flex items-center gap-1">Inventory <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {lowStockItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success" />
              <p className="text-sm">All items are well stocked</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockItems.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-lg border border-border/50 bg-secondary/50 p-3">
                  <div className="text-sm font-medium text-card-foreground">{item.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{item.stock} {item.unit} • {item.status}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
