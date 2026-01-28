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

const SOURCE_URL =
  "https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json";

export const CuratedInternships = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const res = await fetch(SOURCE_URL, { signal: controller.signal });
        if (!res.ok) throw new Error(`GitHub fetch failed (${res.status})`);
        const data = (await res.json()) as Listing[];

        const filtered = (data || [])
          .filter((l) => l.active !== false) // default true
          .slice(0, 25); // keep it lean

        setListings(filtered);
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
