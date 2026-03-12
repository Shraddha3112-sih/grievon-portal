import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  BarChart2,
  CheckCircle,
  Clock,
  MapPin,
  Shield,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Category, type T as Grievance, Severity, Status } from "../backend";
import {
  useAllGrievances,
  useIsAdmin,
  useStats,
  useUpdateGrievanceStatus,
} from "../hooks/useQueries";

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

const SEVERITY_COLOR: Record<Severity, string> = {
  [Severity.low]: "text-green-600",
  [Severity.medium]: "text-amber-600",
  [Severity.high]: "text-red-600",
};

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

export function AdminPage() {
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const { data: stats } = useStats();
  const { data: grievances, isLoading } = useAllGrievances();
  const { mutateAsync: updateStatus, isPending } = useUpdateGrievanceStatus();

  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [editingGrievance, setEditingGrievance] = useState<Grievance | null>(
    null,
  );
  const [newStatus, setNewStatus] = useState<Status>(Status.submitted);
  const [remark, setRemark] = useState("");

  if (checkingAdmin) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="bg-card border border-border rounded-2xl p-10 shadow-card">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Admin Access Required
          </h1>
          <p className="text-muted-foreground">
            You don&apos;t have permission to access the admin panel.
          </p>
        </div>
      </main>
    );
  }

  const filteredGrievances =
    grievances?.filter((g) =>
      statusFilter === "all" ? true : g.status === statusFilter,
    ) ?? [];

  const statCards = [
    {
      label: "Total",
      value: stats ? Number(stats.totalGrievances) : 0,
      icon: <BarChart2 className="w-5 h-5" />,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Submitted",
      value: stats ? Number(stats.submittedCount) : 0,
      icon: <Clock className="w-5 h-5" />,
      color: "bg-slate-100 text-slate-600",
    },
    {
      label: "In Progress",
      value: stats ? Number(stats.inProgressCount) : 0,
      icon: <Users className="w-5 h-5" />,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Resolved",
      value: stats ? Number(stats.resolvedCount) : 0,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "bg-green-50 text-green-600",
    },
  ];

  async function handleSaveStatus() {
    if (!editingGrievance) return;
    try {
      await updateStatus({
        id: editingGrievance.id,
        status: newStatus,
        remark: remark.trim() || null,
      });
      toast.success("Status updated successfully");
      setEditingGrievance(null);
      setRemark("");
    } catch {
      toast.error("Failed to update status");
    }
  }

  function openEdit(g: Grievance) {
    setEditingGrievance(g);
    setNewStatus(g.status);
    setRemark(g.adminRemark ?? "");
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">
          Admin Panel
        </h1>
        <Badge className="ml-2 bg-primary/10 text-primary border-primary/20">
          Authority Access
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="bg-card border border-border rounded-xl p-4 shadow-card"
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}
            >
              {s.icon}
            </div>
            <p className="text-2xl font-display font-bold text-foreground">
              {s.value}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="mb-4">
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as "all" | Status)}
        >
          <TabsList>
            <TabsTrigger value="all" data-ocid="admin.tab">
              All
            </TabsTrigger>
            <TabsTrigger value={Status.submitted} data-ocid="admin.tab">
              Submitted
            </TabsTrigger>
            <TabsTrigger value={Status.under_review} data-ocid="admin.tab">
              Under Review
            </TabsTrigger>
            <TabsTrigger value={Status.in_progress} data-ocid="admin.tab">
              In Progress
            </TabsTrigger>
            <TabsTrigger value={Status.resolved} data-ocid="admin.tab">
              Resolved
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Grievances Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : filteredGrievances.length === 0 ? (
        <div
          className="text-center py-16 border border-dashed border-border rounded-2xl"
          data-ocid="admin.empty_state"
        >
          <AlertTriangle className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-semibold text-foreground">No grievances found</p>
          <p className="text-sm text-muted-foreground mt-1">
            There are no complaints in this category.
          </p>
        </div>
      ) : (
        <div
          className="bg-card border border-border rounded-2xl shadow-card overflow-hidden"
          data-ocid="admin.table"
        >
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Citizen
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Location
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredGrievances.map((g, index) => (
                  <tr
                    key={g.id}
                    className="hover:bg-muted/20 transition-colors"
                    data-ocid="admin.row"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {g.id.slice(0, 12)}...
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {g.citizenName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {g.contactInfo}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        <span>{CATEGORY_EMOJI[g.category]}</span>
                        <span className="text-xs">
                          {CATEGORY_LABELS[g.category]}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {g.location}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium capitalize ${SEVERITY_COLOR[g.severity]}`}
                      >
                        {g.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={`text-xs ${STATUS_CONFIG[g.status].className}`}
                      >
                        {STATUS_CONFIG[g.status].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(g.createdTimestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(g)}
                        data-ocid={`admin.row.${index + 1}.edit_button`}
                      >
                        Update
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-border">
            {filteredGrievances.map((g, index) => (
              <div
                key={g.id}
                className="p-4"
                data-ocid={`admin.row.${index + 1}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      {g.citizenName}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {g.id.slice(0, 14)}...
                    </p>
                  </div>
                  <Badge
                    className={`text-xs flex-shrink-0 ${STATUS_CONFIG[g.status].className}`}
                  >
                    {STATUS_CONFIG[g.status].label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {g.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{CATEGORY_EMOJI[g.category]}</span>
                    <span
                      className={`font-medium capitalize ${SEVERITY_COLOR[g.severity]}`}
                    >
                      {g.severity}
                    </span>
                    <span>· {formatDate(g.createdTimestamp)}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(g)}
                  >
                    Update
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Update Status Dialog */}
      <Dialog
        open={!!editingGrievance}
        onOpenChange={(open) => {
          if (!open) setEditingGrievance(null);
        }}
      >
        <DialogContent className="max-w-md" data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle>Update Grievance Status</DialogTitle>
          </DialogHeader>

          {editingGrievance && (
            <div className="space-y-4 py-2">
              <div className="bg-muted/40 rounded-lg p-3 text-sm">
                <p className="font-medium text-foreground mb-1">
                  {editingGrievance.citizenName}
                </p>
                <p className="text-muted-foreground text-xs line-clamp-2">
                  {editingGrievance.description}
                </p>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="status-select"
                  className="text-sm font-medium text-foreground"
                >
                  New Status
                </label>
                <Select
                  value={newStatus}
                  onValueChange={(v) => setNewStatus(v as Status)}
                >
                  <SelectTrigger
                    id="status-select"
                    data-ocid="admin.status_select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Status.submitted}>Submitted</SelectItem>
                    <SelectItem value={Status.under_review}>
                      Under Review
                    </SelectItem>
                    <SelectItem value={Status.in_progress}>
                      In Progress
                    </SelectItem>
                    <SelectItem value={Status.resolved}>Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="remark-textarea"
                  className="text-sm font-medium text-foreground"
                >
                  Remark (optional)
                </label>
                <Textarea
                  id="remark-textarea"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Add an official remark or update for the citizen..."
                  className="min-h-[80px] resize-none"
                  data-ocid="admin.remark_input"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingGrievance(null)}
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveStatus}
              disabled={isPending}
              data-ocid="admin.save_button"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
