import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

type Profile = {
  id: string;
  full_name: string;
  school: string;
  linkedin: string;
  address: string;
};

type Connection = {
  id: string;
  user_id: string;
  connected_user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  connected_user: Profile;
};

export default function Network() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConnections();
      fetchProfiles();
    }
  }, [user]);

  const fetchConnections = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          connected_user:profiles!connections_connected_user_id_fkey(*)
        `)
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`);

      if (error) throw error;
      setConnections(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch connections',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id);

      if (error) throw error;
      setProfiles(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch profiles',
        variant: 'destructive',
      });
    }
  };

  const sendConnectionRequest = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('connections').insert([
        {
          user_id: user.id,
          connected_user_id: userId,
          status: 'pending',
        },
      ]);

      if (error) throw error;
      await fetchConnections();
      toast({
        title: 'Success',
        description: 'Connection request sent',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send connection request',
        variant: 'destructive',
      });
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

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.school.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Network</h1>

        {/* Search */}
        <div className="mb-8">
          <Input
            placeholder="Search by name or school..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Connection Requests */}
        {connections.filter((c) => c.status === 'pending' && c.connected_user_id === user?.id).length >
          0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Connection Requests</h2>
            <div className="space-y-4">
              {connections
                .filter((c) => c.status === 'pending' && c.connected_user_id === user?.id)
                .map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage
                          src={`https://avatar.vercel.sh/${connection.connected_user.full_name}`}
                        />
                        <AvatarFallback>
                          {connection.connected_user.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{connection.connected_user.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {connection.connected_user.school}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleConnectionResponse(connection.id, 'rejected')}
                      >
                        Decline
                      </Button>
                      <Button onClick={() => handleConnectionResponse(connection.id, 'accepted')}>
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Available Profiles */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Find Interns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProfiles.map((profile) => {
              const connection = connections.find(
                (c) =>
                  (c.user_id === user?.id && c.connected_user_id === profile.id) ||
                  (c.connected_user_id === user?.id && c.user_id === profile.id)
              );

              return (
                <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={`https://avatar.vercel.sh/${profile.full_name}`} />
                      <AvatarFallback>{profile.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{profile.full_name}</p>
                      <p className="text-sm text-muted-foreground">{profile.school}</p>
                    </div>
                  </div>
                  {connection ? (
                    <Button variant="outline" disabled>
                      {connection.status === 'pending'
                        ? 'Request Sent'
                        : connection.status === 'accepted'
                        ? 'Connected'
                        : 'Rejected'}
                    </Button>
                  ) : (
                    <Button onClick={() => sendConnectionRequest(profile.id)}>Connect</Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 