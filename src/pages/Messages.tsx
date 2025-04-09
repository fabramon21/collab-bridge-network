
import { PageLayout } from "@/components/PageLayout";
import { MessagesPanel } from "@/components/messages/MessagesPanel";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Messages() {
  const [tableError, setTableError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if the messages table exists
    const checkMessagesTable = async () => {
      try {
        const { error } = await supabase
          .from('messages')
          .select('id')
          .limit(1);

        if (error) {
          if (error.message.includes('relation') && error.message.includes('does not exist')) {
            setTableError('The messages feature is not fully set up yet. Please apply the database migrations first.');
          } else {
            toast({
              title: 'Error',
              description: 'Failed to connect to the messages database',
              variant: 'destructive',
            });
          }
        }
      } catch (error) {
        console.error('Error checking messages table:', error);
      }
    };

    checkMessagesTable();
  }, [toast]);

  return (
    <PageLayout 
      title="Messages" 
      previousPage={{ name: "Events", path: "/events" }}
      nextPage={{ name: "Profile", path: "/profile" }}
    >
      <div className="max-w-6xl mx-auto">
        {tableError ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Not Configured</AlertTitle>
            <AlertDescription>
              {tableError} Please apply the database migration to enable messaging functionality.
            </AlertDescription>
          </Alert>
        ) : (
          <MessagesPanel />
        )}
      </div>
    </PageLayout>
  );
}
