import { FaRegCopy } from "react-icons/fa6";

interface Props {
  text: string;
}

export default function CopyToClipboard({ text }: Props) {
  return (
    <div>
      <button
        className="text-slate-500 hover:text-slate-700 hover:dark:text-slate-300"
        onClick={() => navigator.clipboard.writeText(text)}
      >
        <FaRegCopy />
      </button>
    </div>
  );
}
