
import { Bell, Users, MessageCircle, Briefcase, Home, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface Notification {
  id: string;
  type: string;
  content: string;
  created_at: string;
  is_read: boolean;
  related_id: string | null;
}

export const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [notConfigured, setNotConfigured] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  // Default to enabled; only disable if explicitly set to "false"
  const notificationsEnabled =
    import.meta.env.VITE_ENABLE_NOTIFICATIONS !== "false";

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      try {
        const { data, error, status } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (error) {
          // Treat missing table as "not configured" across possible PostgREST codes/statuses
          const code = (error as any)?.code;
          if (status === 404 || code === 'PGRST205' || code === 'PGRST116') {
            setNotConfigured(true);
            setNotifications([]);
            return;
          }
          throw error;
        }
        
        setNotifications(data || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Subscribe to realtime notifications only if the table exists
    if (notConfigured) return;
    if (!notificationsEnabled) return;

    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user?.id}` 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setNotifications(prev => 
            prev.map(notification => 
              notification.id === payload.new.id ? payload.new as Notification : notification
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setNotifications(prev => 
            prev.filter(notification => notification.id !== payload.old.id)
          );
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, notConfigured]);

  const markAsRead = async (notificationId: string) => {
    if (!notificationsEnabled || notConfigured) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
        
      if (error) throw error;
      
      setNotifications(notifications.map(notification => 
        notification.id === notificationId ? { ...notification, is_read: true } : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "connection_request": return <Users className="h-5 w-5 text-blue-500" />;
      case "message": return <MessageCircle className="h-5 w-5 text-green-500" />;
      case "internship": return <Briefcase className="h-5 w-5 text-purple-500" />;
      case "housing": return <Home className="h-5 w-5 text-orange-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const notificationTarget = (type?: string) => {
    switch (type) {
      case "message":
      case "housing_contact":
        return "/messages";
      case "connection_request":
      case "connection_accepted":
        return "/network";
      case "internship":
        return "/internships";
      default:
        return "/dashboard";
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    const target = notificationTarget(notification?.type);
    await markAsRead(notification.id);
    navigate(target);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
        <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
          {notifications.filter(n => !n.is_read).length} new
        </span>
      </div>
      
      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="p-3 rounded-md bg-gray-50 animate-pulse">
              <div className="flex">
                <Skeleton className="h-8 w-8 rounded-full mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            </div>
          ))
        ) : notConfigured ? (
          <div className="text-center py-4 space-y-2">
            <p className="text-gray-600 font-medium">
              Notifications table not found.
            </p>
            <p className="text-gray-500 text-sm">
              Run <code className="bg-gray-100 px-1 rounded">supabase db push</code> and restart the app to enable notifications.
            </p>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`p-3 rounded-md cursor-pointer ${notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-blue-500'}`}
              onClick={() => handleNotificationClick(notification)}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">{getIcon(notification.type)}</div>
                <div className="flex-1">
                  <p className={`${notification.is_read ? 'text-gray-700' : 'font-medium text-gray-900'}`}>
                    {notification.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(notification.created_at)}</p>
                </div>
                <button
                  aria-label="Dismiss notification"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    markAsRead(notification.id);
                    setNotifications(prev => prev.filter(n => n.id !== notification.id));
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
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
