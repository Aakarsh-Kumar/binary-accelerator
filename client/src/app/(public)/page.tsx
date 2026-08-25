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
            <div className="h-10 w-10 bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 rounded-xl flex items-center justify-center font-bold shadow-sm">
              GI
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-stone-900 dark:text-white">
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
              className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 dark:text-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-700 rounded-full transition-all"
            >
              <RefreshCw className={`h-3 w-3 ${resetting ? "animate-spin" : ""}`} />
              <span>{resetting ? "Resetting..." : "Reset Demo Data"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden bg-stone-100/40 dark:bg-stone-950/10 border-b border-stone-200 dark:border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            
            {/* Left Column */}
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 mb-6">
                SIH 2026 Procurement Innovation
              </span>
              <h1 className="text-display-lg text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-none">
                Government Innovation <br/>
                <span className="text-teal-600 dark:text-teal-400 font-black">
                  Pilot Passport
                </span> <br/>
                & Scale Platform
              </h1>
              <p className="mt-6 text-sm text-stone-600 dark:text-stone-400 leading-relaxed font-normal">
                GovInnovate replaces prescription-heavy tenders with outcome-based pilots. Build structured, validated evidence artifacts that let any government department verify, scale, and reuse validated startup innovations.
              </p>

              {/* Stats showcase */}
              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-stone-200 dark:border-stone-800 pt-8">
                <div>
                  <span className="block text-2xl font-black text-stone-900 dark:text-white">92/100</span>
                  <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Average Scale Score</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-stone-900 dark:text-white">100%</span>
                  <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Evidence Validated</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-stone-900 dark:text-white">Reusable</span>
                  <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Evidence Passports</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Login Cards */}
            <div className="mt-12 lg:mt-0 lg:col-span-6 flex flex-col justify-center">
              <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-250 dark:border-stone-800 max-w-md mx-auto w-full shadow-sm">
                <div className="mb-6">
                  <h3 className="text-base font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                    Demo Portal Gateway
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Select a seeded user role to test the complete procurement workflow:
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Government Officer */}
                  <button
                    onClick={() => handleLogin("gov@govinnovate.gov.in", "Government Officer")}
                    disabled={!!loading}
                    className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800/40 dark:hover:bg-stone-800/80 border border-stone-200 dark:border-stone-800 rounded-2xl group transition-all duration-200 text-xs"
                  >
                    <div className="flex items-center space-x-3 text-left">
                      <div className="h-10 w-10 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl flex items-center justify-center font-bold">
                        GOV
                      </div>
                      <div>
                        <span className="block font-bold text-stone-800 dark:text-stone-200">
                          Priya Sharma (MoHUA)
                        </span>
                        <span className="text-[10px] text-stone-500">
                          Create Outcome Challenges & Select Startups
                        </span>
                      </div>
                    </div>
                    {loading === "gov@govinnovate.gov.in" ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-400 border-t-transparent" />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-stone-800 group-hover:dark:text-stone-250 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </button>

                  {/* Startup */}
                  <button
                    onClick={() => handleLogin("startup1@wasteai.com", "Startup Owner")}
                    disabled={!!loading}
                    className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800/40 dark:hover:bg-stone-800/80 border border-stone-200 dark:border-stone-800 rounded-2xl group transition-all duration-200 text-xs"
                  >
                    <div className="flex items-center space-x-3 text-left">
                      <div className="h-10 w-10 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl flex items-center justify-center font-bold">
                        SUP
                      </div>
                      <div>
                        <span className="block font-bold text-stone-800 dark:text-stone-200">
                          SmartWaste Solutions
                        </span>
                        <span className="text-[10px] text-stone-500">
                          Browse Challenges, View Match & Upload Evidence
                        </span>
                      </div>
                    </div>
                    {loading === "startup1@wasteai.com" ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-400 border-t-transparent" />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-stone-800 group-hover:dark:text-stone-250 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </button>

                  {/* Evaluator */}
                  <button
                    onClick={() => handleLogin("eval1@expert.res.in", "Independent Validator")}
                    disabled={!!loading}
                    className="w-full flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800/40 dark:hover:bg-stone-800/80 border border-stone-200 dark:border-stone-800 rounded-2xl group transition-all duration-200 text-xs"
                  >
                    <div className="flex items-center space-x-3 text-left">
                      <div className="h-10 w-10 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl flex items-center justify-center font-bold">
                        EVAL
                      </div>
                      <div>
                        <span className="block font-bold text-stone-800 dark:text-stone-200">
                          Dr. A.K. Sinha (IIT Delhi)
                        </span>
                        <span className="text-[10px] text-stone-500">
                          Evaluate proposals & Validate pilot metrics
                        </span>
                      </div>
                    </div>
                    {loading === "eval1@expert.res.in" ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-400 border-t-transparent" />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-stone-800 group-hover:dark:text-stone-250 group-hover:translate-x-0.5 transition-all" />
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
            <h2 className="text-xl font-bold uppercase tracking-wider text-stone-900 dark:text-white">
              Evidence-Backed Procurement Lifecycle
            </h2>
            <p className="mt-2 text-xs text-stone-500">
              GovInnovate links government challenges to validated pilot outcomes, generating a reusable evidence layer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-xs">
            <div className="p-6 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-800/80">
              <div className="h-12 w-12 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl flex items-center justify-center mb-4">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-white mb-2">
                1. Outcome-Based Matching
              </h3>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                Government defines structured outcome criteria. Our compatibility matching evaluates Startup technology, capability, domain, and maturity levels to generate a matching score.
              </p>
            </div>

            <div className="p-6 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-800/80">
              <div className="h-12 w-12 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl flex items-center justify-center mb-4">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-white mb-2">
                2. GIPP Metric Tracking
              </h3>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                During the pilot, startups upload telemetry evidence directly. Performance is measured dynamically (e.g. 65% baseline to 85% target) with payments linked strictly to milestone approval.
              </p>
            </div>

            <div className="p-6 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-800/80">
              <div className="h-12 w-12 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl flex items-center justify-center mb-4">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-white mb-2">
                3. Reusable Innovation Passports
              </h3>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                Validators review evidence to calculate a Scale Readiness Score. The resulting Pilot Passport becomes shareable evidence, preventing other departments from re-piloting duplicate systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-500 py-12 mt-auto border-t border-stone-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="h-6 w-6 bg-stone-800 text-white rounded flex items-center justify-center font-extrabold text-xs">
              GI
            </div>
            <span className="font-bold text-stone-300 tracking-wider">GovInnovate MVP</span>
          </div>
          <div>
            <span>&copy; 2026 Government Innovation Procurement Platform. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
