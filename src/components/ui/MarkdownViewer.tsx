import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  markdown: string;
}

export default function MarkdownViewer({ markdown }: Props) {
  return (
    <div className="prose">
      <ReactMarkdown
        components={{
          h1: CustomH1,
          h2: CustomH2,
          h3: CustomH3,
          h4: CustomH4,
          h5: CustomH5,
          h6: CustomH6,
          p: CustomParagraph,
          em: CustomEmphasis,
          strong: CustomStrong,
          a: CustomLink,
          ul: CustomUnorderedList,
          ol: CustomOrderedList,
          li: CustomListItem,
        }}
        remarkPlugins={[[remarkGfm, { singleTilde: true }]]}
        urlTransform={(url) => {
          const safeUrl = url.startsWith("https://")
            ? url
            : url.replace("http://", "https://");

          if (safeUrl.startsWith("http")) return safeUrl;

          return `https://${safeUrl}`;
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

const CustomH1 = ({ children }: BaseProps) => (
  <h2 className="text-4xl font-bold">{children}</h2>
);

const CustomH2 = ({ children }: BaseProps) => (
  <h2 className="text-2xl font-bold">{children}</h2>
);

const CustomH3 = ({ children }: BaseProps) => (
  <h3 className="text-xl font-bold">{children}</h3>
);

const CustomH4 = ({ children }: BaseProps) => (
  <h4 className="text-lg font-bold">{children}</h4>
);

const CustomH5 = ({ children }: BaseProps) => (
  <h5 className="text-base font-bold">{children}</h5>
);

const CustomH6 = ({ children }: BaseProps) => (
  <h6 className="text-sm font-bold">{children}</h6>
);

const CustomParagraph = ({ children }: BaseProps) => (
  <p className="leading-relaxed mb-4">{children}</p>
);

const CustomEmphasis = ({ children }: BaseProps) => (
  <em className="text-indigo-500">{children}</em>
);

const CustomStrong = ({ children }: BaseProps) => (
  <strong className="text-red-500">{children}</strong>
);

const CustomLink = ({ href, children }: BaseProps & any) => (
  <a href={href} className="text-green-500 underline" target="_blank">
    {children}
  </a>
);

const CustomUnorderedList = ({ children }: BaseProps) => (
  <ul className="list-disc pl-5">{children}</ul>
);

const CustomOrderedList = ({ children }: BaseProps) => (
  <ol className="list-decimal pl-5">{children}</ol>
);

const CustomListItem = ({ children }: BaseProps) => (
  <li className="mb-2">{children}</li>
);
