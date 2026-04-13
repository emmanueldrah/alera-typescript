import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Ambulance, Eye, Inbox, LocateFixed, MapPin, Navigation, RefreshCcw, Route, ShieldCheck, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { LiveLocationMap } from '@/components/maps/LiveLocationMap';
import { useAuth } from '@/contexts/useAuth';
import { useAppData } from '@/contexts/useAppData';
import { useNotifications } from '@/contexts/useNotifications';
import { type AmbulanceRequest } from '@/data/mockData';
import { useLiveLocation } from '@/hooks/useLiveLocation';
import { ambulanceApi } from '@/lib/apiService';

const priorityColors: Record<string, string> = {
  critical: 'bg-destructive/10 text-destructive',
  high: 'bg-warning/10 text-warning',
  medium: 'bg-info/10 text-info',
  low: 'bg-muted text-muted-foreground',
};

const statusColors: Record<string, string> = {
  requested: 'bg-warning/10 text-warning',
  accepted: 'bg-primary/10 text-primary',
  dispatched: 'bg-info/10 text-info',
  'en-route': 'bg-sky-100 text-sky-700',
  arrived: 'bg-success/10 text-success',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
};

type RequestDraft = {
  priority: AmbulanceRequest['priority'];
  location: string;
  address?: string;
  latitude?: number;
  longitude?: number;
};

const getCurrentPosition = () =>
  new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });

const reverseGeocode = async (latitude: number, longitude: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );
    const payload = await response.json();
    return payload.display_name as string | undefined;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return undefined;
  }
};

const describeStatus = (request: AmbulanceRequest, isPatientView: boolean) => {
  switch (request.status) {
    case 'requested':
      return isPatientView ? 'Request sent to ambulance teams' : 'Waiting for acceptance';
    case 'accepted':
      return isPatientView ? 'Ambulance accepted your request' : 'Case accepted and preparing dispatch';
    case 'dispatched':
      return isPatientView ? 'Ambulance on the way' : 'Dispatch confirmed';
    case 'en-route':
      return isPatientView ? 'Responder is navigating to you' : 'Driving to patient';
    case 'arrived':
      return 'Arriving now';
    case 'completed':
      return 'Emergency completed';
    case 'cancelled':
      return 'Emergency cancelled';
    default:
      return 'Emergency active';
  }
};

const AmbulancePage = () => {
  const { user, getUsers } = useAuth();
  const { ambulanceRequests, refreshAppData } = useAppData();
  const { addNotification } = useNotifications();
  const [searchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [draft, setDraft] = useState<RequestDraft>({ priority: 'critical', location: '' });
  const [trackingRequestId, setTrackingRequestId] = useState<string | null>(null);
  const [actionRequestId, setActionRequestId] = useState<string | null>(null);

  const users = getUsers();
  const focusId = searchParams.get('focus');
  const isPatientView = user?.role === 'patient';
  const canDispatch = user?.role === 'ambulance';

  const visibleRequests = useMemo(() => {
    return ambulanceRequests.filter((request) => {
      if (user?.role === 'patient') return request.patientId === user.id;
      if (user?.role === 'ambulance' || user?.role === 'hospital' || user?.role === 'doctor') return true;
      return false;
    });
  }, [ambulanceRequests, user?.id, user?.role]);

  const activeOwnRequest = useMemo(() => {
    if (!isPatientView || !user) return null;
    return visibleRequests.find((request) => request.patientId === user.id && !['completed', 'cancelled'].includes(request.status)) ?? null;
  }, [isPatientView, user, visibleRequests]);

  useEffect(() => {
    if (activeOwnRequest && !trackingRequestId) {
      setTrackingRequestId(activeOwnRequest.id);
    }
  }, [activeOwnRequest, trackingRequestId]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refreshAppData();
    }, 5000);
    return () => window.clearInterval(interval);
  }, [refreshAppData]);

  const trackingRequest = visibleRequests.find((request) => request.id === trackingRequestId) ?? null;
  const shouldShareLiveLocation = Boolean(
    trackingRequest &&
    user &&
    (
      (user.role === 'patient' && trackingRequest.patientId === user.id) ||
      (user.role === 'ambulance' && trackingRequest.assignedAmbulanceId === user.id)
    ) &&
    !['completed', 'cancelled'].includes(trackingRequest.status),
  );

  const {
    ambulanceLocation,
    patientLocation,
    isConnected,
    error: wsError,
    transportMode,
  } = useLiveLocation({
    requestId: trackingRequest?.id,
    enabled: Boolean(trackingRequest),
    shouldShare: shouldShareLiveLocation,
    myRole: user?.role,
  });

  const liveTrackingStatus = transportMode === 'socket'
    ? { label: 'Live feed connected', classes: 'bg-success/10 text-success' }
    : transportMode === 'polling'
      ? { label: 'Auto-refresh active', classes: 'bg-primary/10 text-primary' }
      : { label: 'Connecting...', classes: 'bg-warning/10 text-warning' };

  const captureLocation = async () => {
    if (!navigator.geolocation) {
      setRequestError('This browser does not support GPS location sharing.');
      return;
    }

    setIsCapturingLocation(true);
    setRequestError(null);
    try {
      const position = await getCurrentPosition();
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const label = await reverseGeocode(latitude, longitude);
      setDraft((current) => ({
        ...current,
        latitude,
        longitude,
        address: label,
        location: label || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
      }));
    } catch (error) {
      const message = error instanceof GeolocationPositionError
        ? error.message
        : 'Unable to capture your current position.';
      setRequestError(message);
    } finally {
      setIsCapturingLocation(false);
    }
  };

  const handleRequest = async () => {
    if (!draft.latitude || !draft.longitude || !draft.location) {
      setRequestError('Capture your current GPS location before sending the emergency request.');
      return;
    }

    setActionRequestId('create');
    setRequestError(null);
    try {
      const created = await ambulanceApi.createRequest({
        location_name: draft.location,
        address: draft.address,
        latitude: draft.latitude,
        longitude: draft.longitude,
        description: `Emergency pickup requested at ${draft.location}`,
        priority: draft.priority,
      });

      await refreshAppData();
      setTrackingRequestId(String(created.id));
      setShowForm(false);
      setDraft({ priority: 'critical', location: '' });

      addNotification({
        title: draft.priority === 'critical' ? 'Critical ambulance request sent' : 'Ambulance request sent',
        message: `Live location shared for ${created.location_name}.`,
        type: 'emergency',
        priority: draft.priority,
        audience: 'personal',
        targetRoles: ['ambulance', 'hospital', 'doctor'],
        actionUrlByRole: {
          patient: `/dashboard/ambulance?focus=${created.id}`,
          ambulance: `/dashboard/requests?focus=${created.id}`,
          hospital: `/dashboard/requests?focus=${created.id}`,
          doctor: `/dashboard/requests?focus=${created.id}`,
        },
      });
    } catch (error) {
      console.error('Failed to create ambulance request:', error);
      setRequestError('We could not send the emergency request. Please try again.');
    } finally {
      setActionRequestId(null);
    }
  };

  const updateStatus = async (requestId: string, updateData: Parameters<typeof ambulanceApi.updateRequest>[1]) => {
    setActionRequestId(requestId);
    try {
      await ambulanceApi.updateRequest(requestId, updateData);
      await refreshAppData();
      setTrackingRequestId(requestId);
    } catch (error) {
      console.error('Failed to update ambulance request:', error);
    } finally {
      setActionRequestId(null);
    }
  };

  const handleAccept = async (request: AmbulanceRequest) => {
    await updateStatus(request.id, {
      status: 'dispatched',
      assigned_ambulance_id: Number(user?.id),
    });
    addNotification({
      title: 'Ambulance accepted',
      message: `An ambulance is on the way to ${request.patientName}.`,
      type: 'emergency',
      priority: request.priority,
      audience: 'personal',
      targetEmails: users.find((account) => account.id === request.patientId)?.email ? [users.find((account) => account.id === request.patientId)!.email] : [],
      actionUrlByRole: {
        patient: `/dashboard/ambulance?focus=${request.id}`,
        ambulance: `/dashboard/requests?focus=${request.id}`,
      },
    });
  };

  const renderActions = (request: AmbulanceRequest) => {
    const isActive = actionRequestId === request.id;
    const trackButton = (
      <button
        onClick={() => setTrackingRequestId(request.id)}
        className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
      >
        <Eye className="h-3.5 w-3.5" />
        Track Live
      </button>
    );

    if (user?.role === 'ambulance') {
      return (
        <>
          {trackButton}
          {request.status === 'requested' && (
            <button
              onClick={() => void handleAccept(request)}
              disabled={isActive}
              className="rounded-lg bg-info/10 px-3 py-1 text-xs font-medium text-info hover:bg-info/20 disabled:opacity-60"
            >
              Accept
            </button>
          )}
          {(request.status === 'accepted' || request.status === 'dispatched') && (
            <button
              onClick={() => void updateStatus(request.id, { status: 'en_route' })}
              disabled={isActive}
              className="rounded-lg bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700 hover:bg-sky-200 disabled:opacity-60"
            >
              En Route
            </button>
          )}
          {request.status === 'en-route' && (
            <button
              onClick={() => void updateStatus(request.id, { status: 'arrived' })}
              disabled={isActive}
              className="rounded-lg bg-success/10 px-3 py-1 text-xs font-medium text-success hover:bg-success/20 disabled:opacity-60"
            >
              Arrived
            </button>
          )}
          {(request.status === 'arrived' || request.status === 'en-route' || request.status === 'dispatched') && (
            <button
              onClick={() => void updateStatus(request.id, { status: 'completed' })}
              disabled={isActive}
              className="rounded-lg bg-muted px-3 py-1 text-xs font-medium text-foreground hover:bg-muted/80 disabled:opacity-60"
            >
              Complete
            </button>
          )}
        </>
      );
    }

    return trackButton;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {isPatientView ? 'Request Ambulance' : 'Emergency Tracking'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isPatientView
              ? 'Share your live GPS location so an ambulance can find you in real time.'
              : 'Monitor live patient and ambulance locations for active emergency incidents.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => void refreshAppData()}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted/50"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
          {isPatientView && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground hover:opacity-90"
            >
              <AlertTriangle className="h-4 w-4" />
              Request Ambulance
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-destructive/30 bg-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-display font-semibold text-card-foreground">Emergency Request</h2>
              <p className="mt-1 text-sm text-muted-foreground">GPS capture is required before the request can be sent.</p>
            </div>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="mb-2 text-sm font-medium text-card-foreground">Live GPS location</div>
              <div className="text-sm text-muted-foreground">
                {draft.location || 'No location captured yet.'}
              </div>
              {draft.latitude && draft.longitude && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {draft.latitude.toFixed(5)}, {draft.longitude.toFixed(5)}
                </div>
              )}
              <button
                onClick={() => void captureLocation()}
                disabled={isCapturingLocation}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 disabled:opacity-60"
              >
                <LocateFixed className="h-4 w-4" />
                {isCapturingLocation ? 'Capturing location...' : 'Capture my location'}
              </button>
            </div>

            <div className="rounded-2xl border border-border bg-background p-4">
              <label className="mb-2 block text-sm font-medium text-card-foreground">Priority</label>
              <select
                value={draft.priority}
                onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value as AmbulanceRequest['priority'] }))}
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <div className="mt-4 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
                Ambulance teams will receive your request with live coordinates and can start tracking immediately after acceptance.
              </div>
            </div>
          </div>

          {requestError && (
            <div className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {requestError}
            </div>
          )}

          <button
            onClick={() => void handleRequest()}
            disabled={actionRequestId === 'create' || !draft.latitude || !draft.longitude}
            className="mt-5 rounded-xl bg-destructive px-6 py-2.5 text-sm font-semibold text-destructive-foreground hover:opacity-90 disabled:opacity-60"
          >
            {actionRequestId === 'create' ? 'Sending emergency request...' : 'Send Emergency Request'}
          </button>
        </motion.div>
      )}

      {trackingRequest && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-lg font-display font-semibold">
                  <Navigation className="h-5 w-5 text-primary" />
                  Live Tracking
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-lg px-3 py-1 text-xs font-medium ${priorityColors[trackingRequest.priority]}`}>
                    {trackingRequest.priority}
                  </span>
                  <span className={`rounded-lg px-3 py-1 text-xs font-medium ${statusColors[trackingRequest.status]}`}>
                    {trackingRequest.status}
                  </span>
                  <span className="rounded-lg bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {describeStatus(trackingRequest, isPatientView)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${liveTrackingStatus.classes}`}>
                  {liveTrackingStatus.label}
                </span>
                <button onClick={() => setTrackingRequestId(null)} className="text-sm text-muted-foreground hover:text-foreground">
                  Close
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl bg-muted/40 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Patient</div>
                <div className="mt-2 font-medium text-foreground">{trackingRequest.patientName}</div>
              </div>
              <div className="rounded-xl bg-muted/40 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Ambulance</div>
                <div className="mt-2 font-medium text-foreground">
                  {trackingRequest.assignedAmbulanceId
                    ? users.find((account) => account.id === trackingRequest.assignedAmbulanceId)?.name || `Responder #${trackingRequest.assignedAmbulanceId}`
                    : 'Awaiting assignment'}
                </div>
              </div>
              <div className="rounded-xl bg-muted/40 p-4">
                <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Sharing</div>
                <div className="mt-2 flex items-center gap-2 font-medium text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  {shouldShareLiveLocation ? 'Your live location is being shared' : 'View-only mode'}
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <LiveLocationMap patientLocation={patientLocation} ambulanceLocation={ambulanceLocation} />
            <div className="pointer-events-none absolute left-4 top-4 z-[1000] max-w-sm rounded-2xl bg-background/90 p-4 shadow-lg backdrop-blur">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Route className="h-4 w-4 text-primary" />
                {describeStatus(trackingRequest, isPatientView)}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Patient and ambulance markers update continuously while sharing stays enabled.
              </div>
              {wsError && (
                <div className={`mt-2 text-xs ${transportMode === 'polling' ? 'text-muted-foreground' : 'text-destructive'}`}>{wsError}</div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {visibleRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Inbox className="mb-3 h-10 w-10" />
          <p className="text-sm">No ambulance requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`rounded-2xl border bg-card p-5 ${focusId === request.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${priorityColors[request.priority]}`}>
                    <Ambulance className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-base font-medium text-card-foreground">{request.patientName}</div>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {request.location}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {request.date} at {request.time}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex flex-wrap justify-end gap-2">
                    <span className={`rounded-lg px-3 py-1 text-xs font-medium ${priorityColors[request.priority]}`}>
                      {request.priority}
                    </span>
                    <span className={`rounded-lg px-3 py-1 text-xs font-medium ${statusColors[request.status]}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {describeStatus(request, isPatientView)}
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    {renderActions(request)}
                  </div>
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
