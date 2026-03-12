import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  ChevronRight,
  Loader2,
  ShieldCheck,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { UserRole } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSetupUser } from "../hooks/useQueries";

type RoleChoice = "citizen" | "official";

const steps = ["Role", "Details", "Done"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-10">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                i < current
                  ? "bg-green-500 text-white"
                  : i === current
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={`text-xs font-medium ${
                i === current ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 mb-4 transition-all duration-500 ${
                i < current ? "bg-green-500" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function SetupPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const setupUser = useSetupUser();

  const [step, setStep] = useState(0);
  const [role, setRole] = useState<RoleChoice | null>(null);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    const principal = identity?.getPrincipal();
    if (!principal) {
      setError("Identity not found. Please log in again.");
      return;
    }
    const assignedRole = role === "official" ? UserRole.admin : UserRole.user;
    const fullName =
      role === "official" && department.trim()
        ? `${name.trim()} — ${department.trim()}`
        : name.trim();
    try {
      await setupUser.mutateAsync({
        principal,
        role: assignedRole,
        name: fullName,
      });
      setStep(2);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    }
  }

  function handleContinue() {
    if (role === "official") {
      navigate({ to: "/admin" });
    } else {
      navigate({ to: "/report" });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.14_0.05_255)] via-[oklch(0.18_0.08_255)] to-[oklch(0.22_0.06_255)] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-1.5 text-primary text-sm font-medium mb-4"
          >
            <ShieldCheck className="w-4 h-4" />
            Grievon Portal
          </motion.div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome to Grievon
          </h1>
          <p className="text-[oklch(0.75_0.04_255)] text-base">
            Let's get you set up in just a few steps
          </p>
        </div>

        {/* Card */}
        <div className="bg-[oklch(0.18_0.04_255)] border border-[oklch(0.3_0.06_255)] rounded-2xl p-8 shadow-2xl">
          <StepIndicator current={step} />

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="font-display text-xl font-semibold text-white text-center mb-2">
                  How will you use Grievon?
                </h2>
                <p className="text-[oklch(0.65_0.04_255)] text-sm text-center mb-8">
                  Choose your role to personalise your experience
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    data-ocid="setup.citizen_button"
                    onClick={() => {
                      setRole("citizen");
                      setStep(1);
                    }}
                    className={`group relative flex flex-col items-center gap-4 p-6 rounded-xl border-2 transition-all duration-200 text-left hover:scale-[1.02] active:scale-[0.98] ${
                      role === "citizen"
                        ? "border-primary bg-primary/10"
                        : "border-[oklch(0.3_0.06_255)] bg-[oklch(0.22_0.04_255)] hover:border-primary/60 hover:bg-primary/5"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                      <User className="w-7 h-7 text-primary" />
                    </div>
                    <div className="text-center">
                      <div className="font-display font-semibold text-white text-base mb-1">
                        I'm a Citizen
                      </div>
                      <div className="text-[oklch(0.6_0.04_255)] text-xs leading-relaxed">
                        Report civic issues, track grievance status, and engage
                        with local authorities
                      </div>
                    </div>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.5_0.04_255)] group-hover:text-primary transition-colors" />
                  </button>

                  <button
                    type="button"
                    data-ocid="setup.official_button"
                    onClick={() => {
                      setRole("official");
                      setStep(1);
                    }}
                    className={`group relative flex flex-col items-center gap-4 p-6 rounded-xl border-2 transition-all duration-200 text-left hover:scale-[1.02] active:scale-[0.98] ${
                      role === "official"
                        ? "border-accent bg-accent/10"
                        : "border-[oklch(0.3_0.06_255)] bg-[oklch(0.22_0.04_255)] hover:border-accent/60 hover:bg-accent/5"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                      <ShieldCheck className="w-7 h-7 text-accent" />
                    </div>
                    <div className="text-center">
                      <div className="font-display font-semibold text-white text-base mb-1">
                        I'm a Government Official
                      </div>
                      <div className="text-[oklch(0.6_0.04_255)] text-xs leading-relaxed">
                        Manage, review and resolve citizen complaints from your
                        department
                      </div>
                    </div>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.5_0.04_255)] group-hover:text-accent transition-colors" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="font-display text-xl font-semibold text-white text-center mb-2">
                  {role === "official" ? "Official Details" : "Your Details"}
                </h2>
                <p className="text-[oklch(0.65_0.04_255)] text-sm text-center mb-8">
                  {role === "official"
                    ? "Tell us about yourself and your department"
                    : "Just your name to get started"}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-[oklch(0.8_0.04_255)] text-sm"
                    >
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      data-ocid="setup.name_input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={
                        role === "official"
                          ? "e.g. Rajesh Kumar"
                          : "e.g. Priya Sharma"
                      }
                      className="bg-[oklch(0.14_0.04_255)] border-[oklch(0.3_0.06_255)] text-white placeholder:text-[oklch(0.45_0.04_255)] focus:ring-primary/40"
                      autoFocus
                    />
                  </div>

                  {role === "official" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="department"
                        className="text-[oklch(0.8_0.04_255)] text-sm"
                      >
                        Department{" "}
                        <span className="text-[oklch(0.5_0.04_255)] text-xs">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        id="department"
                        data-ocid="setup.department_input"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Municipal Water Board"
                        className="bg-[oklch(0.14_0.04_255)] border-[oklch(0.3_0.06_255)] text-white placeholder:text-[oklch(0.45_0.04_255)] focus:ring-primary/40"
                      />
                    </div>
                  )}

                  {error && (
                    <div
                      data-ocid="setup.error_state"
                      className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2"
                    >
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(0)}
                      className="flex-1 border-[oklch(0.3_0.06_255)] text-[oklch(0.7_0.04_255)] hover:bg-[oklch(0.25_0.04_255)] hover:text-white"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      data-ocid="setup.submit_button"
                      disabled={setupUser.isPending}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      {setupUser.isPending ? (
                        <>
                          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                          Setting up...
                        </>
                      ) : (
                        "Complete Setup"
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                data-ocid="setup.success_panel"
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </motion.div>

                <h2 className="font-display text-2xl font-bold text-white mb-3">
                  You're all set!
                </h2>
                <p className="text-[oklch(0.65_0.04_255)] text-sm mb-2 max-w-sm mx-auto">
                  {role === "official"
                    ? "Your official account is ready. Head to the admin panel to start reviewing and resolving grievances."
                    : "Your citizen account is ready. You can now report issues and track their resolution in real time."}
                </p>
                <p className="text-[oklch(0.5_0.04_255)] text-xs mb-8">
                  Welcome aboard, {name.split(" — ")[0]}!
                </p>

                <Button
                  data-ocid="setup.continue_button"
                  onClick={handleContinue}
                  className="bg-primary hover:bg-primary/90 px-8 py-2 text-base"
                >
                  {role === "official"
                    ? "Go to Admin Panel"
                    : "Report an Issue"}
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer note */}
        {step < 2 && (
          <p className="text-center text-[oklch(0.45_0.04_255)] text-xs mt-6">
            Your data is secured on the Internet Computer blockchain
          </p>
        )}
      </motion.div>
    </div>
  );
}
