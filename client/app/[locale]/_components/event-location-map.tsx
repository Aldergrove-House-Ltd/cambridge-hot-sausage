"use client";

import { useMapEvents, MapContainer, TileLayer, Marker, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const CAMBRIDGE: [number, number] = [52.206680540625506, 0.1298263621124822];
const MILES_TO_METERS = 1609.34;

const pinIcon = L.divIcon({
  className: "event-pin",
  html: `
    <div style="position:relative;width:40px;height:50px;filter:drop-shadow(0 6px 10px rgba(43,43,43,0.35));">
      <svg viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0 C9 0 0 9 0 20 c0 14 20 30 20 30 s20 -16 20 -30 C40 9 31 0 20 0 z"
              fill="#5A1F1F" stroke="#ECD691" stroke-width="2.5" />
        <circle cx="20" cy="20" r="7" fill="#ECD691" />
      </svg>
    </div>
  `,
  iconSize: [40, 50],
  iconAnchor: [20, 50],
});

interface Props {
  onMapClick: (lat: number, lng: number) => void;
  pin: { lat: number; lng: number } | null;
  radiusMiles: number;
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function EventLocationMap({ onMapClick, pin, radiusMiles }: Props) {
  return (
    <MapContainer
      center={CAMBRIDGE}
      zoom={radiusMiles <= 50 ? 9 : radiusMiles <= 100 ? 8 : 7}
      scrollWheelZoom={true}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Circle
        center={CAMBRIDGE}
        radius={radiusMiles * MILES_TO_METERS}
        pathOptions={{
          color: "#5A1F1F",
          weight: 2,
          opacity: 0.3,
          fillColor: "#4F6B58",
          fillOpacity: 0.05,
          dashArray: "8 6",
        }}
      />

      <Circle
        center={CAMBRIDGE}
        radius={500}
        pathOptions={{
          color: "#ECD691",
          weight: 2,
          fillColor: "#ECD691",
          fillOpacity: 0.3,
        }}
      />

      {pin && (
        <Marker position={[pin.lat, pin.lng]} icon={pinIcon} />
      )}

      <ClickHandler onClick={onMapClick} />
    </MapContainer>
  );
}
