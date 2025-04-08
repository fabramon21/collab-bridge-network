
import { useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SendHorizontal } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface ChatAreaProps {
  currentUserId: string;
  selectedUser: {
    id: string;
    full_name: string;
    profile_image_url?: string | null;
  } | null;
  messages: Message[];
  newMessage: string;
  setNewMessage: (value: string) => void;
  sendMessage: () => void;
  isLoading: boolean;
}

export const ChatArea = ({
  currentUserId,
  selectedUser,
  messages,
  newMessage,
  setNewMessage,
  sendMessage,
  isLoading
}: ChatAreaProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!selectedUser) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20">
        <div className="text-center p-6">
          <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
          <p className="text-muted-foreground">
            Choose a person from the list to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b flex items-center gap-3">
        <Avatar>
          <AvatarImage src={selectedUser.profile_image_url || `https://avatar.vercel.sh/${selectedUser.full_name}`} />
          <AvatarFallback>{selectedUser.full_name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-medium">{selectedUser.full_name}</h2>
        </div>
      </div>

      {/* Message area */}
      <div className="flex-1 p-4 overflow-y-auto" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => {
            const isCurrentUser = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex items-start max-w-[80%]">
                  {!isCurrentUser && (
                    <Avatar className="mr-2 mt-1">
                      <AvatarImage src={selectedUser.profile_image_url || `https://avatar.vercel.sh/${selectedUser.full_name}`} />
                      <AvatarFallback>{selectedUser.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div
                      className={`rounded-lg p-3 ${
                        isCurrentUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs mt-1 text-muted-foreground text-right">
                      {format(new Date(message.created_at), 'h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Input area */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !newMessage.trim()}
            size="icon"
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
