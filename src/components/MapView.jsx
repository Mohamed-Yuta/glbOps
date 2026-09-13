import React, { useEffect, useRef, useState } from "react";
import { Map as MaplibreMap, Marker as MaplibreMarker, Popup as MaplibrePopup, NavigationControl, LngLatBounds } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { STATUS_COLORS, STATUS_LABELS } from "../constants";
import { projetStatus } from "../utils/stats";

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
  const markersRef = useRef([]);
  const [loaded, setLoaded] = useState(false);
  const geolocated = projects.filter((p) => p.lat != null && p.lng != null);

  const counts = { vide: 0, encours: 0, nonconforme: 0, livre: 0 };
  geolocated.forEach((pr) => { counts[projetStatus(pr)] += 1; });

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const map = new MaplibreMap({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [-6.85, 34.0],
      zoom: 7,
      attributionControl: { compact: true },
    });
    map.addControl(new NavigationControl({ visualizePitch: false }), "top-right");
    map.once("load", () => setLoaded(true));
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const render = () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      if (geolocated.length === 0) return;
      const bounds = new LngLatBounds();

      geolocated.forEach((pr) => {
        const client = getClient(pr.clientId);
        const status = projetStatus(pr);

        const el = document.createElement("div");
        el.className = "gt-map-marker";
        el.innerHTML = pinSVG(STATUS_COLORS[status]);
        el.title = `${pr.id} — ${client?.nom || "—"}`;

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

        const marker = new MaplibreMarker({ element: el, anchor: "bottom" })
          .setLngLat([pr.lng, pr.lat])
          .setPopup(new MaplibrePopup({ offset: [0, -34], maxWidth: "260px" }).setDOMContent(popupNode))
          .addTo(map);

        markersRef.current.push(marker);
        bounds.extend([pr.lng, pr.lat]);
      });

      if (geolocated.length === 1) {
        map.easeTo({ center: [geolocated[0].lng, geolocated[0].lat], zoom: 11, duration: 500 });
      } else {
        map.fitBounds(bounds, { padding: { top: 50, bottom: 150, left: 50, right: 50 }, maxZoom: 12, duration: 500 });
      }
    };

    if (map.isStyleLoaded()) render();
    else map.once("load", render);
  }, [projects]);

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
        {!loaded && (
          <div className="gt-map-loading">
            <span className="gt-map-spinner" /> Chargement de la carte…
          </div>
        )}
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
