
import { Profile } from "@/lib/supabase";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { MapPin, School } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";

interface ProfileCardProps {
  profile: Profile;
  action?: ReactNode;
}

export const ProfileCard = ({ profile, action }: ProfileCardProps) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card key={profile.id} className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.profile_image_url || ""} alt={profile.full_name || ""} />
            <AvatarFallback>{profile.full_name ? getInitials(profile.full_name) : "?"}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{profile.full_name}</CardTitle>
            {profile.university && (
              <CardDescription className="flex items-center">
                <School className="h-3.5 w-3.5 mr-1" />
                {profile.university}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2 pt-0">
        {profile.location && (
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            {profile.location}
          </div>
        )}
        {profile.bio && (
          <p className="text-sm line-clamp-2">{profile.bio}</p>
        )}
        {profile.skills && profile.skills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {profile.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {profile.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{profile.skills.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      {action && (
        <CardFooter className="pt-0">
          {action}
        </CardFooter>
      )}
    </Card>
  );
};
