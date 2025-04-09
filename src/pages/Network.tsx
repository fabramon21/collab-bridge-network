
import { PageLayout } from "@/components/PageLayout";

export default function Network() {
  return (
    <PageLayout 
      title="Network" 
      previousPage={{ name: "Dashboard", path: "/dashboard" }}
      nextPage={{ name: "Events", path: "/events" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Connect with Peers</h2>
          <p className="text-muted-foreground">
            This feature is coming soon. You'll be able to find and connect with other interns and students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-medium mb-2">Find by University</h3>
            <p className="text-sm text-muted-foreground">
              Connect with students from your university or others.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-medium mb-2">Find by Company</h3>
            <p className="text-sm text-muted-foreground">
              Connect with interns at the same companies you're interested in.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-medium mb-2">Find by Location</h3>
            <p className="text-sm text-muted-foreground">
              Connect with people in your area or where you plan to intern.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
