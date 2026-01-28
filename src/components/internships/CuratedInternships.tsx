import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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
    url: "https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json",
  },
  {
    label: "New Grad Positions",
    url: "https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/.github/scripts/listings.json",
  },
];

export const CuratedInternships = () => {
  const [listings, setListings] = useState<(Listing & { source: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const results = await Promise.all(
          SOURCES.map(async (src) => {
            const res = await fetch(src.url, { signal: controller.signal });
            if (!res.ok)
              throw new Error(`${src.label} fetch failed (${res.status})`);
            const data = (await res.json()) as Listing[];
            return (data || [])
              .filter((l) => l.active !== false)
              .map((l) => ({ ...l, source: src.label }));
          })
        );

        // Merge, dedupe by company+title+url, and sort newest first by source order
        const merged = results.flat();
        const seen = new Set<string>();
        const unique = merged.filter((item) => {
          const key = `${item.company_name}|${item.title}|${item.url}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setListings(unique.slice(0, 50)); // keep it lean
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

  return (
    <div className="grid gap-3">
      {listings.map((item, idx) => (
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
  );
};
