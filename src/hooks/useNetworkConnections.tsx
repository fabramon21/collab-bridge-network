
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
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

export const useNetworkConnections = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingConnections, setPendingConnections] = useState<Connection[]>([]);
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
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
      // Check if connections table exists with proper structure
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
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .eq('status', 'accepted');
        
      if (acceptedError) throw acceptedError;
      
      // Get pending connections where the user is the recipient
      const { data: pendingConnections, error: pendingError } = await supabase
        .from('connections')
        .select('*')
        .eq('recipient_id', user.id)
        .eq('status', 'pending');
        
      if (pendingError) throw pendingError;
      
      // Fetch profiles for connections
      if (acceptedConnections) {
        const enhancedConnections = await Promise.all(
          acceptedConnections.map(async (connection) => {
            const profileId = connection.sender_id === user.id 
              ? connection.recipient_id 
              : connection.sender_id;
              
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
              .eq('id', connection.sender_id)
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
        .select('recipient_id, sender_id')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);
        
      // Extract IDs to exclude from suggestions
      const excludeIds = new Set<string>();
      excludeIds.add(user.id); // Exclude current user
      
      existingConnections?.forEach(conn => {
        excludeIds.add(conn.sender_id);
        excludeIds.add(conn.recipient_id);
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
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${profileId}),and(sender_id.eq.${profileId},recipient_id.eq.${user.id})`)
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
          sender_id: user.id,
          recipient_id: profileId,
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

  return {
    connections,
    pendingConnections,
    suggestions,
    loading,
    actionLoading,
    searchTerm,
    setSearchTerm,
    searchResults,
    tableError,
    fetchConnections,
    fetchConnectionSuggestions,
    sendConnectionRequest,
    respondToRequest
  };
};
