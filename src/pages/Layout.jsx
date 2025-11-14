import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  MessageSquare,
  Users,
  Settings,
  Save,
  Sparkles,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import logo from "/Logo_41_anos.svg";

const navigationItems = [
  {
    title: "Chat",
    url: createPageUrl("Chat"),
    icon: MessageSquare,
  },
  {
    title: "Clientes",
    url: createPageUrl("Clients"),
    icon: Users,
  },
  {
    title: "Configuración",
    url: createPageUrl("Configuration"),
    icon: Settings,
  },
  {
    title: "Prompts Guardados",
    url: createPageUrl("SavedPrompts"),
    icon: Save,
  },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --accent-primary: #3b82f6;
            --accent-hover: #2563eb;
            --bg-light: #ffffff;
            --bg-light-secondary: #f8fafc;
            --bg-dark: #0f172a;
            --bg-dark-secondary: #1e293b;
            --text-light: #1e293b;
            --text-light-secondary: #64748b;
            --text-dark: #f1f5f9;
            --text-dark-secondary: #94a3b8;
            --border-light: #e2e8f0;
            --border-dark: #334155;
          }
          
          .dark {
            color-scheme: dark;
          }
        `}
      </style>
      <div className="min-h-screen flex w-full bg-slate-50 dark:bg-slate-950">
        <Sidebar className="border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <SidebarHeader className="border-b border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="w-11 h-11" />
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                  NeuroScore
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Entorno de Pruebas IA Sistemas GyG
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2 mb-1">
                Navegación
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`transition-all duration-150 rounded-lg mb-0.5 ${
                          location.pathname === item.url
                            ? "bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-medium"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Link
                          to={item.url}
                          className="flex items-center gap-3 px-3 py-2"
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="px-3 py-4 mt-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="w-full justify-start gap-3 text-sm border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {theme === "light" ? (
                  <>
                    <Moon className="w-4 h-4" />
                    <span>Modo Oscuro</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4" />
                    <span>Modo Claro</span>
                  </>
                )}
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 lg:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg" />
                <div className="flex items-center gap-2">
                  <img src={logo} alt="Logo" className="w-11 h-11" />
                  <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    NeuroScore
                  </h1>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="dark:hover:bg-slate-800"
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
