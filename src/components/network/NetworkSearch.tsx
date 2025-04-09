
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface NetworkSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export const NetworkSearch = ({ searchTerm, setSearchTerm }: NetworkSearchProps) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
      <div className="relative w-full md:w-auto flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search people by name, university, or location..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};
