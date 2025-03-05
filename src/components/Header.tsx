
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Menu, X } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // This would normally use authentication state
  const [isLoggedIn] = useState(true);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          InternConnect
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-4 items-center">
          {isLoggedIn ? (
            <>
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => navigate("/messages")}>
                Messages
              </Button>
              <Button variant="ghost" onClick={() => navigate("/network")}>
                Network
              </Button>
              <Button variant="ghost" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </Button>
              <Avatar className="h-8 w-8 cursor-pointer" onClick={() => navigate("/profile")}>
                <AvatarFallback>DU</AvatarFallback>
              </Avatar>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Log in
              </Button>
              <Button onClick={() => navigate("/signup")}>Sign up</Button>
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
            {isLoggedIn ? (
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
