import { useState, useEffect, useRef } from "react";
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
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  profile_image_url: string | null;
  is_online?: boolean;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export const MessagesPanel = () => {
  const [conversations, setConversations] = useState<{[key: string]: Profile}>({});
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      
      try {
        // Get all messages to/from the current user
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .order('created_at', { ascending: false });
          
        if (messagesError) throw messagesError;
        
        // Extract unique conversation partners
        const conversationPartners = new Set<string>();
        messagesData?.forEach(message => {
          if (message.sender_id === user.id) {
            conversationPartners.add(message.recipient_id);
          } else {
            conversationPartners.add(message.sender_id);
          }
        });
        
        // Get profile information for all conversation partners
        if (conversationPartners.size > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, profile_image_url')
            .in('id', Array.from(conversationPartners));
            
          if (profilesError) throw profilesError;
          
          const conversationsMap: {[key: string]: Profile} = {};
          profilesData?.forEach(profile => {
            conversationsMap[profile.id] = profile;
          });
          
          setConversations(conversationsMap);
          
          // Select the first conversation by default
          if (profilesData && profilesData.length > 0) {
            setSelectedContact(profilesData[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversations();
    
    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `recipient_id=eq.${user?.id}` 
      }, async (payload) => {
        const newMessage = payload.new as Message;
        
        // Update messages if this is from the selected contact
        if (selectedContact === newMessage.sender_id) {
          setMessages(prev => [...prev, newMessage]);
          
          // Mark as read
          await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', newMessage.id);
        }
        
        // Ensure we have the sender's profile
        if (!conversations[newMessage.sender_id]) {
          const { data } = await supabase
            .from('profiles')
            .select('id, full_name, profile_image_url')
            .eq('id', newMessage.sender_id)
            .single();
            
          if (data) {
            setConversations(prev => ({
              ...prev,
              [data.id]: data
            }));
          }
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [user]);

  useEffect(() => {
    // Load messages for selected contact
    const fetchMessages = async () => {
      if (!user || !selectedContact) return;
      
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},recipient_id.eq.${selectedContact}),and(sender_id.eq.${selectedContact},recipient_id.eq.${user.id})`)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        setMessages(data || []);
        
        // Mark unread messages as read
        const unreadMessageIds = data
          ?.filter(m => m.recipient_id === user.id && !m.is_read)
          .map(m => m.id);
          
        if (unreadMessageIds && unreadMessageIds.length > 0) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadMessageIds);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    
    fetchMessages();
  }, [selectedContact, user]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!user || !selectedContact || !newMessage.trim()) return;
    
    try {
      const messageData = {
        sender_id: user.id,
        recipient_id: selectedContact,
        content: newMessage.trim()
      };
      
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();
        
      if (error) throw error;
      
      // Update local messages
      setMessages([...messages, data]);
      setNewMessage("");
      
      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: selectedContact,
          type: 'message',
          content: `New message from ${user.user_metadata?.full_name || 'a user'}`,
          related_id: data.id
        });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-[600px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      
      <div className="flex flex-grow overflow-hidden">
        {/* Contacts list */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : Object.keys(conversations).length > 0 ? (
            <div className="p-2">
              {Object.entries(conversations).map(([id, profile]) => {
                const unreadCount = messages.filter(
                  m => m.sender_id === id && m.recipient_id === user?.id && !m.is_read
                ).length;
                
                const initials = profile.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase();
                  
                return (
                  <div 
                    key={id}
                    className={`flex items-center p-2 rounded-md cursor-pointer ${
                      selectedContact === id ? 'bg-gray-100' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedContact(id)}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={profile.profile_image_url || ""} alt={profile.full_name} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      {profile.is_online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{profile.full_name}</span>
                        {unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>No conversations yet.</p>
            </div>
          )}
        </div>
        
        {/* Messages */}
        <div className="w-2/3 flex flex-col">
          {selectedContact ? (
            <>
              <div className="p-3 border-b border-gray-200 flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage 
                    src={conversations[selectedContact]?.profile_image_url || ""} 
                    alt={conversations[selectedContact]?.full_name} 
                  />
                  <AvatarFallback>
                    {conversations[selectedContact]?.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{conversations[selectedContact]?.full_name}</span>
              </div>
              
              <div className="flex-grow overflow-y-auto p-4">
                {messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.reduce((acc: JSX.Element[], message, index) => {
                      // Add date separator
                      if (index === 0 || formatDate(messages[index - 1].created_at) !== formatDate(message.created_at)) {
                        acc.push(
                          <div key={`date-${message.id}`} className="flex justify-center my-4">
                            <div className="bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-500">
                              {formatDate(message.created_at)}
                            </div>
                          </div>
                        );
                      }
                      
                      const isMine = message.sender_id === user?.id;
                      
                      acc.push(
                        <div 
                          key={message.id} 
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              isMine ? 'bg-primary text-white' : 'bg-gray-100'
                            }`}
                          >
                            <p className="break-words">{message.content}</p>
                            <div 
                              className={`text-xs mt-1 ${
                                isMine ? 'text-primary-foreground/70' : 'text-gray-500'
                              }`}
                            >
                              {formatTime(message.created_at)}
                            </div>
                          </div>
                        </div>
                      );
                      
                      return acc;
                    }, [])}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">No messages yet. Send a message to start the conversation!</p>
                  </div>
                )}
              </div>
              
              <CardFooter className="border-t border-gray-200 p-3">
                <div className="flex w-full items-center space-x-2">
                  <Input 
                    placeholder="Type a message..." 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button size="icon" onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
