"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  type Drive,
  type Application,
  type Notification,
  type ApplicationStage,
  type User,
  mockDrives,
  mockApplications,
  mockNotifications,
  buildRoundResultsForStage,
} from "@/lib/mock-data";

const STORAGE_KEY_DRIVES = "placeme_drives";
const STORAGE_KEY_APPS = "placeme_applications";
const STORAGE_KEY_NOTIFS = "placeme_notifications";

interface PlacementContextType {
  drives: Drive[];
  applications: Application[];
  notifications: Notification[];
  addDrive: (drive: Omit<Drive, "id" | "postedDate" | "registeredCount">) => void;
  updateDriveStatus: (driveId: string, status: "open" | "closed" | "ongoing") => void;
  updateApplicationStage: (appId: string, stage: ApplicationStage) => void;
  bulkUpdateStage: (appIds: string[], stage: ApplicationStage) => void;
  applyToDrive: (driveId: string, user: User) => boolean;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetToDefaults: () => void;
}

const PlacementContext = createContext<PlacementContextType | undefined>(undefined);

export function PlacementProvider({ children }: { children: React.ReactNode }) {
  const [drives, setDrives] = useState<Drive[]>(() => {
    if (typeof window === "undefined") return mockDrives;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DRIVES);
      return stored ? JSON.parse(stored) : mockDrives;
    } catch {
      return mockDrives;
    }
  });

  const [applications, setApplications] = useState<Application[]>(() => {
    if (typeof window === "undefined") return mockApplications;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_APPS);
      return stored ? JSON.parse(stored) : mockApplications;
    } catch {
      return mockApplications;
    }
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window === "undefined") return mockNotifications;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_NOTIFS);
      return stored ? JSON.parse(stored) : mockNotifications;
    } catch {
      return mockNotifications;
    }
  });

  const [isLoaded] = useState(true);

  // Sync to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_DRIVES, JSON.stringify(drives));
    } catch {}
  }, [drives, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(applications));
    } catch {}
  }, [applications, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
    } catch {}
  }, [notifications, isLoaded]);

  const addDrive = (newDriveData: Omit<Drive, "id" | "postedDate" | "registeredCount">) => {
    const id = `drv-${Date.now().toString().slice(-4)}`;
    const newDrive: Drive = {
      ...newDriveData,
      id,
      postedDate: new Date().toISOString(),
      registeredCount: 0,
    };
    setDrives((prev) => [newDrive, ...prev]);

    // Add notification
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      title: `New Drive: ${newDrive.companyName}`,
      message: `${newDrive.companyName} is hiring ${newDrive.role}. CTC: ₹${newDrive.ctcLakh} LPA.`,
      type: "info",
      read: false,
      timestamp: new Date().toISOString(),
      link: `/drives/${id}`,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const updateDriveStatus = (driveId: string, status: "open" | "closed" | "ongoing") => {
    setDrives((prev) =>
      prev.map((d) => (d.id === driveId ? { ...d, status } : d))
    );
  };

  const updateApplicationStage = (appId: string, stage: ApplicationStage) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        const drive = drives.find((d) => d.id === app.driveId);
        const rounds = drive ? drive.rounds : [];
        return {
          ...app,
          currentStage: stage,
          lastUpdated: new Date().toISOString(),
          roundResults: buildRoundResultsForStage(rounds, stage),
        };
      })
    );

    // Create notification for the student
    const targetApp = applications.find((a) => a.id === appId);
    if (targetApp) {
      const notif: Notification = {
        id: `notif-${Date.now()}`,
        title: `${targetApp.companyName} — Status Updated`,
        message: `Your application for ${targetApp.role} was updated to ${stage.replace("-", " ").toUpperCase()}.`,
        type: stage === "offered" ? "success" : stage === "rejected" ? "warning" : "info",
        read: false,
        timestamp: new Date().toISOString(),
        link: "/applications",
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const bulkUpdateStage = (appIds: string[], stage: ApplicationStage) => {
    const idsSet = new Set(appIds);
    setApplications((prev) =>
      prev.map((app) => {
        if (!idsSet.has(app.id)) return app;
        const drive = drives.find((d) => d.id === app.driveId);
        const rounds = drive ? drive.rounds : [];
        return {
          ...app,
          currentStage: stage,
          lastUpdated: new Date().toISOString(),
          roundResults: buildRoundResultsForStage(rounds, stage),
        };
      })
    );

    // Create a batch notification
    const count = appIds.length;
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      title: `Batch Round Update`,
      message: `${count} student(s) status updated to ${stage.replace("-", " ").toUpperCase()}.`,
      type: stage === "offered" ? "success" : stage === "rejected" ? "warning" : "info",
      read: false,
      timestamp: new Date().toISOString(),
      link: "/applications",
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const applyToDrive = (driveId: string, user: User): boolean => {
    const drive = drives.find((d) => d.id === driveId);
    if (!drive) return false;

    // Check if already applied (matching email, studentId, or rollNumber)
    const exists = applications.some(
      (a) =>
        a.driveId === driveId &&
        (a.email.toLowerCase() === user.email.toLowerCase() ||
          a.studentId === user.id ||
          (!!a.rollNumber && a.rollNumber === user.rollNumber))
    );
    if (exists) return false;

    const newApp: Application = {
      id: `app-${Date.now()}`,
      driveId,
      companyName: drive.companyName,
      role: drive.role,
      studentId: user.id,
      studentName: user.name,
      rollNumber: user.rollNumber,
      branch: user.branch,
      cgpa: user.cgpa,
      email: user.email,
      currentStage: "applied",
      appliedDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      roundResults: buildRoundResultsForStage(drive.rounds, "applied"),
    };

    setApplications((prev) => [newApp, ...prev]);
    setDrives((prev) =>
      prev.map((d) => (d.id === driveId ? { ...d, registeredCount: d.registeredCount + 1 } : d))
    );
    return true;
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetToDefaults = () => {
    setDrives(mockDrives);
    setApplications(mockApplications);
    setNotifications(mockNotifications);
    try {
      localStorage.removeItem(STORAGE_KEY_DRIVES);
      localStorage.removeItem(STORAGE_KEY_APPS);
      localStorage.removeItem(STORAGE_KEY_NOTIFS);
    } catch {}
  };

  return (
    <PlacementContext.Provider
      value={{
        drives,
        applications,
        notifications,
        addDrive,
        updateDriveStatus,
        updateApplicationStage,
        bulkUpdateStage,
        applyToDrive,
        markNotificationRead,
        markAllNotificationsRead,
        resetToDefaults,
      }}
    >
      {children}
    </PlacementContext.Provider>
  );
}

export function usePlacement() {
  const context = useContext(PlacementContext);
  if (!context) {
    throw new Error("usePlacement must be used within a PlacementProvider");
  }
  return context;
}
