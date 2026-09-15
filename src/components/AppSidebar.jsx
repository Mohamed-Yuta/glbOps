import React from "react";
import { List, Building2, Wrench, Truck, UserRound, Map as MapIcon, Calendar } from "lucide-react";
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

const NAV_ITEMS = [
  { key: "projets", label: "Projets", icon: List },
  { key: "clients", label: "Clients", icon: Building2 },
  { key: "materiels", label: "Matériel", icon: Wrench },
  { key: "vehicules", label: "Véhicules", icon: Truck },
  { key: "employes", label: "Employés", icon: UserRound },
  { key: "carte", label: "Carte", icon: MapIcon },
  { key: "calendrier", label: "Calendrier", icon: Calendar },
];

export default function AppSidebar({ visibleTabs, view, setView, currentUser }) {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="gt-sidebar-brand">
          <img src="/logo.png" alt="Globétudes" className="gt-sidebar-brand-mark" />
          <div className="gt-sidebar-brand-text">
            <div className="gt-sidebar-brand-title">Globétudes</div>
            <div className="gt-sidebar-brand-sub">Projets &amp; prestations</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.filter((item) => visibleTabs.includes(item.key)).map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton isActive={view === item.key} onClick={() => setView(item.key)} tooltip={item.label}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="gt-sidebar-footer">
          <div className="gt-sidebar-footer-avatar">{(currentUser.name || "?").slice(0, 1)}</div>
          <div className="gt-sidebar-footer-text">
            <div className="gt-sidebar-footer-name">{currentUser.name}</div>
            <div className="gt-sidebar-footer-role">{currentUser.role}</div>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
