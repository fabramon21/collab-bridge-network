
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setLoading(false);
      
      // Listen for auth changes
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user || null);
        }
      );
      
      return () => {
        authListener.subscription.unsubscribe();
      };
    };
    
    checkUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    }
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          InternConnect
        </Link>
        <div className="space-x-4">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                    Dashboard
                  </Button>
                  <span className="text-sm font-medium text-gray-700">
                    {user.email}
                  </span>
                  <Button variant="outline" onClick={handleSignOut}>
                    Sign out
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate("/login")}>
                    Log in
                  </Button>
                  <Button onClick={() => navigate("/signup")}>Sign up</Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
