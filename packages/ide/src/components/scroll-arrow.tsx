import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

interface ScrollArrowProps {
  show: boolean;
  onClick?: () => void;
}

export function ScrollArrow({ show, onClick }: ScrollArrowProps) {
  const [isVisible, setIsVisible] = useState(show);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setIsVisible(show);
    if (show) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible && scrollY <= 700) return null;

  const showArrowUp = scrollY > 700;

  return (
    <div
      onClick={onClick}
      className="fixed border right-8 bottom-10 z-100 cursor-pointer group animate-bounce-down bg-white/90 dark:bg-neutral-900/30 border-neutral-200 dark:border-neutral-700 backdrop-blur-xs px-3 py-3 rounded-full shadow-lg transition-opacity duration-1000"
    >
      {showArrowUp ? (
        <ArrowUp className="w-6 h-6 group-hover:text-(--color-primary) transition-colors" />
      ) : (
        <ArrowDown className="w-6 h-6 group-hover:text-(--color-primary) transition-colors" />
      )}
    </div>
  );
}
