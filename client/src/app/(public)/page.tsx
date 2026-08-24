"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";
import toast from "react-hot-toast";
import { ShieldCheck, Award, RefreshCw, Layers, ArrowRight, Activity, Cpu, Search, CheckCircle2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const handleLogin = async (email: string, roleName: string) => {
    setLoading(email);
    try {
      const response = await api.post("/auth/login", {
        email,
        password: "password123",
      });

      if (response.data?.success) {
        setUser(response.data.user);
        toast.success(`Logged in as ${response.data.user.name} (${roleName})`);
        
        // Wait briefly for Zustand state to persist, then redirect
        setTimeout(() => {
          router.push("/dashboard");
        }, 100);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(null);
    }
  };

  const handleResetDemo = async () => {
    setResetting(true);
    try {
      const response = await api.post("/demo/reset");
      if (response.status === 200) {
        toast.success("Demo database cleared and seeded with fresh data!");
      }
    } catch (error) {
      toast.error("Failed to seed demo data. Make sure server is running.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 bg-teal-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-teal-500/20">
              GI
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
                GovInnovate
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-stone-500 font-bold">
                Pilot Procurement & Reuse
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleResetDemo}
              disabled={resetting}
              className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 dark:text-teal-300 dark:bg-teal-950/40 dark:hover:bg-teal-900/40 border border-teal-200 dark:border-teal-900 rounded-full transition-all"
            >
              <RefreshCw className={`h-3 w-3 ${resetting ? "animate-spin" : ""}`} />
              <span>{resetting ? "Resetting..." : "Reset Demo Data"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden bg-gradient-to-b from-teal-50/50 to-stone-50 dark:from-teal-950/20 dark:to-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            
            {/* Left Column */}
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300 border border-orange-200 dark:border-orange-900 mb-6 animate-pulse">
                SIH 2026 Procurement Innovation
              </span>
              <h1 className="text-display-lg text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-none">
                Government Innovation <br/>
                <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
                  Pilot Passport
                </span> <br/>
                & Scale Platform
              </h1>
              <p className="mt-6 text-lg text-stone-600 dark:text-stone-300 leading-relaxed font-body-lg">
                GovInnovate replaces prescription-heavy tenders with outcome-based pilots. Build structured, validated evidence artifacts that let any government department verify, scale, and reuse validated startup innovations.
              </p>

              {/* Stats showcase */}
              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-stone-200 dark:border-stone-800 pt-8">
                <div>
                  <span className="block text-2xl font-black text-teal-600 dark:text-teal-400">92/100</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Average Scale Score</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-teal-600 dark:text-teal-400">100%</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Evidence Validated</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-teal-600 dark:text-teal-400">Reusable</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Evidence Passports</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Login Cards */}
            <div className="mt-12 lg:mt-0 lg:col-span-6 flex flex-col justify-center">
              <div className="bg-white dark:bg-stone-800 p-8 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-700/60 max-w-md mx-auto w-full">
                <div className="mb-6">
                  <h3 className="text-headline-md text-xl font-bold text-stone-900 dark:text-white">
                    Demo Portal Gateway
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Select a seeded user role to test the complete procurement workflow:
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Government Officer */}
                  <button
                    onClick={() => handleLogin("gov@govinnovate.gov.in", "Government Officer")}
                    disabled={!!loading}
                    className="w-full flex items-center justify-between p-4 bg-teal-50 hover:bg-teal-100/80 dark:bg-teal-950/20 dark:hover:bg-teal-950/40 border border-teal-200/60 dark:border-teal-900/40 rounded-2xl group transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3 text-left">
                      <div className="h-10 w-10 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center font-bold">
                        GOV
                      </div>
                      <div>
                        <span className="block font-bold text-sm text-stone-800 dark:text-stone-200">
                          Priya Sharma (MoHUA)
                        </span>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400">
                          Create Outcome Challenges & Select Startups
                        </span>
                      </div>
                    </div>
                    {loading === "gov@govinnovate.gov.in" ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
                    ) : (
                      <ArrowRight className="h-5 w-5 text-teal-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    )}
                  </button>

                  {/* Startup */}
                  <button
                    onClick={() => handleLogin("startup1@wasteai.com", "Startup Owner")}
                    disabled={!!loading}
                    className="w-full flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100/80 dark:bg-orange-950/20 dark:hover:bg-orange-950/40 border border-orange-200/60 dark:border-orange-900/40 rounded-2xl group transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3 text-left">
                      <div className="h-10 w-10 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center font-bold">
                        SUP
                      </div>
                      <div>
                        <span className="block font-bold text-sm text-stone-800 dark:text-stone-200">
                          SmartWaste Solutions
                        </span>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400">
                          Browse Challenges, View Match & Upload Evidence
                        </span>
                      </div>
                    </div>
                    {loading === "startup1@wasteai.com" ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                    ) : (
                      <ArrowRight className="h-5 w-5 text-orange-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    )}
                  </button>

                  {/* Evaluator */}
                  <button
                    onClick={() => handleLogin("eval1@expert.res.in", "Independent Validator")}
                    disabled={!!loading}
                    className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100/80 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40 rounded-2xl group transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3 text-left">
                      <div className="h-10 w-10 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-bold">
                        EVAL
                      </div>
                      <div>
                        <span className="block font-bold text-sm text-stone-800 dark:text-stone-200">
                          Dr. A.K. Sinha (IIT Delhi)
                        </span>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400">
                          Evaluate proposals & Validate pilot metrics
                        </span>
                      </div>
                    </div>
                    {loading === "eval1@expert.res.in" ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                    ) : (
                      <ArrowRight className="h-5 w-5 text-indigo-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    )}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Innovation Description */}
      <section className="py-16 bg-white dark:bg-stone-900 border-t border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-headline-lg text-3xl font-extrabold text-stone-900 dark:text-white">
              The Lifecycle of Evidence-Backed Procurement
            </h2>
            <p className="mt-4 text-stone-600 dark:text-stone-300">
              GovInnovate links government challenges to validated pilot outcomes, generating a reusable evidence layer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-800">
              <div className="h-12 w-12 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl flex items-center justify-center mb-4">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-white mb-2">
                1. Outcome-Based Matching
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-300">
                Government defines structured outcome criteria. Our compatibility matching evaluates Startup technology, capability, domain, and maturity levels to generate a matching score.
              </p>
            </div>

            <div className="p-6 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-800">
              <div className="h-12 w-12 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center mb-4">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-white mb-2">
                2. GIPP Metric Tracking
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-300">
                During the pilot, startups upload telemetry evidence directly. Performance is measured dynamically (e.g. 65% baseline to 85% target) with payments linked strictly to milestone approval.
              </p>
            </div>

            <div className="p-6 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-800">
              <div className="h-12 w-12 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-4">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-white mb-2">
                3. Reusable Innovation Passports
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-300">
                Validators review evidence to calculate a Scale Readiness Score. The resulting Pilot Passport becomes shareable evidence, preventing other departments from re-piloting duplicate systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 mt-auto border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="h-6 w-6 bg-teal-500 rounded flex items-center justify-center text-white font-extrabold text-xs">
              GI
            </div>
            <span className="font-bold text-white tracking-wider">GovInnovate MVP</span>
          </div>
          <div>
            <span>&copy; 2026 Government Innovation Procurement Platform. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
