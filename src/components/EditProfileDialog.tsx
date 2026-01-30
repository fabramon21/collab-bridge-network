import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Profile } from "@/types/auth.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({
    full_name: "",
    university: "",
    linkedin_url: "",
    address: "",
  });

  // Update form when dialog opens or profile changes
  useEffect(() => {
    if (open && profile) {
      setFormData({
        full_name: profile.full_name || "",
        university: profile.university || profile.school || "",
        linkedin_url: profile.linkedin_url || profile.linkedin || "",
        address: profile.address || "",
      });
    }
  }, [open, profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Build update payload with only the fields to update
      const updateData: Partial<Profile> = {
        full_name: formData.full_name?.trim() || null,
        university: formData.university?.trim() || null,
        linkedin_url: formData.linkedin_url?.trim() || null,
        address: formData.address?.trim() || null,
      };
      
      await updateProfile(updateData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name || ""}
              onChange={handleInputChange}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="university">School/University</Label>
            <Input
              id="university"
              name="university"
              value={formData.university || ""}
              onChange={handleInputChange}
              placeholder="Enter your school or university"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input
              id="linkedin_url"
              name="linkedin_url"
              type="url"
              value={formData.linkedin_url || ""}
              onChange={handleInputChange}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address || ""}
              onChange={handleInputChange}
              placeholder="Enter your address"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
