import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { liveLocationApi } from '@/lib/apiService';

export interface LocationData {
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  user_id?: string | number;
  role?: string;
  timestamp?: string;
}

type UseLiveLocationOptions = {
  requestId?: string;
  enabled?: boolean;
  shouldShare?: boolean;
  myRole?: string;
};

const buildWebSocketUrl = (requestId: string) => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  const apiBase = import.meta.env.VITE_API_URL || '';
  const wsBase = apiBase.replace(/^http/, 'ws');
  return wsBase
    ? `${wsBase}/ws/location/${requestId}`
    : `${protocol}//${host}/api/ws/location/${requestId}`;
};

export const useLiveLocation = ({
  requestId,
  enabled = false,
  shouldShare = false,
  myRole,
}: UseLiveLocationOptions) => {
  const [myLocation, setMyLocation] = useState<LocationData | null>(null);
  const [patientLocation, setPatientLocation] = useState<LocationData | null>(null);
  const [ambulanceLocation, setAmbulanceLocation] = useState<LocationData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const isMounted = useRef(true);

  const setRoleLocation = useCallback((payload: LocationData) => {
    const normalizedRole = payload.role === 'provider' ? 'doctor' : payload.role;
    if (normalizedRole === 'patient') {
      setPatientLocation(payload);
    } else if (normalizedRole === 'ambulance') {
      setAmbulanceLocation(payload);
    }
  }, []);

  const pushLocationToBackend = useCallback(async (location: LocationData) => {
    try {
      await liveLocationApi.updateMine({
        latitude: location.lat,
        longitude: location.lng,
        sharing_enabled: true,
      });
    } catch (locationError) {
      console.error('Failed to persist live location:', locationError);
    }
  }, []);

  const connect = useCallback(() => {
    if (!requestId || socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const socket = new WebSocket(buildWebSocketUrl(requestId));

    socket.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as LocationData & { type?: string };
        if (data.type === 'location_update' || data.type === 'location_snapshot') {
          setRoleLocation(data);
        }
      } catch (parseError) {
        console.error('Failed to parse location message', parseError);
      }
    };

    socket.onclose = (event) => {
      setIsConnected(false);
      if (event.code !== 1000 && enabled) {
        reconnectTimerRef.current = window.setTimeout(() => {
          if (isMounted.current) {
            connect();
          }
        }, 3000);
      }
    };

    socket.onerror = () => {
      setError('Live tracking connection failed');
    };

    socketRef.current = socket;
  }, [enabled, requestId, setRoleLocation]);

  const stopTracking = useCallback(async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (shouldShare) {
      try {
        await liveLocationApi.disableMine();
      } catch (disableError) {
        console.error('Failed to disable live location sharing:', disableError);
      }
    }
  }, [shouldShare]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const nextLocation: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          heading: position.coords.heading ?? undefined,
          speed: position.coords.speed ?? undefined,
          role: myRole,
          timestamp: new Date().toISOString(),
        };
        setMyLocation(nextLocation);
        setRoleLocation(nextLocation);
        void pushLocationToBackend(nextLocation);

        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            type: 'location_update',
            ...nextLocation,
          }));
        }
      },
      (geoError) => {
        setError(`Geolocation error: ${geoError.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, [myRole, pushLocationToBackend, setRoleLocation]);

  const refreshSnapshot = useCallback(async () => {
    if (!requestId) return;
    try {
      const snapshot = await liveLocationApi.getRequestTracking(requestId);
      if (snapshot.patient_location?.latitude != null && snapshot.patient_location.longitude != null) {
        setPatientLocation({
          lat: snapshot.patient_location.latitude,
          lng: snapshot.patient_location.longitude,
          user_id: snapshot.patient_location.user_id,
          role: snapshot.patient_location.role,
          timestamp: snapshot.patient_location.last_updated ?? undefined,
        });
      }
      if (snapshot.ambulance_location?.latitude != null && snapshot.ambulance_location.longitude != null) {
        setAmbulanceLocation({
          lat: snapshot.ambulance_location.latitude,
          lng: snapshot.ambulance_location.longitude,
          user_id: snapshot.ambulance_location.user_id,
          role: snapshot.ambulance_location.role,
          timestamp: snapshot.ambulance_location.last_updated ?? undefined,
        });
      }
    } catch (snapshotError) {
      console.error('Failed to fetch live location snapshot:', snapshotError);
    }
  }, [requestId]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled || !requestId) {
      return undefined;
    }

    void refreshSnapshot();
    connect();
    if (shouldShare) {
      startTracking();
    }

    return () => {
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      void stopTracking();
      if (socketRef.current) {
        socketRef.current.close(1000);
        socketRef.current = null;
      }
    };
  }, [connect, enabled, refreshSnapshot, requestId, shouldShare, startTracking, stopTracking]);

  const peerLocation = useMemo(() => {
    const normalizedRole = myRole === 'provider' ? 'doctor' : myRole;
    return normalizedRole === 'patient' ? ambulanceLocation : patientLocation;
  }, [ambulanceLocation, myRole, patientLocation]);

  return {
    myLocation,
    peerLocation,
    patientLocation,
    ambulanceLocation,
    isConnected,
    error,
    reconnect: connect,
  };
};
