import { Link } from "react-router-dom";

export const FooterNav = () => {
  return (
    <nav className="border-t bg-white">
      <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
        <div className="flex flex-wrap gap-4">
          <Link to="/about" className="hover:text-primary font-medium">
            About
          </Link>
          <Link to="/terms" className="hover:text-primary">
            Terms
          </Link>
          <Link to="/privacy" className="hover:text-primary">
            Privacy
          </Link>
        </div>
        <span className="text-xs text-gray-500">InternConnect · built for interns</span>
      </div>
    </nav>
  );
};
