import React from "react";
import { List, Building2, Wrench, Truck, UserRound, Map as MapIcon, Calendar } from "lucide-react";
import { ROLES } from "../constants";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";

// Grouped by what they're for, each with its own accent color (existing tokens, not a new
// palette) so the icon rail reads at a glance instead of one flat list of look-alike rows.
const NAV_GROUPS = [
  {
    label: "Suivi",
    items: [
      { key: "projets", label: "Projets", icon: List, color: "var(--accent)" },
      { key: "carte", label: "Carte", icon: MapIcon, color: "var(--status-success)" },
      { key: "calendrier", label: "Calendrier", icon: Calendar, color: "var(--blue)" },
    ],
  },
  {
    label: "Ressources",
    items: [
      { key: "clients", label: "Clients", icon: Building2, color: "var(--status-info)" },
      { key: "materiels", label: "Matériel", icon: Wrench, color: "var(--status-warning)" },
      { key: "vehicules", label: "Véhicules", icon: Truck, color: "var(--teal)" },
      { key: "employes", label: "Employés", icon: UserRound, color: "var(--violet)" },
    ],
  },
];

export default function AppSidebar({ visibleTabs, view, setView, currentUser, onRoleChange }) {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="gt-sidebar-brand">
          <img src="/logo.png" alt="Globétudes" className="gt-sidebar-brand-mark" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((item) => visibleTabs.includes(item.key));
          if (items.length === 0) return null;
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton isActive={view === item.key} onClick={() => setView(item.key)} tooltip={item.label}>
                        <span className="gt-sidebar-icon" style={{ "--icon-color": item.color }}>
                          <item.icon size={15} />
                        </span>
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter>
        <div className="gt-sidebar-footer">
          <div className="gt-sidebar-footer-avatar">{(currentUser.name || "?").slice(0, 1)}</div>
          <div className="gt-sidebar-footer-text">
            <div className="gt-sidebar-footer-name">{currentUser.name}</div>
            <select
              className="gt-sidebar-roleselect"
              value={currentUser.role}
              onChange={(e) => onRoleChange(e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
