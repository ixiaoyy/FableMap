export function createApiClient(getBaseUrl) {
  async function readJson(response) {
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || `HTTP ${response.status}`);
    }
    return payload;
  }

  async function getJson(path) {
    const response = await fetch(`${getBaseUrl()}${path}`, { cache: "no-store" });
    return readJson(response);
  }

  async function postForm(path, formData) {
    const response = await fetch(`${getBaseUrl()}${path}`, {
      method: "POST",
      body: new URLSearchParams(formData),
    });
    return readJson(response);
  }

  async function postJson(path, payload) {
    const response = await fetch(`${getBaseUrl()}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return readJson(response);
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
    submitWorldEvent(event) {
      return postJson("/api/world/event", event);
    },
  };
}
