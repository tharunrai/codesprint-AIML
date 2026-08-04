import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { X } from "lucide-react";

export interface ProfileExtras {
  phone?: string;
  section?: string;
  semester?: number;
  backlogs?: number;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  skills?: string;
  designation?: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: ProfileExtras;
  onSave: (data: ProfileExtras) => void;
  isFaculty: boolean;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  isFaculty,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState<ProfileExtras>({});

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(initialData);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "semester" || name === "backlogs" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-card w-full max-w-lg rounded-xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="text-lg font-bold">Edit Profile</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-primary">Contact Information</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <Input
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {isFaculty ? (
              <div className="space-y-4 pt-2 border-t border-white/5 mt-4">
                <h3 className="text-sm font-semibold text-primary">Faculty Details</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">Designation</label>
                  <Input
                    name="designation"
                    value={formData.designation || ""}
                    onChange={handleChange}
                    placeholder="e.g. Associate Professor & TPC Coordinator"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2 border-t border-white/5 mt-4">
                <h3 className="text-sm font-semibold text-primary">Academic Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Section</label>
                    <Input
                      name="section"
                      value={formData.section || ""}
                      onChange={handleChange}
                      placeholder="e.g. A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Semester</label>
                    <Input
                      name="semester"
                      type="number"
                      value={formData.semester || ""}
                      onChange={handleChange}
                      placeholder="e.g. 8"
                      min={1}
                      max={10}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Active Backlogs</label>
                  <Input
                    name="backlogs"
                    type="number"
                    value={formData.backlogs === undefined ? "" : formData.backlogs}
                    onChange={handleChange}
                    placeholder="e.g. 0"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Technical Skills (comma-separated)</label>
                  <Input
                    name="skills"
                    value={formData.skills || ""}
                    onChange={handleChange}
                    placeholder="e.g. React, TypeScript, Python, Node.js"
                  />
                </div>
              </div>
            )}

            <div className="space-y-4 pt-2 border-t border-white/5 mt-4">
              <h3 className="text-sm font-semibold text-primary">Professional Links</h3>
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn Profile</label>
                <Input
                  name="linkedin"
                  value={formData.linkedin || ""}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GitHub Profile</label>
                <Input
                  name="github"
                  value={formData.github || ""}
                  onChange={handleChange}
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Portfolio / Website</label>
                <Input
                  name="portfolio"
                  value={formData.portfolio || ""}
                  onChange={handleChange}
                  placeholder="https://myportfolio.com"
                />
              </div>
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-white/5 flex justify-end gap-3 bg-muted/5">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="edit-profile-form">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
