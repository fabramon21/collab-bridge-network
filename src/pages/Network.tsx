
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { ConnectionCard } from '@/components/network/ConnectionCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Users, UserPlus } from 'lucide-react';

type Profile = {
  id: string;
  full_name: string;
  university: string;
  linkedin_url: string | null;
  location: string | null;
  bio: string | null;
};

type Connection = {
  id: string;
  sender_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string | null;
};

export default function Network() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('find');

  useEffect(() => {
    if (user) {
      fetchConnections();
      fetchProfiles();
    }
  }, [user]);

  const fetchConnections = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch connections',
        variant: 'destructive',
      });
    }
  };

  const fetchProfiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, university, linkedin_url, location, bio')
        .neq('id', user.id);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch profiles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendConnectionRequest = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('connections').insert([
        {
          sender_id: user.id,
          recipient_id: userId,
          status: 'pending',
        },
      ]);

      if (error) throw error;
      await fetchConnections();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send connection request',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleConnectionResponse = async (connectionId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status })
        .eq('id', connectionId);

      if (error) throw error;
      await fetchConnections();
      
      toast({
        title: 'Success',
        description: `Connection ${status}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update connection',
        variant: 'destructive',
      });
    }
  };

  const pendingRequests = connections.filter(
    (c) => c.status === 'pending' && c.recipient_id === user?.id
  );

  const myConnections = connections.filter(
    (c) => c.status === 'accepted' && (c.sender_id === user?.id || c.recipient_id === user?.id)
  );

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profile.university && profile.university.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (profile.location && profile.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getConnectionStatus = (profileId: string) => {
    return connections.find(
      (c) =>
        (c.sender_id === user?.id && c.recipient_id === profileId) ||
        (c.recipient_id === user?.id && c.sender_id === profileId)
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Network</h1>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mb-8"
        >
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="find" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" /> Find Interns
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> My Connections
              {myConnections.length > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                  {myConnections.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" /> Requests
              {pendingRequests.length > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="find">
            <div>
              <Input
                placeholder="Search by name, university, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-6"
              />

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredProfiles.length > 0 ? (
                <div className="space-y-4">
                  {filteredProfiles.map((profile) => {
                    const connection = getConnectionStatus(profile.id);
                    return (
                      <ConnectionCard
                        key={profile.id}
                        profile={profile}
                        connection={connection}
                        onConnect={() => sendConnectionRequest(profile.id)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No profiles found matching your search.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="connections">
            {myConnections.length > 0 ? (
              <div className="space-y-4">
                {myConnections.map((connection) => {
                  const connectedProfileId = connection.sender_id === user?.id 
                    ? connection.recipient_id 
                    : connection.sender_id;
                  
                  const connectedProfile = profiles.find(p => p.id === connectedProfileId);
                  
                  if (!connectedProfile) return null;
                  
                  return (
                    <ConnectionCard
                      key={connection.id}
                      profile={connectedProfile}
                      connection={connection}
                      onConnect={() => {}}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                You don't have any connections yet. Connect with other interns to grow your network!
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests">
            {pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.map((request) => {
                  const senderProfile = profiles.find(p => p.id === request.sender_id);
                  
                  if (!senderProfile) return null;
                  
                  return (
                    <ConnectionCard
                      key={request.id}
                      profile={senderProfile}
                      connection={request}
                      onConnect={() => {}}
                      onAccept={(id) => handleConnectionResponse(id, 'accepted')}
                      onDecline={(id) => handleConnectionResponse(id, 'rejected')}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                You don't have any pending connection requests.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
