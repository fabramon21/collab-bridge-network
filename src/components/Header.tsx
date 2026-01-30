import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from "@/integrations/supabase/client";

export const Header = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifError, setNotifError] = useState<string | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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

  const handleNotificationClick = async (notification: any) => {
    setNotifOpen(false);
    const target = notificationTarget(notification?.type);
    if (notification?.id) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - (notification.is_read ? 0 : 1)));
    }
    navigate(target);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const { data, error, status } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);
        if (error) {
          if (status === 404) {
            setNotifError("Notifications not configured");
            return;
          }
          throw error;
        }
        setNotifications(data || []);
        setUnreadCount((data || []).filter((n) => !n.is_read).length);
      } catch (err) {
        console.error("Error loading notifications", err);
        setNotifError("Notifications not available");
      }
    };
    fetchNotifications();
  }, [user]);

  const openNotifications = async () => {
    setNotifOpen((prev) => !prev);
    if (!notifOpen && notifications.length > 0) {
      // mark all as read
      const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
      if (unreadIds.length > 0) {
        // optimistically clear badge to avoid flicker
        setUnreadCount(0);
        setNotifications((prev) =>
          prev.map((n) => (unreadIds.includes(n.id) ? { ...n, is_read: true } : n))
        );
        // fire-and-forget mark read
        supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
      }
    }
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!notifRef.current) return;
      if (!notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          InternConnect
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-4 items-center">
          {user && (
            <>
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => navigate("/network")}>
                Network
              </Button>
              <Button variant="ghost" onClick={() => navigate("/about")}>
                About
              </Button>
              <Button variant="ghost" onClick={() => navigate("/messages")}>
                Messages
              </Button>
              <div className="relative" ref={notifRef}>
                <Button variant="ghost" className="relative" onClick={openNotifications}>
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border rounded-md shadow-lg z-50">
                    <div className="p-3 border-b font-medium">Notifications</div>
                    <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                    {notifError ? (
                      <p className="text-sm text-gray-500">{notifError}</p>
                    ) : notifications.length === 0 ? (
                      <p className="text-sm text-gray-500">No notifications</p>
                    ) : (
                      notifications.map((n, idx) => (
                        <div
                          key={n.id}
                          className={`w-full text-left text-sm border rounded p-2 flex items-start justify-between cursor-pointer ${
                            n.is_read ? "bg-gray-50" : "bg-blue-50"
                          }`}
                          onClick={() => handleNotificationClick(n)}
                          role="button"
                          tabIndex={0}
                        >
                          <div>
                            <div className="font-medium">{n.content}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(n.created_at).toLocaleString()}
                            </div>
                          </div>
                          <button
                            aria-label="Dismiss notification"
                            className="text-gray-400 hover:text-gray-600 ml-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNotifications((prev) =>
                                prev.filter((item: any) => item.id !== n.id)
                              );
                            }}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                      <AvatarFallback>{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {profile?.university}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t py-4 px-4">
          <div className="flex flex-col space-y-3">
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  className="justify-start" 
                  onClick={() => {
                    navigate("/dashboard");
                    setIsMenuOpen(false);
                  }}
                >
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => {
                    navigate("/network");
                    setIsMenuOpen(false);
                  }}
                >
                  Network
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => {
                    navigate("/about");
                    setIsMenuOpen(false);
                  }}
                >
                  About
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => {
                    navigate("/messages");
                    setIsMenuOpen(false);
                  }}
                >
                  Messages
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => {
                    navigate("/profile");
                    setIsMenuOpen(false);
                  }}
                >
                  Profile
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => {
                    navigate("/about");
                    setIsMenuOpen(false);
                  }}
                >
                  About
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => {
                    navigate("/login");
                    setIsMenuOpen(false);
                  }}
                >
                  Log in
                </Button>
                <Button 
                  className="justify-start"
                  onClick={() => {
                    navigate("/signup");
                    setIsMenuOpen(false);
                  }}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
