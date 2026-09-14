import React, { useEffect, useRef, useState } from "react";
import { Map as MaplibreMap, Marker as MaplibreMarker, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Loader2 } from "lucide-react";
import { VECTOR_STYLE, RASTER_FALLBACK_STYLE } from "../utils/mapStyle";

export default function LocationPicker({ lat, lng, onPick, geocoding }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;
    let map = null;

    // React StrictMode double-invokes this effect (mount -> cleanup -> mount) synchronously in dev.
    // Deferring the actual MapLibre instantiation past that lets the phantom first invocation get
    // cancelled before it ever creates a map, instead of two instances fighting over one container.
    const raf = requestAnimationFrame(() => {
      if (cancelled) return;
      const hasPoint = lat != null && lng != null;

      map = new MaplibreMap({
        container: containerRef.current,
        style: VECTOR_STYLE,
        center: hasPoint ? [lng, lat] : [-6.85, 34.0],
        zoom: hasPoint ? 12 : 6,
        attributionControl: { compact: true },
      });
      map.addControl(new NavigationControl({ visualizePitch: false }), "top-right");
      map.on("error", () => map.setStyle(RASTER_FALLBACK_STYLE));
      map.on("click", (e) => onPick(e.lngLat.lat, e.lngLat.lng));

      mapRef.current = map;
      setReady(true);

      const resizeObserver = new ResizeObserver(() => map.resize());
      resizeObserver.observe(containerRef.current);
      map._locpickerResizeObserver = resizeObserver;
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (map) {
        map._locpickerResizeObserver?.disconnect();
        map.remove();
      }
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (lat == null || lng == null) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }
    if (!markerRef.current) {
      markerRef.current = new MaplibreMarker({ draggable: true, color: "#A3271D" }).setLngLat([lng, lat]).addTo(map);
      markerRef.current.on("dragend", () => {
        const p = markerRef.current.getLngLat();
        onPick(p.lat, p.lng);
      });
    } else {
      markerRef.current.setLngLat([lng, lat]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, ready]);

  return (
    <div className="gt-locpicker">
      <div ref={containerRef} className="gt-locpicker-map" />
      <div className="gt-locpicker-hint">
        {geocoding ? (
          <>
            <Loader2 size={11} className="gt-spin-icon" /> Recherche de l'adresse…
          </>
        ) : (
          "Cliquez sur la carte pour positionner le projet"
        )}
      </div>
    </div>
  );
}
