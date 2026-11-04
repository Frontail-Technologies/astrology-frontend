import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { documentFileProblem, formatFileSize } from "./astrologer-documents.ts";

describe("astrologer document files", () => {
  it("accepts PDFs and images up to 10 MB", () => {
    assert.equal(documentFileProblem({ type: "application/pdf", size: 2_000_000 }), null);
    assert.equal(documentFileProblem({ type: "image/jpeg", size: 10 * 1024 * 1024 }), null);
  });

  it("explains what is wrong with other files", () => {
    assert.equal(documentFileProblem(null), "Choose a file.");
    assert.equal(documentFileProblem({ type: "application/zip", size: 100 }), "Upload a PDF, JPEG, PNG or WebP file.");
    assert.equal(documentFileProblem({ type: "image/png", size: 11 * 1024 * 1024 }), "The file is larger than 10 MB.");
  });

  it("formats sizes", () => {
    assert.equal(formatFileSize(300), "1 KB");
    assert.equal(formatFileSize(250_000), "244 KB");
    assert.equal(formatFileSize(3 * 1024 * 1024), "3.0 MB");
  });
});
