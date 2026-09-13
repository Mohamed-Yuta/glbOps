import React, { useState } from "react";
import { X, ChevronRight, Building2 } from "lucide-react";

export default function NewProjetModal({ onClose, onCreate, clients, presetClient }) {
  const [selectedClientId, setSelectedClientId] = useState(presetClient ? presetClient.id : "");
  const [newClientNom, setNewClientNom] = useState("");
  const [refFonciere, setRefFonciere] = useState("");
  const [situation, setSituation] = useState("");
  const [nature, setNature] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const creatingNewClient = !presetClient && selectedClientId === "__new__";
  const clientReady = presetClient ? true : creatingNewClient ? newClientNom.trim().length > 0 : selectedClientId !== "";

  const submit = () => {
    if (!clientReady || !situation) return;
    const latNum = parseFloat(lat.replace(",", "."));
    const lngNum = parseFloat(lng.replace(",", "."));
    onCreate({
      clientId: presetClient ? presetClient.id : creatingNewClient ? null : selectedClientId,
      newClientNom: presetClient ? null : creatingNewClient ? newClientNom.trim() : null,
      refFonciere,
      situation,
      nature,
      lat: Number.isFinite(latNum) ? latNum : null,
      lng: Number.isFinite(lngNum) ? lngNum : null,
    });
    onClose();
  };

  return (
    <div className="gt-drawer-backdrop" onClick={onClose}>
      <div className="gt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gt-drawer-head">
          <div className="gt-drawer-client">Nouveau projet</div>
          <button className="gt-iconbtn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="gt-form" style={{ padding: "16px 20px 20px" }}>
          {presetClient ? (
            <>
              <label>Client</label>
              <div className="gt-chip" style={{ width: "fit-content" }}>
                <Building2 size={12} /> {presetClient.nom} ({presetClient.id})
              </div>
            </>
          ) : (
            <>
              <label>Client</label>
              <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
                <option value="">— choisir un client —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom} ({c.id})</option>
                ))}
                <option value="__new__">+ Nouveau client…</option>
              </select>
              {creatingNewClient && (
                <input value={newClientNom} onChange={(e) => setNewClientNom(e.target.value)} placeholder="Nom du nouveau client" autoFocus />
              )}
            </>
          )}
          <label>Référence foncière</label>
          <input value={refFonciere} onChange={(e) => setRefFonciere(e.target.value)} placeholder="ex. TF/12345/R" />
          <label>Situation / localisation</label>
          <input value={situation} onChange={(e) => setSituation(e.target.value)} placeholder="ex. Hay Riad, Rabat" />
          <label>Nature du projet</label>
          <input value={nature} onChange={(e) => setNature(e.target.value)} placeholder="ex. Lotissement résidentiel" />
          <label>Coordonnées GPS (pour la carte, facultatif)</label>
          <div className="gt-formrow">
            <input style={{ flex: 1 }} value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Latitude, ex. 33.9716" />
            <input style={{ flex: 1 }} value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Longitude, ex. -6.8498" />
          </div>
          <button className="gt-btn gt-btn-primary" onClick={submit} disabled={!clientReady || !situation}>
            Créer le projet <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
