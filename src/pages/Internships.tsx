import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/PageLayout";
import { CuratedInternships } from "@/components/internships/CuratedInternships";
import { Megaphone, Newspaper } from "lucide-react";

const Internships = () => {
  const navigate = useNavigate();

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
              <Button onClick={() => navigate("/events")}>Open board</Button>
              <Button variant="outline" onClick={() => navigate("/events")}>
                Post an opportunity
              </Button>
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
