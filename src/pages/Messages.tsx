
import { PageLayout } from "@/components/PageLayout";

export default function Messages() {
  return (
    <PageLayout 
      title="Messages" 
      previousPage={{ name: "Events", path: "/events" }}
      nextPage={{ name: "Profile", path: "/profile" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Messages</h2>
          <p className="text-muted-foreground">
            This feature is coming soon. You'll be able to message other users on the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-medium mb-2">Direct Messages</h3>
            <p className="text-sm text-muted-foreground">
              Send private messages to other users.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-medium mb-2">Group Chats</h3>
            <p className="text-sm text-muted-foreground">
              Create or join group conversations with peers.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-medium mb-2">Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Stay updated on your conversations.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
