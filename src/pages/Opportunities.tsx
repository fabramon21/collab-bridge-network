import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";

type Opportunity = {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  location: string | null;
  apply_url: string | null;
  role_type: string | null;
  created_at: string;
};

export default function Opportunities() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Remote");
  const [applyUrl, setApplyUrl] = useState("");
  const [roleType, setRoleType] = useState("internship");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchItems();
  }, [user]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error("Error fetching opportunities", err);
      toast({
        title: "Couldn't load opportunities",
        description: "Make sure the opportunities table migration is applied.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to post an opportunity.",
        variant: "destructive",
      });
      return;
    }
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Missing info",
        description: "Title and description are required.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("opportunities").insert({
        title: title.trim(),
        description: description.trim(),
        location: location.trim() || "Remote",
        apply_url: applyUrl.trim() || null,
        role_type: roleType,
        creator_id: user.id,
      });
      if (error) throw error;

      toast({ title: "Posted", description: "Your opportunity is live." });
      setIsPostOpen(false);
      setTitle("");
      setDescription("");
      setLocation("Remote");
      setApplyUrl("");
      setRoleType("internship");
      fetchItems();
    } catch (err) {
      console.error("Error posting opportunity", err);
      toast({
        title: "Could not post",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout
      title="Opportunity Board"
      previousPage={{ name: "Internships", path: "/internships" }}
    >
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Community Opportunities</h2>
          <Dialog open={isPostOpen} onOpenChange={setIsPostOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Post an opportunity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Post an opportunity</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., SWE Intern @ Acme"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea
                    id="desc"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Key details, timing, requirements..."
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Remote / City, State"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="apply">Apply link (optional)</Label>
                  <Input
                    id="apply"
                    value={applyUrl}
                    onChange={(e) => setApplyUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="role_type">Role type</Label>
                  <Input
                    id="role_type"
                    value={roleType}
                    onChange={(e) => setRoleType(e.target.value)}
                    placeholder="internship / newgrad / research"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPostOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={submit} disabled={submitting}>
                  {submitting ? "Posting..." : "Post"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No opportunities yet.</p>
          ) : (
            items.map((item) => (
              <Card key={item.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    {item.title}
                    {item.role_type && (
                      <Badge variant="outline" className="uppercase text-[10px]">
                        {item.role_type}
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {item.location || "Remote"}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {item.description && (
                    <p className="text-sm whitespace-pre-line">{item.description}</p>
                  )}
                  {item.apply_url && (
                    <Button asChild size="sm" variant="secondary">
                      <a href={item.apply_url} target="_blank" rel="noreferrer">
                        Apply
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  );
}
