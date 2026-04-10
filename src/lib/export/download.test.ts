import { describe, it, expect, vi, beforeEach } from "vitest";
import { downloadMarkdown } from "./download";

describe("downloadMarkdown", () => {
  let clickSpy: ReturnType<typeof vi.fn>;
  let appendChildSpy: ReturnType<typeof vi.spyOn>;
  let removeChildSpy: ReturnType<typeof vi.spyOn>;
  const fakeUrl = "blob:http://localhost/fake-blob-url";

  beforeEach(() => {
    clickSpy = vi.fn();
    appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation((node) => node);
    removeChildSpy = vi.spyOn(document.body, "removeChild").mockImplementation((node) => node);

    vi.spyOn(document, "createElement").mockReturnValue({
      href: "",
      download: "",
      click: clickSpy,
    } as unknown as HTMLAnchorElement);

    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => fakeUrl),
      revokeObjectURL: vi.fn(),
    });
  });

  it("creates a Blob with text/markdown type", () => {
    const BlobSpy = vi.fn(globalThis.Blob);
    vi.stubGlobal("Blob", BlobSpy);

    downloadMarkdown("test", "# Hello");

    expect(BlobSpy).toHaveBeenCalledWith(["# Hello"], {
      type: "text/markdown",
    });
  });

  it("appends .md when filename does not end with .md", () => {
    const anchor = { href: "", download: "", click: clickSpy } as unknown as HTMLAnchorElement;
    vi.spyOn(document, "createElement").mockReturnValue(anchor);

    downloadMarkdown("my-playbook", "content");

    expect(anchor.download).toBe("my-playbook.md");
  });

  it("does not double the .md extension", () => {
    const anchor = { href: "", download: "", click: clickSpy } as unknown as HTMLAnchorElement;
    vi.spyOn(document, "createElement").mockReturnValue(anchor);

    downloadMarkdown("my-playbook.md", "content");

    expect(anchor.download).toBe("my-playbook.md");
  });

  it("clicks the anchor element to trigger download", () => {
    downloadMarkdown("file", "content");

    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it("revokes the object URL after download", () => {
    downloadMarkdown("file", "content");

    expect(URL.revokeObjectURL).toHaveBeenCalledWith(fakeUrl);
  });
});
