export function downloadMarkdown(filename: string, content: string) {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = safeName.endsWith(".md") ? safeName : `${safeName}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
