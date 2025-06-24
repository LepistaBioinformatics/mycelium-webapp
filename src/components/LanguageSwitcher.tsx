import { cva, VariantProps } from "class-variance-authority";
import { useTranslation } from "react-i18next";
import { Language } from "@/i18n/config";
import { useMemo, useState } from "react";

const containerStyles = cva(
  "flex gap-3 items-center text-center rounded-full p-2 transition-all",
  {
    variants: {
      open: {
        true: "h-fit",
        false: "max-h-8",
      },
    },
  }
);

const selectedStyles = cva("transition-all w-full", {
  variants: {
    open: {
      true: "hidden",
      false: "block",
    },
  },
  defaultVariants: {
    open: false,
  },
});

const selectorStyles = cva("flex justify-around gap-2 transition-all w-full", {
  variants: {
    open: {
      true: "block",
      false: "hidden",
    },
    horizontal: {
      true: "flex-row",
      false: "flex-col",
    },
  },
  defaultVariants: {
    open: false,
    horizontal: false,
  },
});

const flagStyles = cva("px-2", {
  variants: {
    selected: {
      true: "border border-dashed border-indigo-500 dark:border-lime-500 rounded-lg",
    },
  },
});

interface Props
  extends VariantProps<typeof selectedStyles>,
    VariantProps<typeof selectorStyles> {
  keepOpen?: boolean;
}

export default function LanguageSwitcher({ horizontal, keepOpen }: Props) {
  const { i18n } = useTranslation();

  const [open, setOpen] = useState(false);

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  const currentLanguage = useMemo(() => i18n.language, [i18n.language]);

  const handleSetLanguage = (language: string) => {
    changeLanguage(language);
    setOpen(false);
  };

  return (
    <div className={containerStyles({ open })}>
      <button
        className={selectedStyles({ open: keepOpen || open })}
        onClick={() => setOpen(true)}
      >
        {getLanguageFlag(currentLanguage)}
      </button>

      <div className={selectorStyles({ open: keepOpen || open, horizontal })}>
        <button
          onClick={() => handleSetLanguage(Language.EN)}
          className={flagStyles({ selected: currentLanguage === Language.EN })}
        >
          {getLanguageFlag(Language.EN)}
        </button>
        <button
          onClick={() => handleSetLanguage(Language.PT_BR)}
          className={flagStyles({
            selected: currentLanguage === Language.PT_BR,
          })}
        >
          {getLanguageFlag(Language.PT_BR)}
        </button>
        <button
          onClick={() => handleSetLanguage(Language.ES)}
          className={flagStyles({ selected: currentLanguage === Language.ES })}
        >
          {getLanguageFlag(Language.ES)}
        </button>
      </div>
    </div>
  );
}

function getLanguageFlag(language: string) {
  switch (language) {
    case Language.EN:
      return "🇺🇸";
    case Language.PT_BR:
      return "🇧🇷";
    case Language.ES:
      return "🇪🇸";
    default:
      return "🇺🇸";
  }
}
