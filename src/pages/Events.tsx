import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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
  creator: {
    full_name: string;
  };
  participants: {
    status: 'interested' | 'attending' | 'not_attending';
  }[];
};

export default function Events() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'social' as 'social' | 'roommate' | 'professional',
    location: '',
    start_time: '',
    end_time: '',
    max_participants: '',
  });

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          creator:profiles!events_creator_id_fkey(full_name),
          participants:event_participants!inner(status)
        `)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data);
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

  const createEvent = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.from('events').insert([
        {
          creator_id: user.id,
          title: newEvent.title,
          description: newEvent.description,
          event_type: newEvent.event_type,
          location: newEvent.location,
          start_time: newEvent.start_time,
          end_time: newEvent.end_time,
          max_participants: newEvent.max_participants ? parseInt(newEvent.max_participants) : null,
        },
      ]);

      if (error) throw error;
      setShowCreateForm(false);
      setNewEvent({
        title: '',
        description: '',
        event_type: 'social',
        location: '',
        start_time: '',
        end_time: '',
        max_participants: '',
      });
      await fetchEvents();
      toast({
        title: 'Success',
        description: 'Event created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive',
      });
    }
  };

  const handleEventParticipation = async (eventId: string, status: 'interested' | 'attending' | 'not_attending') => {
    if (!user) return;

    try {
      const { error } = await supabase.from('event_participants').upsert([
        {
          event_id: eventId,
          user_id: user.id,
          status,
        },
      ]);

      if (error) throw error;
      await fetchEvents();
      toast({
        title: 'Success',
        description: `You are now ${status} in this event`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update participation status',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Events</h1>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : 'Create Event'}
          </Button>
        </div>

        {/* Create Event Form */}
        {showCreateForm && (
          <div className="mb-8 p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Create New Event</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_type">Event Type</Label>
                <select
                  id="event_type"
                  className="w-full p-2 border rounded-md"
                  value={newEvent.event_type}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, event_type: e.target.value as 'social' | 'roommate' | 'professional' })
                  }
                >
                  <option value="social">Social</option>
                  <option value="roommate">Roommate</option>
                  <option value="professional">Professional</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={newEvent.start_time}
                    onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={newEvent.end_time}
                    onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_participants">Max Participants (optional)</Label>
                <Input
                  id="max_participants"
                  type="number"
                  value={newEvent.max_participants}
                  onChange={(e) => setNewEvent({ ...newEvent, max_participants: e.target.value })}
                />
              </div>

              <Button onClick={createEvent}>Create Event</Button>
            </div>
          </div>
        )}

        {/* Events List */}
        <div className="space-y-6">
          {events.map((event) => (
            <div key={event.id} className="border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{event.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    Created by {event.creator.full_name}
                  </p>
                </div>
                <span className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary">
                  {event.event_type}
                </span>
              </div>

              <p className="mb-4">{event.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{event.location || 'TBD'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Time</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.start_time), 'MMM d, yyyy h:mm a')} -{' '}
                    {format(new Date(event.end_time), 'h:mm a')}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={event.participants[0]?.status === 'attending' ? 'default' : 'outline'}
                  onClick={() => handleEventParticipation(event.id, 'attending')}
                >
                  {event.participants[0]?.status === 'attending' ? 'Attending' : 'Attend'}
                </Button>
                <Button
                  variant={event.participants[0]?.status === 'interested' ? 'default' : 'outline'}
                  onClick={() => handleEventParticipation(event.id, 'interested')}
                >
                  {event.participants[0]?.status === 'interested' ? 'Interested' : 'Interested'}
                </Button>
                {event.participants[0]?.status && (
                  <Button
                    variant="outline"
                    onClick={() => handleEventParticipation(event.id, 'not_attending')}
                  >
                    Not Attending
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 