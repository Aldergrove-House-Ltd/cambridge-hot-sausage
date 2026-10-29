"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapPin {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

interface LocateUsMapProps {
  pins?: MapPin[];
}

const DEFAULT_PIN: MapPin = {
  lat: 52.206680540625506,
  lng: 0.1298263621124822,
  name: "Cambridge Hot Sausage",
  address: "Pitch 14, Fitzroy Street, Cambridge CB1 1EW",
};

const pinIcon = L.divIcon({
  className: "chs-pin",
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
  popupAnchor: [0, -44],
});

export default function LocateUsMap({ pins }: LocateUsMapProps) {
  const markers = pins && pins.length > 0 ? pins : [DEFAULT_PIN];
  const center: [number, number] = [markers[0].lat, markers[0].lng];
  const zoom = markers.length > 1 ? 15 : 17;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      zoomControl={true}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.fr/mentions-legales/">OpenStreetMap France</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
      />
      {markers.map((pin, i) => (
        <Marker key={i} position={[pin.lat, pin.lng]} icon={pinIcon}>
          <Popup>
            <div style={{ fontFamily: "system-ui, sans-serif" }}>
              <strong style={{ display: "block", marginBottom: 4, color: "#5A1F1F" }}>
                {pin.name}
              </strong>
              <span style={{ color: "#2B2B2B" }}>{pin.address}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
