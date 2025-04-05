import { ComponentProps, useState } from "react";
import Typography from "./Typography";
import Button from "./Button";

interface Props {
  text: string;
  maxLength?: number;
  props?: ComponentProps<typeof Typography>;
}

export default function SeeMoreText({ text, maxLength = 100, props }: Props) {
  const [showMore, setShowMore] = useState(false);

  const handleShowMore = () => {
    setShowMore(!showMore);
  }

  const truncatedText = text.slice(0, maxLength);

  const displayText = showMore ? text : truncatedText;

  return (
    <Typography {...props} as="small" width="md" decoration="smooth">
      {displayText}
      {text.length > maxLength && (
        <span className="text-xs ml-1">
          {!showMore && (<span className="text-slate-500 mr-1">...</span>)}
          <Button
            intent="link"
            size="xs"
            padding="none"
            rounded
            onClick={handleShowMore}
          >
            {showMore ? "less" : "more"}
          </Button>
        </span>
      )}
    </Typography>
  );
}
