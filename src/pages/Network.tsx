
import { PageLayout } from "@/components/PageLayout";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { 
  Users, 
  Search, 
  UserPlus, 
  User2, 
  UserCheck, 
  School, 
  Building2, 
  MapPin, 
  Loader2,
  AlertCircle 
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

type Connection = {
  id: string;
  user_id: string;
  connected_user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  profile?: Profile;
};

export default function Network() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingConnections, setPendingConnections] = useState<Connection[]>([]);
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState('connections');
  const [tableError, setTableError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchConnections();
      fetchConnectionSuggestions();
    }
  }, [user]);

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchProfiles();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const fetchConnections = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Check if connections table exists
      const { error: tableCheckError } = await supabase
        .from('connections')
        .select('id')
        .limit(1);

      if (tableCheckError) {
        if (tableCheckError.message.includes('relation') && tableCheckError.message.includes('does not exist')) {
          setTableError('The connections feature is not fully set up yet. Please apply the database migrations first.');
          setLoading(false);
          return;
        }
      }

      // Get connections where user is either the sender or recipient and status is accepted
      const { data: acceptedConnections, error: acceptedError } = await supabase
        .from('connections')
        .select('*')
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`)
        .eq('status', 'accepted');
        
      if (acceptedError) throw acceptedError;
      
      // Get pending connections where the user is the recipient
      const { data: pendingConnections, error: pendingError } = await supabase
        .from('connections')
        .select('*')
        .eq('connected_user_id', user.id)
        .eq('status', 'pending');
        
      if (pendingError) throw pendingError;
      
      // Fetch profiles for connections
      if (acceptedConnections) {
        const enhancedConnections = await Promise.all(
          acceptedConnections.map(async (connection) => {
            const profileId = connection.user_id === user.id 
              ? connection.connected_user_id 
              : connection.user_id;
              
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', profileId)
              .single();
              
            return { ...connection, profile };
          })
        );
        
        setConnections(enhancedConnections);
      }
      
      // Fetch profiles for pending connections
      if (pendingConnections) {
        const enhancedPendingConnections = await Promise.all(
          pendingConnections.map(async (connection) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', connection.user_id)
              .single();
              
            return { ...connection, profile };
          })
        );
        
        setPendingConnections(enhancedPendingConnections);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch connections',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectionSuggestions = async () => {
    if (!user || tableError) return;
    
    try {
      // Get all existing connection IDs (both accepted and pending)
      const { data: existingConnections } = await supabase
        .from('connections')
        .select('connected_user_id, user_id')
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`);
        
      // Extract IDs to exclude from suggestions
      const excludeIds = new Set<string>();
      excludeIds.add(user.id); // Exclude current user
      
      existingConnections?.forEach(conn => {
        excludeIds.add(conn.user_id);
        excludeIds.add(conn.connected_user_id);
      });
      
      // Get profiles not in existing connections
      const { data: suggestedProfiles } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', `(${Array.from(excludeIds).join(',')})`)
        .limit(5);
        
      if (suggestedProfiles) {
        setSuggestions(suggestedProfiles);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const searchProfiles = async () => {
    if (!user || !searchTerm || tableError) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`full_name.ilike.%${searchTerm}%,university.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
        .neq('id', user.id)
        .limit(5);
        
      if (error) throw error;
      
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching profiles:', error);
    }
  };

  const sendConnectionRequest = async (profileId: string) => {
    if (!user || tableError) {
      toast({
        title: 'Error',
        description: 'Cannot send connection request - database tables are not set up',
        variant: 'destructive',
      });
      return;
    }
    
    setActionLoading(true);
    try {
      // Check if connection already exists
      const { data: existingConn } = await supabase
        .from('connections')
        .select('*')
        .or(`and(user_id.eq.${user.id},connected_user_id.eq.${profileId}),and(user_id.eq.${profileId},connected_user_id.eq.${user.id})`)
        .single();
        
      if (existingConn) {
        toast({
          title: 'Connection exists',
          description: existingConn.status === 'pending' 
            ? 'Connection request already sent' 
            : 'Already connected with this user',
        });
        setActionLoading(false);
        return;
      }
      
      // Create new connection
      const { error } = await supabase
        .from('connections')
        .insert({
          user_id: user.id,
          connected_user_id: profileId,
          status: 'pending'
        });
        
      if (error) throw error;
      
      // Create notification for recipient
      await supabase
        .from('notifications')
        .insert({
          user_id: profileId,
          type: 'connection_request',
          content: `You have a new connection request`,
          related_id: user.id
        });
        
      toast({
        title: 'Success',
        description: 'Connection request sent',
      });
      
      // Refresh suggestions
      fetchConnectionSuggestions();
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: 'Error',
        description: 'Failed to send connection request',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const respondToRequest = async (connectionId: string, accept: boolean) => {
    if (!user || tableError) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('connections')
        .update({ 
          status: accept ? 'accepted' : 'rejected' 
        })
        .eq('id', connectionId);
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: accept 
          ? 'Connection request accepted' 
          : 'Connection request rejected',
      });
      
      // Refresh connections
      fetchConnections();
    } catch (error) {
      console.error('Error responding to request:', error);
      toast({
        title: 'Error',
        description: 'Failed to respond to connection request',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const renderProfileCard = (profile: Profile, action?: React.ReactNode) => {
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

  return (
    <PageLayout 
      title="Network" 
      previousPage={{ name: "Dashboard", path: "/dashboard" }}
      nextPage={{ name: "Events", path: "/events" }}
    >
      <div className="max-w-6xl mx-auto">
        {tableError ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Not Configured</AlertTitle>
            <AlertDescription>
              {tableError} Please apply the database migration to enable networking functionality.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative w-full md:w-auto flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search people by name, university, or location..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {searchResults.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">Search Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((profile) => (
                    renderProfileCard(profile, (
                      <Button 
                        onClick={() => sendConnectionRequest(profile.id)}
                        disabled={actionLoading}
                        className="w-full"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    ))
                  ))}
                </div>
              </div>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="connections">
                  <UserCheck className="h-4 w-4 mr-2" />
                  My Connections
                </TabsTrigger>
                <TabsTrigger value="requests">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Requests
                  {pendingConnections.length > 0 && (
                    <Badge className="ml-2" variant="destructive">
                      {pendingConnections.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="suggestions">
                  <Users className="h-4 w-4 mr-2" />
                  Suggested
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="connections">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : connections.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {connections.map((connection) => 
                      connection.profile ? renderProfileCard(connection.profile, (
                        <Button 
                          variant="outline"
                          onClick={() => toast({
                            title: "Feature coming soon",
                            description: "Messaging a connection directly is coming soon."
                          })}
                          className="w-full"
                        >
                          Message
                        </Button>
                      )) : null
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <User2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60" />
                    <p className="text-lg font-medium">No connections yet</p>
                    <p>Connect with peers to expand your network</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="requests">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : pendingConnections.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingConnections.map((connection) => 
                      connection.profile ? renderProfileCard(connection.profile, (
                        <div className="flex gap-2">
                          <Button 
                            variant="default"
                            onClick={() => respondToRequest(connection.id, true)}
                            disabled={actionLoading}
                            className="flex-1"
                          >
                            Accept
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => respondToRequest(connection.id, false)}
                            disabled={actionLoading}
                            className="flex-1"
                          >
                            Decline
                          </Button>
                        </div>
                      )) : null
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60" />
                    <p>No pending connection requests</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="suggestions">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suggestions.map((profile) => 
                      renderProfileCard(profile, (
                        <Button 
                          onClick={() => sendConnectionRequest(profile.id)}
                          disabled={actionLoading}
                          className="w-full"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60" />
                    <p>No suggestions available at this time</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-medium mb-2 flex items-center">
                  <School className="h-5 w-5 mr-2" />
                  Find by University
                </h3>
                <p className="text-sm text-muted-foreground">
                  Connect with students from your university or others.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-medium mb-2 flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Find by Company
                </h3>
                <p className="text-sm text-muted-foreground">
                  Connect with interns at the same companies you're interested in.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-medium mb-2 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Find by Location
                </h3>
                <p className="text-sm text-muted-foreground">
                  Connect with people in your area or where you plan to intern.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
