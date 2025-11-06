import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { Zap, User, LogOut, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

interface AutoHideHeaderProps {
  userEmail: string;
  onLogout: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
  backLabel?: string;
}

export function AutoHideHeader({
  userEmail,
  onLogout,
  showBackButton = false,
  onBackClick,
  backLabel = "Dashboard",
}: AutoHideHeaderProps) {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleScroll = () => {
      // Clear existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Debounce scroll handling
      scrollTimeout.current = setTimeout(() => {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY.current;

        // Only hide after scrolling past 80px
        if (currentScrollY < 80) {
          setIsHidden(false);
        } else {
          // Scrolling down
          if (scrollDelta > 0 && currentScrollY > lastScrollY.current) {
            setIsHidden(true);
          }
          // Scrolling up
          else if (scrollDelta < 0) {
            setIsHidden(false);
          }
        }

        lastScrollY.current = currentScrollY;
      }, 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 w-full glass-strong z-50 border-b border-neutral-border header-transition ${
          isHidden ? "header--hidden" : ""
        }`}
        style={{ height: "64px" }}
      >
        {/* Light mode gradient overlay */}
        <div className="absolute inset-0 header-gradient-light dark:hidden" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center gap-4">
              {showBackButton && onBackClick && (
                <Button
                  variant="ghost"
                  onClick={onBackClick}
                  className="hover:bg-primary/10 hover:text-primary btn-hover-lift focus-ring h-11 min-w-[44px]"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {backLabel}
                </Button>
              )}
              <div className="flex items-center gap-3">
                <div className="bg-slate-800 dark:bg-slate-700 p-2 rounded-xl border border-primary/30">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="text-lg text-text-primary">TenderAI</span>
                  <span className="text-xs text-primary ml-2">Neo-Tech</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="flex items-center gap-2 text-text-secondary">
                <User className="h-4 w-4" />
                <span className="text-sm">{userEmail}</span>
              </div>
              <Button
                variant="ghost"
                onClick={onLogout}
                className="hover:bg-primary/10 hover:text-primary btn-hover-lift focus-ring h-11 min-w-[44px]"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Spacer to prevent content jump */}
      <div style={{ height: "64px" }} />
      
      {/* Subtle shadow when header is hidden */}
      {isHidden && (
        <div className="fixed top-0 w-full h-px bg-neutral-border z-40 shadow-sm" />
      )}
    </>
  );
}
