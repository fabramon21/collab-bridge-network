import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/PageLayout";
import { CuratedInternships } from "@/components/internships/CuratedInternships";
import { Megaphone, Newspaper, PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type Opportunity = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  apply_url: string | null;
  role_type: string | null;
  created_at: string;
};

const Internships = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [isPostOpen, setIsPostOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Remote");
  const [applyUrl, setApplyUrl] = useState("");
  const [roleType, setRoleType] = useState("internship");
  const [submitting, setSubmitting] = useState(false);
  const [communityItems, setCommunityItems] = useState<Opportunity[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(true);

  const fetchCommunity = async () => {
    setLoadingCommunity(true);
    try {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCommunityItems(data || []);
    } catch (err) {
      console.error("Error loading community opportunities", err);
    } finally {
      setLoadingCommunity(false);
    }
  };

  useEffect(() => {
    if (user) fetchCommunity();
  }, [user]);

  const handleSubmit = async () => {
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
      const body = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim() || "Remote",
        apply_url: applyUrl.trim() || null,
        role_type: "internship",
        creator_id: user.id,
      };

      const { error } = await supabase.from("opportunities").insert(body);
      if (error) throw error;

      toast({
        title: "Posted",
        description: "Your opportunity is live.",
      });
      setIsPostOpen(false);
      setTitle("");
      setDescription("");
      setLocation("Remote");
      setApplyUrl("");
      setRoleType("internship");
      fetchCommunity();
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
      title="Internship Opportunities"
      previousPage={{ name: "Dashboard", path: "/dashboard" }}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-start gap-3">
              <Megaphone className="h-6 w-6 text-primary mt-1" />
              <div>
                <CardTitle>Community Board</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Peers can post internships, research gigs, or opportunities they find.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Dialog open={isPostOpen} onOpenChange={setIsPostOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Post an opportunity
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Post an opportunity</DialogTitle>
                    <DialogDescription>
                      Share internships, research gigs, or new grad roles with the community.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Software Engineer Intern @ Acme"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="desc">Description</Label>
                      <Textarea
                        id="desc"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Key details, timeline, what they're looking for..."
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
                      <Select value={roleType} onValueChange={setRoleType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="newgrad">New Grad</SelectItem>
                          <SelectItem value="research">Research</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPostOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                      {submitting ? "Posting..." : "Post"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="space-y-2 max-h-[900px] overflow-y-auto pr-1">
                {loadingCommunity ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : communityItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No opportunities yet.</p>
                ) : (
                  communityItems.map((item) => (
                    <Card key={item.id} className="border border-muted">
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
                          {item.location || "Remote"} • {new Date(item.created_at).toLocaleDateString()}
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start gap-3">
              <Newspaper className="h-6 w-6 text-primary mt-1" />
              <div>
                <CardTitle>Curated Feed</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Handpicked openings from multiple sources, refreshed regularly.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <CuratedInternships />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Internships;
