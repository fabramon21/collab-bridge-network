
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { FooterNav } from "@/components/FooterNav";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <Hero />
      <Features />
      
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="flex gap-4">
          {user ? (
            <Button 
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
              size="lg"
            >
              Go to Dashboard
              <ChevronRight className="h-5 w-5" />
            </Button>
          ) : (
            <>
              <Button 
                variant="outline"
                onClick={() => navigate("/login")}
                size="lg"
              >
                Log In
              </Button>
              <Button 
                onClick={() => navigate("/signup")}
                className="flex items-center gap-2"
                size="lg"
              >
                Sign Up Now
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>

      <FooterNav />
    </div>
  );
};

export default Index;
