import { PageLayout } from "@/components/PageLayout";
import { HousingListings } from "@/components/housing/HousingListings";
import { RoommatePreferences } from "@/components/housing/RoommatePreferences";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

const HousingPage = () => {
  return (
    <PageLayout title="Housing & Roommates">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-2">What are you looking for?</h2>
          <p className="text-sm text-muted-foreground">
            Start by sharing who you’d like to live with. You can always switch to browsing housing listings.
          </p>
        </Card>

        <Tabs defaultValue="roommates" className="w-full">
          <TabsList>
            <TabsTrigger value="roommates">Find a roommate</TabsTrigger>
            <TabsTrigger value="listings">Browse housing</TabsTrigger>
          </TabsList>

          <TabsContent value="roommates" className="mt-4">
            <RoommatePreferences />
          </TabsContent>

          <TabsContent value="listings" className="mt-6">
            <HousingListings />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default HousingPage;
