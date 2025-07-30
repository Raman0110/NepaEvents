import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

// Only allow setting new location if there's no existing one
function LocationMarker({ setNewVenue }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setNewVenue((prev) => ({
        ...prev,
        locationCoordinates: `${e.latlng.lat},${e.latlng.lng}`,
      }));
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function VenueLocationMap({ setNewVenue, existingCoordinates }) {
  const parsedCoordinates = existingCoordinates
    ? existingCoordinates.split(',').map(Number)
    : null;

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-red-200">
      <MapContainer
        center={parsedCoordinates || [27.7172, 85.324]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Show existing marker if coordinates are available */}
        {parsedCoordinates && <Marker position={parsedCoordinates} />}

        {/* Only allow click interaction if no existing coordinates */}
        {!parsedCoordinates && <LocationMarker setNewVenue={setNewVenue} />}
      </MapContainer>
    </div>
  );
}
