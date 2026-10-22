// Flowbite's Table defaults to `dark:bg-gray-*`; keep rows on the surface scale.
export const tableTheme = {
  head: {
    cell: {
      base: "bg-zinc-50 px-4 py-3 group-first/head:first:rounded-tl-lg group-first/head:last:rounded-tr-lg dark:bg-surface-900",
    },
  },
  row: {
    striped:
      "odd:bg-white even:bg-zinc-50 odd:dark:bg-surface-950 even:dark:bg-surface-900",
    hovered: "hover:bg-zinc-50 dark:hover:bg-surface-800",
  },
};

export const rowClassName = "bg-white dark:bg-surface-950";
export const cellClassName =
  "px-4 py-2 whitespace-nowrap text-zinc-600 dark:text-zinc-300";
