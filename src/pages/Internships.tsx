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
import { Checkbox } from "@/components/ui/checkbox";

const CATEGORIES = [
  "Software Engineering",
  "AI, Data Science & Machine Learning",
  "Product & Business Analytics",
  "Design & UI/UX",
  "Marketing & Growth",
  "Cybersecurity",
  "Finance & Quant",
  "Research & Biotech",
];

type Opportunity = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  apply_url: string | null;
  role_type: string | null;
  category: string | null;
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
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [communityItems, setCommunityItems] = useState<Opportunity[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeCats, setSubscribeCats] = useState<string[]>([CATEGORIES[0]]);
  const [subscribeSubmitting, setSubscribeSubmitting] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("internships_subscribe_prompt_seen");
    if (!seen || seen === "0") {
      setSubscribeEmail(user?.email || "");
      setShowSubscribeModal(true);
    }
  }, [user]);

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
      const base = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim() || "Remote",
        apply_url: applyUrl.trim() || null,
        role_type: "internship",
        creator_id: user.id,
      };

      let { data, error } = await supabase
        .from("opportunities")
        .insert({ ...base, category })
        .select()
        .single();

      if (error && typeof error.message === "string" && error.message.toLowerCase().includes("category")) {
        const retry = await supabase.from("opportunities").insert(base).select().single();
        error = retry.error;
        data = retry.data;
      }

      if (error) throw error;

      // Trigger edge function to email subscribers (fire-and-forget)
      if (data) {
        supabase.functions
          .invoke("opportunity-email-public", {
            body: { record: data },
          })
          .catch((fnErr) => console.warn("opportunity-email invoke failed", fnErr));
      }

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
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as any).message
          : "Please try again in a moment.";
      toast({
        title: "Could not post",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSubscribeCat = (value: string) => {
    setSubscribeCats((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  const handleSubscribe = async () => {
    if (!subscribeEmail.trim()) {
      toast({
        title: "Email required",
        description: "Enter an email to get alerts.",
        variant: "destructive",
      });
      return;
    }

    const cats = subscribeCats.length > 0 ? subscribeCats : CATEGORIES;
    setSubscribeSubmitting(true);
    try {
      const { error } = await supabase.from("opportunity_subscriptions").insert({
        user_id: user?.id || null,
        email: subscribeEmail.trim(),
        categories: cats,
      });
      if (error) throw error;
      toast({
        title: "Subscribed",
        description: "We'll email you when new opportunities are posted.",
      });
      localStorage.setItem("internships_subscribe_prompt_seen", "1");
      setShowSubscribeModal(false);
    } catch (err) {
      console.error("Error subscribing", err);
      // Graceful fallback: store locally so we don't block the user
      const localSubsKey = "opportunity_subscriptions_local";
      const existing = JSON.parse(localStorage.getItem(localSubsKey) || "[]");
      const entry = {
        email: subscribeEmail.trim(),
        categories: cats,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(localSubsKey, JSON.stringify([...existing, entry]));
      localStorage.setItem("internships_subscribe_prompt_seen", "1");
      setShowSubscribeModal(false);
      toast({
        title: "Subscribed locally",
        description:
          "We saved your preferences. If email fails, we'll still keep your choices.",
      });
    } finally {
      setSubscribeSubmitting(false);
    }
  };

  return (
    <PageLayout
      title="Internship Opportunities"
      previousPage={{ name: "Dashboard", path: "/dashboard" }}
    >
      <div className="max-w-8xl mx-auto space-y-5 px-1 sm:px-2">
        <div className="grid gap-4 md:[grid-template-columns:480px_minmax(0,1fr)]">
          <Card className="w-full">
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
                    <div className="space-y-1">
                      <Label htmlFor="category">Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
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
                        {item.category && (
                          <Badge variant="outline" className="text-[10px]">
                            {item.category}
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

          <Card className="w-full">
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

      {/* First-time subscription prompt */}
      <Dialog open={showSubscribeModal} onOpenChange={setShowSubscribeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Get email alerts for new opportunities</DialogTitle>
            <DialogDescription>
              Tell us where to reach you and what types you care about.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="sub-email">Email</Label>
              <Input
                id="sub-email"
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CATEGORIES.map((c) => (
                  <label
                    key={c}
                    className="flex items-center gap-2 text-sm border rounded-md p-2 hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={subscribeCats.includes(c)}
                      onCheckedChange={() => toggleSubscribeCat(c)}
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                localStorage.setItem("internships_subscribe_prompt_seen", "1");
                setShowSubscribeModal(false);
              }}
            >
              Not now
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                localStorage.setItem("internships_subscribe_prompt_seen", "never");
                setShowSubscribeModal(false);
              }}
            >
              Don&apos;t ask again
            </Button>
            <Button onClick={handleSubscribe} disabled={subscribeSubmitting}>
              {subscribeSubmitting ? "Subscribing..." : "Subscribe"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default Internships;
