import { Users, Building2, CalendarDays, GraduationCap } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Network with Peers",
      description:
        "Connect with other interns in your area or industry. Build your professional network early in your career.",
    },
    {
      icon: <Building2 className="h-6 w-6 text-primary" />,
      title: "Find Housing",
      description:
        "Looking for housing during your internship? Find compatible roommates among fellow interns in your area.",
    },
    {
      icon: <CalendarDays className="h-6 w-6 text-primary" />,
      title: "Join Events",
      description:
        "Participate in social events, professional meetups, and networking opportunities with other interns.",
    },
    {
      icon: <GraduationCap className="h-6 w-6 text-primary" />,
      title: "Career Growth",
      description:
        "Share experiences, learn from peers, and get advice from other interns in your field of study.",
    },
  ];

  return (
    <div className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-lg font-semibold text-primary">Features</h2>
          <p className="mt-2 text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to succeed
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Our platform provides all the tools you need to make meaningful connections and find opportunities during your internship.
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="relative">
                <div>
                  <div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                    {feature.icon}
                  </div>
                  <p className="ml-16 text-lg font-medium leading-6 text-gray-900">
                    {feature.title}
                  </p>
                </div>
                <div className="mt-2 ml-16 text-base text-gray-500">
                  {feature.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}