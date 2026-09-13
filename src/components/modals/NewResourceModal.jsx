import React, { useState } from "react";
import { X, ChevronRight } from "lucide-react";

export default function NewResourceModal({ title, label, placeholder, onClose, onCreate }) {
  const [nom, setNom] = useState("");

  const submit = () => {
    if (!nom.trim()) return;
    onCreate(nom.trim());
    onClose();
  };

  return (
    <div className="gt-drawer-backdrop" onClick={onClose}>
      <div className="gt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gt-drawer-head">
          <div className="gt-drawer-client">{title}</div>
          <button className="gt-iconbtn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="gt-form" style={{ padding: "16px 20px 20px" }}>
          <label>{label}</label>
          <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder={placeholder} autoFocus onKeyDown={(e) => e.key === "Enter" && submit()} />
          <button className="gt-btn gt-btn-primary" onClick={submit} disabled={!nom.trim()}>
            Créer <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
