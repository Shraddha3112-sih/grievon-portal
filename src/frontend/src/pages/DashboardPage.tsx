import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  LogIn,
  MapPin,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Category, Severity, Status } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyGrievances } from "../hooks/useQueries";

const CATEGORY_EMOJI: Record<Category, string> = {
  [Category.roads_infrastructure]: "🛣️",
  [Category.water_supply]: "💧",
  [Category.electricity]: "⚡",
  [Category.sanitation]: "🗑️",
  [Category.public_safety]: "🛡️",
  [Category.healthcare]: "🏥",
  [Category.education]: "🎓",
  [Category.other]: "📋",
};

const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
  [Status.submitted]: { label: "Submitted", className: "status-submitted" },
  [Status.under_review]: {
    label: "Under Review",
    className: "status-under_review",
  },
  [Status.in_progress]: {
    label: "In Progress",
    className: "status-in_progress",
  },
  [Status.resolved]: { label: "Resolved", className: "status-resolved" },
};

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string }> = {
  [Severity.low]: { label: "Low", color: "text-green-600" },
  [Severity.medium]: { label: "Medium", color: "text-amber-600" },
  [Severity.high]: { label: "High", color: "text-red-600" },
};

const CATEGORY_LABELS: Record<Category, string> = {
  [Category.roads_infrastructure]: "Roads & Infrastructure",
  [Category.water_supply]: "Water Supply",
  [Category.electricity]: "Electricity",
  [Category.sanitation]: "Sanitation",
  [Category.public_safety]: "Public Safety",
  [Category.healthcare]: "Healthcare",
  [Category.education]: "Education",
  [Category.other]: "Other",
};

function formatDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DashboardPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: grievances, isLoading } = useMyGrievances();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!identity) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="bg-card border border-border rounded-2xl p-10 shadow-card">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            My Grievances
          </h1>
          <p className="text-muted-foreground mb-6">
            Please login to view your submitted grievances and track their
            status.
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            data-ocid="nav.login_button"
          >
            <LogIn className="w-4 h-4 mr-2" />
            {isLoggingIn ? "Connecting..." : "Login to Continue"}
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            My Grievances
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track all your submitted complaints
          </p>
        </div>
        <Link to="/report">
          <Button size="sm">+ Report New Issue</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className="h-24 rounded-xl"
              data-ocid="dashboard.loading_state"
            />
          ))}
        </div>
      ) : !grievances || grievances.length === 0 ? (
        <div
          className="text-center py-16 border border-dashed border-border rounded-2xl"
          data-ocid="dashboard.empty_state"
        >
          <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold text-foreground mb-1">
            No grievances yet
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            You haven&apos;t filed any complaints yet.
          </p>
          <Link to="/report">
            <Button>Report Your First Issue</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="dashboard.list">
          {grievances.map((g, index) => {
            const isExpanded = expandedId === g.id;
            const statusCfg = STATUS_CONFIG[g.status];
            const sevCfg = SEVERITY_CONFIG[g.severity];

            return (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.4 }}
                data-ocid={`dashboard.item.${index + 1}`}
              >
                <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
                  <button
                    type="button"
                    className="w-full text-left p-4 hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : g.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0 mt-0.5">
                        {CATEGORY_EMOJI[g.category]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="font-semibold text-sm text-foreground truncate">
                              {CATEGORY_LABELS[g.category]}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                              {g.id}
                            </p>
                          </div>
                          <Badge
                            className={`text-xs px-2 py-0.5 flex-shrink-0 ${statusCfg.className}`}
                          >
                            {statusCfg.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1.5 line-clamp-1">
                          {g.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {g.location}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatDate(g.createdTimestamp)}
                          </span>
                          <span
                            className={`text-xs font-medium ${sevCfg.color}`}
                          >
                            {sevCfg.label} severity
                          </span>
                        </div>
                      </div>
                      <div className="text-muted-foreground flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 border-t border-border bg-muted/20">
                          <div className="grid sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                Description
                              </p>
                              <p className="text-foreground leading-relaxed">
                                {g.description}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                  Department
                                </p>
                                <p className="text-foreground">
                                  {g.department}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                  Duration
                                </p>
                                <p className="text-foreground">{g.duration}</p>
                              </div>
                              {g.adminRemark && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                    Authority Remark
                                  </p>
                                  <p className="text-foreground bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs">
                                    {g.adminRemark}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </main>
  );
}
