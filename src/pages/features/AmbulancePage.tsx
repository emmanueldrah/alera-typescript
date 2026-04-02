import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ambulance, MapPin, AlertTriangle, X, Inbox } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { useNotifications } from '@/contexts/useNotifications';
import { type AmbulanceRequest } from '@/data/mockData';

const priorityColors: Record<string, string> = { critical: 'bg-destructive/10 text-destructive', high: 'bg-warning/10 text-warning', medium: 'bg-info/10 text-info', low: 'bg-muted text-muted-foreground' };

const AmbulancePage = () => {
  const { user, getUsers } = useAuth();
  const { ambulanceRequests, addAmbulanceRequest, updateAmbulanceRequest } = useAppData();
  const { addNotification } = useNotifications();
  const [searchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ location: '', priority: 'high' as const });
  const focusId = searchParams.get('focus');
  const currentPage = user?.role === 'ambulance' ? 'requests' : 'ambulance';
  const users = getUsers();
  const visibleRequests = ambulanceRequests.filter((request) => {
    if (user?.role === 'ambulance') return true;
    if (user?.role === 'patient') return request.patientId === user.id;
    return false;
  });

  const handleRequest = () => {
    if (!formData.location) return;

    const request: AmbulanceRequest = {
      id: `amb-${Date.now()}`,
      patientName: user?.name || 'Patient',
      patientId: user?.id || '',
      location: formData.location,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      status: 'requested',
      priority: formData.priority,
    };

    addAmbulanceRequest(request);
    addNotification({
      title: formData.priority === 'critical' ? 'Critical Emergency Request Sent' : 'Ambulance Request Sent',
      message: `Emergency response requested for ${formData.location}.`,
      type: 'emergency',
      priority: formData.priority,
      audience: 'personal',
      actionUrl: `/dashboard/ambulance?focus=${request.id}`,
      actionLabel: 'Open request',
      targetEmails: user?.email ? [user.email] : [],
      targetRoles: ['ambulance'],
      excludeEmails: user?.email ? [user.email] : [],
      actionUrlByRole: {
        patient: `/dashboard/ambulance?focus=${request.id}`,
        ambulance: `/dashboard/requests?focus=${request.id}`,
      },
    });
    setShowForm(false);
    setFormData({ location: '', priority: 'high' });
  };

  const handleDispatch = (id: string) => {
    const target = ambulanceRequests.find((request) => request.id === id);
    updateAmbulanceRequest(id, (request) => ({ ...request, status: 'dispatched' as const }));
    if (target) {
      const patientEmail = users.find((account) => account.id === target.patientId)?.email;
      addNotification({
        title: 'Emergency Dispatched',
        message: `Dispatch started for ${target.patientName} at ${target.location}.`,
        type: 'emergency',
        priority: target.priority,
        audience: 'personal',
        actionUrl: `/dashboard/requests?focus=${target.id}`,
        actionLabel: 'Open dispatch',
        targetEmails: patientEmail ? [patientEmail] : [],
        excludeEmails: user?.email ? [user.email] : [],
        actionUrlByRole: {
          ambulance: `/dashboard/requests?focus=${target.id}`,
          patient: `/dashboard/ambulance?focus=${target.id}`,
        },
      });
    }
  };

  const handleComplete = (id: string) => {
    const target = ambulanceRequests.find((request) => request.id === id);
    updateAmbulanceRequest(id, (request) => ({ ...request, status: 'completed' as const }));
    if (target) {
      const patientEmail = users.find((account) => account.id === target.patientId)?.email;
      addNotification({
        title: 'Emergency Closed',
        message: `Response for ${target.patientName} was marked complete.`,
        type: 'emergency',
        priority: 'medium',
        audience: 'personal',
        actionUrl: `/dashboard/${currentPage}?focus=${target.id}`,
        actionLabel: 'View case',
        targetEmails: patientEmail ? [patientEmail] : [],
        excludeEmails: user?.email ? [user.email] : [],
        actionUrlByRole: {
          ambulance: `/dashboard/requests?focus=${target.id}`,
          patient: `/dashboard/ambulance?focus=${target.id}`,
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-display font-bold text-foreground">{user?.role === 'ambulance' ? 'Emergency Requests' : 'Request Ambulance'}</h1></div>
        {user?.role === 'patient' && <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition"><AlertTriangle className="w-4 h-4" /> Request Ambulance</button>}
      </div>
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-destructive/30 p-6">
          <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-display font-semibold text-card-foreground">Emergency Request</h2><button onClick={() => setShowForm(false)} className="text-muted-foreground"><X className="w-5 h-5" /></button></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-card-foreground mb-1.5 block">Location</label><input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Enter your address" className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="text-sm font-medium text-card-foreground mb-1.5 block">Priority</label><select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as typeof formData.priority })} className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
          </div>
          <button onClick={handleRequest} className="mt-4 px-6 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition">Send Emergency Request</button>
        </motion.div>
      )}
      {visibleRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Inbox className="w-10 h-10 mb-3" />
          <p className="text-sm">No ambulance requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleRequests.map((request, index) => (
            <motion.div key={request.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`bg-card rounded-2xl border p-5 ${focusId === request.id ? 'border-primary ring-2 ring-primary/20' : request.priority === 'critical' ? 'border-destructive/30' : 'border-border'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${priorityColors[request.priority]}`}><Ambulance className="w-6 h-6" /></div>
                  <div>
                    <div className="text-base font-medium text-card-foreground">{request.patientName}</div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> {request.location}</div>
                    <div className="text-xs text-muted-foreground mt-1">{request.date} at {request.time}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${priorityColors[request.priority]}`}>{request.priority}</span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${request.status === 'requested' ? 'bg-warning/10 text-warning' : request.status === 'dispatched' ? 'bg-info/10 text-info' : 'bg-success/10 text-success'}`}>{request.status}</span>
                  </div>
                  {user?.role === 'ambulance' && request.status === 'requested' && <button onClick={() => handleDispatch(request.id)} className="px-3 py-1 rounded-lg bg-info/10 text-info text-xs font-medium hover:bg-info/20">Dispatch</button>}
                  {user?.role === 'ambulance' && request.status === 'dispatched' && <button onClick={() => handleComplete(request.id)} className="px-3 py-1 rounded-lg bg-success/10 text-success text-xs font-medium hover:bg-success/20">Complete</button>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AmbulancePage;
