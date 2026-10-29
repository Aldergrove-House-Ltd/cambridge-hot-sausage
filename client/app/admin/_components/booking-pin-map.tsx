"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pinIcon = L.divIcon({
  className: "booking-pin",
  html: `
    <div style="position:relative;width:36px;height:46px;filter:drop-shadow(0 4px 8px rgba(43,43,43,0.3));">
      <svg viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0 C9 0 0 9 0 20 c0 14 20 30 20 30 s20 -16 20 -30 C40 9 31 0 20 0 z"
              fill="#5A1F1F" stroke="#ECD691" stroke-width="2.5" />
        <circle cx="20" cy="20" r="7" fill="#ECD691" />
      </svg>
    </div>
  `,
  iconSize: [36, 46],
  iconAnchor: [18, 46],
});

export default function BookingPinMap({ lat, lng }: { lat: number; lng: number }) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      scrollWheelZoom={false}
      zoomControl={true}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/voyager/{z}/{x}/{y}{r}.png"
      />
      <Marker position={[lat, lng]} icon={pinIcon} />
    </MapContainer>
  );
}
