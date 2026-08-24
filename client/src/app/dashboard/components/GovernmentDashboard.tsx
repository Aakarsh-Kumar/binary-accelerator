"use client";

import { useState, useEffect } from "react";
import { api } from "@/services/api";
import toast from "react-hot-toast";
import { Plus, Check, FileText, UserPlus, Play, Award, Loader2, Landmark, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function GovernmentDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "create" | "challenges" | "applications" | "pilots">("overview");
  
  // States
  const [challenges, setChallenges] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [pilots, setPilots] = useState<any[]>([]);
  const [evaluators, setEvaluators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State for Challenge
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    department: "MoHUA / Municipal Corp",
    sector: "Urban Sanitation",
    problemDescription: "",
    baseline: "",
    expectedOutcome: "",
    budget: "",
    duration: "90 Days",
    location: "",
    eligibility: "",
    successKpis: "",
    status: "PUBLISHED"
  });

  // Assign Evaluators Modal state
  const [assigningAppId, setAssigningAppId] = useState<string | null>(null);
  const [selectedEvaluator, setSelectedEvaluator] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [challengesRes, appsRes, pilotsRes] = await Promise.all([
        api.get("/challenges?status=ALL"), // Custom parameter to bypass default published filter
        api.get("/applications"),
        api.get("/pilots")
      ]);
      setChallenges(challengesRes.data);
      setApplications(appsRes.data);
      setPilots(pilotsRes.data);

      // Seed mock evaluators list for simple dropdown select
      setEvaluators([
        { id: "eval-user-1-id", name: "Dr. A.K. Sinha (IIT Delhi)", email: "eval1@expert.res.in" },
        { id: "eval-user-2-id", name: "Prof. Rajesh Patel (IISc)", email: "eval2@expert.res.in" },
        { id: "eval-user-3-id", name: "Dr. Sunita Rao (CSIR)", email: "eval3@expert.res.in" }
      ]);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post("/challenges", newChallenge);
      if (response.status === 201) {
        toast.success("Challenge published successfully!");
        setNewChallenge({
          title: "",
          department: "MoHUA / Municipal Corp",
          sector: "Urban Sanitation",
          problemDescription: "",
          baseline: "",
          expectedOutcome: "",
          budget: "",
          duration: "90 Days",
          location: "",
          eligibility: "",
          successKpis: "",
          status: "PUBLISHED"
        });
        setActiveTab("challenges");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to publish challenge");
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualEligibilityOverride = async (appId: string, status: string) => {
    const reason = window.prompt(`Please enter the manual override reason for marking this application as ${status}:`);
    if (reason === null) return;
    
    try {
      const response = await api.put(`/applications/${appId}/status`, {
        eligibilityStatus: status,
        reason: reason || "Manual Override by Officer"
      });
      if (response.status === 200) {
        toast.success(`Application marked as ${status}!`);
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to override application eligibility status");
    }
  };

  const handleShortlistApplication = async (appId: string) => {
    try {
      const response = await api.put(`/applications/${appId}/status`, {
        eligibilityStatus: "SHORTLISTED",
        reason: "Evaluations completed and approved by Officer"
      });
      if (response.status === 200) {
        toast.success("Application successfully shortlisted for pilot!");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to shortlist application");
    }
  };

  const handleAssignEvaluator = async () => {
    if (!selectedEvaluator || !assigningAppId) {
      toast.error("Please select an evaluator");
      return;
    }

    try {
      const response = await api.post(`/applications/${assigningAppId}/assign`, {
        evaluatorIds: [selectedEvaluator]
      });
      if (response.status === 200) {
        toast.success("Evaluator assigned successfully!");
        setAssigningAppId(null);
        setSelectedEvaluator("");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to assign evaluator");
    }
  };

  const handleSelectStartup = async (app: any) => {
    try {
      const response = await api.post("/pilots", {
        applicationId: app.id,
        startDate: new Date().toLocaleDateString(),
        endDate: "90 Days Later",
        location: app.challenge.location,
        budget: app.challenge.budget,
        objectives: app.proposedSolution,
        kpis: [
          { name: "Waste Collection Efficiency", unit: "%", baseline: "65", target: "85", minimum: "80" }
        ],
        milestones: [
          { name: "Prototype Deployment", description: "Deploy core model feeds", deadline: "30 Days", deliverable: "Deployment Report", paymentAmount: 200000 },
          { name: "Mid-Pilot Evaluation", description: "Audit collection routing", deadline: "60 Days", deliverable: "Routing Audit Log", paymentAmount: 300000 },
          { name: "Target Achievement", description: "Maintain waste collection efficiency above 85%", deadline: "90 Days", deliverable: "Final validated reports", paymentAmount: 500000 }
        ]
      });

      if (response.status === 201) {
        toast.success(`Startup "${app.startup.name}" selected! Pilot Project initialized.`);
        setActiveTab("pilots");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to initialize pilot");
    }
  };

  const handleApproveMilestone = async (pilotId: string, milestoneId: string) => {
    try {
      const response = await api.post(`/pilots/${pilotId}/milestones/${milestoneId}/approve`);
      if (response.status === 200) {
        toast.success("Milestone approved! Payment released.");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to approve milestone");
    }
  };

  const handleGeneratePassport = async (pilotId: string) => {
    try {
      const response = await api.post(`/pilots/${pilotId}/passport`);
      if (response.data?.success) {
        toast.success("Pilot Passport generated successfully!");
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate passport");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 space-x-6 pb-2">
        {(["overview", "create", "challenges", "applications", "pilots"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-semibold capitalize pb-2 border-b-2 px-1 transition-all ${
              activeTab === tab
                ? "border-teal-500 text-teal-600 dark:text-teal-400"
                : "border-transparent text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Dashboard Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl border border-stone-200 dark:border-stone-800">
              <span className="block text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Active Challenges</span>
              <span className="text-3xl font-black mt-2 block">{challenges.filter(c => c.status === 'PUBLISHED').length}</span>
            </div>
            <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl border border-stone-200 dark:border-stone-800">
              <span className="block text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Total Applications</span>
              <span className="text-3xl font-black mt-2 block">{applications.length}</span>
            </div>
            <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl border border-stone-200 dark:border-stone-800">
              <span className="block text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Active Pilots</span>
              <span className="text-3xl font-black mt-2 block">{pilots.filter(p => p.status === 'ACTIVE').length}</span>
            </div>
            <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl border border-stone-200 dark:border-stone-800">
              <span className="block text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Validated Passports</span>
              <span className="text-3xl font-black mt-2 block">{pilots.filter(p => p.passports.length > 0).length}</span>
            </div>
          </div>

          {/* Pilot Overview Tracker */}
          <div className="bg-white dark:bg-stone-800 rounded-3xl p-6 border border-stone-200 dark:border-stone-800">
            <h3 className="text-headline-md text-lg font-bold mb-4">Pilot Overview</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800 text-left text-xs">
                <thead>
                  <tr className="text-stone-500 uppercase tracking-wider font-bold">
                    <th className="pb-3">Challenge</th>
                    <th className="pb-3">Startup</th>
                    <th className="pb-3">KPI Baseline → Target</th>
                    <th className="pb-3">Current KPI</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Scale Score</th>
                    <th className="pb-3">Passport</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {pilots.map((pilot) => {
                    const primaryKpi = pilot.kpis?.[0];
                    return (
                      <tr key={pilot.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/50">
                        <td className="py-4 font-semibold">{pilot.challenge.title}</td>
                        <td className="py-4">{pilot.startup.name}</td>
                        <td className="py-4">{primaryKpi ? `${primaryKpi.baseline}${primaryKpi.unit} → ${primaryKpi.target}${primaryKpi.unit}` : "-"}</td>
                        <td className="py-4 font-bold text-teal-600 dark:text-teal-400">{primaryKpi ? `${primaryKpi.currentValue || 0}${primaryKpi.unit}` : "-"}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            pilot.status === "ACTIVE"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                              : pilot.status === "VALIDATED"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                          }`}>
                            {pilot.status}
                          </span>
                        </td>
                        <td className="py-4 font-bold">{pilot.scaleScore ? `${pilot.scaleScore}/100` : "Pending"}</td>
                        <td className="py-4">
                          {pilot.passports && pilot.passports.length > 0 ? (
                            <Link
                              href={`/passport/${pilot.id}`}
                              className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
                            >
                              GIPP Passport
                            </Link>
                          ) : pilot.status === "VALIDATED" ? (
                            <button
                              onClick={() => handleGeneratePassport(pilot.id)}
                              className="px-2.5 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded font-bold text-[10px]"
                            >
                              Generate GIPP
                            </button>
                          ) : (
                            <span className="text-stone-400">Validate First</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {pilots.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-stone-500">
                        No active or completed pilots found. Create a challenge and select a startup to initiate.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CHALLENGE TAB */}
      {activeTab === "create" && (
        <div className="bg-white dark:bg-stone-800 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-3xl">
          <h3 className="text-headline-md text-xl font-bold mb-2">Create Outcome-Based Challenge</h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
            Describe expected outcomes rather than prescribing technology solutions (e.g. increase efficiency rather than requesting AI waste sorting).
          </p>

          <form onSubmit={handleCreateChallenge} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Challenge Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Waste Collection Optimization"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={newChallenge.department}
                  onChange={(e) => setNewChallenge({ ...newChallenge, department: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Sector</label>
                <input
                  type="text"
                  required
                  value={newChallenge.sector}
                  onChange={(e) => setNewChallenge({ ...newChallenge, sector: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Budget (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1500000"
                  value={newChallenge.budget}
                  onChange={(e) => setNewChallenge({ ...newChallenge, budget: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Duration</label>
                <input
                  type="text"
                  required
                  value={newChallenge.duration}
                  onChange={(e) => setNewChallenge({ ...newChallenge, duration: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Location / Target Area</label>
              <input
                type="text"
                required
                placeholder="e.g. Sector 5 Municipal Area"
                value={newChallenge.location}
                onChange={(e) => setNewChallenge({ ...newChallenge, location: e.target.value })}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Problem Description</label>
              <textarea
                required
                rows={3}
                placeholder="Describe current system issues..."
                value={newChallenge.problemDescription}
                onChange={(e) => setNewChallenge({ ...newChallenge, problemDescription: e.target.value })}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Current Baseline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Collection rate is 65%"
                  value={newChallenge.baseline}
                  onChange={(e) => setNewChallenge({ ...newChallenge, baseline: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Expected Outcome</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Collection efficiency >= 85% within 90 days"
                  value={newChallenge.expectedOutcome}
                  onChange={(e) => setNewChallenge({ ...newChallenge, expectedOutcome: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Eligibility Requirements</label>
              <input
                type="text"
                required
                placeholder="e.g. DPIIT Registered startup with functional prototype"
                value={newChallenge.eligibility}
                onChange={(e) => setNewChallenge({ ...newChallenge, eligibility: e.target.value })}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Success KPIs</label>
              <input
                type="text"
                required
                placeholder="e.g. Waste Collection rate >= 85%, Fuel consumption decrease >= 15%"
                value={newChallenge.successKpis}
                onChange={(e) => setNewChallenge({ ...newChallenge, successKpis: e.target.value })}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl flex items-center space-x-2"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Publish Challenge</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CHALLENGES TAB */}
      {activeTab === "challenges" && (
        <div className="grid md:grid-cols-2 gap-6">
          {challenges.map((c) => (
            <div key={c.id} className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2 py-0.5 bg-teal-100 text-teal-800 dark:bg-teal-950/30 dark:text-teal-300 rounded text-[10px] font-bold uppercase">
                    {c.sector}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    c.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"
                  }`}>
                    {c.status}
                  </span>
                </div>
                <h4 className="text-headline-md font-bold mb-2 text-base">{c.title}</h4>
                <p className="text-stone-500 dark:text-stone-400 text-xs line-clamp-3 mb-4">{c.problemDescription}</p>

                {/* Cross-Department Reuse indicator */}
                <div className="bg-teal-50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/60 p-3 rounded-2xl mb-4 text-xs">
                  <span className="font-bold text-teal-700 dark:text-teal-400 block text-[10px]">Cross-Department Reuse Evidence</span>
                  <span className="block text-[11px] text-stone-600 dark:text-stone-300 mt-1">
                    Previously Validated Solutions: <span className="font-bold text-teal-600 dark:text-teal-400">2 relevant Pilot Passports</span> found.
                  </span>
                  <Link href={`/repository?query=${c.sector}`} className="text-teal-600 dark:text-teal-400 font-bold hover:underline mt-2 inline-block text-[10px]">
                    [View Validated Evidence] →
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-stone-100 dark:border-stone-800 pt-3">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Expected Outcome</span>
                    <span className="font-semibold">{c.expectedOutcome}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Budget</span>
                    <span className="font-semibold">₹{c.budget.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {challenges.length === 0 && (
            <div className="col-span-2 text-center py-8 text-stone-500">
              No challenges created yet. Use the Create tab to initialize one.
            </div>
          )}
        </div>
      )}

      {/* APPLICATIONS TAB */}
      {activeTab === "applications" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {applications.map((app) => {
              const matchScores = JSON.parse(app.matchDetails || "{}");
              return (
                <div key={app.id} className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                        {app.challenge.title}
                      </span>
                      <h4 className="font-bold text-base text-stone-900 dark:text-white mt-1">
                        {app.startup.name}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="block text-2xl font-black text-teal-600 dark:text-teal-400">
                        {app.compatibilityScore}%
                      </span>
                      <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold block">
                        Match Score
                      </span>
                    </div>
                  </div>

                  {/* Compatibility score breakdowns */}
                  <div className="grid grid-cols-4 gap-2 bg-stone-50 dark:bg-stone-900/50 p-3 rounded-2xl text-[10px]">
                    <div>
                      <span className="text-stone-400 block">Tech</span>
                      <span className="font-bold">{matchScores.techScore}%</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Domain</span>
                      <span className="font-bold">{matchScores.domainScore}%</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Capability</span>
                      <span className="font-bold">{matchScores.capabilityScore}%</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Maturity</span>
                      <span className="font-bold">{matchScores.maturityScore}%</span>
                    </div>
                  </div>

                  <div className="text-xs space-y-2">
                    <div>
                      <span className="font-semibold block text-stone-500">Proposed Solution</span>
                      <p className="text-stone-600 dark:text-stone-300 mt-0.5">{app.proposedSolution}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-semibold text-stone-500">Cost Estimate</span>
                        <span className="block font-bold">₹{app.estimatedCost.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-stone-500">Eligibility</span>
                        <span className={`block font-bold ${
                          app.eligibilityStatus === "ELIGIBLE" ? "text-emerald-600" : "text-amber-600"
                        }`}>
                          {app.eligibilityStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
                    {app.eligibilityStatus === "ELIGIBILITY_REVIEW" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleManualEligibilityOverride(app.id, "ELIGIBLE")}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center space-x-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve Eligibility (Override)</span>
                        </button>
                        <button
                          onClick={() => handleManualEligibilityOverride(app.id, "INELIGIBLE")}
                          className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl flex items-center space-x-1 dark:bg-red-950/20 dark:text-red-400"
                        >
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                    {app.eligibilityStatus === "INELIGIBLE" && (
                      <span className="text-red-600 font-bold">Ineligible (Rejected)</span>
                    )}
                    {app.eligibilityStatus === "ELIGIBLE" && (
                      <button
                        onClick={() => setAssigningAppId(app.id)}
                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-950 text-stone-700 dark:text-stone-300 font-bold rounded-xl flex items-center space-x-1.5"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Assign Evaluators</span>
                      </button>
                    )}
                    {app.eligibilityStatus === "UNDER_EVALUATION" && (
                      <div className="flex flex-col space-y-2 w-full">
                        {app.evaluations?.map((ev: any) => (
                          <div key={ev.id} className="text-[11px] text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-900/60 p-2 rounded-xl border border-stone-200/40">
                            <span className="font-bold block">
                              {ev.evaluator.name}: {ev.recommendation === 'PENDING' ? 'Awaiting Score' : `Score: ${ev.totalScore}/100 (${ev.recommendation})`}
                            </span>
                            {ev.comments && <p className="italic mt-0.5">"{ev.comments}"</p>}
                          </div>
                        ))}
                        <div className="flex items-center space-x-2 pt-2">
                          <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
                          <span className="text-stone-500 font-bold text-[11px] mr-2">Evaluation Review State</span>
                          {app.evaluations?.some((ev: any) => ev.recommendation !== 'PENDING' && ev.recommendation !== 'CONFLICT_BLOCKED') && (
                            <button
                              onClick={() => handleShortlistApplication(app.id)}
                              className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl flex items-center space-x-1"
                            >
                              <span>Shortlist Solution</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {app.eligibilityStatus === "SHORTLISTED" && (
                      <button
                        onClick={() => handleSelectStartup(app)}
                        className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl flex items-center space-x-1.5"
                      >
                        <Play className="h-3.5 w-3.5" />
                        <span>Select for Pilot</span>
                      </button>
                    )}
                    {app.eligibilityStatus === "SELECTED" && (
                      <div className="flex items-center space-x-2 text-emerald-600 font-bold">
                        <Check className="h-4 w-4" />
                        <span>Selected (Active Pilot)</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {applications.length === 0 && (
              <div className="col-span-2 text-center py-8 text-stone-500">
                No active challenge applications found.
              </div>
            )}
          </div>

          {/* Assign Evaluator Dialog */}
          {assigningAppId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-stone-200 dark:border-stone-850 w-full max-w-sm text-xs">
                <h4 className="font-extrabold text-base text-stone-900 dark:text-white mb-2">Assign Expert Evaluator</h4>
                <p className="text-stone-400 mb-4">Select an expert evaluator to assign to this startup solution:</p>
                
                <select
                  value={selectedEvaluator}
                  onChange={(e) => setSelectedEvaluator(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl mb-4 text-xs"
                >
                  <option value="">Select Evaluator</option>
                  {evaluators.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>

                <div className="flex justify-end space-x-3 text-xs">
                  <button
                    onClick={() => setAssigningAppId(null)}
                    className="px-4 py-2 text-stone-500 hover:text-stone-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignEvaluator}
                    className="px-4 py-2 bg-teal-500 text-white font-bold rounded-xl"
                  >
                    Confirm Assignment
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PILOTS TAB */}
      {activeTab === "pilots" && (
        <div className="space-y-6">
          {pilots.map((p) => (
            <div key={p.id} className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-6">
              <div className="flex justify-between items-start border-b border-stone-100 dark:border-stone-800 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400">{p.challenge.title}</span>
                  <h4 className="font-bold text-lg text-stone-900 dark:text-white mt-1">
                    Pilot with {p.startup.name}
                  </h4>
                </div>
                <div>
                  <span className="px-3 py-1 bg-teal-500 text-white rounded-full text-xs font-bold">
                    {p.status}
                  </span>
                </div>
              </div>

              {/* KPI Progress section */}
              <div>
                <h5 className="font-bold text-xs uppercase tracking-wider text-stone-400 mb-3">Target KPI Progress</h5>
                {p.kpis?.map((kpi: any) => (
                  <div key={kpi.id} className="space-y-2 max-w-md">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold">{kpi.name}</span>
                      <span className="font-black text-teal-600 dark:text-teal-400">
                        Current: {kpi.currentValue || 0}{kpi.unit} (Target: {kpi.target}{kpi.unit})
                      </span>
                    </div>
                    {/* Basic Progress Visualization */}
                    <div className="flex items-center space-x-2 text-[10px]">
                      <span>Baseline: {kpi.baseline}%</span>
                      <div className="flex-1 h-3 bg-stone-100 dark:bg-stone-900 rounded-full overflow-hidden relative border border-stone-200/50">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                          style={{
                            width: `${Math.min(100, (parseFloat(kpi.currentValue || 0) / parseFloat(kpi.target || 100)) * 100)}%`
                          }}
                        />
                      </div>
                      <span>Target: {kpi.target}%</span>
                    </div>
                    {kpi.evidenceUrl && (
                      <span className="text-[10px] text-stone-400 block pt-1">
                        Latest evidence: <a href="#" className="underline font-bold text-teal-600">{kpi.evidenceUrl}</a>
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Milestones timeline */}
              <div>
                <h5 className="font-bold text-xs uppercase tracking-wider text-stone-400 mb-3">Milestones & Payments</h5>
                <div className="grid md:grid-cols-4 gap-4">
                  {p.milestones?.map((m: any) => (
                    <div key={m.id} className="p-4 bg-stone-50 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-900 rounded-2xl flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-stone-400">{m.deadline}</span>
                        <h6 className="font-bold text-xs mt-1 text-stone-800 dark:text-stone-200">{m.name}</h6>
                        <p className="text-[10px] text-stone-500 mt-1">{m.description}</p>
                      </div>

                      <div className="border-t border-stone-200/60 dark:border-stone-900 pt-3 mt-3 space-y-2 text-[10px]">
                        <div className="flex justify-between">
                          <span>Amount:</span>
                          <span className="font-bold">₹{m.paymentAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Payment:</span>
                          <span className={`font-bold ${
                            m.paymentStatus === "APPROVED" ? "text-emerald-600" : "text-amber-600"
                          }`}>
                            {m.paymentStatus}
                          </span>
                        </div>

                        {/* Government Approval actions */}
                        {m.status === "SUBMITTED" && (
                          <button
                            onClick={() => handleApproveMilestone(p.id, m.id)}
                            className="w-full py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded font-bold text-[9px] uppercase"
                          >
                            Approve Funding
                          </button>
                        )}
                        {m.status === "PENDING" && (
                          <span className="text-[9px] text-stone-400 uppercase italic">Awaiting Startup Evidence</span>
                        )}
                        {m.status === "APPROVED" && (
                          <span className="text-[9px] text-emerald-600 font-bold uppercase flex items-center space-x-1 justify-end">
                            <CheckCircle className="h-3.5 w-3.5 inline" />
                            <span>Paid</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {pilots.length === 0 && (
            <div className="text-center py-8 text-stone-500">
              No active pilot projects found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
