"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const mdComponents: Components = {
  h1: (props) => <h1 className="text-2xl font-bold mt-8 mb-4" {...props} />,
  h2: (props) => <h2 className="text-xl font-semibold mt-6 mb-3" {...props} />,
  h3: (props) => <h3 className="text-lg font-medium mt-4 mb-2" {...props} />,
  p: (props) => <p className="mb-3 leading-relaxed text-sm" {...props} />,
  ul: (props) => <ul className="list-disc pl-6 mb-3 space-y-1" {...props} />,
  ol: (props) => <ol className="list-decimal pl-6 mb-3 space-y-1" {...props} />,
  li: (props) => <li className="text-sm" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-4"
      {...props}
    />
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className={`${className} block`} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: (props) => (
    <pre
      className="rounded-lg bg-muted p-4 text-xs overflow-auto mb-4"
      {...props}
    />
  ),
  hr: () => <hr className="my-6 border-border" />,
  input: (props) => <input {...props} className="mr-2" disabled />,
};

interface DemoScriptViewProps {
  markdown: string;
}

export function DemoScriptView({ markdown }: DemoScriptViewProps) {
  return (
    <div className="prose-custom">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
