"use client";

import { ReactNode, useState } from "react";

export interface VerticalTabNavItem {
  tab: string;
  labelKey: string;
  icon: ReactNode;
}

interface Props {
  items: VerticalTabNavItem[];
  activeTab: string;
  onSelect: (tab: string) => void;
  t: (key: string) => string;
}

interface ScrollHint {
  left: boolean;
  right: boolean;
}

export default function VerticalTabNav({
  items,
  activeTab,
  onSelect,
  t,
}: Props) {
  const [scrollHint, setScrollHint] = useState<ScrollHint>({
    left: false,
    right: false,
  });

  const updateScrollHint = (el: HTMLElement) => {
    const next: ScrollHint = {
      left: el.scrollLeft > 1,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    };

    // The ref callback below re-runs on every render (its identity changes
    // each time), so bail out with the same object when nothing changed —
    // otherwise a fresh object every render defeats React's Object.is bailout
    // and this loops forever ("Maximum update depth exceeded").
    setScrollHint((prev) =>
      prev.left === next.left && prev.right === next.right ? prev : next
    );
  };

  return (
    <div className="relative sm:w-40 shrink-0">
      {/* Desktop left rail, mobile top bar */}
      <nav
        ref={(node) => {
          if (node) updateScrollHint(node);
        }}
        onScroll={(e) => updateScrollHint(e.currentTarget)}
        className="flex flex-row sm:flex-col border-b sm:border-b-0 sm:border-r border-zinc-200 dark:border-zinc-800 overflow-x-auto sm:overflow-x-visible scrollbar"
      >
        {items.map(({ tab, labelKey, icon }) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onSelect(tab)}
              className={[
                "flex items-center gap-2 px-3 py-2.5 text-sm whitespace-nowrap sm:whitespace-normal transition-colors shrink-0 sm:w-full text-left",
                "border-b-2 sm:border-b-0 sm:border-l-2",
                isActive
                  ? "border-brand-violet-500 dark:border-brand-violet-400 text-brand-violet-700 dark:text-brand-violet-300 bg-brand-violet-50 dark:bg-brand-violet-950"
                  : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800",
              ].join(" ")}
            >
              <span className="shrink-0">{icon}</span>
              <span>{t(labelKey)}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile-only scroll affordance — the shared `.scrollbar` utility only
          reveals its thumb on hover, which touch devices never trigger, so
          without this there's no cue that more tabs sit off-screen. */}
      {scrollHint.left && (
        <div className="sm:hidden pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white dark:from-brand-950 to-transparent" />
      )}
      {scrollHint.right && (
        <div className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white dark:from-brand-950 to-transparent" />
      )}
    </div>
  );
}
