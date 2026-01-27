// src/components/dashboard/FeatureCard.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action: string;
  color: string;
  onClick?: () => void;
}

export const FeatureCard = ({
  title,
  description,
  icon: Icon,
  action,
  color,
  onClick,
}: FeatureCardProps) => {
  return (
    <Card className="border border-gray-200 transition-all hover:shadow-md h-full flex flex-col">
      <CardHeader className={`${color} rounded-t-lg`}>
        <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="pt-6 flex-grow">
        <CardTitle className="text-lg mb-2">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onClick}>
          {action}
        </Button>
      </CardFooter>
    </Card>
  );
};
