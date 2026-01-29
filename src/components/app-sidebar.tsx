import React from "react";
import {
  LayoutDashboard,
  Library,
  Swords,
  LineChart,
  Gavel,
  Scale,
  BookOpen,
  ShieldAlert,
  Briefcase,
  UserRound,
  Zap
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarSeparator,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
const SUBJECTS = [
  { name: "Political Law", icon: Gavel },
  { name: "Labor Law", icon: Briefcase },
  { name: "Civil Law", icon: Scale },
  { name: "Taxation Law", icon: Zap },
  { name: "Mercantile Law", icon: BookOpen },
  { name: "Criminal Law", icon: ShieldAlert },
  { name: "Remedial Law", icon: UserRound },
  { name: "Legal Ethics", icon: Scale },
];
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  return (
    <Sidebar variant="sidebar">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Gavel className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-none">BarMaster.PH</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Elite Prep</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/"}>
                <Link to="/"><LayoutDashboard className="size-4" /> <span>Dashboard</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/subjects"}>
                <Link to="/subjects"><Library className="size-4" /> <span>Codal Library</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/practice"}>
                <Link to="/practice"><Swords className="size-4" /> <span>Practice Arena</span></Link>
              </SidebarMenuButton>
              <SidebarMenuBadge>5</SidebarMenuBadge>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/progress"}>
                <Link to="/progress"><LineChart className="size-4" /> <span>Progress & Analytics</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Bar Subjects</SidebarGroupLabel>
          <SidebarMenu>
            {SUBJECTS.map((sub) => (
              <SidebarMenuItem key={sub.name}>
                <SidebarMenuButton asChild>
                  <Link to={`/subjects?subject=${encodeURIComponent(sub.name)}`}>
                    <sub.icon className="size-4 opacity-70" />
                    <span className="text-xs">{sub.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="rounded-lg bg-accent/50 p-3">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
            <span>Bar 2026 Countdown</span>
            <span className="text-primary font-bold">Sept 20</span>
          </div>
          <div className="text-lg font-black tracking-tight flex items-baseline gap-1">
            495 <span className="text-[10px] font-normal text-muted-foreground">DAYS REMAINING</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}