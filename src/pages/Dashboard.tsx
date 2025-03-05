
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Users, Home, Briefcase, PlusCircle } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session) {
          navigate("/login");
          return;
        }
        
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.session.user.id)
          .single();
          
        if (error) throw error;
        
        setProfile(data);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading profile",
          description: error.message || "Something went wrong",
        });
      } finally {
        setLoading(false);
      }
    };
    
    getProfile();
  }, [navigate, toast]);

  const dashboardItems = [
    {
      title: "Connect with Peers",
      description: "Find and connect with other interns at your school or company",
      icon: Users,
      action: "Browse Connections",
      color: "bg-blue-100"
    },
    {
      title: "Join Discussions",
      description: "Participate in group conversations about internships and career topics",
      icon: MessageCircle,
      action: "View Discussions",
      color: "bg-green-100"
    },
    {
      title: "Housing Options",
      description: "Find roommates or housing options near your internship location",
      icon: Home,
      action: "Explore Housing",
      color: "bg-purple-100"
    },
    {
      title: "Internship Opportunities",
      description: "Discover new internship openings and career opportunities",
      icon: Briefcase,
      action: "Browse Opportunities",
      color: "bg-orange-100"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {profile?.full_name}</h1>
          <p className="text-gray-600 mt-2">{profile?.school}</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Get Started</h2>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              <span>Create Post</span>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardItems.map((item, index) => (
              <Card key={index} className="border border-gray-200 transition-all hover:shadow-md">
                <CardHeader className={`${item.color} rounded-t-lg`}>
                  <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">{item.action}</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Complete Your Profile</h2>
          <div className="flex flex-col space-y-4">
            <div className="bg-gray-50 rounded-md p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">Add a profile picture</p>
                <p className="text-sm text-gray-500">Help others recognize you</p>
              </div>
              <Button variant="outline" size="sm">Upload</Button>
            </div>
            <div className="bg-gray-50 rounded-md p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">Add your skills</p>
                <p className="text-sm text-gray-500">Highlight what you're good at</p>
              </div>
              <Button variant="outline" size="sm">Add Skills</Button>
            </div>
            <div className="bg-gray-50 rounded-md p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">Share your interests</p>
                <p className="text-sm text-gray-500">Connect with like-minded peers</p>
              </div>
              <Button variant="outline" size="sm">Add Interests</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
