import { useEffect, useMemo, useState, useRef } from "react";
import { PageLayout } from "@/components/PageLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircle, Users, Building2, Brain, Home, Briefcase } from "lucide-react";

type Room = {
  id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  icon: string | null;
  created_by: string;
  created_at: string;
};

type Message = {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: {
    full_name: string | null;
  };
};

const ICONS: Record<string, JSX.Element> = {
  company: <Building2 className="h-4 w-4" />,
  prep: <Brain className="h-4 w-4" />,
  housing: <Home className="h-4 w-4" />,
  career: <Briefcase className="h-4 w-4" />,
  general: <MessageCircle className="h-4 w-4" />,
};

export default function Discussions() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [roomForm, setRoomForm] = useState({
    title: "",
    description: "",
    tags: "",
    icon: "general",
  });

  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchRooms = async () => {
    setRoomsLoading(true);
    const { data, error } = await supabase
      .from("discussions_rooms")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading rooms", description: error.message, variant: "destructive" });
    } else {
      setRooms(data || []);
    }
    setRoomsLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (!activeRoom) return;
    const loadMessages = async () => {
      setMessagesLoading(true);
      const { data, error } = await supabase
        .from("discussions_messages")
        .select("*, sender:sender_id(full_name)")
        .eq("room_id", activeRoom.id)
        .order("created_at", { ascending: true });
      if (error) {
        toast({ title: "Error loading messages", description: error.message, variant: "destructive" });
      } else {
        setMessages(data || []);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }
      setMessagesLoading(false);
    };
    loadMessages();
  }, [activeRoom]);

  const handleCreateRoom = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to create a room.", variant: "destructive" });
      return;
    }
    if (!roomForm.title.trim()) {
      toast({ title: "Title required", description: "Give your room a name.", variant: "destructive" });
      return;
    }
    const tags = roomForm.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const { error } = await supabase.from("discussions_rooms").insert({
      title: roomForm.title.trim(),
      description: roomForm.description.trim() || null,
      tags,
      icon: roomForm.icon,
      created_by: user.id,
    });
    if (error) {
      toast({ title: "Error creating room", description: error.message, variant: "destructive" });
      return;
    }
    setCreateOpen(false);
    setRoomForm({ title: "", description: "", tags: "", icon: "general" });
    fetchRooms();
  };

  const handleSendMessage = async () => {
    if (!user || !activeRoom) return;
    if (!messageInput.trim()) return;
    const content = messageInput.trim();
    setMessageInput("");

    const { error } = await supabase.from("discussions_messages").insert({
      room_id: activeRoom.id,
      sender_id: user.id,
      content,
    });
    if (error) {
      toast({ title: "Message failed", description: error.message, variant: "destructive" });
    } else {
      // refresh messages
      const { data } = await supabase
        .from("discussions_messages")
        .select("*, sender:sender_id(full_name)")
        .eq("room_id", activeRoom.id)
        .order("created_at", { ascending: true });
      setMessages(data || []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  return (
    <PageLayout title="Discussions" nextPage={{ name: "Messages", path: "/messages" }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Join a room</h1>
            <p className="text-sm text-muted-foreground">
              Company threads, interview prep, housing groups, and more.
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>Create a room</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create discussion room</DialogTitle>
                  <DialogDescription>
                    Make it easy for others to find with tags and a clear title.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="room-title">Title</Label>
                    <Input
                      id="room-title"
                      value={roomForm.title}
                      onChange={(e) => setRoomForm({ ...roomForm, title: e.target.value })}
                      placeholder="e.g., Meta interns 2026"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="room-desc">Description</Label>
                    <Textarea
                      id="room-desc"
                      value={roomForm.description}
                      onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                      placeholder="What will people discuss here?"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="room-tags">Tags (comma separated)</Label>
                    <Input
                      id="room-tags"
                      value={roomForm.tags}
                      onChange={(e) => setRoomForm({ ...roomForm, tags: e.target.value })}
                      placeholder="company, interview, housing"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Icon</Label>
                    <Select
                      value={roomForm.icon}
                      onValueChange={(val) => setRoomForm({ ...roomForm, icon: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an icon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="prep">Interview prep</SelectItem>
                        <SelectItem value="housing">Housing</SelectItem>
                        <SelectItem value="career">Career</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateRoom}>Create room</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roomsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-full border border-gray-200">
                <CardHeader className="pb-2">
                  <div className="h-4 w-28 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-48 bg-muted animate-pulse rounded mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))
          ) : rooms.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rooms yet. Create the first one!</p>
          ) : (
            rooms.map((room) => (
              <Card
                key={room.id}
                className="h-full border border-gray-200 hover:shadow-sm transition cursor-pointer"
                onClick={() => setActiveRoom(room)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                        {ICONS[room.icon || "general"] ?? ICONS.general}
                      </div>
                      <div>
                        <CardTitle className="text-base">{room.title}</CardTitle>
                        {room.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {room.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Members TBD</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(room.tags ?? []).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm">Enter room</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Dialog open={!!activeRoom} onOpenChange={() => setActiveRoom(null)}>
          <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{activeRoom?.title}</DialogTitle>
              <DialogDescription>{activeRoom?.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <ScrollArea className="h-80 border rounded-md p-3 bg-muted/30">
                {messagesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className="mb-3">
                      <div className="text-sm font-semibold">
                        {m.sender?.full_name || "Someone"}
                        <span className="text-xs text-muted-foreground ml-2">
                          {new Date(m.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm">{m.content}</div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  placeholder="Write a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button onClick={handleSendMessage}>Send</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
