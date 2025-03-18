"use client";

import { FaRegCircleCheck } from "react-icons/fa6";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdErrorOutline } from "react-icons/md";
import { IoWarningOutline } from "react-icons/io5";
import { cva, VariantProps } from "class-variance-authority";
import { components } from "@/services/openapi/mycelium-schema";
import Banner from "./Banner";
import Countdown from "react-countdown";
import { useMemo } from "react";

const styles = cva("absolute top-1 right-5 w-[calc(100%-2rem)] md:w-[50%] xl:max-w-[500px] flex flex-col gap-1 z-50 transition-all duration-300", {
  variants: {
    show: {
      true: "opacity-100",
      false: "opacity-0",
    },
    intent: {
      error: "border-dashed border-red-500 dark:border-red-500",
      info: "border-dashed border-blue-500 dark:border-blue-500",
      success: "border-dashed border-green-500 dark:border-green-500",
      warning: "border-dashed border-yellow-500 dark:border-yellow-500",
    },
  },
});

type HttpResponse = components["schemas"]["HttpJsonResponse"];

interface Props extends
  BaseProps,
  VariantProps<typeof styles> {
  title?: string | null;
  response: HttpResponse | string | null;
  timeout?: number;
  show: boolean;
  setShow: () => void;
}

export default function SuspenseNotification({
  response,
  title,
  intent,
  show,
  setShow,
  timeout = 10000,
}: Props) {
  const cleanMessage = (message: string) => {
    return message?.replace(/\[[^\]]*\]\s*/g, '');
  };

  const message = useMemo(() => {
    //
    // Check if the response is an object.
    //
    if (typeof response === "object") {
      return cleanMessage(response?.msg ?? "");
    }

    //
    // Check if the response is a string.
    //
    if (typeof response === "string") {
      return cleanMessage(response);
    }

    return null;
  }, [response]);

  const icon = useMemo(() => {
    switch (intent) {
      case "error":
        return <MdErrorOutline />;
      case "info":
        return <IoMdInformationCircleOutline />;
      case "success":
        return <FaRegCircleCheck />;
      case "warning":
        return <IoWarningOutline />;
    }
  }, [intent]);

  const bannerTitle = useMemo(() => (
    <div className="flex items-center gap-2">
      {icon}
      <h3 className="text-lg font-bold">
        {title ?? (response && typeof response === "object" ? response.code : "Error")}
      </h3>
    </div>
  ), [title, icon]);

  const handleClose = () => {
    setTimeout(() => {
      setShow();
    }, 1000);
  };

  return show && (
    <Countdown
      date={Date.now() + timeout}
      renderer={({ seconds }) => (
        <div className={styles({ intent, show })}>
          <ProgressBar
            percent={((seconds * 100) / timeout) * 1000}
            intent={intent}
          />

          <div className="flex items-center justify-between">
            <Banner
              intent={intent}
              title={bannerTitle}
              closeable={true}
              onClose={setShow}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">{message}</div>
              </div>
            </Banner>
          </div>
        </div>
      )}
      onComplete={handleClose}
    />
  );
}

const progressBarStyles = cva("h-full flex justify-center items-center rounded-full !bg-opacity-50 transition-all duration-[2000ms]", {
  variants: {
    intent: {
      error: "bg-red-500 dark:bg-red-500",
      info: "bg-blue-500 dark:bg-blue-500",
      success: "bg-green-500 dark:bg-green-500",
      warning: "bg-yellow-500 dark:bg-yellow-500",
      neutral: "bg-gray-400 dark:bg-gray-600",
    },
  },
  defaultVariants: {
    intent: "neutral",
  },
});

interface ProgressBarProps extends BaseProps, VariantProps<typeof progressBarStyles> {
  percent: number;
}

function ProgressBar({ percent, intent }: ProgressBarProps) {
  return (
    <div className={`w-[calc(100%-1rem)] mx-auto h-[2px] bg-gray-200 dark:bg-gray-800 rounded-full`}>
      <div className={progressBarStyles({ intent })} style={{ width: `${percent}%` }}></div>
    </div>
  );
}
