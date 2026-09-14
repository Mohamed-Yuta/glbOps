import React, { useEffect, useRef, useState } from "react";
import {
  Map as MaplibreMap,
  Marker as MaplibreMarker,
  Popup as MaplibrePopup,
  NavigationControl,
  ScaleControl,
  GeolocateControl,
  FullscreenControl,
  LngLatBounds,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { AlertTriangle, RotateCcw, Satellite, Map as MapIcon } from "lucide-react";
import { STATUS_COLORS, STATUS_LABELS } from "../constants";
import { projetStatus } from "../utils/stats";
import { VECTOR_STYLE, RASTER_FALLBACK_STYLE, SATELLITE_STYLE } from "../utils/mapStyle";

const LOAD_TIMEOUT_MS = 8000;
const SOURCE_ID = "gt-projects";

function pinSVG(color) {
  return `
    <svg width="30" height="38" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 23 15 23s15-12.5 15-23C30 6.7 23.3 0 15 0z" fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="15" cy="15" r="5.5" fill="#fff"/>
    </svg>
  `;
}

export default function MapView({ projects, getClient, onOpenProjet }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const [loaded, setLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [basemap, setBasemap] = useState("street");
  const [rasterFallback, setRasterFallback] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const geolocated = projects.filter((p) => p.lat != null && p.lng != null);

  const counts = { vide: 0, encours: 0, nonconforme: 0, livre: 0 };
  geolocated.forEach((pr) => { counts[projetStatus(pr)] += 1; });

  const style = basemap === "satellite" ? SATELLITE_STYLE : rasterFallback ? RASTER_FALLBACK_STYLE : VECTOR_STYLE;

  useEffect(() => {
    if (!containerRef.current) return;

    setLoaded(false);
    setMapError(null);

    // React StrictMode double-invokes this effect (mount -> cleanup -> mount) synchronously in
    // dev. Deferring the actual MapLibre instantiation past that lets the phantom first
    // invocation get cancelled before it ever creates a map, instead of two instances fighting
    // over one container (which otherwise leaves the map permanently blank).
    let cancelled = false;
    let map = null;
    let timeoutId = null;

    const raf = requestAnimationFrame(() => {
      if (cancelled) return;

      map = new MaplibreMap({
        container: containerRef.current,
        style,
        center: [-6.85, 34.0],
        zoom: 7,
        attributionControl: { compact: true },
      });
      map.addControl(new NavigationControl({ visualizePitch: false }), "top-right");
      map.addControl(new GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }), "top-right");
      map.addControl(new FullscreenControl(), "top-right");
      map.addControl(new ScaleControl({ maxWidth: 100, unit: "metric" }), "top-left");

      const handleLoad = () => setLoaded(true);
      const handleError = (e) => {
        console.error("MapLibre error:", e?.error || e);
        if (basemap === "street" && !rasterFallback) {
          // Basemap style/tiles failed (network block, ad-blocker, unreachable host) — fall back to plain raster tiles.
          setRasterFallback(true);
        } else {
          setMapError("Impossible de charger le fond de carte. Vérifiez votre connexion internet.");
        }
      };

      map.on("load", handleLoad);
      map.on("error", handleError);
      mapRef.current = map;

      timeoutId = setTimeout(() => {
        if (!map._removed && !map.isStyleLoaded()) {
          handleError(new Error("timeout"));
        }
      }, LOAD_TIMEOUT_MS);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (timeoutId) clearTimeout(timeoutId);
      if (map) map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style, attempt]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const geojson = {
      type: "FeatureCollection",
      features: geolocated.map((pr) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [pr.lng, pr.lat] },
        properties: { projetId: pr.id },
      })),
    };

    const openPopupFor = (pr) => {
      const client = getClient(pr.clientId);
      const status = projetStatus(pr);
      const popupNode = document.createElement("div");
      popupNode.className = "gt-map-popup";
      popupNode.innerHTML = `
        <div class="gt-map-popup-top">
          <span class="gt-map-popup-id">${pr.id}</span>
          <span class="gt-map-popup-badge" style="color:${STATUS_COLORS[status]};border-color:${STATUS_COLORS[status]}">${STATUS_LABELS[status]}</span>
        </div>
        <div class="gt-map-popup-client">${client?.nom || "—"}</div>
        <div class="gt-map-popup-meta">${pr.situation}</div>
        <div class="gt-map-popup-meta">${pr.naturePrestationProjet || "—"} · Réf. ${pr.referenceFonciere || "—"}</div>
        <div class="gt-map-popup-meta">${pr.prestations.length} prestation${pr.prestations.length > 1 ? "s" : ""}</div>
      `;
      const btn = document.createElement("button");
      btn.className = "gt-map-popup-btn";
      btn.textContent = "Voir le projet →";
      btn.onclick = () => onOpenProjet(pr.id);
      popupNode.appendChild(btn);
      return new MaplibrePopup({ offset: [0, -34], maxWidth: "260px" }).setDOMContent(popupNode);
    };

    const syncMarkers = () => {
      if (!map.getSource(SOURCE_ID)) return;
      let features;
      try {
        features = map.querySourceFeatures(SOURCE_ID, { filter: ["!", ["has", "point_count"]] });
      } catch {
        return;
      }
      const visibleIds = new Set(features.map((f) => f.properties.projetId));

      Object.keys(markersRef.current).forEach((id) => {
        if (!visibleIds.has(id)) {
          markersRef.current[id].remove();
          delete markersRef.current[id];
        }
      });

      visibleIds.forEach((id) => {
        if (markersRef.current[id]) return;
        const pr = geolocated.find((p) => p.id === id);
        if (!pr) return;
        const status = projetStatus(pr);
        const el = document.createElement("div");
        el.className = "gt-map-marker";
        el.innerHTML = pinSVG(STATUS_COLORS[status]);
        el.title = `${pr.id} — ${getClient(pr.clientId)?.nom || "—"}`;

        const marker = new MaplibreMarker({ element: el, anchor: "bottom" })
          .setLngLat([pr.lng, pr.lat])
          .setPopup(openPopupFor(pr))
          .addTo(map);
        markersRef.current[id] = marker;
      });
    };

    const setupLayers = () => {
      if (!map.getSource(SOURCE_ID)) {
        map.addSource(SOURCE_ID, {
          type: "geojson",
          data: geojson,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });
        map.addLayer({
          id: "gt-clusters",
          type: "circle",
          source: SOURCE_ID,
          filter: ["has", "point_count"],
          paint: {
            "circle-color": "#14181F",
            "circle-radius": ["step", ["get", "point_count"], 16, 10, 20, 30, 26],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });
        map.addLayer({
          id: "gt-cluster-count",
          type: "symbol",
          source: SOURCE_ID,
          filter: ["has", "point_count"],
          layout: { "text-field": "{point_count_abbreviated}", "text-font": ["Noto Sans Bold"], "text-size": 12 },
          paint: { "text-color": "#ffffff" },
        });

        map.on("click", "gt-clusters", (e) => {
          const [feature] = map.queryRenderedFeatures(e.point, { layers: ["gt-clusters"] });
          const clusterId = feature.properties.cluster_id;
          map.getSource(SOURCE_ID).getClusterExpansionZoom(clusterId).then((zoom) => {
            map.easeTo({ center: feature.geometry.coordinates, zoom, duration: 400 });
          }).catch(() => {});
        });
        map.on("mouseenter", "gt-clusters", () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", "gt-clusters", () => { map.getCanvas().style.cursor = ""; });

        map.on("data", (e) => { if (e.sourceId === SOURCE_ID && e.isSourceLoaded) syncMarkers(); });
        map.on("moveend", syncMarkers);
      } else {
        map.getSource(SOURCE_ID).setData(geojson);
      }

      syncMarkers();

      const bounds = new LngLatBounds();
      geolocated.forEach((pr) => bounds.extend([pr.lng, pr.lat]));
      if (geolocated.length === 1) {
        map.easeTo({ center: [geolocated[0].lng, geolocated[0].lat], zoom: 11, duration: 500 });
      } else if (geolocated.length > 1) {
        map.fitBounds(bounds, { padding: { top: 50, bottom: 150, left: 50, right: 50 }, maxZoom: 12, duration: 500 });
      }
    };

    if (map.isStyleLoaded()) setupLayers();
    else map.once("load", setupLayers);
  }, [projects, style, attempt, loaded]);

  const retry = () => {
    setRasterFallback(false);
    setAttempt((a) => a + 1);
  };

  const toggleBasemap = () => {
    setRasterFallback(false);
    setBasemap((b) => (b === "satellite" ? "street" : "satellite"));
  };

  return (
    <>
      <div className="gt-stats">
        <div className="gt-stat"><div className="gt-stat-num">{geolocated.length}</div><div className="gt-stat-label">Projets géolocalisés</div></div>
        <div className="gt-stat"><div className="gt-stat-num" style={{ color: "var(--amber)" }}>{counts.encours}</div><div className="gt-stat-label">En cours</div></div>
        <div className="gt-stat"><div className="gt-stat-num" style={{ color: counts.nonconforme ? "var(--bad)" : "var(--ink)" }}>{counts.nonconforme}</div><div className="gt-stat-label">Non-conformité</div></div>
        <div className="gt-stat"><div className="gt-stat-num" style={{ color: "var(--good)" }}>{counts.livre}</div><div className="gt-stat-label">Livrés</div></div>
      </div>
      <div className="gt-map-wrap">
        <div ref={containerRef} className="gt-map" />
        {!loaded && !mapError && (
          <div className="gt-map-loading">
            <span className="gt-map-spinner" /> Chargement de la carte…
          </div>
        )}
        {mapError && (
          <div className="gt-map-loading gt-map-error">
            <AlertTriangle size={16} />
            <div>{mapError}</div>
            <button className="gt-btn gt-btn-neutral" onClick={retry}>
              <RotateCcw size={14} /> Réessayer
            </button>
          </div>
        )}
        <button className="gt-map-basemap-btn" onClick={toggleBasemap} title="Changer de fond de carte">
          {basemap === "satellite" ? <MapIcon size={14} /> : <Satellite size={14} />}
          {basemap === "satellite" ? "Plan" : "Satellite"}
        </button>
        <div className="gt-map-legend">
          <div className="gt-map-legend-title">Statut du projet</div>
          {Object.keys(STATUS_LABELS).map((k) => (
            <div className="gt-map-legend-row" key={k}>
              <span className="gt-map-legend-dot" style={{ background: STATUS_COLORS[k] }} />
              {STATUS_LABELS[k]}
            </div>
          ))}
        </div>
        {geolocated.length < projects.length && (
          <div className="gt-map-note">
            {projects.length - geolocated.length} projet{projects.length - geolocated.length > 1 ? "s" : ""} sans coordonnées, non affiché{projects.length - geolocated.length > 1 ? "s" : ""}.
          </div>
        )}
      </div>
    </>
  );
}
