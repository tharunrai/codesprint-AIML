"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Mail, Edit2 } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  email: string;
  roleBadgeText: string;
  isFaculty: boolean;
  onEdit: () => void;
  onLogout: () => void;
}

export default function ProfileHeader({
  name,
  email,
  roleBadgeText,
  isFaculty,
  onEdit,
  onLogout,
}: ProfileHeaderProps) {
  return (
    <Card className="relative overflow-hidden mb-6">
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary/20 via-accent/15 to-primary/10" />
      <div className="relative pt-12 flex flex-col sm:flex-row items-center sm:items-end gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-primary/20 border-4 border-background -mt-4">
          {name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-2xl font-black text-foreground">{name || "User"}</h2>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1.5">
            <Badge variant={isFaculty ? "warning" : "info"} size="sm">
              {roleBadgeText}
            </Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> {email}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Button variant="secondary" size="sm" onClick={onEdit}>
            <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
          <Button variant="secondary" size="sm" onClick={onLogout}>
            Sign Out
          </Button>
        </div>
      </div>
    </Card>
  );
}
