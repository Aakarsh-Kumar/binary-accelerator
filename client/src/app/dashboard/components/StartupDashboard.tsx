"use client";

import { useState, useEffect } from "react";
import { api } from "@/services/api";
import toast from "react-hot-toast";
import { Search, Loader2, Send, CheckCircle, FileText, UploadCloud, RefreshCw, Cpu, Award } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function StartupDashboard() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "discover" | "applications" | "pilots">("overview");

  // States
  const [challenges, setChallenges] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [pilots, setPilots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Profile Form state
  const startupProfile = (user as any)?.startupProfile;
  const [profile, setProfile] = useState({
    name: startupProfile?.name || "",
    industry: startupProfile?.industry || "Urban Tech / Waste Management",
    technology: startupProfile?.technology || "AI Computer Vision, IoT sensors",
    teamSize: startupProfile?.teamSize || 5,
    yearsOperating: startupProfile?.yearsOperating || 2,
    productDescription: startupProfile?.productDescription || "",
    deployments: startupProfile?.deployments || "",
    certifications: startupProfile?.certifications || "DPIIT Registered Startup",
  });

  // Application Modal state
  const [applyingChallenge, setApplyingChallenge] = useState<any | null>(null);
  const [proposal, setProposal] = useState({
    proposedSolution: "",
    technicalApproach: "",
    implementationPlan: "",
    expectedImpact: "",
    pilotPlan: "",
    estimatedCost: "",
    supportingDocuments: "technical_proposal.pdf"
  });

  // KPI Evidence Update state
  const [updatingKpi, setUpdatingKpi] = useState<any | null>(null);
  const [newKpiValue, setNewKpiValue] = useState("");

  // Milestone Update state
  const [uploadingMilestone, setUploadingMilestone] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [challengesRes, appsRes, pilotsRes] = await Promise.all([
        api.get("/challenges"),
        api.get("/applications"),
        api.get("/pilots")
      ]);
      setChallenges(challengesRes.data);
      setApplications(appsRes.data);
      setPilots(pilotsRes.data);
    } catch (error) {
      toast.error("Failed to load startup dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post("/startups/profile", profile);
      if (response.status === 200) {
        toast.success("Profile saved successfully!");
        // Refresh session
        const meRes = await api.get("/auth/me");
        setUser(meRes.data.user);
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post("/applications", {
        challengeId: applyingChallenge.id,
        ...proposal,
        estimatedCost: parseFloat(proposal.estimatedCost)
      });
      if (response.status === 201) {
        toast.success("Application submitted successfully!");
        setApplyingChallenge(null);
        setProposal({
          proposedSolution: "",
          technicalApproach: "",
          implementationPlan: "",
          expectedImpact: "",
          pilotPlan: "",
          estimatedCost: "",
          supportingDocuments: "technical_proposal.pdf"
        });
        setActiveTab("applications");
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateKpi = async (pilotId: string, kpiId: string) => {
    if (!newKpiValue) {
      toast.error("Please enter a new KPI metric value");
      return;
    }

    try {
      const response = await api.put(`/pilots/${pilotId}/kpis/${kpiId}`, {
        currentValue: newKpiValue,
        evidenceUrl: "automated_telemetry_dump.csv"
      });
      if (response.status === 200) {
        toast.success("Telemetry updated successfully! Government notified.");
        setUpdatingKpi(null);
        setNewKpiValue("");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to update KPI");
    }
  };

  const handleUploadMilestoneEvidence = async (pilotId: string, milestoneId: string) => {
    try {
      const response = await api.put(`/pilots/${pilotId}/milestones/${milestoneId}`, {
        evidenceUrl: "milestone_evidence_report.pdf"
      });
      if (response.status === 200) {
        toast.success("Milestone evidence submitted for government validation!");
        setUploadingMilestone(null);
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to submit milestone evidence");
    }
  };

  // Compatibility Mock Scores calculator (Calculates dynamic frontend display)
  const calculateCompatibility = (challenge: any) => {
    // Determine deterministic weighted matches
    const startupTech = ((user as any)?.startupProfile?.technology || "").toLowerCase();
    const challengeTitle = (challenge.title || "").toLowerCase();
    const isShowcaseMatch = challengeTitle.includes("waste") && startupTech.includes("waste");
    
    if (isShowcaseMatch) return 91;
    // Default variations
    const hash = challenge.title.charCodeAt(0) + challenge.title.charCodeAt(challenge.title.length - 1);
    return 65 + (hash % 25);
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
        {(["overview", "profile", "discover", "applications", "pilots"] as const).map((tab) => (
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl border border-stone-200 dark:border-stone-800">
              <span className="block text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">My Applications</span>
              <span className="text-3xl font-black mt-2 block">{applications.length}</span>
            </div>
            <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl border border-stone-200 dark:border-stone-800">
              <span className="block text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Active Pilots</span>
              <span className="text-3xl font-black mt-2 block">{pilots.filter(p => p.status === 'ACTIVE').length}</span>
            </div>
            <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl border border-stone-200 dark:border-stone-800">
              <span className="block text-xs text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Completed Pilots</span>
              <span className="text-3xl font-black mt-2 block">{pilots.filter(p => p.status === 'COMPLETED' || p.status === 'VALIDATED').length}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-800 rounded-3xl p-6 border border-stone-200 dark:border-stone-800">
            <h3 className="text-headline-md text-lg font-bold mb-4">My Running Pilots</h3>
            {pilots.map((p) => (
              <div key={p.id} className="border border-stone-100 dark:border-stone-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h4 className="font-bold text-sm text-stone-900 dark:text-white">{p.challenge.title}</h4>
                  <span className="text-xs text-stone-500 dark:text-stone-400 mt-1 block">Location: {p.location}</span>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-6 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px]">KPI Current</span>
                    <span className="font-bold text-teal-500">{p.kpis?.[0]?.currentValue || 0}%</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Milestones Approved</span>
                    <span className="font-bold">{p.milestones?.filter((m: any) => m.status === 'APPROVED').length} / {p.milestones?.length}</span>
                  </div>
                  <button
                    onClick={() => setActiveTab("pilots")}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 text-stone-700 dark:text-stone-300 font-bold rounded-xl"
                  >
                    View Timeline
                  </button>
                </div>
              </div>
            ))}
            {pilots.length === 0 && (
              <p className="text-stone-500 text-xs text-center py-6">No active pilot projects. Explore challenges and apply to begin.</p>
            )}
          </div>
        </div>
      )}

      {/* EDIT PROFILE TAB */}
      {activeTab === "profile" && (
        <div className="bg-white dark:bg-stone-800 p-8 rounded-3xl border border-stone-200 dark:border-stone-800 max-w-3xl">
          <h3 className="text-headline-md text-xl font-bold mb-2">Startup Profile Details</h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">Specify technology capabilities to enable accurate compatibility matching scores.</p>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Startup Name</label>
                <input
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Industry Sector</label>
                <input
                  type="text"
                  required
                  value={profile.industry}
                  onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Team Size</label>
                <input
                  type="number"
                  required
                  value={profile.teamSize}
                  onChange={(e) => setProfile({ ...profile, teamSize: parseInt(e.target.value) })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Years Operating</label>
                <input
                  type="number"
                  required
                  value={profile.yearsOperating}
                  onChange={(e) => setProfile({ ...profile, yearsOperating: parseInt(e.target.value) })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Certifications</label>
                <input
                  type="text"
                  required
                  value={profile.certifications}
                  onChange={(e) => setProfile({ ...profile, certifications: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Technology Focus Keywords</label>
              <input
                type="text"
                required
                value={profile.technology}
                onChange={(e) => setProfile({ ...profile, technology: e.target.value })}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                placeholder="e.g. AI Computer Vision, IoT, Spectroscopy"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Product Description</label>
              <textarea
                required
                rows={3}
                value={profile.productDescription}
                onChange={(e) => setProfile({ ...profile, productDescription: e.target.value })}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Previous Deployments History</label>
              <textarea
                required
                rows={2}
                value={profile.deployments}
                onChange={(e) => setProfile({ ...profile, deployments: e.target.value })}
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
                    <CheckCircle className="h-4 w-4" />
                    <span>Save Profile Details</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DISCOVER TAB */}
      {activeTab === "discover" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {challenges.filter(c => c.status === 'PUBLISHED').map((c) => {
              const compScore = calculateCompatibility(c);
              return (
                <div key={c.id} className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2 py-0.5 bg-teal-100 text-teal-800 dark:bg-teal-950/30 dark:text-teal-300 rounded text-[10px] font-bold uppercase">
                        {c.sector}
                      </span>
                      <div className="text-right">
                        <span className="px-2.5 py-1 bg-teal-500/10 text-teal-600 font-bold rounded-full text-xs">
                          {compScore}% Match
                        </span>
                      </div>
                    </div>
                    <h4 className="text-headline-md font-bold mb-2 text-base">{c.title}</h4>
                    <p className="text-stone-500 dark:text-stone-400 text-xs line-clamp-3 mb-4">{c.problemDescription}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-stone-100 dark:border-stone-800 pt-3">
                      <div>
                        <span className="text-stone-400 block text-[10px]">Baseline</span>
                        <span className="font-semibold">{c.baseline}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">Outcome Target</span>
                        <span className="font-semibold">{c.expectedOutcome}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setApplyingChallenge(c)}
                      className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl text-center block text-xs"
                    >
                      Apply to Challenge
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Application Submit Modal */}
          {applyingChallenge && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
              <div className="bg-white dark:bg-stone-800 p-8 rounded-3xl border border-stone-200 dark:border-stone-850 w-full max-w-lg text-xs my-8 max-h-[90vh] overflow-y-auto">
                <h4 className="font-extrabold text-base text-stone-900 dark:text-white mb-2">Apply to Challenge</h4>
                <p className="text-stone-500 mb-6">Challenge: "{applyingChallenge.title}"</p>

                <form onSubmit={handleApply} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Proposed Solution Description</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Explain your core product solution..."
                      value={proposal.proposedSolution}
                      onChange={(e) => setProposal({ ...proposal, proposedSolution: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Technical Approach & Architecture</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Specify sensor metrics, models, ML structure..."
                      value={proposal.technicalApproach}
                      onChange={(e) => setProposal({ ...proposal, technicalApproach: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Estimated Pilot Cost (₹)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 1000000"
                        value={proposal.estimatedCost}
                        onChange={(e) => setProposal({ ...proposal, estimatedCost: e.target.value })}
                        className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Supporting Document File</label>
                      <input
                        type="text"
                        required
                        value={proposal.supportingDocuments}
                        onChange={(e) => setProposal({ ...proposal, supportingDocuments: e.target.value })}
                        className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Implementation Plan Timeline</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. Week 1-2: Sensor deployment. Week 3-8: Dynamic routing validation."
                      value={proposal.implementationPlan}
                      onChange={(e) => setProposal({ ...proposal, implementationPlan: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Expected Pilot Impact (Quantifiable)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 20% reduction in emission chokes, 90% bin routing precision"
                      value={proposal.expectedImpact}
                      onChange={(e) => setProposal({ ...proposal, expectedImpact: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Detailed Pilot Testing Plan</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Describe target zones, testing methods, telemetry updates..."
                      value={proposal.pilotPlan}
                      onChange={(e) => setProposal({ ...proposal, pilotPlan: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 text-xs pt-3">
                    <button
                      type="button"
                      onClick={() => setApplyingChallenge(null)}
                      className="px-4 py-2 text-stone-500 hover:text-stone-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-teal-500 text-white font-bold rounded-xl flex items-center space-x-2"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span>Submit Proposal</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* APPLICATIONS TAB */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-bold block">{app.challenge.title}</span>
                <h4 className="font-bold text-stone-900 dark:text-white mt-1 text-sm">{app.proposedSolution}</h4>
                <p className="text-[10px] text-stone-500 mt-1">Cost: ₹{app.estimatedCost.toLocaleString()} | Compatibility: {app.compatibilityScore}%</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase ${
                  app.eligibilityStatus === "ELIGIBLE"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : app.eligibilityStatus === "UNDER_EVALUATION"
                    ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300"
                    : app.eligibilityStatus === "SELECTED"
                    ? "bg-teal-100 text-teal-800 dark:bg-teal-950/30 dark:text-teal-300"
                    : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300"
                }`}>
                  {app.eligibilityStatus.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          ))}
          {applications.length === 0 && (
            <p className="text-stone-500 text-xs text-center py-6">No applications submitted yet.</p>
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
                    My Pilot Project
                  </h4>
                </div>
                <div>
                  <span className="px-3 py-1 bg-teal-500 text-white rounded-full text-xs font-bold">
                    {p.status}
                  </span>
                </div>
              </div>

              {/* KPI Telemetry Updating */}
              <div>
                <h5 className="font-bold text-xs uppercase tracking-wider text-stone-400 mb-3">Telemetry KPI Updating</h5>
                {p.kpis?.map((kpi: any) => (
                  <div key={kpi.id} className="space-y-2 max-w-md">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold">{kpi.name}</span>
                      <span className="font-black text-teal-600 dark:text-teal-400">
                        Current: {kpi.currentValue || 0}{kpi.unit} (Target: {kpi.target}{kpi.unit})
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 pt-1">
                      <button
                        onClick={() => setUpdatingKpi(kpi)}
                        className="px-3 py-1.5 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-[10px] font-bold rounded-lg flex items-center space-x-1"
                      >
                        <UploadCloud className="h-3.5 w-3.5" />
                        <span>Update Telemetry Value</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Milestones Deliverables Submit */}
              <div>
                <h5 className="font-bold text-xs uppercase tracking-wider text-stone-400 mb-3">Milestone Deliverables & Payment</h5>
                <div className="grid md:grid-cols-4 gap-4 text-xs">
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
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className="font-bold uppercase text-stone-600 dark:text-stone-300">{m.status}</span>
                        </div>

                        {/* Startup Submit evidence */}
                        {m.status === "PENDING" && (
                          <button
                            onClick={() => setUploadingMilestone(m)}
                            className="w-full py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded font-bold text-[9px] uppercase"
                          >
                            Submit Evidence
                          </button>
                        )}
                        {m.status === "SUBMITTED" && (
                          <span className="text-[9px] text-amber-500 uppercase italic">Awaiting Govt Approval</span>
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

              {/* KPI Input Dialog */}
              {updatingKpi && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <div className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-stone-200 dark:border-stone-850 w-full max-w-sm text-xs">
                    <h4 className="font-extrabold text-base text-stone-900 dark:text-white mb-1">Update KPI Telemetry</h4>
                    <p className="text-stone-400 mb-4">Metric: "{updatingKpi.name}"</p>

                    <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Current Telemetry Value ({updatingKpi.unit})</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 89"
                      value={newKpiValue}
                      onChange={(e) => setNewKpiValue(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl mb-4"
                    />

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setUpdatingKpi(null)}
                        className="px-4 py-2 text-stone-500 hover:text-stone-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateKpi(p.id, updatingKpi.id)}
                        className="px-4 py-2 bg-teal-500 text-white font-bold rounded-xl"
                      >
                        Update KPI
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Milestone Evidence Input Dialog */}
              {uploadingMilestone && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <div className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-stone-200 dark:border-stone-850 w-full max-w-sm text-xs">
                    <h4 className="font-extrabold text-base text-stone-900 dark:text-white mb-2">Submit Milestone Deliverables</h4>
                    <p className="text-stone-400 mb-4">Milestone: "{uploadingMilestone.name}"</p>

                    <p className="text-stone-500 mb-4 leading-relaxed">
                      Click confirm to upload the delivery report (`milestone_evidence_report.pdf`) and submit the milestone for Government review.
                    </p>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setUploadingMilestone(null)}
                        className="px-4 py-2 text-stone-500 hover:text-stone-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUploadMilestoneEvidence(p.id, uploadingMilestone.id)}
                        className="px-4 py-2 bg-teal-500 text-white font-bold rounded-xl"
                      >
                        Confirm Upload
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {pilots.length === 0 && (
            <div className="text-center py-8 text-stone-500">
              No active pilot projects.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
