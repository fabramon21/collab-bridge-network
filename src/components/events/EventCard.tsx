
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EventProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    event_type: 'social' | 'roommate' | 'professional';
    location: string | null;
    start_time: string;
    end_time: string;
    max_participants: number | null;
  };
  status?: 'interested' | 'attending' | 'not_attending';
  onAttend: () => void;
  onInterested: () => void;
  onDecline: () => void;
  isLoading?: boolean;
}

export const EventCard = ({ 
  event, 
  status, 
  onAttend, 
  onInterested, 
  onDecline,
  isLoading = false
}: EventProps) => {
  // Helper for formatting dates
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  // Helper for getting event type badge color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'social':
        return 'bg-purple-100 text-purple-800';
      case 'roommate':
        return 'bg-green-100 text-green-800';
      case 'professional':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold">{event.title}</h3>
          <Badge 
            variant="outline" 
            className={getEventTypeColor(event.event_type)}
          >
            {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
          </Badge>
        </div>
        
        <div className="mb-4">
          <p className="text-muted-foreground">{event.description}</p>
        </div>
        
        <div className="space-y-2 mb-4">
          {event.location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{event.location}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(event.start_time)}</span>
          </div>
          
          {event.max_participants && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              <span>Max {event.max_participants} participants</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 pt-2">
          {status === 'attending' ? (
            <Button 
              variant="outline" 
              className="w-full bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              disabled
            >
              Attending
            </Button>
          ) : status === 'interested' ? (
            <>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={onDecline}
                disabled={isLoading}
              >
                Not Going
              </Button>
              <Button 
                className="flex-1"
                onClick={onAttend}
                disabled={isLoading}
              >
                Attend
              </Button>
            </>
          ) : status === 'not_attending' ? (
            <Button 
              variant="outline" 
              className="w-full bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
              disabled
            >
              Not Attending
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={onInterested}
                disabled={isLoading}
              >
                Interested
              </Button>
              <Button 
                className="flex-1"
                onClick={onAttend}
                disabled={isLoading}
              >
                Attend
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
