
import { Button } from "@/components/ui/button";
import { Loader2, User2, UserCheck, UserPlus, Users } from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { ProfileCard } from "@/components/network/ProfileCard";
import { Badge } from "@/components/ui/badge";
import { Profile } from "@/lib/supabase";

type Connection = {
  id: string;
  sender_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  profile?: Profile;
};

interface NetworkConnectionsProps {
  connections: Connection[];
  pendingConnections: Connection[];
  suggestions: Profile[];
  loading: boolean;
  activeTab: string;
  setActiveTab: (value: string) => void;
  actionLoading: boolean;
  sendConnectionRequest: (profileId: string) => void;
  respondToRequest: (connectionId: string, accept: boolean) => void;
  searchResults: Profile[];
}

export const NetworkConnections = ({
  connections,
  pendingConnections,
  suggestions,
  loading,
  activeTab,
  setActiveTab,
  actionLoading,
  sendConnectionRequest,
  respondToRequest,
  searchResults
}: NetworkConnectionsProps) => {
  return (
    <>
      {searchResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">Search Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((profile) => (
              <ProfileCard 
                key={profile.id}
                profile={profile}
                action={
                  <Button 
                    onClick={() => sendConnectionRequest(profile.id)}
                    disabled={actionLoading}
                    className="w-full"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                }
              />
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
                connection.profile ? (
                  <ProfileCard 
                    key={connection.id}
                    profile={connection.profile}
                    action={
                      <Button 
                        variant="outline"
                        onClick={() => {}}
                        className="w-full"
                      >
                        Message
                      </Button>
                    }
                  />
                ) : null
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
                connection.profile ? (
                  <ProfileCard 
                    key={connection.id}
                    profile={connection.profile}
                    action={
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
                    }
                  />
                ) : null
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
              {suggestions.map((profile) => (
                <ProfileCard 
                  key={profile.id}
                  profile={profile}
                  action={
                    <Button 
                      onClick={() => sendConnectionRequest(profile.id)}
                      disabled={actionLoading}
                      className="w-full"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60" />
              <p>No suggestions available at this time</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
};
