import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  MessageSquare,
  Search,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useStats } from "../hooks/useQueries";

const CATEGORY_ITEMS = [
  { emoji: "🛣️", label: "Roads & Infrastructure" },
  { emoji: "💧", label: "Water Supply" },
  { emoji: "⚡", label: "Electricity" },
  { emoji: "🗑️", label: "Sanitation" },
  { emoji: "🛡️", label: "Public Safety" },
  { emoji: "🏥", label: "Healthcare" },
  { emoji: "🎓", label: "Education" },
  { emoji: "📋", label: "Other Issues" },
];

const HOW_IT_WORKS = [
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Describe Your Issue",
    desc: "Chat with our AI assistant to describe the civic problem you're facing in plain language.",
  },
  {
    icon: <ClipboardList className="w-5 h-5" />,
    title: "AI Classifies & Routes",
    desc: "The system automatically categorizes your grievance and routes it to the right department.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Track in Real-Time",
    desc: "Get a unique ID and monitor status updates as authorities act on your complaint.",
  },
];

export function HomePage() {
  const { data: stats } = useStats();

  const statItems = [
    {
      label: "Total Grievances",
      value: stats ? Number(stats.totalGrievances) : "—",
    },
    {
      label: "Under Review",
      value: stats ? Number(stats.underReviewCount) : "—",
    },
    {
      label: "In Progress",
      value: stats ? Number(stats.inProgressCount) : "—",
    },
    { label: "Resolved", value: stats ? Number(stats.resolvedCount) : "—" },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-foreground">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 30%, oklch(0.55 0.18 255) 0%, transparent 50%), radial-gradient(circle at 75% 70%, oklch(0.45 0.12 255) 0%, transparent 50%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 mb-6">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/80 text-xs font-medium">
                Government of India — Citizen Services
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Your Voice.
              <br />
              <span
                className="text-primary"
                style={{ color: "oklch(0.65 0.15 255)" }}
              >
                Government Action.
              </span>
            </h1>

            <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-8 max-w-lg">
              Report civic problems directly to the right government department.
              Our AI guides you through the process in minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/report">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-foreground hover:bg-white/90 font-semibold"
                  data-ocid="hero.report_button"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Report a Problem
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:text-white"
                  data-ocid="hero.track_button"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Track My Grievance
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Stats Bar */}
        <div className="relative border-t border-white/10 bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statItems.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                  className="text-center py-2"
                >
                  <p className="text-2xl font-display font-bold text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-white/50 mt-0.5">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              We Handle All Civic Issues
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
              From potholes to power outages — every complaint reaches the right
              hands.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORY_ITEMS.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <Link to="/report">
                  <div className="group bg-card border border-border rounded-xl p-4 text-center hover:border-primary/40 hover:shadow-card transition-all cursor-pointer">
                    <span className="text-2xl mb-2 block">{cat.emoji}</span>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {cat.label}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Three simple steps to get your issue resolved
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="relative"
              >
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(100%-1rem)] w-8 border-t-2 border-dashed border-border z-10" />
                )}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 font-display font-bold">
                    {step.icon}
                  </div>
                  <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                    Step {i + 1}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Users className="w-10 h-10 mx-auto mb-4 text-white/70" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">
              Join thousands of citizens making their city better
            </h2>
            <p className="text-white/70 mb-6 text-sm md:text-base">
              Every complaint filed is a step toward a better community. Your
              voice matters.
            </p>
            <Link to="/report">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                File a Grievance Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-10 bg-muted/30 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {[
              {
                icon: <CheckCircle2 className="w-4 h-4" />,
                text: "Secure & Encrypted",
              },
              {
                icon: <CheckCircle2 className="w-4 h-4" />,
                text: "Blockchain-backed",
              },
              {
                icon: <CheckCircle2 className="w-4 h-4" />,
                text: "AI-powered routing",
              },
              {
                icon: <CheckCircle2 className="w-4 h-4" />,
                text: "24/7 accessible",
              },
            ].map((badge) => (
              <div
                key={badge.text}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span className="text-primary">{badge.icon}</span>
                {badge.text}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
