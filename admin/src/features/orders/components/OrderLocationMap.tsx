import "leaflet/dist/leaflet.css";

import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer } from "react-leaflet";

import { parseCoord } from "@/features/orders/utils/order-location.utils";
import { AppButton } from "@/shared/components";
import { useTranslation } from "@/shared/design-system/localization/contexts/LocalizationContext";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

/** Esri World Street Map — no API key. Avoid OSM public tiles and keyless CARTO. */
const MAP_TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
const MAP_TILE_ATTRIBUTION =
  'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, TomTom, FAO, NOAA, USGS';

export type OrderLocationMapProps = {
  latitude: string | number;
  longitude: string | number;
  customerAddress?: string | null;
};

type LatLngTuple = [number, number];

export function OrderLocationMap({
  latitude,
  longitude,
  customerAddress,
}: OrderLocationMapProps) {
  const t = useTranslation();
  const [route, setRoute] = useState<LatLngTuple[] | null>(null);
  const [driverPosition, setDriverPosition] = useState<LatLngTuple | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lat = parseCoord(latitude);
  const lng = parseCoord(longitude);

  const customerPosition = useMemo<LatLngTuple | null>(() => {
    if (lat == null || lng == null) {
      return null;
    }
    return [lat, lng];
  }, [lat, lng]);

  if (!customerPosition || lat == null || lng == null) {
    return (
      <p className="text-sm text-muted-foreground">{t.orderLocationMissing}</p>
    );
  }

  const googleMapsHref = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  async function getDirections() {
    if (!navigator.geolocation) {
      setError(t.orderLocationGeolocationUnavailable);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const driverLat = position.coords.latitude;
      const driverLng = position.coords.longitude;
      setDriverPosition([driverLat, driverLng]);

      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${driverLng},${driverLat};${lng},${lat}?overview=full&geometries=geojson`,
      );

      if (!response.ok) {
        throw new Error("osrm");
      }

      const data = (await response.json()) as {
        routes?: Array<{
          geometry?: { coordinates?: Array<[number, number]> };
        }>;
      };

      const coordinates = data.routes?.[0]?.geometry?.coordinates;
      if (!coordinates?.length) {
        throw new Error("osrm");
      }

      setRoute(coordinates.map(([routeLng, routeLat]) => [routeLat, routeLng]));
    } catch (err) {
      setRoute(null);
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        typeof (err as GeolocationPositionError).code === "number"
      ) {
        setError(t.orderLocationPermissionDenied);
      } else {
        setError(t.orderLocationRouteFailed);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-border">
        <MapContainer
          center={customerPosition}
          zoom={14}
          scrollWheelZoom={false}
          className="z-0 h-[360px] w-full"
        >
          <TileLayer attribution={MAP_TILE_ATTRIBUTION} url={MAP_TILE_URL} />
          <Marker position={customerPosition} />
          {driverPosition ? <Marker position={driverPosition} /> : null}
          {route ? (
            <Polyline positions={route} pathOptions={{ color: "#008158", weight: 4 }} />
          ) : null}
        </MapContainer>
      </div>

      <div className="flex flex-wrap gap-2">
        <AppButton
          type="button"
          onClick={() => void getDirections()}
          isLoading={loading}
          loadingText={t.orderLocationCalculating}
        >
          {t.orderLocationShowRoute}
        </AppButton>
        <AppButton type="button" variant="outline" asChild>
          <a href={googleMapsHref} target="_blank" rel="noopener noreferrer">
            {t.orderLocationOpenGoogleMaps}
          </a>
        </AppButton>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {customerAddress ? (
        <p className="text-sm text-muted-foreground">{customerAddress}</p>
      ) : null}
    </div>
  );
}
