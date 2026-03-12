import { Shield } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="bg-foreground text-primary-foreground/80 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary/30 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="font-display font-semibold text-white text-lg leading-none">
                Grievon
              </p>
              <p className="text-xs text-primary-foreground/50 mt-0.5">
                Citizen Grievance Portal
              </p>
            </div>
          </div>

          <p className="text-xs text-primary-foreground/50 text-center">
            Empowering citizens to voice civic concerns and drive government
            action.
          </p>

          <p className="text-xs text-primary-foreground/40">
            © {year}. Built with ❤️ using{" "}
            <a
              href={utmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary-foreground/70 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
