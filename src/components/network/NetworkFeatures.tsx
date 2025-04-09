
import { Building2, MapPin, School } from "lucide-react";

export const NetworkFeatures = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="font-medium mb-2 flex items-center">
          <School className="h-5 w-5 mr-2" />
          Find by University
        </h3>
        <p className="text-sm text-muted-foreground">
          Connect with students from your university or others.
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="font-medium mb-2 flex items-center">
          <Building2 className="h-5 w-5 mr-2" />
          Find by Company
        </h3>
        <p className="text-sm text-muted-foreground">
          Connect with interns at the same companies you're interested in.
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="font-medium mb-2 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Find by Location
        </h3>
        <p className="text-sm text-muted-foreground">
          Connect with people in your area or where you plan to intern.
        </p>
      </div>
    </div>
  );
};
