/** Recognizes the legacy art-preview query only in Vite development; production never enables it. */
export function isToolArtCandidateEnabled(search = window.location.search): boolean {
  const mode = new URLSearchParams(search).get("toolArt");
  return import.meta.env.DEV && (mode === "free" || mode === "preview");
}

/** Selects the isolated development farm used to review unpublished original art without changing the regular save. */
export function isToolArtPreviewEnabled(search = window.location.search): boolean {
  const parameters = new URLSearchParams(search);
  return isToolArtCandidateEnabled(search)
    && (parameters.get("toolArt") === "preview" || parameters.get("toolArtPreview") === "1");
}
