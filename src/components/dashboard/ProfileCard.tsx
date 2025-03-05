
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ProfileCardProps {
  name: string;
  school: string;
  avatarUrl?: string;
}

export const ProfileCard = ({ name, school, avatarUrl }: ProfileCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{name}</h2>
          <p className="text-gray-600">{school}</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Save" : "Edit Profile"}
        </Button>
      </div>
      
      {isEditing && (
        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <p className="text-sm text-gray-500">Profile editing will be available soon!</p>
        </div>
      )}
    </div>
  );
};
