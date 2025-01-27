import { Laptop, Users, MessageCircle, Home } from "lucide-react";

const features = [
  {
    name: 'Connect with peers',
    description: 'Find and connect with other interns in your city or company.',
    icon: Users,
  },
  {
    name: 'Group discussions',
    description: 'Join topic-based groups to discuss shared interests and experiences.',
    icon: MessageCircle,
  },
  {
    name: 'Find housing',
    description: 'Looking for roommates? Connect with other interns seeking housing.',
    icon: Home,
  },
  {
    name: 'Career growth',
    description: 'Share experiences and learn from other interns in your field.',
    icon: Laptop,
  },
];

export const Features = () => {
  return (
    <div className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-lg font-semibold text-primary">Features</h2>
          <p className="mt-2 text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to connect
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Our platform provides all the tools you need to make meaningful connections during your internship.
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-lg font-medium text-gray-900">{feature.name}</h3>
                  <p className="mt-2 text-center text-base text-gray-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};