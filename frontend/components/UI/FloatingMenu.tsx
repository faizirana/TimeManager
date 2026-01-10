import React, { useState, useRef, useEffect } from "react";

interface FloatingMenuProps {
  menuItems: { label: string; onClick: () => void; color?: string }[];
  buttonContent: React.ReactNode;
  direction?: "top" | "right" | "bottom" | "left";
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({
  menuItems,
  buttonContent,
  direction = "right",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        onClick={toggleMenu}
        className={`focus:outline-none w-full ${menuItems.length > 0 ? "cursor-pointer" : ""}`}
      >
        {buttonContent}
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            direction === "top"
              ? "bottom-full mb-2"
              : direction === "right"
                ? "left-full bottom-0 ml-2"
                : direction === "bottom"
                  ? "top-full mt-2"
                  : "right-full bottom-0 mr-2"
          } w-48 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded shadow-lg z-10`}
        >
          <ul className="py-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  className={`${item.color ?? "text-zinc-950 dark:text-white"} block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 focus:outline-none`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FloatingMenu;
