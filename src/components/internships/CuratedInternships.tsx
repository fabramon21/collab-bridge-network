import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Listing = {
  company_name: string;
  title: string;
  url: string;
  locations?: string[];
  terms?: string[];
  sponsorship?: boolean;
  notes?: string;
  active?: boolean;
};

const SOURCES = [
  {
    label: "Summer 2026 Internships",
    urls: [
      "https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json",
      "https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/main/.github/scripts/listings.json",
    ],
  },
  {
    label: "New Grad Positions",
    urls: [
      "https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/.github/scripts/listings.json",
      "https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/main/.github/scripts/listings.json",
    ],
  },
  {
    label: "Summer 2026 Community",
    urls: [
      "https://raw.githubusercontent.com/summer2026internships/Summer2026-Internships/dev/.github/scripts/listings.json",
      "https://raw.githubusercontent.com/summer2026internships/Summer2026-Internships/main/.github/scripts/listings.json",
    ],
  },
  {
    label: "Summer 2026 Internships (vanshb03)",
    urls: [
      "https://raw.githubusercontent.com/vanshb03/Summer2026-Internships/dev/.github/scripts/listings.json",
      "https://raw.githubusercontent.com/vanshb03/Summer2026-Internships/main/.github/scripts/listings.json",
    ],
  },
];

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

const inferCategory = (title: string) => {
  if (!title) return "Software Engineering";
  const t = title.toLowerCase();
  if (t.includes("data") || t.includes("machine learning") || t.includes("ml") || t.includes("ai"))
    return "AI, Data Science & Machine Learning";
  if (t.includes("product") || t.includes("pm") || t.includes("business"))
    return "Product & Business Analytics";
  if (t.includes("design") || t.includes("ux") || t.includes("ui"))
    return "Design & UI/UX";
  if (t.includes("marketing") || t.includes("growth"))
    return "Marketing & Growth";
  if (t.includes("security") || t.includes("cyber"))
    return "Cybersecurity";
  if (t.includes("quant") || t.includes("trading") || t.includes("finance"))
    return "Finance & Quant";
  if (t.includes("research") || t.includes("bio") || t.includes("biotech"))
    return "Research & Biotech";
  return "Software Engineering";
};

export const CuratedInternships = () => {
  const [listings, setListings] = useState<(Listing & { source: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "intern" | "newgrad">("all");
  const [sponsorshipFilter, setSponsorshipFilter] = useState<"all" | "yes" | "no">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | string>("all");

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const results = await Promise.all(
          SOURCES.map(async (src) => {
            for (const url of src.urls) {
              try {
                const res = await fetch(url, { signal: controller.signal });
                if (!res.ok) throw new Error(`${res.status}`);
                const data = (await res.json()) as Listing[];
                return (data || [])
                  .filter((l) => l.active !== false)
                  .slice(0, 25)
                  .map((l) => ({ ...l, source: src.label }));
              } catch (err) {
                // try next URL
              }
            }
            console.warn(`Skipping source ${src.label} after trying all URLs`);
            return [];
          })
        );

        // Merge, dedupe by company+title+url, and sort newest first by source order
        const merged = results.flat();

        // Drop outdated (2025) listings to keep the feed focused on 2026+
        const without2025 = merged.filter((item) => {
          const t = item.title?.toLowerCase() || "";
          const season = (item as any).season?.toString().toLowerCase() || "";
          const notes = (item.notes || "").toLowerCase();
          const terms = (item.terms || []).join(" ").toLowerCase();
          const url = (item.url || "").toLowerCase();
          const has2025 =
            t.includes("2025") ||
            season.includes("2025") ||
            notes.includes("2025") ||
            terms.includes("2025") ||
            url.includes("2025");
          return !has2025;
        });

        const seen = new Set<string>();
        const unique = without2025.filter((item) => {
          const key = `${item.company_name}|${item.title}|${item.url}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        const sorted = unique.sort((a, b) => {
          const da = Number((a as any).date_updated || (a as any).date_posted || 0);
          const db = Number((b as any).date_updated || (b as any).date_posted || 0);
          return db - da;
        });

        if (unique.length === 0) {
          // Local fallback to avoid empty state when external sources fail (offline/404).
          setListings([
            {
              company_name: "Example Corp",
              title: "Software Engineer Intern",
              url: "#",
              locations: ["Remote"],
              terms: ["Summer 2026"],
              sponsorship: false,
              notes: "Fallback listing shown because external feeds were unreachable.",
              active: true,
              source: "Fallback",
            },
          ]);
        } else {
          setListings(sorted.slice(0, 100)); // show more to include newer feeds
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError(err.message || "Failed to load internships");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-3">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-3">
        {error}. Make sure you have internet access to GitHub raw content.
      </div>
    );
  }

  const filtered = listings.filter((item) => {
    const isNewGrad = item.source.includes("New Grad");
    if (typeFilter === "intern" && isNewGrad) return false;
    if (typeFilter === "newgrad" && !isNewGrad) return false;

    if (sponsorshipFilter === "yes" && !item.sponsorship) return false;
    if (sponsorshipFilter === "no" && item.sponsorship) return false;
    const cat = inferCategory(item.title);
    if (categoryFilter !== "all" && cat !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="grid gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Role type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="intern">Internships</SelectItem>
            <SelectItem value="newgrad">New Grad</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sponsorshipFilter}
          onValueChange={(v: any) => setSponsorshipFilter(v)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sponsorship" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sponsorship</SelectItem>
            <SelectItem value="yes">Offers sponsorship</SelectItem>
            <SelectItem value="no">No sponsorship</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={categoryFilter}
          onValueChange={(v: any) => setCategoryFilter(v)}
        >
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="max-h-[900px] overflow-y-auto pr-1 space-y-3">
        {filtered.map((item, idx) => (
          <Card key={`${item.company_name}-${item.title}-${idx}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex justify-between items-start gap-2">
                <span>{item.company_name}</span>
                <div className="flex flex-wrap gap-1">
                  {item.terms?.map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                  {item.sponsorship && <Badge variant="outline">Sponsorship</Badge>}
                  <Badge variant="outline" className="uppercase text-[10px] tracking-wide">
                    {item.source.includes("New Grad") ? "New Grad" : "Intern"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {inferCategory(item.title)}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.locations?.join(", ") || "Remote / Various"}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>
                  )}
                </div>
                <Button asChild size="sm">
                  <a href={item.url} target="_blank" rel="noreferrer">
                    Apply
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
