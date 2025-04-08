
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { ExternalLink } from 'lucide-react';

interface ConnectionCardProps {
  profile: {
    id: string;
    full_name: string;
    university: string;
    location?: string;
    linkedin_url?: string;
  };
  connection?: {
    id: string;
    status: 'pending' | 'accepted' | 'rejected';
  };
  onConnect: () => void;
  onAccept?: (connectionId: string) => void;
  onDecline?: (connectionId: string) => void;
}

export const ConnectionCard = ({ 
  profile, 
  connection, 
  onConnect,
  onAccept,
  onDecline 
}: ConnectionCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await onConnect();
      toast({
        title: "Connection request sent",
        description: `Request sent to ${profile.full_name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={`https://avatar.vercel.sh/${profile.full_name}`} />
          <AvatarFallback>{profile.full_name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{profile.full_name}</p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              {profile.university}
            </p>
            {profile.location && (
              <p className="text-sm text-muted-foreground">• {profile.location}</p>
            )}
          </div>
          {profile.linkedin_url && (
            <a 
              href={profile.linkedin_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 flex items-center gap-1 mt-1 hover:underline"
            >
              LinkedIn <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
      <div>
        {connection ? (
          connection.status === 'pending' ? (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => onDecline && onDecline(connection.id)}
                disabled={isLoading}
                size="sm"
              >
                Decline
              </Button>
              <Button 
                onClick={() => onAccept && onAccept(connection.id)}
                disabled={isLoading}
                size="sm"
              >
                Accept
              </Button>
            </div>
          ) : (
            <Button variant="outline" disabled className="text-sm">
              {connection.status === 'accepted' ? 'Connected' : 'Rejected'}
            </Button>
          )
        ) : (
          <Button onClick={handleConnect} disabled={isLoading} size="sm">
            {isLoading ? 'Connecting...' : 'Connect'}
          </Button>
        )}
      </div>
    </div>
  );
};
