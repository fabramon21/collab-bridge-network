
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { EventCard } from '@/components/events/EventCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Search, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

// Import types
type Event = {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  event_type: 'social' | 'roommate' | 'professional';
  location: string | null;
  start_time: string;
  end_time: string;
  max_participants: number | null;
  created_at: string;
  updated_at: string;
};

type EventParticipant = {
  id: string;
  event_id: string;
  user_id: string;
  status: 'interested' | 'attending' | 'not_attending';
  created_at: string;
};

export default function Events() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchEvents();
      fetchParticipants();
    }
  }, [user]);

  const fetchEvents = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch events',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch participation status',
        variant: 'destructive',
      });
    }
  };

  const updateParticipation = async (eventId: string, status: 'interested' | 'attending' | 'not_attending') => {
    if (!user) return;

    setActionLoading(true);
    try {
      // Check if user already has a status for this event
      const existingParticipation = participants.find(p => p.event_id === eventId);

      if (existingParticipation) {
        // Update existing participation
        const { error } = await supabase
          .from('event_participants')
          .update({ status })
          .eq('id', existingParticipation.id);

        if (error) throw error;
      } else {
        // Create new participation
        const { error } = await supabase
          .from('event_participants')
          .insert([
            {
              event_id: eventId,
              user_id: user.id,
              status,
            },
          ]);

        if (error) throw error;
      }

      // Refresh participants
      await fetchParticipants();

      toast({
        title: 'Success',
        description: `You are now ${status.replace('_', ' ')} the event.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update participation status',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Helper functions for filtering
  const getEventStatus = (eventId: string): 'interested' | 'attending' | 'not_attending' | undefined => {
    const participation = participants.find(p => p.event_id === eventId);
    return participation?.status;
  };

  const isUpcoming = (event: Event) => {
    return new Date(event.start_time) > new Date();
  };

  // Filter events based on tab, search, and type
  const filterEvents = () => {
    let filteredEvents = events;

    // Filter by tab
    if (activeTab === 'attending') {
      filteredEvents = events.filter(event => {
        const status = getEventStatus(event.id);
        return status === 'attending';
      });
    } else if (activeTab === 'interested') {
      filteredEvents = events.filter(event => {
        const status = getEventStatus(event.id);
        return status === 'interested';
      });
    } else if (activeTab === 'upcoming') {
      filteredEvents = events.filter(event => isUpcoming(event));
    }

    // Filter by search term
    if (searchTerm) {
      filteredEvents = filteredEvents.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by event type
    if (selectedType) {
      filteredEvents = filteredEvents.filter(event => event.event_type === selectedType);
    }

    return filteredEvents;
  };

  const filteredEvents = filterEvents();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Events</h1>

        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-auto flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge 
              variant={selectedType === null ? "default" : "outline"} 
              className="cursor-pointer"
              onClick={() => setSelectedType(null)}
            >
              All
            </Badge>
            <Badge 
              variant={selectedType === 'social' ? "default" : "outline"} 
              className="cursor-pointer"
              onClick={() => setSelectedType('social')}
            >
              Social
            </Badge>
            <Badge 
              variant={selectedType === 'roommate' ? "default" : "outline"} 
              className="cursor-pointer"
              onClick={() => setSelectedType('roommate')}
            >
              Roommate
            </Badge>
            <Badge 
              variant={selectedType === 'professional' ? "default" : "outline"} 
              className="cursor-pointer"
              onClick={() => setSelectedType('professional')}
            >
              Professional
            </Badge>
          </div>
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mb-8"
        >
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="attending">Attending</TabsTrigger>
            <TabsTrigger value="interested">Interested</TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <TabsContent value={activeTab} className="mt-0">
              {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      status={getEventStatus(event.id)}
                      onAttend={() => updateParticipation(event.id, 'attending')}
                      onInterested={() => updateParticipation(event.id, 'interested')}
                      onDecline={() => updateParticipation(event.id, 'not_attending')}
                      isLoading={actionLoading}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No events found matching your criteria.
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
