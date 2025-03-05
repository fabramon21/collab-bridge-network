
import { Bell, Users, MessageCircle, Briefcase } from "lucide-react";
import { useState } from "react";

interface Notification {
  id: string;
  type: "connection" | "message" | "opportunity";
  content: string;
  time: string;
  read: boolean;
}

export const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "connection",
      content: "John Smith sent you a connection request",
      time: "2 hours ago",
      read: false
    },
    {
      id: "2",
      type: "message",
      content: "New message from Maria Garcia about housing",
      time: "Yesterday",
      read: false
    },
    {
      id: "3",
      type: "opportunity",
      content: "New internship posting matches your profile",
      time: "2 days ago",
      read: true
    }
  ]);

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === notificationId ? { ...notification, read: true } : notification
    ));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "connection": return <Users className="h-5 w-5 text-blue-500" />;
      case "message": return <MessageCircle className="h-5 w-5 text-green-500" />;
      case "opportunity": return <Briefcase className="h-5 w-5 text-purple-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
        <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
          {notifications.filter(n => !n.read).length} new
        </span>
      </div>
      
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`p-3 rounded-md ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-blue-500'}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex">
                <div className="mr-3 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div>
                  <p className={`${notification.read ? 'text-gray-700' : 'font-medium text-gray-900'}`}>
                    {notification.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No notifications yet</p>
        )}
      </div>
    </div>
  );
};
