export function setStatus(elements, ok, text, detail) {
  elements.statusDot.classList.toggle("ok", ok);
  elements.statusText.textContent = text;
  elements.healthDetails.textContent = detail || "";
}

export function applyMetaToForm(elements, meta) {
  if (!meta) {
    return;
  }
  const coords = meta.default_coordinates || {};
  const mode = meta.default_mode || "live";
  if (elements.lat && typeof coords.lat === "number") {
    elements.lat.value = String(coords.lat);
  }
  if (elements.lon && typeof coords.lon === "number") {
    elements.lon.value = String(coords.lon);
  }
  if (elements.radius && typeof coords.radius === "number") {
    elements.radius.value = String(coords.radius);
  }
  if (elements.mode && meta.supported_modes?.includes(mode)) {
    elements.mode.value = mode;
  }
}

export function setSubmitting(elements, active) {
  elements.generateButton.disabled = active;
  elements.refreshButton.disabled = active;
}

export function renderResult(elements, payload) {
  const previewUrl = payload.preview_url || payload.preview;
  const worldUrl = payload.world_url || payload.world;
  const manifestUrl = payload.manifest_url || payload.manifest;
  elements.resultBox.innerHTML = `
    <div class="result-card">
      <div><strong>World ID:</strong> ${payload.world_id || "-"}</div>
      <div><strong>Theme:</strong> ${payload.region_theme || "-"}</div>
      <div><strong>Faction:</strong> ${payload.dominant_faction || "-"}</div>
      <div><strong>Counts:</strong> POI ${payload.poi_count ?? "-"} · Roads ${payload.road_count ?? "-"} · Landmarks ${payload.landmark_count ?? "-"}</div>
      <div><strong>Provider:</strong> ${payload.provider || "-"} · <strong>Cache:</strong> ${payload.cache_status || "-"}</div>
      <div><strong>Generated at:</strong> ${payload.generated_at || "-"}</div>
      <div class="link-row">
        <a href="${previewUrl}" target="_blank" rel="noreferrer">Open preview</a>
        <a href="${worldUrl}" target="_blank" rel="noreferrer">Open world.json</a>
        <a href="${manifestUrl}" target="_blank" rel="noreferrer">Open manifest.json</a>
      </div>
    </div>
  `;
  if (previewUrl) {
    elements.previewFrame.hidden = false;
    elements.previewFrame.src = previewUrl;
  }
}

export function renderError(elements, message) {
  elements.resultBox.textContent = message;
}
