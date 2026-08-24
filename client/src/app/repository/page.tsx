"use client";

import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Search, Loader2, Award, ShieldCheck, ArrowRight, BookOpen, Layers } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function EvidenceRepositoryPage() {
  const [query, setQuery] = useState("");
  const [passports, setPassports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPassports();
  }, []);

  const fetchPassports = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/passports/repository?query=${query}`);
      setPassports(response.data);
    } catch (error) {
      toast.error("Failed to fetch evidence repository");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPassports();
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 py-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title */}
        <div className="flex items-center space-x-3 bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-800 dark:to-emerald-800 text-white p-8 rounded-3xl shadow-lg">
          <BookOpen className="h-10 w-10 text-teal-200" />
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-teal-200 block">
              GovInnovate Evidence Layer
            </span>
            <h1 className="text-2xl font-black mt-1">Innovation Evidence Repository</h1>
            <p className="text-xs text-teal-100 mt-0.5">
              Discover previously completed, validated pilots to reuse evidence and accelerate scale-up approvals.
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search by: Problem, Sector, Technology, Department, Location, Startup, KPI or Score..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl text-xs"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-2xl text-xs flex items-center space-x-1"
            >
              <span>Query Repository</span>
            </button>
          </form>
        </div>

        {/* Query Results */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {passports.map((passport) => {
              const dataObj = JSON.parse(passport.data);
              const kpis = dataObj.kpis || [];
              const primaryKpi = kpis[0] || {};
              const validation = dataObj.validation || {};

              return (
                <div
                  key={passport.id}
                  className="bg-white dark:bg-stone-800 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 flex flex-col justify-between hover:shadow-lg transition-all duration-200"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-0.5 bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-300 rounded text-[9px] font-black uppercase">
                        {dataObj.sector}
                      </span>
                      <div className="flex items-center space-x-1.5 font-bold text-emerald-600 text-[10px]">
                        <ShieldCheck className="h-4 w-4" />
                        <span>{validation.status || "VALIDATED"}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-stone-900 dark:text-white line-clamp-1">
                        {dataObj.challengeTitle}
                      </h4>
                      <span className="text-[10px] text-stone-400 block mt-0.5">Startup: {dataObj.startupName}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs bg-stone-50 dark:bg-stone-900/50 p-4 rounded-2xl border border-stone-100 dark:border-stone-800">
                      <div>
                        <span className="text-stone-400 block text-[9px] uppercase">KPI Achieved</span>
                        <span className="font-extrabold text-teal-500 mt-0.5 block">
                          {primaryKpi.currentValue || 0}% vs {primaryKpi.target}%
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[9px] uppercase">Scale Score</span>
                        <span className="font-extrabold text-stone-700 dark:text-stone-300 mt-0.5 block">
                          {passport.scaleScore}/100
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-stone-500 dark:text-stone-400 space-y-1">
                      <div>
                        <span className="font-bold text-stone-400">Department:</span> {dataObj.department}
                      </div>
                      <div>
                        <span className="font-bold text-stone-400">Location:</span> {dataObj.pilotLocation}
                      </div>
                      <div>
                        <span className="font-bold text-stone-400">Recommendation:</span> <span className="font-bold text-teal-600 dark:text-teal-400 uppercase">{passport.recommendation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-stone-100 dark:border-stone-850 mt-6">
                    <Link
                      href={`/passport/${passport.pilotId}`}
                      className="w-full py-2.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 font-bold rounded-xl text-center block text-xs"
                    >
                      View Pilot Passport
                    </Link>
                  </div>
                </div>
              );
            })}
            {passports.length === 0 && (
              <div className="col-span-3 text-center py-12 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-800 rounded-3xl text-stone-500">
                No matching Pilot Passports found in the Evidence Repository.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
