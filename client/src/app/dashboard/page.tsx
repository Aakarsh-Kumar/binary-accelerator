"use client";

import { useAuthStore } from "@/store/authStore";
import GovernmentDashboard from "./components/GovernmentDashboard";
import StartupDashboard from "./components/StartupDashboard";
import EvaluatorDashboard from "./components/EvaluatorDashboard";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center font-bold text-red-500">
        Access Denied. Please log in first.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-stone-900 border border-stone-800 text-stone-100 p-8 rounded-3xl shadow-sm">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-stone-400">
            Welcome back
          </span>
          <h2 className="text-2xl font-black mt-1">{user.name}</h2>
          <p className="text-xs text-stone-300 mt-0.5">
            Role: <span className="font-bold">{user.role}</span> | Username: @{user.username}
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <span className="block text-2xl font-black">{new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
          <span className="text-xs text-stone-400">Innovation Cycle 2026</span>
        </div>
      </div>

      <div className="bg-stone-50 dark:bg-stone-900 rounded-3xl">
        {user.role === "GOVERNMENT" && <GovernmentDashboard />}
        {user.role === "STARTUP" && <StartupDashboard />}
        {user.role === "EVALUATOR" && <EvaluatorDashboard />}
      </div>
    </div>
  );
}