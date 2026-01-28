// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Users,
  Home,
  Briefcase,
  PlusCircle,
  Search,
  Activity,
  User,
  Clock,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { FeatureCard } from "@/components/dashboard/FeatureCard";
import { ProfileTasks } from "@/components/dashboard/ProfileTasks";
import { NotificationsPanel } from "@/components/dashboard/NotificationsPanel";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { PageLayout } from "@/components/PageLayout";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [newConnectionsCount, setNewConnectionsCount] = useState<number | null>(null);
  const [activeDiscussionsCount, setActiveDiscussionsCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      setNewConnectionsCount(null);
      return;
    }

    const fetchNewConnections = async () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      try {
        const { data, error } = await supabase
          .from("connections")
          .select("id, status, sender_id, recipient_id, updated_at, created_at")
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .eq("status", "accepted")
          .gte("updated_at", oneWeekAgo.toISOString());

        if (error) throw error;

        setNewConnectionsCount((data || []).length);
      } catch (err) {
        console.error("Error fetching new connections count", err);
        setNewConnectionsCount(null);
        toast({
          title: "Couldn't load connections",
          description: "We couldn't update your new connections stat.",
          variant: "destructive",
        });
      }
    };

    fetchNewConnections();
  }, [user, toast]);

  useEffect(() => {
    const fetchActiveDiscussions = async () => {
      if (!user) {
        setActiveDiscussionsCount(null);
        return;
      }

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      try {
        const { data, error } = await supabase
          .from("messages")
          .select("sender_id, recipient_id, created_at")
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .gte("created_at", oneWeekAgo.toISOString());

        if (error) throw error;

        const partners = new Set<string>();
        (data || []).forEach((msg) => {
          const other =
            msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
          partners.add(other);
        });

        setActiveDiscussionsCount(partners.size);
      } catch (err) {
        console.error("Error fetching active discussions count", err);
        setActiveDiscussionsCount(null);
      }
    };

    fetchActiveDiscussions();
  }, [user]);

  // Statistics data (placeholder counts until analytics are wired)
  const stats = [
    {
      title: "Profile Views",
      value: "—",
      icon: User,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Discussions",
      value: activeDiscussionsCount !== null ? activeDiscussionsCount : "—",
      icon: MessageCircle,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      title: "Upcoming Deadlines",
      value: "—",
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-100",
    },
    {
      title: "New Connections",
      icon: Heart,
      color: "text-rose-500",
      bgColor: "bg-rose-100",
      value: newConnectionsCount !== null ? newConnectionsCount : "—",
    },
  ];

  const dashboardItems = [
    {
      title: "Connect with Peers",
      description:
        "Find and connect with other interns at your school or company",
      icon: Users,
      action: "Browse Connections",
      color: "bg-blue-100",
      onClick: () => navigate("/network"),
    },
    {
      title: "Join Discussions",
      description:
        "Participate in group conversations about internships and career topics",
      icon: MessageCircle,
      action: "View Discussions",
      color: "bg-green-100",
      onClick: () => navigate("/discussions"),
    },
    {
      title: "Housing Options",
      description:
        "Find roommates or housing options near your internship location",
      icon: Home,
      action: "Explore Housing",
      color: "bg-purple-100",
      onClick: () => navigate("/housing"),
    },
    {
      title: "Internship Opportunities",
      description:
        "Discover new internship openings and career opportunities",
      icon: Briefcase,
      action: "Browse Opportunities",
      color: "bg-orange-100",
      onClick: () => navigate("/internships"),
    },
  ];

  const handleCreatePost = () => navigate("/messages");
  const handleSearch = () => navigate("/network");

  const dashboardContent = (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-2 rounded-full`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ProfileCard />
        </div>
        <div>
          <NotificationsPanel />
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Get Started</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardItems.map((item, index) => (
            <FeatureCard
              key={index}
              title={item.title}
              description={item.description}
              icon={item.icon}
              action={item.action}
              color={item.color}
              onClick={item.onClick}
            />
          ))}
        </div>
      </div>

      <div className="mb-8">
        <ProfileTasks />
      </div>
    </>
  );

  return (
    <PageLayout
      title="Dashboard"
      nextPage={{ name: "Network", path: "/network" }}
    >
      <div className="max-w-7xl mx-auto">{dashboardContent}</div>
    </PageLayout>
  );
};

export default Dashboard;
