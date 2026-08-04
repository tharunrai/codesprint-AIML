import React from "react";
import ProfileSection from "./ProfileSection";
import { Globe, Link2, ExternalLink } from "lucide-react";
import Button from "@/components/ui/Button";

interface SocialLinksCardProps {
  github?: string;
  linkedin?: string;
  portfolio?: string;
  onEdit: () => void;
}

function GithubIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function LinkedinIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.69 1.69 0 1 0-.02-3.38 1.69 1.69 0 0 0 .02 3.38m1.4 9.74v-8.37H5.06v8.37h2.8z" />
    </svg>
  );
}

export default function SocialLinksCard({ github, linkedin, portfolio, onEdit }: SocialLinksCardProps) {
  const hasAnyLink = !!(github || linkedin || portfolio);

  return (
    <ProfileSection title="Professional Links" icon={<Link2 className="w-4 h-4 text-primary" />}>
      {!hasAnyLink ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Globe className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground text-sm mb-3">No professional links added yet.</p>
          <Button variant="secondary" size="sm" onClick={onEdit}>
            Add Links
          </Button>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg bg-sidebar-bg hover:bg-sidebar-hover border border-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <GithubIcon className="w-5 h-5 text-sidebar-fg/70 group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-sidebar-fg/90">GitHub</span>
              </div>
              <ExternalLink className="w-4 h-4 text-sidebar-fg/40 group-hover:text-primary transition-colors" />
            </a>
          )}
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg bg-sidebar-bg hover:bg-sidebar-hover border border-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <LinkedinIcon className="w-5 h-5 text-sidebar-fg/70 group-hover:text-[#0077B5] transition-colors" />
                <span className="text-sm font-medium text-sidebar-fg/90">LinkedIn</span>
              </div>
              <ExternalLink className="w-4 h-4 text-sidebar-fg/40 group-hover:text-[#0077B5] transition-colors" />
            </a>
          )}
          {portfolio && (
            <a
              href={portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg bg-sidebar-bg hover:bg-sidebar-hover border border-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-sidebar-fg/70 group-hover:text-accent transition-colors" />
                <span className="text-sm font-medium text-sidebar-fg/90">Portfolio / Website</span>
              </div>
              <ExternalLink className="w-4 h-4 text-sidebar-fg/40 group-hover:text-accent transition-colors" />
            </a>
          )}
        </div>
      )}
    </ProfileSection>
  );
}
