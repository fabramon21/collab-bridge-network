
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ConversationList } from '@/components/messages/ConversationList';
import { ChatArea } from '@/components/messages/ChatArea';
import { Loader2 } from 'lucide-react';

type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
};

type Profile = {
  id: string;
  full_name: string;
  profile_image_url: string | null;
};

type Conversation = {
  id: string;
  profile: Profile;
  lastMessage: {
    content: string;
    created_at: string;
    is_read: boolean;
  };
  unreadCount: number;
};

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchProfiles();

      // Subscribe to new messages
      const channel = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `recipient_id=eq.${user.id}`,
          },
          (payload) => {
            const newMessage = payload.new as Message;
            setMessages((prev) => [...prev, newMessage]);
            
            // Update conversations
            updateConversations([...messages, newMessage], profiles);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // Update conversations when messages or profiles change
  useEffect(() => {
    if (messages.length > 0 && profiles.length > 0) {
      updateConversations(messages, profiles);
    }
  }, [messages, profiles]);

  const fetchMessages = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch messages',
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
        .select('id, full_name, profile_image_url');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch profiles',
        variant: 'destructive',
      });
    }
  };

  const updateConversations = (allMessages: Message[], allProfiles: Profile[]) => {
    if (!user) return;

    // Get unique conversation partners
    const conversationPartners = new Set<string>();
    allMessages.forEach(msg => {
      if (msg.sender_id === user.id) {
        conversationPartners.add(msg.recipient_id);
      } else if (msg.recipient_id === user.id) {
        conversationPartners.add(msg.sender_id);
      }
    });

    // Create conversations
    const newConversations: Conversation[] = [];
    
    conversationPartners.forEach(partnerId => {
      const profile = allProfiles.find(p => p.id === partnerId);
      if (!profile) return;
      
      // Get messages for this conversation
      const conversationMessages = allMessages.filter(
        msg => 
          (msg.sender_id === user.id && msg.recipient_id === partnerId) || 
          (msg.recipient_id === user.id && msg.sender_id === partnerId)
      ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      if (conversationMessages.length === 0) return;
      
      // Get last message
      const lastMessage = conversationMessages[conversationMessages.length - 1];
      
      // Count unread messages
      const unreadCount = conversationMessages.filter(
        msg => msg.recipient_id === user.id && msg.sender_id === partnerId && !msg.is_read
      ).length;
      
      newConversations.push({
        id: partnerId, // Using partner ID as conversation ID
        profile,
        lastMessage: {
          content: lastMessage.content,
          created_at: lastMessage.created_at,
          is_read: lastMessage.is_read
        },
        unreadCount
      });
    });
    
    // Sort by last message date (newest first)
    newConversations.sort((a, b) => 
      new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    );
    
    setConversations(newConversations);
    
    // Select first conversation if none selected
    if (!selectedUserId && newConversations.length > 0) {
      setSelectedUserId(newConversations[0].profile.id);
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedUserId || !newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase.from('messages').insert([
        {
          sender_id: user.id,
          recipient_id: selectedUserId,
          content: newMessage.trim(),
          is_read: false
        },
      ]);

      if (error) throw error;
      
      // Fetch messages again to get the new message with its ID
      await fetchMessages();
      
      setNewMessage('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!user || !selectedUserId) return;
    
    try {
      const messagesToMark = messages.filter(
        msg => msg.sender_id === selectedUserId && msg.recipient_id === user.id && !msg.is_read
      );
      
      if (messagesToMark.length === 0) return;
      
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', messagesToMark.map(msg => msg.id));
      
      if (error) throw error;
      
      // Update local messages
      setMessages(prevMessages => 
        prevMessages.map(msg => {
          if (msg.sender_id === selectedUserId && msg.recipient_id === user.id && !msg.is_read) {
            return { ...msg, is_read: true };
          }
          return msg;
        })
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Mark messages as read when changing conversation
  useEffect(() => {
    if (selectedUserId) {
      markMessagesAsRead();
    }
  }, [selectedUserId]);

  const selectedUser = selectedUserId 
    ? profiles.find(p => p.id === selectedUserId) || null
    : null;

  const conversationMessages = messages.filter(
    msg => 
      (msg.sender_id === user?.id && msg.recipient_id === selectedUserId) || 
      (msg.recipient_id === user?.id && msg.sender_id === selectedUserId)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-[600px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px] border rounded-md overflow-hidden">
            {/* Contacts List */}
            <div className="md:col-span-1 border-r">
              <ConversationList 
                conversations={conversations} 
                selectedUserId={selectedUserId} 
                onSelectConversation={setSelectedUserId}
              />
            </div>

            {/* Chat Area */}
            <div className="md:col-span-2">
              <ChatArea 
                currentUserId={user?.id || ''}
                selectedUser={selectedUser}
                messages={conversationMessages}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                sendMessage={sendMessage}
                isLoading={sendingMessage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
