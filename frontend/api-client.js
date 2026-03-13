export function createApiClient(getBaseUrl) {
  async function getJson(path) {
    const response = await fetch(`${getBaseUrl()}${path}`, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || `HTTP ${response.status}`);
    }
    return payload;
  }

  async function postForm(path, formData) {
    const response = await fetch(`${getBaseUrl()}${path}`, {
      method: "POST",
      body: new URLSearchParams(formData),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || `HTTP ${response.status}`);
    }
    return payload;
  }

  return {
    getHealth() {
      return getJson("/api/health");
    },
    getMeta() {
      return getJson("/api/meta");
    },
    createNearbyPreview(formData) {
      return postForm("/api/nearby", formData);
    },
  };
}
