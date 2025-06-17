import { Config } from "tailwindcss";

const sharedComponentStylesVariants: Config["variants"] = {
    width: {
        full: "w-full",
        min: "w-min",
        max: "w-max",
        fit: "w-fit",
        half: "w-1/2",
        third: "w-1/3",
    },
    height: {
        full: "h-full",
        fit: "h-fit",
        min: "h-min",
        max: "h-max",
        screen: "h-screen",
        half: "h-1/2",
        third: "h-1/3",
    },
    padding: {
        none: "p-0",
        xs: "p-1",
        sm: "p-2",
        md: "p-1 sm:p-5",
        lg: "p-1 sm:p-8",
        xl: "p-1 sm:p-10",
        "2xl": "p-1 sm:p-20",
        "3xl": "p-1 sm:p-30",
        "4xl": "p-1 sm:p-40",
        "5xl": "p-1 sm:p-50",
        "6xl": "p-1 sm:p-60",
        "7xl": "p-1 sm:p-70",
        "8xl": "p-1 sm:p-80",
        "9xl": "p-1 sm:p-90",
    },
    margin: {
        none: "m-0",
        xs: "m-1",
        sm: "m-2",
        md: "m-4",
        lg: "m-8",
        xl: "m-16",
        "2xl": "m-32",
        "3xl": "m-48",
        "4xl": "m-64",
        "5xl": "m-80",
    },
    gap: {
        0: "gap-0",
        1: "gap-1",
        2: "gap-2",
        3: "gap-3",
        4: "gap-4",
        5: "gap-5",
        6: "gap-6",
        7: "gap-7",
        8: "gap-8",
        9: "gap-9",
        10: "gap-10",
        11: "gap-11",
        12: "gap-12",
    }
};

const sharedComponentStylesDefaultVariants: Config["defaultVariants"] = {
    width: "none",
    height: "none",
    padding: "md",
    margin: "none",
    flex: "none",
    gap: 0,
};

export {
    sharedComponentStylesVariants as projectVariants,
    sharedComponentStylesDefaultVariants as projectDefaultVariants,
};
