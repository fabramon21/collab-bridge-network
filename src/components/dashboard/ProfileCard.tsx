
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export const ProfileCard = () => {
  const { profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    university: profile?.university || "", // Changed from school to university
    location: profile?.location || "",
    address: profile?.address || "",
    bio: profile?.bio || "",
    linkedin_url: profile?.linkedin_url || "", // Changed from linkedin to linkedin_url
  });
  const { toast } = useToast();

  const initials = formData.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile?.profile_image_url} alt={profile?.full_name} />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{profile?.full_name}</h2>
          <p className="text-gray-600">{profile?.university || "Add your university"}</p> {/* Changed from school to university */}
          {profile?.location && <p className="text-gray-600">{profile.location}</p>}
        </div>
        <Button 
          variant="outline" 
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>
      
      {isEditing && (
        <div className="mt-4 space-y-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <div className="grid gap-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input 
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Your full name"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="university">University</Label> {/* Changed label from School to University */}
            <Input 
              id="university"
              name="university" 
              value={formData.university}
              onChange={handleInputChange}
              placeholder="Your university"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Your location"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input 
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Your full address"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Input 
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="linkedin_url">LinkedIn URL</Label> {/* Changed label from LinkedIn to LinkedIn URL */}
            <Input 
              id="linkedin_url"
              name="linkedin_url" 
              value={formData.linkedin_url}
              onChange={handleInputChange}
              placeholder="Your LinkedIn profile URL"
            />
          </div>
          
          <Button onClick={handleSubmit}>Save Profile</Button>
        </div>
      )}
    </div>
  );
};
