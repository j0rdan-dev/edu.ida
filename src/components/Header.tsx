import { Link, useLocation, useNavigate } from "react-router-dom";
import { Gamepad2, Home, Info } from "lucide-react";
import { GAMES_PATH } from "@/data/educationalGames";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isGamesPage = `${location.pathname.replace(/\/+$/, "")}/`.startsWith(GAMES_PATH);

  const handleHomeClick = () => {
    navigate("/", {
      state: {
        homeResetToken: Date.now(),
      },
    });
  };

  return (
    <header className="site-header border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
          <span className="text-primary">EDU.IDA</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3" aria-label="Главна навигација">
          <button
            type="button"
            aria-label="Почетна"
            onClick={handleHomeClick}
            className={`flex min-h-11 items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 ${
              location.pathname === "/"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-foreground"
            }`}
          >
            <Home className="h-4 w-4" />
            <span className="hidden text-sm font-medium sm:inline">Почетна</span>
          </button>
          <Link to={GAMES_PATH} aria-current={isGamesPage ? "page" : undefined}
            className={`flex min-h-11 items-center gap-1.5 rounded-lg px-3 py-2 transition-all duration-200 ${isGamesPage ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"}`}>
            <Gamepad2 className="h-4 w-4" aria-hidden="true" /><span className="text-sm font-medium">Игри</span>
          </Link>
          <Link
            to="/about"
            aria-label="За нас"
            className={`flex min-h-11 items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 ${
              location.pathname.replace(/\/+$/, "") === "/about"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-foreground"
            }`}
          >
            <Info className="h-4 w-4" />
            <span className="hidden text-sm font-medium min-[400px]:inline">За нас</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
