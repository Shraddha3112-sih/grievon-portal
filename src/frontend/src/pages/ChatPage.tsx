import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  CheckCircle2,
  Clock,
  Copy,
  MapPin,
  RotateCcw,
  Send,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Category, Severity } from "../backend";
import { useSubmitGrievance } from "../hooks/useQueries";

type ChatStep =
  | "description"
  | "category"
  | "location"
  | "severity"
  | "duration"
  | "contact"
  | "review"
  | "submitted";

interface Message {
  id: string;
  role: "bot" | "user";
  content: string;
  timestamp: Date;
}

interface GrievanceData {
  description: string;
  category: Category;
  location: string;
  severity: Severity;
  duration: string;
  citizenName: string;
  contactInfo: string;
}

const CATEGORY_OPTIONS: { value: Category; label: string; emoji: string }[] = [
  {
    value: Category.roads_infrastructure,
    label: "Roads & Infrastructure",
    emoji: "🛣️",
  },
  { value: Category.water_supply, label: "Water Supply", emoji: "💧" },
  { value: Category.electricity, label: "Electricity", emoji: "⚡" },
  { value: Category.sanitation, label: "Sanitation", emoji: "🗑️" },
  { value: Category.public_safety, label: "Public Safety", emoji: "🛡️" },
  { value: Category.healthcare, label: "Healthcare", emoji: "🏥" },
  { value: Category.education, label: "Education", emoji: "🎓" },
  { value: Category.other, label: "Other", emoji: "📋" },
];

const DURATION_OPTIONS = [
  "Less than a day",
  "1–3 days",
  "About a week",
  "More than a week",
  "Over a month",
];

const DEPARTMENT_MAP: Record<Category, string> = {
  [Category.roads_infrastructure]: "Public Works Department",
  [Category.water_supply]: "Water Supply & Sewerage Board",
  [Category.electricity]: "State Electricity Department",
  [Category.sanitation]: "Municipal Sanitation Department",
  [Category.public_safety]: "Police & Public Safety Department",
  [Category.healthcare]: "Department of Health Services",
  [Category.education]: "Department of Education",
  [Category.other]: "General Administration Department",
};

function detectCategory(description: string): Category {
  const text = description.toLowerCase();
  if (/road|pothole|bridge|footpath|pavement|street|traffic/.test(text))
    return Category.roads_infrastructure;
  if (/water|supply|pipe|leak|sewage|drain|flood/.test(text))
    return Category.water_supply;
  if (/electric|power|light|outage|meter|voltage|transformer/.test(text))
    return Category.electricity;
  if (/garbage|waste|trash|dirty|sanitation|cleanliness/.test(text))
    return Category.sanitation;
  if (/crime|safety|theft|assault|police|robbery|violence/.test(text))
    return Category.public_safety;
  if (/hospital|doctor|medicine|health|clinic|medical/.test(text))
    return Category.healthcare;
  if (/school|education|teacher|student|college|class/.test(text))
    return Category.education;
  return Category.other;
}

function categoryLabel(cat: Category): string {
  return CATEGORY_OPTIONS.find((c) => c.value === cat)?.label ?? cat;
}

function msgId() {
  return Math.random().toString(36).slice(2);
}

function FormattedMessage({ content }: { content: string }) {
  const segments: React.ReactNode[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const lineKey = line.slice(0, 20) || Math.random().toString(36);
    if (segments.length > 0) segments.push(<br key={`br-${lineKey}`} />);
    const parts = line.split(/\*\*(.+?)\*\*/g);
    let partIdx = 0;
    for (const part of parts) {
      const key = `${lineKey}-${partIdx}-${part.slice(0, 8)}`;
      if (partIdx % 2 === 1) {
        segments.push(<strong key={key}>{part}</strong>);
      } else if (part) {
        segments.push(<span key={key}>{part}</span>);
      }
      partIdx++;
    }
  }
  return <>{segments}</>;
}

export function ChatPage() {
  const [step, setStep] = useState<ChatStep>("description");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: msgId(),
      role: "bot",
      content:
        "👋 Hello! I'm Grievon Assistant. I'm here to help you file a complaint with the right government department.\n\nPlease describe the civic problem you're facing — be as detailed as you like!",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [data, setData] = useState<Partial<GrievanceData>>({});
  const [submittedId, setSubmittedId] = useState<string>("");
  const [idCopied, setIdCopied] = useState(false);
  const [customDuration, setCustomDuration] = useState("");
  const [showCustomDuration, setShowCustomDuration] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const { mutateAsync: submitGrievance, isPending } = useSubmitGrievance();

  function addMessage(role: "bot" | "user", content: string) {
    setMessages((prev) => [
      ...prev,
      { id: msgId(), role, content, timestamp: new Date() },
    ]);
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  function handleDescriptionSubmit() {
    const desc = inputValue.trim();
    if (!desc) return;
    addMessage("user", desc);
    const detectedCat = detectCategory(desc);
    setData((prev) => ({ ...prev, description: desc }));
    setInputValue("");

    setTimeout(() => {
      addMessage(
        "bot",
        `I can see you're describing an issue related to **${categoryLabel(detectedCat)}**.\n\nIs that the right category? You can also pick a different one below.`,
      );
      setData((prev) => ({ ...prev, category: detectedCat }));
      setStep("category");
    }, 400);
  }

  function handleCategorySelect(cat: Category) {
    const label = categoryLabel(cat);
    addMessage(
      "user",
      `${CATEGORY_OPTIONS.find((c) => c.value === cat)?.emoji} ${label}`,
    );
    setData((prev) => ({ ...prev, category: cat }));

    setTimeout(() => {
      addMessage(
        "bot",
        "Got it! 📍 Now, where exactly is this problem located? Please provide the street, area, landmark, or pincode.",
      );
      setStep("location");
    }, 400);
  }

  function handleLocationSubmit() {
    const loc = inputValue.trim();
    if (!loc) return;
    addMessage("user", loc);
    setData((prev) => ({ ...prev, location: loc }));
    setInputValue("");

    setTimeout(() => {
      addMessage(
        "bot",
        "Thanks! How severe is this issue?\n\n🟢 **Low** — Minor inconvenience\n🟡 **Medium** — Affects daily life\n🔴 **High** — Urgent, safety risk",
      );
      setStep("severity");
    }, 400);
  }

  function handleSeveritySelect(sev: Severity) {
    const labels: Record<Severity, string> = {
      [Severity.low]: "🟢 Low severity",
      [Severity.medium]: "🟡 Medium severity",
      [Severity.high]: "🔴 High severity",
    };
    addMessage("user", labels[sev]);
    setData((prev) => ({ ...prev, severity: sev }));

    setTimeout(() => {
      addMessage("bot", "⏱️ How long has this problem been going on?");
      setStep("duration");
    }, 400);
  }

  function handleDurationSelect(dur: string) {
    addMessage("user", dur);
    setData((prev) => ({ ...prev, duration: dur }));

    setTimeout(() => {
      addMessage(
        "bot",
        "Almost done! 👤 Please share your name and contact information so the department can reach you if needed.",
      );
      setStep("contact");
    }, 400);
  }

  function handleContactSubmit() {
    const [namePart, contactPart] = inputValue.split("|").map((s) => s.trim());
    if (!namePart || !contactPart) {
      toast.error(
        "Please enter both name and contact info separated by |\nExample: John Doe | john@email.com",
      );
      return;
    }
    addMessage("user", `Name: ${namePart}\nContact: ${contactPart}`);
    setData((prev) => ({
      ...prev,
      citizenName: namePart,
      contactInfo: contactPart,
    }));
    setInputValue("");

    const finalData = {
      ...data,
      citizenName: namePart,
      contactInfo: contactPart,
    };
    setTimeout(() => {
      addMessage(
        "bot",
        `✅ Here's a summary of your grievance:\n\n📋 **Category:** ${categoryLabel(finalData.category as Category)}\n📍 **Location:** ${finalData.location}\n⚠️ **Severity:** ${finalData.severity}\n⏱️ **Duration:** ${finalData.duration}\n🏢 **Will be routed to:** ${DEPARTMENT_MAP[finalData.category as Category]}\n\nDoes everything look correct?`,
      );
      setStep("review");
    }, 400);
  }

  async function handleSubmit() {
    if (
      !data.description ||
      !data.category ||
      !data.location ||
      !data.severity ||
      !data.duration ||
      !data.citizenName ||
      !data.contactInfo
    ) {
      toast.error("Missing required information. Please restart.");
      return;
    }

    try {
      const [id, grievance] = await submitGrievance({
        description: data.description,
        category: data.category,
        location: data.location,
        severity: data.severity,
        duration: data.duration,
        citizenName: data.citizenName,
        contactInfo: data.contactInfo,
      });

      setSubmittedId(id);
      addMessage("user", "✔️ Yes, submit my grievance!");

      setTimeout(() => {
        addMessage(
          "bot",
          `🎉 Your grievance has been successfully submitted!\n\n**Grievance ID:** ${id}\n**Department:** ${grievance.department}\n**Status:** Submitted\n\nYou can track the status of your complaint in the My Grievances section. The ${grievance.department} has been notified.`,
        );
        setStep("submitted");
      }, 600);
    } catch {
      toast.error("Failed to submit grievance. Please try again.");
    }
  }

  function handleRestart() {
    setStep("description");
    setData({});
    setSubmittedId("");
    setIdCopied(false);
    setInputValue("");
    setShowCustomDuration(false);
    setMessages([
      {
        id: msgId(),
        role: "bot",
        content:
          "👋 Hello! I'm Grievon Assistant. I'm here to help you file a complaint with the right government department.\n\nPlease describe the civic problem you're facing — be as detailed as you like!",
        timestamp: new Date(),
      },
    ]);
  }

  function handleCopyId() {
    navigator.clipboard.writeText(submittedId);
    setIdCopied(true);
    toast.success("Grievance ID copied!");
    setTimeout(() => setIdCopied(false), 2000);
  }

  const STEPS: ChatStep[] = [
    "description",
    "category",
    "location",
    "severity",
    "duration",
    "contact",
    "review",
    "submitted",
  ];
  const currentStepIdx = STEPS.indexOf(step);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Report a Grievance
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Our AI assistant will guide you through the process step by step.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-1.5 mb-6 flex-wrap">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i <= currentStepIdx ? "bg-primary" : "bg-muted"
            } ${i === 0 ? "w-8" : "w-5"}`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-2">
          Step {currentStepIdx + 1} of {STEPS.length}
        </span>
      </div>

      {/* Chat window */}
      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="bg-muted/50 border-b border-border px-4 py-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Grievon Assistant
            </p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
          {step === "submitted" && (
            <button
              type="button"
              onClick={handleRestart}
              className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted"
            >
              <RotateCcw className="w-3 h-3" />
              New grievance
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-2.5 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {msg.role === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-primary flex-shrink-0 flex items-center justify-center mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div
                  className={
                    msg.role === "bot" ? "chat-bubble-bot" : "chat-bubble-user"
                  }
                >
                  <p className="text-sm leading-relaxed">
                    <FormattedMessage content={msg.content} />
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-border p-4">
          {step === "description" && (
            <div className="space-y-2">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleDescriptionSubmit();
                  }
                }}
                placeholder="Describe your civic problem... (e.g. 'There's a large pothole on MG Road near the bus stop')"
                className="min-h-[80px] resize-none"
                data-ocid="chat.input"
              />
              <Button
                onClick={handleDescriptionSubmit}
                disabled={!inputValue.trim()}
                className="w-full"
                data-ocid="chat.submit_button"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          )}

          {step === "category" && (
            <div className="space-y-2" data-ocid="chat.category_select">
              <p className="text-xs text-muted-foreground mb-2">
                Select the category that best fits your issue:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    type="button"
                    key={cat.value}
                    onClick={() => handleCategorySelect(cat.value)}
                    className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all hover:border-primary hover:bg-primary/5 ${
                      data.category === cat.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border"
                    }`}
                  >
                    <span className="text-lg">{cat.emoji}</span>
                    <span className="text-xs leading-tight text-center">
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "location" && (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLocationSubmit();
                  }}
                  placeholder="Area, street, or landmark..."
                  className="pl-9"
                  data-ocid="chat.input"
                />
              </div>
              <Button
                onClick={handleLocationSubmit}
                disabled={!inputValue.trim()}
                data-ocid="chat.submit_button"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}

          {step === "severity" && (
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  {
                    sev: Severity.low,
                    label: "Low",
                    emoji: "🟢",
                    desc: "Minor inconvenience",
                  },
                  {
                    sev: Severity.medium,
                    label: "Medium",
                    emoji: "🟡",
                    desc: "Affects daily life",
                  },
                  {
                    sev: Severity.high,
                    label: "High",
                    emoji: "🔴",
                    desc: "Safety risk",
                  },
                ] as const
              ).map(({ sev, label, emoji, desc }) => (
                <button
                  type="button"
                  key={sev}
                  onClick={() => handleSeveritySelect(sev)}
                  className="flex flex-col items-center gap-1 px-3 py-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all"
                  data-ocid="chat.severity_button"
                >
                  <span className="text-xl">{emoji}</span>
                  <span className="font-semibold text-sm">{label}</span>
                  <span className="text-xs text-muted-foreground text-center">
                    {desc}
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === "duration" && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {DURATION_OPTIONS.map((dur) => (
                  <button
                    type="button"
                    key={dur}
                    onClick={() => handleDurationSelect(dur)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:border-primary hover:bg-primary/5 text-sm transition-all"
                  >
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    {dur}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowCustomDuration(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-muted-foreground/50 hover:border-primary text-sm text-muted-foreground hover:text-foreground transition-all"
                >
                  Custom...
                </button>
              </div>
              {showCustomDuration && (
                <div className="flex gap-2">
                  <Input
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customDuration.trim())
                        handleDurationSelect(customDuration.trim());
                    }}
                    placeholder="Enter duration..."
                    data-ocid="chat.input"
                  />
                  <Button
                    onClick={() => handleDurationSelect(customDuration.trim())}
                    disabled={!customDuration.trim()}
                    data-ocid="chat.submit_button"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === "contact" && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Format:{" "}
                <code className="bg-muted px-1 rounded">
                  Your Name | email@example.com or phone
                </code>
              </p>
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleContactSubmit();
                  }}
                  placeholder="John Doe | john@email.com"
                  data-ocid="chat.input"
                />
                <Button
                  onClick={handleContactSubmit}
                  disabled={!inputValue.trim()}
                  data-ocid="chat.submit_button"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="flex gap-3">
              <Button
                onClick={handleSubmit}
                disabled={isPending}
                className="flex-1"
                data-ocid="chat.confirm_button"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Yes, Submit Grievance
                  </span>
                )}
              </Button>
              <Button variant="outline" onClick={handleRestart}>
                Start Over
              </Button>
            </div>
          )}

          {step === "submitted" && submittedId && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-green-700 font-medium mb-1">
                  Your Grievance ID
                </p>
                <p className="font-mono font-bold text-green-800 text-lg">
                  {submittedId}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyId}
                className="flex items-center gap-1.5 text-sm text-green-700 hover:text-green-900 border border-green-200 hover:border-green-400 rounded-lg px-3 py-1.5 transition-colors"
                data-ocid="grievance.id_copy_button"
              >
                {idCopied ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {idCopied ? "Copied!" : "Copy ID"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
