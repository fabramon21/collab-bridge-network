import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">InternConnect</Link>
        <div className="space-x-4">
          <Button variant="ghost">Log in</Button>
          <Button>Sign up</Button>
        </div>
      </div>
    </header>
  );
};