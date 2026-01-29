import React, { useMemo } from "react";
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
  Zap,
  PencilLine
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
  const daysRemaining = useMemo(() => {
    const examDate = new Date('2026-09-20').getTime();
    const today = new Date().getTime();
    const diff = examDate - today;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, []);
  return (
    <Sidebar variant="sidebar">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Gavel className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black leading-none tracking-tight">BarMaster.PH</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black opacity-80 mt-0.5">Elite Prep</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="custom-scrollbar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-widest px-4 mb-2">Command Center</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/"} className="h-11 rounded-xl">
                <Link to="/"><LayoutDashboard className="size-4" /> <span className="font-bold">Dashboard</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/subjects"} className="h-11 rounded-xl">
                <Link to="/subjects"><Library className="size-4" /> <span className="font-bold">Codal Library</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/practice"} className="h-11 rounded-xl">
                <Link to="/practice"><Swords className="size-4" /> <span className="font-bold">Practice Arena</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/codals-editor"} className="h-11 rounded-xl">
                <Link to="/codals-editor"><PencilLine className="size-4" /> <span className="font-bold">Codal Editor</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/progress"} className="h-11 rounded-xl">
                <Link to="/progress"><LineChart className="size-4" /> <span className="font-bold">Analytics</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator className="mx-4" />
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-widest px-4 mb-2">Subject Mastery</SidebarGroupLabel>
          <SidebarMenu>
            {SUBJECTS.map((sub) => (
              <SidebarMenuItem key={sub.name}>
                <SidebarMenuButton asChild className="h-9 rounded-lg">
                  <Link to={`/subjects?subject=${encodeURIComponent(sub.name)}`}>
                    <sub.icon className="size-4 opacity-60" />
                    <span className="text-xs font-semibold">{sub.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="rounded-2xl bg-accent/30 p-4 border border-border/50">
          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">
            <span>Bar 2026 Docket</span>
            <span className="text-primary font-black">Sept 20</span>
          </div>
          <div className="text-2xl font-black tracking-tighter flex items-baseline gap-1.5 leading-none">
            {daysRemaining} <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Days Out</span>
          </div>
          <div className="mt-3 w-full bg-background/50 h-1.5 rounded-full overflow-hidden border border-border/20">
             <div 
               className="bg-primary h-full transition-all duration-500" 
               style={{ width: `${Math.min(100, ( (500 - daysRemaining) / 500 ) * 100)}%` }} 
             />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}