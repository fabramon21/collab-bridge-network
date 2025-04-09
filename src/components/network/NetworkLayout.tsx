
import { PageLayout } from "@/components/PageLayout";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ReactNode } from "react";

interface NetworkLayoutProps {
  children: ReactNode;
  tableError: string | null;
}

export const NetworkLayout = ({ children, tableError }: NetworkLayoutProps) => {
  return (
    <PageLayout 
      title="Network" 
      previousPage={{ name: "Dashboard", path: "/dashboard" }}
      nextPage={{ name: "Events", path: "/events" }}
    >
      <div className="max-w-6xl mx-auto">
        {tableError ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Not Configured</AlertTitle>
            <AlertDescription>
              {tableError} Please apply the database migration to enable networking functionality.
            </AlertDescription>
          </Alert>
        ) : (
          children
        )}
      </div>
    </PageLayout>
  );
};
