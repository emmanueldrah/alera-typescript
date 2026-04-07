import { useState, useEffect, useRef, useCallback } from 'react';

export interface LocationData {
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  user_id?: string | number;
  role?: string;
  timestamp?: string;
}

/**
 * Hook to manage live location tracking over WebSockets.
 * 
 * @param requestId The ID of the request/room to join
 * @param isSender Whether this user should broadcast their own location
 */
export const useLiveLocation = (requestId: string, isSender: boolean = false) => {
  const [myLocation, setMyLocation] = useState<LocationData | null>(null);
  const [peerLocation, setPeerLocation] = useState<LocationData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    // Determine WebSocket URL based on current environment
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    // In local dev with Vite proxy, it might be different, but usually window.location.host works
    // If VITE_API_URL is set, we prefer that for the host part
    const apiBase = import.meta.env.VITE_API_URL || '';
    const wsBase = apiBase.replace(/^http/, 'ws');
    const wsUrl = wsBase 
      ? `${wsBase}/ws/location/${requestId}`
      : `${protocol}//${host}/api/ws/location/${requestId}`;

    console.log(`Connecting to location WS: ${wsUrl}`);
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('Location WebSocket connected');
      setIsConnected(true);
      setError(null);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'location_update') {
          setPeerLocation(data);
        }
      } catch (err) {
        console.error('Failed to parse location message', err);
      }
    };

    socket.onclose = (event) => {
      console.log('Location WebSocket disconnected', event.code);
      setIsConnected(false);
      
      // Auto-reconnect after 3 seconds if not a clean/auth-failure close
      if (event.code !== 1000 && event.code !== 4001 && event.code !== 4003) {
        setTimeout(() => {
          if (isMounted.current) connect();
        }, 3000);
      }
    };

    socket.onerror = () => {
      setError('WebSocket connection error');
    };

    socketRef.current = socket;
  }, [requestId]);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          heading: position.coords.heading ?? undefined,
          speed: position.coords.speed ?? undefined,
        };
        setMyLocation(newLocation);

        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            type: 'location_update',
            ...newLocation
          }));
        }
      },
      (err) => {
        setError(`Geolocation error: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (requestId) {
      connect();
      if (isSender) {
        startTracking();
      }
    }

    return () => {
      stopTracking();
      if (socketRef.current) {
        socketRef.current.close(1000);
      }
    };
  }, [connect, isSender, requestId, startTracking, stopTracking]);

  return {
    myLocation,
    peerLocation,
    isConnected,
    error,
    reconnect: connect
  };
};
