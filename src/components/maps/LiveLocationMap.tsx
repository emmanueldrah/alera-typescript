import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type LocationData } from '@/hooks/useLiveLocation';
import { MapPin, Navigation } from 'lucide-react';

// Fix for default marker icons in Leaflet + React environment
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom provider icon (e.g. ambulance or doctor)
const providerIcon = L.divIcon({
  html: `<div class="bg-primary text-primary-foreground p-1.5 rounded-full border-2 border-background shadow-lg pulse-animation"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-navigation"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg></div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Custom patient icon
const patientIcon = L.divIcon({
  html: `<div class="bg-destructive text-destructive-foreground p-1.5 rounded-full border-2 border-background shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.192-7.397 11.602a1.106 1.106 0 0 1-1.206 0C9.539 20.192 4 14.993 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface LiveLocationMapProps {
  myLocation: LocationData | null;
  peerLocation: LocationData | null;
  myRole?: string;
  className?: string;
}

// Component to handle map centering when positions change
const MapUpdater: React.FC<{ myLocation: LocationData | null; peerLocation: LocationData | null }> = ({ myLocation, peerLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (myLocation && peerLocation) {
      const bounds = L.latLngBounds([
        [myLocation.lat, myLocation.lng],
        [peerLocation.lat, peerLocation.lng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (myLocation) {
      map.setView([myLocation.lat, myLocation.lng], 15);
    } else if (peerLocation) {
      map.setView([peerLocation.lat, peerLocation.lng], 15);
    }
  }, [map, myLocation, peerLocation]);

  return null;
};

export const LiveLocationMap: React.FC<LiveLocationMapProps> = ({
  myLocation,
  peerLocation,
  myRole = 'patient',
  className = "h-[400px] w-full rounded-2xl overflow-hidden border border-border bg-muted/20"
}) => {
  const defaultPosition: [number, number] = [0, 0];
  const centersOn = myLocation ? [myLocation.lat, myLocation.lng] : (peerLocation ? [peerLocation.lat, peerLocation.lng] : defaultPosition);

  // Determine icons based on role
  const isPatient = myRole === 'patient';
  const myMarkerIcon = isPatient ? patientIcon : providerIcon;
  const peerMarkerIcon = isPatient ? providerIcon : patientIcon;

  return (
    <div className={className}>
      <MapContainer
        center={centersOn as [number, number]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {myLocation && (
          <Marker 
            position={[myLocation.lat, myLocation.lng]} 
            icon={myMarkerIcon}
          >
            <Popup>
              <div className="text-sm font-semibold">You</div>
            </Popup>
          </Marker>
        )}

        {peerLocation && (
          <Marker 
            position={[peerLocation.lat, peerLocation.lng]} 
            icon={peerMarkerIcon}
          >
            <Popup>
              <div className="text-sm font-semibold">
                {isPatient ? 'Responder' : 'Patient'}
              </div>
            </Popup>
          </Marker>
        )}

        <MapUpdater myLocation={myLocation} peerLocation={peerLocation} />
      </MapContainer>
    </div>
  );
};
