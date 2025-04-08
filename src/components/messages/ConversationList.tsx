
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface Conversation {
  id: string;
  profile: {
    id: string;
    full_name: string;
    profile_image_url?: string | null;
  };
  lastMessage: {
    content: string;
    created_at: string;
    is_read: boolean;
  };
  unreadCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedUserId: string | null;
  onSelectConversation: (userId: string) => void;
}

export const ConversationList = ({
  conversations,
  selectedUserId,
  onSelectConversation
}: ConversationListProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(c => 
    c.profile.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          filteredConversations.map(conversation => (
            <div
              key={conversation.id}
              className={`p-3 cursor-pointer hover:bg-muted/50 flex items-start gap-3 ${
                selectedUserId === conversation.profile.id ? 'bg-muted' : ''
              }`}
              onClick={() => onSelectConversation(conversation.profile.id)}
            >
              <Avatar>
                <AvatarImage src={conversation.profile.profile_image_url || `https://avatar.vercel.sh/${conversation.profile.full_name}`} />
                <AvatarFallback>{conversation.profile.full_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium truncate">{conversation.profile.full_name}</h3>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(conversation.lastMessage.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                  {conversation.lastMessage.content}
                </p>
              </div>
              {conversation.unreadCount > 0 && (
                <Badge variant="default" className="rounded-full h-5 min-w-5 flex items-center justify-center">
                  {conversation.unreadCount}
                </Badge>
              )}
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No conversations found
          </div>
        )}
      </div>
    </div>
  );
};
