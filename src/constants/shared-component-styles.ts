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
    },
    padding: {
        none: "p-0",
        xs: "p-1",
        sm: "p-2",
        md: "p-5",
        lg: "p-8",
        xl: "p-10",
        "2xl": "p-20",
        "3xl": "p-30",
        "4xl": "p-40",
        "5xl": "p-50",
        "6xl": "p-60",
        "7xl": "p-70",
        "8xl": "p-80",
        "9xl": "p-90",
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
    }
};

const sharedComponentStylesDefaultVariants: Config["defaultVariants"] = {
    width: "none",
    height: "none",
    padding: "md",
    margin: "none",
    flex: "none",
};

export {
    sharedComponentStylesVariants as projectVariants,
    sharedComponentStylesDefaultVariants as projectDefaultVariants,
};
