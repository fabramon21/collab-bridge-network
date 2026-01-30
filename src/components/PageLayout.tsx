
import React from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { FooterNav } from "@/components/FooterNav";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  previousPage?: {
    name: string;
    path: string;
  };
  nextPage?: {
    name: string;
    path: string;
  };
}

export const PageLayout = ({
  children,
  title,
  previousPage,
  nextPage,
}: PageLayoutProps) => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
          {children}
          
          <div className="mt-8 flex justify-between items-center pt-4 border-t">
            <div>
              {previousPage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(previousPage.path)}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {previousPage.name}
                </Button>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
            
            <div>
              {nextPage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(nextPage.path)}
                  className="flex items-center gap-2"
                >
                  {nextPage.name}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <FooterNav />
      </div>
    </>
  );
};
