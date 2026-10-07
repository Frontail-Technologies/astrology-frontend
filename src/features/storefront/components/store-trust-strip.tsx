import { BadgeCheck, Gem, ListChecks, MessagesSquare } from "lucide-react";

import { storeTrustItems } from "../content/store-content";

const icons = { natural: Gem, selected: BadgeCheck, details: ListChecks, guidance: MessagesSquare };

export function StoreTrustStrip() {
  return (
    <ul className="grid grid-cols-2 divide-border overflow-hidden rounded-xl border border-border bg-surface lg:grid-cols-4 lg:divide-x">
      {storeTrustItems.map((item, index) => {
        const Icon = icons[item.id];
        return (
          <li
            key={item.id}
            className={`flex items-start gap-3 p-4 sm:p-5 ${index > 1 ? "border-t border-border lg:border-t-0" : ""} ${
              index % 2 === 1 ? "border-l border-border lg:border-l-0" : ""
            }`}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-300/25 text-gold-500 dark:text-gold-300">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{item.text}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
