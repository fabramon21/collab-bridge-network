import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FooterNav } from "@/components/FooterNav";

const founders = [
  { name: "Fabrizzio Ramon", role: "Co-Founder" },
  { name: "Jana Abedeljaber", role: "Co-Founder" },
  { name: "Dieynbou Diallo", role: "Co-Founder" },
];

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 w-full">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-primary/70 font-semibold">
            About
          </p>
          <h1 className="text-4xl font-bold text-gray-900">
            InternConnect was built to fix the internship scramble we lived through.
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed max-w-3xl">
            As students, every recruiting cycle meant 100+ applications, juggling housing leads,
            and trying to meet people in a new city before day one. We kept spreadsheets for
            roles, group chats for housing, and DMs for community—nothing was connected.
            InternConnect is the single place we wanted back then.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">What felt broken</h2>
            <ul className="space-y-3 text-gray-700 leading-relaxed">
              <li>No single place to find internships that fit you and your timeline.</li>
              <li>Hard to meet the other interns heading to the same city or company.</li>
              <li>Housing and roommate searches scattered across spreadsheets and DMs.</li>
            </ul>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">What we’re building</h2>
            <ul className="space-y-3 text-gray-700 leading-relaxed">
              <li>Curated opportunities matched to students, not just companies.</li>
              <li>Warm intros to peers so you land with a network on day one.</li>
              <li>Housing tools that make finding roommates and safe places simpler.</li>
            </ul>
          </div>
        </section>

        <section className="bg-white shadow-sm rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Principles we won’t trade</h2>
          <ul className="space-y-3 text-gray-700 leading-relaxed">
            <li>Candidate-first: we design for students before we design for companies.</li>
            <li>Transparency: clear info on opportunities, expectations, and safety.</li>
            <li>Community over clicks: tools that create real connections, not noise.</li>
          </ul>
        </section>

        <section className="bg-white shadow-sm rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Who’s building</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {founders.map((founder) => (
              <div
                key={founder.name}
                className="border rounded-lg p-4 bg-gray-50 text-center space-y-2"
              >
                <p className="text-base font-semibold text-gray-900">{founder.name}</p>
                <p className="text-sm text-gray-600">{founder.role}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-700 leading-relaxed">
            We’re building InternConnect so every student can navigate internships with
            confidence, community, and a place to stay.
          </p>
        </section>

        <section className="bg-white shadow-sm rounded-lg p-6 space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">Where we’re heading</h2>
          <p className="text-gray-700 leading-relaxed">
            Today, students use InternConnect to line up housing, find peers, and stay organized.
            Tomorrow, we want every intern to arrive with a network, a plan, and a place to live.
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/signup">Join the community</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/network">See who’s around</Link>
          </Button>
        </div>
      </div>
      <FooterNav />
    </div>
  );
};

export default About;
