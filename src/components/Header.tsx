import { Link, useLocation } from "react-router-dom";
import { Home, Info } from "lucide-react";

const Header = () => {
  const location = useLocation();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
          <span className="text-primary">EDU.IDA</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 ${
              location.pathname === "/"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-foreground"
            }`}
          >
            <Home className="h-4 w-4" />
            <span className="text-sm font-medium">Почетна</span>
          </Link>
          <Link
            to="/about"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 ${
              location.pathname === "/about"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-foreground"
            }`}
          >
            <Info className="h-4 w-4" />
            <span className="text-sm font-medium">За нас</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
