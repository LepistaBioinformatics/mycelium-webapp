"use client";

interface Props {
  isLoading: boolean;
}

export function HorizontalLoadingBar({ isLoading }: Props) {
  return (
    <>
      {isLoading ? (
        <div
          className="bg-zinc-900 dark:bg-zinc-100 h-[1px] w-[60%] overflow-hidden"
          style={{
            transformOrigin: "0% 50%",
            animation: "indeterminateAnimation 2s infinite linear",
          }}
        />
      ) : (
        <div className="h-[1px]"></div>
      )}
    </>
  );
}
