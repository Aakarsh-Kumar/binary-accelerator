"use client";

import { useState, useEffect } from "react";
import { api } from "@/services/api";
import toast from "react-hot-toast";
import { ShieldAlert, Award, FileText, CheckCircle2, ChevronRight, Loader2, Sparkles } from "lucide-react";

export default function EvaluatorDashboard() {
  const [activeTab, setActiveTab] = useState<"evaluations" | "validations">("evaluations");

  // States
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [pilots, setPilots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Scoring form state
  const [scoringEval, setScoringEval] = useState<any | null>(null);
  const [scoreForm, setScoreForm] = useState({
    hasConflict: false,
    scoreTechnicalFit: 80,
    scoreProblemFit: 80,
    scoreInnovation: 80,
    scoreScalability: 80,
    scoreCostEffectiveness: 80,
    scoreCybersecurity: 80,
    scoreTeamCapability: 80,
    comments: "",
    strengths: "",
    risks: "",
    recommendation: "RECOMMENDED"
  });

  // Validation Form state
  const [validatingPilot, setValidatingPilot] = useState<any | null>(null);
  const [validationForm, setValidationForm] = useState({
    startupClaim: "",
    target: "",
    evidence: "",
    measurementMethod: "IoT Telemetry Log Cross-Reference",
    independentResult: "",
    status: "VALIDATED",
    comments: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [evalsRes, pilotsRes] = await Promise.all([
        api.get("/evaluations"),
        api.get("/pilots")
      ]);
      setEvaluations(evalsRes.data);
      // Evaluators validate pilots that are in ACTIVE or VALIDATION/VALIDATED state
      setPilots(pilotsRes.data);
    } catch (error) {
      toast.error("Failed to load evaluator dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleConflict = async (evalId: string, hasConflict: boolean) => {
    if (hasConflict) {
      const confirmConflict = window.confirm("Are you sure you want to declare a conflict of interest? This will block your access to this evaluation.");
      if (!confirmConflict) return;
    }

    try {
      const response = await api.post("/evaluations", {
        applicationId: evaluations.find(e => e.id === evalId)?.applicationId,
        hasConflict,
        scoreTechnicalFit: 0,
        scoreProblemFit: 0,
        scoreInnovation: 0,
        scoreScalability: 0,
        scoreCostEffectiveness: 0,
        scoreCybersecurity: 0,
        scoreTeamCapability: 0,
        comments: hasConflict ? "Blocked due to conflict of interest declaration." : "",
        strengths: "",
        risks: "",
        recommendation: hasConflict ? "CONFLICT_BLOCKED" : "PENDING"
      });

      if (response.status === 200) {
        toast.success(hasConflict ? "Conflict registered. Evaluation blocked." : "Declared no conflict!");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to update conflict status");
    }
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post("/evaluations", {
        applicationId: scoringEval.applicationId,
        ...scoreForm
      });
      if (response.status === 200) {
        toast.success("Scoring submitted successfully!");
        setScoringEval(null);
        setScoreForm({
          hasConflict: false,
          scoreTechnicalFit: 80,
          scoreProblemFit: 80,
          scoreInnovation: 80,
          scoreScalability: 80,
          scoreCostEffectiveness: 80,
          scoreCybersecurity: 80,
          scoreTeamCapability: 80,
          comments: "",
          strengths: "",
          risks: "",
          recommendation: "RECOMMENDED"
        });
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to submit scoring");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenValidate = (pilot: any) => {
    const kpi = pilot.kpis?.[0] || {};
    setValidatingPilot(pilot);
    setValidationForm({
      startupClaim: `${kpi.currentValue || 0}%`,
      target: `${kpi.target || 85}%`,
      evidence: kpi.evidenceUrl || "automated_telemetry_dump.csv",
      measurementMethod: "IoT Telemetry Log Cross-Reference",
      independentResult: kpi.currentValue || "87", // Default mock seed for showcase check
      status: "VALIDATED",
      comments: ""
    });
  };

  const handleSubmitValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post(`/pilots/${validatingPilot.id}/validate`, validationForm);
      if (response.status === 200) {
        toast.success("Pilot validated! GIPP Scale Readiness Score calculated.");
        setValidatingPilot(null);
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to submit validation");
    } finally {
      setSubmitting(false);
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
        {(["evaluations", "validations"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-semibold capitalize pb-2 border-b-2 px-1 transition-all ${
              activeTab === tab
                ? "border-teal-500 text-teal-600 dark:text-teal-400"
                : "border-transparent text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
            }`}
          >
            {tab === "evaluations" ? "Assigned Evaluations" : "Pilot Validations"}
          </button>
        ))}
      </div>

      {/* ASSIGNED EVALUATIONS */}
      {activeTab === "evaluations" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {evaluations.map((ev) => (
              <div key={ev.id} className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">
                      {ev.application.challenge.title}
                    </span>
                    <h4 className="font-bold text-base text-stone-900 dark:text-white mt-1">
                      {ev.application.startup.name}
                    </h4>
                  </div>
                  <div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      ev.recommendation === "PENDING"
                        ? "bg-stone-100 text-stone-600 dark:bg-stone-900 dark:text-stone-400"
                        : ev.recommendation === "CONFLICT_BLOCKED"
                        ? "bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300"
                    }`}>
                      {ev.recommendation}
                    </span>
                  </div>
                </div>

                <div className="text-xs space-y-2">
                  <div>
                    <span className="font-semibold text-stone-500">Proposed Solution</span>
                    <p className="text-stone-600 dark:text-stone-300 mt-0.5">{ev.application.proposedSolution}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-semibold text-stone-500">Proposed Cost</span>
                      <span className="block font-bold">₹{ev.application.estimatedCost.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-stone-500">Compatibility Score</span>
                      <span className="block font-bold text-teal-500">{ev.application.compatibilityScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Conflict Declaration / Evaluate Action block */}
                <div className="flex space-x-3 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
                  {ev.recommendation === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleConflict(ev.id, true)}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/15 dark:hover:bg-red-950/30 text-red-600 font-bold rounded-xl flex items-center space-x-1"
                      >
                        <ShieldAlert className="h-4 w-4" />
                        <span>Declare Conflict</span>
                      </button>
                      <button
                        onClick={() => setScoringEval(ev)}
                        className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl flex items-center space-x-1"
                      >
                        <Award className="h-4 w-4" />
                        <span>Evaluate Solution</span>
                      </button>
                    </>
                  )}
                  {ev.recommendation === "CONFLICT_BLOCKED" && (
                    <div className="flex items-center space-x-1.5 text-red-500 font-bold">
                      <ShieldAlert className="h-4 w-4" />
                      <span>Blocked (Conflict Declared)</span>
                    </div>
                  )}
                  {ev.recommendation !== "PENDING" && ev.recommendation !== "CONFLICT_BLOCKED" && (
                    <div className="text-xs text-stone-500 space-y-1">
                      <span className="block font-bold text-teal-600">Scoring Submitted: {ev.totalScore}/100</span>
                      <p className="text-stone-400 italic">"{ev.comments}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {evaluations.length === 0 && (
              <p className="text-stone-500 text-xs text-center py-6 col-span-2">No assigned applications to evaluate.</p>
            )}
          </div>

          {/* Scoring Sheet Modal */}
          {scoringEval && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
              <div className="bg-white dark:bg-stone-800 p-8 rounded-3xl border border-stone-200 dark:border-stone-850 w-full max-w-lg text-xs my-8 max-h-[90vh] overflow-y-auto">
                <h4 className="font-extrabold text-base text-stone-900 dark:text-white mb-1 flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-teal-500" />
                  <span>Expert Proposal Evaluation Sheet</span>
                </h4>
                <p className="text-stone-500 mb-6">Startup: "{scoringEval.application.startup.name}"</p>

                <form onSubmit={handleSubmitScore} className="space-y-4 text-xs">
                  {/* SLIDERS FOR WEIGHTED CRITERIA */}
                  <div className="space-y-3 bg-stone-50 dark:bg-stone-900/50 p-4 rounded-2xl border border-stone-100 dark:border-stone-800">
                    <div>
                      <div className="flex justify-between font-bold mb-1 text-[10px]">
                        <span>Technical Fit (25%)</span>
                        <span className="text-teal-600">{scoreForm.scoreTechnicalFit}/100</span>
                      </div>
                      <input
                        type="range" min="0" max="100"
                        value={scoreForm.scoreTechnicalFit}
                        onChange={(e) => setScoreForm({ ...scoreForm, scoreTechnicalFit: parseInt(e.target.value) })}
                        className="w-full h-1 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1 text-[10px]">
                        <span>Problem Fit (20%)</span>
                        <span className="text-teal-600">{scoreForm.scoreProblemFit}/100</span>
                      </div>
                      <input
                        type="range" min="0" max="100"
                        value={scoreForm.scoreProblemFit}
                        onChange={(e) => setScoreForm({ ...scoreForm, scoreProblemFit: parseInt(e.target.value) })}
                        className="w-full h-1 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1 text-[10px]">
                        <span>Innovation Level (20%)</span>
                        <span className="text-teal-600">{scoreForm.scoreInnovation}/100</span>
                      </div>
                      <input
                        type="range" min="0" max="100"
                        value={scoreForm.scoreInnovation}
                        onChange={(e) => setScoreForm({ ...scoreForm, scoreInnovation: parseInt(e.target.value) })}
                        className="w-full h-1 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1 text-[10px]">
                        <span>Scalability (15%)</span>
                        <span className="text-teal-600">{scoreForm.scoreScalability}/100</span>
                      </div>
                      <input
                        type="range" min="0" max="100"
                        value={scoreForm.scoreScalability}
                        onChange={(e) => setScoreForm({ ...scoreForm, scoreScalability: parseInt(e.target.value) })}
                        className="w-full h-1 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1 text-[10px]">
                        <span>Cost Effectiveness (10%)</span>
                        <span className="text-teal-600">{scoreForm.scoreCostEffectiveness}/100</span>
                      </div>
                      <input
                        type="range" min="0" max="100"
                        value={scoreForm.scoreCostEffectiveness}
                        onChange={(e) => setScoreForm({ ...scoreForm, scoreCostEffectiveness: parseInt(e.target.value) })}
                        className="w-full h-1 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between font-bold mb-1 text-[10px]">
                          <span>Cybersecurity (5%)</span>
                          <span className="text-teal-600">{scoreForm.scoreCybersecurity}</span>
                        </div>
                        <input
                          type="range" min="0" max="100"
                          value={scoreForm.scoreCybersecurity}
                          onChange={(e) => setScoreForm({ ...scoreForm, scoreCybersecurity: parseInt(e.target.value) })}
                          className="w-full h-1 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between font-bold mb-1 text-[10px]">
                          <span>Team Capability (5%)</span>
                          <span className="text-teal-600">{scoreForm.scoreTeamCapability}</span>
                        </div>
                        <input
                          type="range" min="0" max="100"
                          value={scoreForm.scoreTeamCapability}
                          onChange={(e) => setScoreForm({ ...scoreForm, scoreTeamCapability: parseInt(e.target.value) })}
                          className="w-full h-1 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Key Strengths</label>
                    <input
                      type="text" required
                      placeholder="e.g. Robust fill-level AI algorithm, DPIIT verified team"
                      value={scoreForm.strengths}
                      onChange={(e) => setScoreForm({ ...scoreForm, strengths: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Key Risks</label>
                    <input
                      type="text" required
                      placeholder="e.g. Heavy dependency on sensor battery life"
                      value={scoreForm.risks}
                      onChange={(e) => setScoreForm({ ...scoreForm, risks: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Summary Comments & Rationale</label>
                    <textarea
                      required rows={2}
                      placeholder="Input final evaluation rationale..."
                      value={scoreForm.comments}
                      onChange={(e) => setScoreForm({ ...scoreForm, comments: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Recommendation</label>
                    <select
                      value={scoreForm.recommendation}
                      onChange={(e) => setScoreForm({ ...scoreForm, recommendation: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                    >
                      <option value="RECOMMENDED">RECOMMENDED</option>
                      <option value="RECOMMENDED_WITH_REVISIONS">RECOMMENDED WITH REVISIONS</option>
                      <option value="NOT_RECOMMENDED">NOT RECOMMENDED</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 text-xs pt-3">
                    <button
                      type="button"
                      onClick={() => setScoringEval(null)}
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
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Submit Scores</span>
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

      {/* PILOT VALIDATIONS */}
      {activeTab === "validations" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {pilots.filter(p => p.status === 'ACTIVE' || p.status === 'VALIDATED').map((p) => {
              const primaryKpi = p.kpis?.[0] || {};
              return (
                <div key={p.id} className="bg-white dark:bg-stone-800 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-4">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">{p.challenge.title}</span>
                    <h4 className="font-bold text-base text-stone-900 dark:text-white mt-1">
                      Pilot: {p.startup.name}
                    </h4>
                    <p className="text-[10px] text-stone-500 mt-1">Objectives: {p.objectives}</p>
                  </div>

                  <div className="bg-stone-50 dark:bg-stone-900/50 p-4 rounded-2xl border border-stone-100 dark:border-stone-800 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-stone-500">Metric Under Verification:</span>
                      <span className="font-bold">{primaryKpi.name}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center pt-2">
                      <div className="bg-stone-100 dark:bg-stone-900 p-2 rounded-xl">
                        <span className="text-[9px] text-stone-400 block uppercase">Baseline</span>
                        <span className="font-bold">{primaryKpi.baseline}%</span>
                      </div>
                      <div className="bg-stone-100 dark:bg-stone-900 p-2 rounded-xl">
                        <span className="text-[9px] text-stone-400 block uppercase">Target</span>
                        <span className="font-bold">{primaryKpi.target}%</span>
                      </div>
                      <div className="bg-stone-100 dark:bg-stone-900 p-2 rounded-xl">
                        <span className="text-[9px] text-stone-400 block uppercase">Startup Claim</span>
                        <span className="font-bold text-teal-600">{primaryKpi.currentValue || 0}%</span>
                      </div>
                    </div>
                    {primaryKpi.evidenceUrl && (
                      <div className="pt-2 text-[10px]">
                        <span className="text-stone-400">Claim Evidence:</span>
                        <span className="block font-mono text-teal-600 overflow-x-auto">{primaryKpi.evidenceUrl}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-stone-100 dark:border-stone-850 flex justify-between items-center text-xs">
                    {p.status === "ACTIVE" ? (
                      <button
                        onClick={() => handleOpenValidate(p)}
                        className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl flex items-center space-x-1"
                      >
                        <span>Conduct Validation</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2 text-emerald-600 font-bold">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Validation Submitted (Score: {p.scaleScore}/100)</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {pilots.filter(p => p.status === 'ACTIVE' || p.status === 'VALIDATED').length === 0 && (
              <p className="text-stone-500 text-xs text-center py-6 col-span-2">No pilots currently active or awaiting validation.</p>
            )}
          </div>

          {/* Validation Form Modal */}
          {validatingPilot && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
              <div className="bg-white dark:bg-stone-800 p-8 rounded-3xl border border-stone-200 dark:border-stone-850 w-full max-w-lg text-xs my-8 max-h-[90vh] overflow-y-auto">
                <h4 className="font-extrabold text-base text-stone-900 dark:text-white mb-2">Independent Pilot Validation Form</h4>
                <p className="text-stone-500 mb-6">Pilot: "{validatingPilot.startup.name}"</p>

                <form onSubmit={handleSubmitValidation} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Startup Claimed Result</label>
                      <input
                        type="text" required disabled
                        value={validationForm.startupClaim}
                        className="w-full p-2.5 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Target Result</label>
                      <input
                        type="text" required disabled
                        value={validationForm.target}
                        className="w-full p-2.5 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Independent Verified Result (Metric)</label>
                    <input
                      type="text" required
                      placeholder="e.g. 87"
                      value={validationForm.independentResult}
                      onChange={(e) => setValidationForm({ ...validationForm, independentResult: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Measurement Method Details</label>
                    <input
                      type="text" required
                      value={validationForm.measurementMethod}
                      onChange={(e) => setValidationForm({ ...validationForm, measurementMethod: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Validation Decision Status</label>
                    <select
                      value={validationForm.status}
                      onChange={(e) => setValidationForm({ ...validationForm, status: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                    >
                      <option value="VALIDATED">VALIDATED</option>
                      <option value="PARTIALLY_VALIDATED">PARTIALLY VALIDATED</option>
                      <option value="NOT_VALIDATED">NOT VALIDATED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-600 dark:text-stone-400 mb-1">Verification Comments & Rationale</label>
                    <textarea
                      required rows={3}
                      placeholder="Explain your independent findings..."
                      value={validationForm.comments}
                      onChange={(e) => setValidationForm({ ...validationForm, comments: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 text-xs pt-3">
                    <button
                      type="button"
                      onClick={() => setValidatingPilot(null)}
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
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Submit Validation</span>
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
    </div>
  );
}
