import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/PageLayout";
import { CuratedInternships } from "@/components/internships/CuratedInternships";
import { Megaphone, Newspaper } from "lucide-react";
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
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Internships = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [isPostOpen, setIsPostOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Remote");
  const [applyUrl, setApplyUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
        description: "Your opportunity is live on the board.",
      });
      setIsPostOpen(false);
      setTitle("");
      setDescription("");
      setLocation("Remote");
      setApplyUrl("");
      navigate("/events");
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
          <Card>
            <CardHeader className="flex flex-row items-start gap-3">
              <Megaphone className="h-6 w-6 text-primary mt-1" />
              <div>
                <CardTitle>Community Board</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Peers can post internships, research gigs, or opportunities they find.
                </p>
              </div>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button onClick={() => navigate("/opportunities")}>Open board</Button>
              <Dialog open={isPostOpen} onOpenChange={setIsPostOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Post an opportunity</Button>
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
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsPostOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                      {submitting ? "Posting..." : "Post to board"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start gap-3">
              <Newspaper className="h-6 w-6 text-primary mt-1" />
              <div>
                <CardTitle>Curated Feed</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Live from Simplify’s Summer 2026 internship tracker. Updated automatically.
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
