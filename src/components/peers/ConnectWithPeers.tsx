import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Briefcase, GraduationCap, Clock, UserRoundPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  full_name: string;
  university: string | null;
  location: string | null;
  bio: string | null;
  interests: string[] | null;
  skills: string[] | null;
  profile_image_url: string | null;
  is_online: boolean;
  last_active: string;
}

interface Connection {
  id: string;
  sender_id: string;
  recipient_id: string;
  status: string;
}

export const ConnectWithPeers = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [universityFilter, setUniversityFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) return;
      
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', user.id);
          
        if (profilesError) throw profilesError;
        
        const { data: connectionsData, error: connectionsError } = await supabase
          .from('connections')
          .select('*')
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);
          
        if (connectionsError) throw connectionsError;
        
        setProfiles(profilesData || []);
        setFilteredProfiles(profilesData || []);
        setConnections(connectionsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfiles();
  }, [user]);

  useEffect(() => {
    let results = profiles;
    
    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter(profile => 
        profile.full_name?.toLowerCase().includes(searchLower) || 
        profile.university?.toLowerCase().includes(searchLower) ||
        profile.location?.toLowerCase().includes(searchLower) ||
        profile.bio?.toLowerCase().includes(searchLower) ||
        profile.interests?.some(interest => interest.toLowerCase().includes(searchLower)) ||
        profile.skills?.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }
    
    if (universityFilter) {
      results = results.filter(profile => profile.university === universityFilter);
    }
    
    if (locationFilter) {
      results = results.filter(profile => profile.location === locationFilter);
    }
    
    setFilteredProfiles(results);
  }, [search, universityFilter, locationFilter, profiles]);

  const getConnectionStatus = (profileId: string) => {
    const connection = connections.find(c => 
      (c.sender_id === user?.id && c.recipient_id === profileId) || 
      (c.recipient_id === user?.id && c.sender_id === profileId)
    );
    
    if (!connection) return null;
    
    if (connection.status === 'pending') {
      return connection.sender_id === user?.id ? 'pending-sent' : 'pending-received';
    }
    
    return connection.status;
  };

  const sendConnectionRequest = async (recipientId: string) => {
    try {
      const { error: connectionError } = await supabase
        .from('connections')
        .insert({
          sender_id: user?.id,
          recipient_id: recipientId,
          status: 'pending'
        });
        
      if (connectionError) throw connectionError;
      
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: recipientId,
          type: 'connection_request',
          content: `You received a connection request from ${user?.user_metadata?.full_name || 'a user'}`,
          related_id: user?.id
        });
        
      if (notificationError) throw notificationError;
      
      const newConnection = {
        id: Date.now().toString(),
        sender_id: user?.id!,
        recipient_id: recipientId,
        status: 'pending'
      };
      
      setConnections([...connections, newConnection]);
      
      toast({
        title: "Connection request sent",
        description: "They will be notified of your request.",
      });
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error sending request",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const acceptConnectionRequest = async (connectionId: string, senderId: string) => {
    try {
      const { error: connectionError } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);
        
      if (connectionError) throw connectionError;
      
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: senderId,
          type: 'connection_request',
          content: `${user?.user_metadata?.full_name || 'Someone'} accepted your connection request`,
          related_id: user?.id
        });
        
      if (notificationError) throw notificationError;
      
      setConnections(connections.map(c => 
        c.id === connectionId ? { ...c, status: 'accepted' } : c
      ));
      
      toast({
        title: "Connection accepted",
        description: "You are now connected!",
      });
    } catch (error) {
      console.error('Error accepting connection request:', error);
      toast({
        title: "Error accepting request",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const getUniqueUniversities = () => {
    return [...new Set(profiles.filter(p => p.university).map(p => p.university))];
  };
  
  const getUniqueLocations = () => {
    return [...new Set(profiles.filter(p => p.location).map(p => p.location))];
  };

  const formatLastActive = (lastActiveString: string) => {
    const lastActive = new Date(lastActiveString);
    const now = new Date();
    
    const diffMs = now.getTime() - lastActive.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 5) return 'Online now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return lastActive.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Connect with Peers</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Search peers..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Select 
            value={universityFilter || "all"} 
            onValueChange={(value) => setUniversityFilter(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="University" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Universities</SelectItem>
              {getUniqueUniversities().map((university) => (
                <SelectItem key={university} value={university!}>
                  {university}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={locationFilter || "all"} 
            onValueChange={(value) => setLocationFilter(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {getUniqueLocations().map((location) => (
                <SelectItem key={location} value={location!}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                    <div className="h-3 w-32 bg-gray-200 rounded" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                <div className="h-4 w-5/6 bg-gray-200 rounded" />
              </CardContent>
              <CardFooter>
                <div className="h-9 w-full bg-gray-200 rounded" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredProfiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => {
            const connectionStatus = getConnectionStatus(profile.id);
            const initials = profile.full_name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "??";
              
            return (
              <Popover key={profile.id}>
                <PopoverTrigger asChild>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={profile.profile_image_url || ""} alt={profile.full_name || ""} />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          {profile.is_online && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{profile.full_name}</CardTitle>
                          <CardDescription className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatLastActive(profile.last_active)}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {profile.university && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <GraduationCap className="h-4 w-4 mr-1" />
                          {profile.university}
                        </div>
                      )}
                      {profile.location && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {profile.location}
                        </div>
                      )}
                      {profile.bio && (
                        <p className="text-sm mt-2 line-clamp-2">{profile.bio}</p>
                      )}
                    </CardContent>
                    <CardFooter>
                      {!connectionStatus && (
                        <Button 
                          className="w-full"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            sendConnectionRequest(profile.id);
                          }}
                        >
                          <UserRoundPlus className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                      {connectionStatus === 'pending-sent' && (
                        <Button variant="outline" className="w-full" disabled>
                          Request Sent
                        </Button>
                      )}
                      {connectionStatus === 'pending-received' && (
                        <Button 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            const connection = connections.find(c => 
                              c.sender_id === profile.id && c.recipient_id === user?.id
                            );
                            if (connection) {
                              acceptConnectionRequest(connection.id, profile.id);
                            }
                          }}
                        >
                          Accept Request
                        </Button>
                      )}
                      {connectionStatus === 'accepted' && (
                        <Button variant="outline" className="w-full">
                          Message
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="flex flex-col space-y-4 p-2">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={profile.profile_image_url || ""} alt={profile.full_name || ""} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{profile.full_name}</h3>
                        {profile.university && (
                          <p className="text-sm text-gray-500 flex items-center">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            {profile.university}
                          </p>
                        )}
                        {profile.location && (
                          <p className="text-sm text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {profile.location}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {profile.bio && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">About</h4>
                        <p className="text-sm">{profile.bio}</p>
                      </div>
                    )}
                    
                    {profile.skills && profile.skills.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {profile.skills.map((skill, i) => (
                            <Badge key={i} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {profile.interests && profile.interests.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Interests</h4>
                        <div className="flex flex-wrap gap-1">
                          {profile.interests.map((interest, i) => (
                            <Badge key={i} variant="outline">{interest}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-2">
                      {!connectionStatus && (
                        <Button 
                          className="w-full"
                          onClick={() => sendConnectionRequest(profile.id)}
                        >
                          <UserRoundPlus className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                      {connectionStatus === 'pending-sent' && (
                        <Button variant="outline" className="w-full" disabled>
                          Request Sent
                        </Button>
                      )}
                      {connectionStatus === 'pending-received' && (
                        <Button 
                          className="w-full"
                          onClick={() => {
                            const connection = connections.find(c => 
                              c.sender_id === profile.id && c.recipient_id === user?.id
                            );
                            if (connection) {
                              acceptConnectionRequest(connection.id, profile.id);
                            }
                          }}
                        >
                          Accept Request
                        </Button>
                      )}
                      {connectionStatus === 'accepted' && (
                        <Button className="w-full">
                          Send Message
                        </Button>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No peers found matching your search criteria.</p>
          <Button onClick={() => {
            setSearch("");
            setUniversityFilter("");
            setLocationFilter("");
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};
