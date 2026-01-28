import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Button as ToggleButton } from "@/components/ui/button";

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
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [onlySameSchool, setOnlySameSchool] = useState(false);
  const [onlySameLocation, setOnlySameLocation] = useState(false);
  const [onlySharedSkills, setOnlySharedSkills] = useState(false);
  const [sortByMatch, setSortByMatch] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) return;
      
      try {
        const { data: myData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (myData) setMyProfile(myData as Profile);

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
        const message =
          error && typeof error === "object" && "message" in error
            ? (error as any).message
            : "Unable to load peers right now.";
        toast({
          title: "Failed to fetch connections",
          description: message,
          variant: "destructive",
        });
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
    if (onlySameSchool && myProfile?.university) {
      results = results.filter((p) => p.university === myProfile.university);
    }
    if (onlySameLocation && myProfile?.location) {
      results = results.filter((p) => p.location === myProfile.location);
    }
    if (onlySharedSkills && myProfile?.skills) {
      results = results.filter((p) =>
        (p.skills || []).some((s) => myProfile.skills?.includes(s))
      );
    }

    const withScores = results.map((p) => ({
      ...p,
      _score: computeMatchScore(p),
      _sharedSkills: sharedArray(p.skills, myProfile?.skills),
      _sharedInterests: sharedArray(p.interests, myProfile?.interests),
    }));

    const sorted = sortByMatch
      ? withScores.sort((a, b) => b._score - a._score)
      : withScores;

    setFilteredProfiles(sorted);
  }, [
    search,
    universityFilter,
    locationFilter,
    profiles,
    onlySameSchool,
    onlySameLocation,
    onlySharedSkills,
    sortByMatch,
    myProfile,
  ]);

  const sharedArray = (a?: string[] | null, b?: string[] | null) => {
    if (!a || !b) return [];
    return a.filter((item) => b.includes(item));
  };

  const computeMatchScore = (p: Profile) => {
    if (!myProfile) return 0;
    let score = 0;
    if (p.university && p.university === myProfile.university) score += 3;
    if (p.location && p.location === myProfile.location) score += 2;
    score += sharedArray(p.skills, myProfile.skills).length * 1.5;
    score += sharedArray(p.interests, myProfile.interests).length * 1;
    return score;
  };

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
      const message =
        error && typeof error === "object" && "message" in error
          ? (error as any).message
          : "Please try again later.";
      toast({
        title: "Error sending request",
        description: message,
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

  const sendMessage = async (recipientId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to send a message.",
        variant: "destructive",
      });
      return;
    }
    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        recipient_id: recipientId,
        content: "Hi! Thanks for connecting – want to chat?",
      });
      if (error) throw error;
      toast({
        title: "Message sent",
        description: "Opening your inbox...",
      });
      navigate("/messages");
    } catch (err) {
      console.error("Error sending message", err);
      toast({
        title: "Error",
        description: "Could not send message. Please try again.",
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

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <ToggleButton
            variant={sortByMatch ? "default" : "outline"}
            size="sm"
            onClick={() => setSortByMatch((v) => !v)}
          >
            Best match first
          </ToggleButton>
          <ToggleButton
            variant={onlySameSchool ? "default" : "outline"}
            size="sm"
            onClick={() => setOnlySameSchool((v) => !v)}
          >
            Same school
          </ToggleButton>
          <ToggleButton
            variant={onlySameLocation ? "default" : "outline"}
            size="sm"
            onClick={() => setOnlySameLocation((v) => !v)}
          >
            Same city
          </ToggleButton>
          <ToggleButton
            variant={onlySharedSkills ? "default" : "outline"}
            size="sm"
            onClick={() => setOnlySharedSkills((v) => !v)}
          >
            Shared skills
          </ToggleButton>
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
                      <div className="flex flex-wrap gap-1 mt-2">
                        {sharedArray(profile.skills, myProfile?.skills).map((skill, i) => (
                          <Badge key={`s-${i}`} variant="secondary" className="text-xs">
                            Shared: {skill}
                          </Badge>
                        ))}
                        {sharedArray(profile.interests, myProfile?.interests).map((intr, i) => (
                          <Badge key={`i-${i}`} variant="outline" className="text-xs">
                            Both like {intr}
                          </Badge>
                        ))}
                      </div>
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
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            sendMessage(profile.id);
                          }}
                        >
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
                        <Button className="w-full" onClick={() => sendMessage(profile.id)}>
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
