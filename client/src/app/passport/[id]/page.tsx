"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/services/api";
import { Loader2, Award, ArrowLeft, Printer, ShieldCheck, CheckCircle2, TrendingUp, HelpCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function PassportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [passport, setPassport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPassport();
  }, [id]);

  const fetchPassport = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/pilots/${id}/passport`);
      setPassport(response.data);
    } catch (error) {
      toast.error("Passport not found. Make sure the pilot has been validated first.");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-50 dark:bg-stone-900">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!passport) return null;

  const passportData = JSON.parse(passport.data);

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      {/* Actions header */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-6 no-print">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center space-x-2 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 font-semibold text-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Printer className="h-4 w-4" />
          <span>Print Passport</span>
        </button>
      </div>

      {/* Main Passport container */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-stone-900 border-4 border-double border-teal-600 dark:border-teal-500 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        
        {/* Passport decorative background watermark */}
        <div className="absolute top-0 right-0 h-96 w-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Passport Header */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b-2 border-stone-100 dark:border-stone-800 pb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-teal-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg">
              GI
            </div>
            <div>
              <span className="block text-[10px] tracking-widest uppercase font-bold text-stone-400">
                Government of India
              </span>
              <h1 className="text-2xl font-black tracking-tight text-stone-950 dark:text-white">
                INNOVATION PILOT PASSPORT
              </h1>
              <span className="block text-[9px] uppercase tracking-wider text-teal-600 dark:text-teal-400 font-black mt-0.5">
                Validated Innovation Evidence Registry Artifact
              </span>
            </div>
          </div>

          <div className="text-center md:text-right border border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-950/20 px-4 py-2 rounded-2xl">
            <span className="block text-[9px] text-stone-400 uppercase tracking-widest font-black">Passport Number</span>
            <span className="font-mono font-bold text-sm tracking-wide text-teal-600 dark:text-teal-400">
              {passport.passportNumber}
            </span>
          </div>
        </div>

        {/* Score visualization & Recommendation */}
        <div className="grid md:grid-cols-3 gap-6 py-8 border-b border-stone-100 dark:border-stone-800 items-center">
          <div className="bg-stone-50 dark:bg-stone-900/60 p-6 rounded-2xl text-center border border-stone-200/50 dark:border-stone-800 flex flex-col justify-center h-full">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Scale Readiness Score</span>
            <span className="text-4xl font-black text-teal-600 dark:text-teal-400 mt-2 block">
              {passport.scaleScore}/100
            </span>
            <div className="w-full bg-stone-200 dark:bg-stone-800 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-teal-500 h-full rounded-full" style={{ width: `${passport.scaleScore}%` }} />
            </div>
          </div>

          <div className="md:col-span-2 border-2 border-teal-500 dark:border-teal-600 bg-teal-500/5 dark:bg-teal-500/10 p-6 rounded-2xl flex flex-col justify-between h-full">
            <div>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-teal-600 dark:text-teal-400">Official Decision Support Recommendation</span>
              <h2 className="text-xl font-black tracking-tight text-teal-900 dark:text-teal-100 mt-2 uppercase">
                {passport.recommendation}
              </h2>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-3 leading-relaxed">
              * This certificate serves as independent validation of pilot metric targets. It represents decision support evidence for subsequent public procurement review, not automatic authorization.
            </p>
          </div>
        </div>

        {/* Core Passport details */}
        <div className="grid md:grid-cols-2 gap-8 py-8 border-b border-stone-100 dark:border-stone-800 text-xs">
          <div className="space-y-4">
            <h3 className="font-bold text-[10px] text-stone-400 uppercase tracking-widest">Innovation Entity</h3>
            <div>
              <span className="text-stone-400 block text-[10px]">Startup Name</span>
              <span className="font-bold text-sm">{passportData.startupName}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">Technology Stack</span>
              <span className="font-semibold text-stone-700 dark:text-stone-300">{passportData.startupTechnology}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">Proposed Solution Scope</span>
              <p className="text-stone-600 dark:text-stone-300 mt-0.5">{passportData.proposedSolution}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-[10px] text-stone-400 uppercase tracking-widest">Pilot Configuration</h3>
            <div>
              <span className="text-stone-400 block text-[10px]">Sponsoring Department</span>
              <span className="font-bold text-sm text-stone-700 dark:text-stone-300">{passportData.department}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px]">Original Challenge Problem</span>
              <p className="text-stone-600 dark:text-stone-300 mt-0.5">{passportData.problemDescription}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-stone-400 block text-[10px]">Pilot Location</span>
                <span className="font-bold">{passportData.pilotLocation}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Testing Duration</span>
                <span className="font-bold">{passportData.pilotDuration}</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Target Achievement Comparison */}
        <div className="py-8 border-b border-stone-100 dark:border-stone-800 text-xs">
          <h3 className="font-bold text-[10px] text-stone-400 uppercase tracking-widest mb-4">Baseline vs Target vs Actual KPI Results</h3>
          <div className="space-y-4">
            {passportData.kpis?.map((kpi: any, idx: number) => (
              <div key={idx} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-stone-50 dark:bg-stone-900/40 border border-stone-200/50 dark:border-stone-800 rounded-xl">
                <div>
                  <span className="font-bold block text-sm">{kpi.name}</span>
                </div>
                <div className="flex space-x-6 mt-3 md:mt-0 font-mono">
                  <div className="text-center">
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 block">Baseline</span>
                    <span className="font-bold">{kpi.baseline}%</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 block">Target</span>
                    <span className="font-bold">{kpi.target}%</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 block">Actual</span>
                    <span className="font-extrabold text-teal-600 dark:text-teal-400">{kpi.currentValue}%</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] uppercase tracking-wider text-stone-400 block">Status</span>
                    <span className="font-bold text-emerald-600 uppercase text-[10px]">{kpi.status.replace(/_/g, " ")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Validation log details */}
        <div className="py-8 border-b border-stone-100 dark:border-stone-800 text-xs space-y-4">
          <h3 className="font-bold text-[10px] text-stone-400 uppercase tracking-widest">Independent Validation Log</h3>
          
          <div className="grid md:grid-cols-2 gap-4 bg-stone-50 dark:bg-stone-900/60 p-6 rounded-2xl border border-stone-200/50 dark:border-stone-800">
            <div className="space-y-3">
              <div>
                <span className="text-stone-400 block text-[9px] uppercase">Validator Specialist</span>
                <span className="font-bold">{passportData.validation?.validatorName || "Dr. A.K. Sinha"}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[9px] uppercase">Measurement Method</span>
                <span className="font-semibold">{passportData.validation?.measurementMethod || "IoT Telemetry Log Cross-Reference"}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-stone-400 block text-[9px] uppercase">Validation Status</span>
                <span className="font-bold text-emerald-600 uppercase flex items-center space-x-1">
                  <ShieldCheck className="h-4 w-4" />
                  <span>{passportData.validation?.status || "PASSED"}</span>
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[9px] uppercase">Specialist Comments</span>
                <p className="italic text-stone-600 dark:text-stone-300">
                  "{passportData.validation?.comments || "Independent audits confirm waste sensor readings match telemetry. Efficiency threshold successfully achieved."}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Milestones timeline */}
        <div className="py-8 text-xs">
          <h3 className="font-bold text-[10px] text-stone-400 uppercase tracking-widest mb-4">Completed Milestones Verification</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {passportData.milestones?.map((m: any, idx: number) => (
              <div key={idx} className="p-4 bg-stone-50 dark:bg-stone-900/40 border border-stone-200/50 dark:border-stone-800 rounded-xl relative">
                <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-bold text-stone-400">{m.deadline}</span>
                <h4 className="font-bold text-xs mt-1">{m.name}</h4>
                <span className="block text-[9px] text-emerald-600 font-bold uppercase mt-2">Verified & Paid</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
