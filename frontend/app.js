const { useEffect, useMemo, useState } = React;

function createApiClient(getBaseUrl) {
  async function readJson(response) {
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || `HTTP ${response.status}`);
    }
    return payload;
  }

  return {
    async getHealth() {
      const response = await fetch(`${getBaseUrl()}/api/health`, { cache: "no-store" });
      return readJson(response);
    },
    async getMeta() {
      const response = await fetch(`${getBaseUrl()}/api/meta`, { cache: "no-store" });
      return readJson(response);
    },
    async createNearbyPreview(form) {
      const response = await fetch(`${getBaseUrl()}/api/nearby`, {
        method: "POST",
        body: new URLSearchParams(form),
      });
      return readJson(response);
    },
  };
}

function App() {
  const [apiBase, setApiBase] = useState(window.location.origin);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [health, setHealth] = useState(null);
  const [meta, setMeta] = useState(null);
  const [statusOk, setStatusOk] = useState(false);
  const [statusText, setStatusText] = useState("等待连接 FastAPI...");
  const [statusDetail, setStatusDetail] = useState("");
  const [result, setResult] = useState(null);
  const [errorText, setErrorText] = useState("");
  const [form, setForm] = useState({
    lat: "35.6580",
    lon: "139.7016",
    radius: "300",
    mode: "fixture",
    seed: "",
  });

  const api = useMemo(() => createApiClient(() => apiBase.replace(/\/$/, "")), [apiBase]);

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function applyMeta(nextMeta) {
    if (!nextMeta) {
      return;
    }
    const coords = nextMeta.default_coordinates || {};
    setForm((current) => ({
      ...current,
      lat: typeof coords.lat === "number" ? String(coords.lat) : current.lat,
      lon: typeof coords.lon === "number" ? String(coords.lon) : current.lon,
      radius: typeof coords.radius === "number" ? String(coords.radius) : current.radius,
      mode: nextMeta.default_mode || current.mode,
    }));
  }

  async function checkBackend() {
    setChecking(true);
    setStatusOk(false);
    setStatusText("正在检查 FastAPI 服务...");
    setStatusDetail("");
    try {
      const [nextHealth, nextMeta] = await Promise.all([api.getHealth(), api.getMeta()]);
      setHealth(nextHealth);
      setMeta(nextMeta);
      applyMeta(nextMeta);
      setStatusOk(true);
      setStatusText(`FastAPI 已连接 · ${nextMeta.project || "FableMap"}`);
      setStatusDetail(
        `frontend_mode=${nextMeta.frontend_mode} · fixture_available=${nextHealth.fixture_available} · output_root=${nextHealth.output_root}`
      );
    } catch (error) {
      setStatusOk(false);
      setStatusText("FastAPI 不可用");
      setStatusDetail(error.message || String(error));
    } finally {
      setChecking(false);
    }
  }

  async function submitNearby(refresh) {
    setSubmitting(true);
    setErrorText(refresh ? "正在刷新附近世界..." : "正在生成附近世界...");
    try {
      const payload = await api.createNearbyPreview({
        lat: form.lat,
        lon: form.lon,
        radius: form.radius,
        mode: form.mode,
        seed: form.seed,
        refresh: refresh ? "true" : "false",
      });
      setResult(payload);
      setErrorText("");
    } catch (error) {
      setResult(null);
      setErrorText(`生成失败：${error.message || String(error)}`);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    checkBackend();
  }, []);

  const previewUrl = result?.preview_url || "";

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      "div",
      { className: "wrap" },
      React.createElement(
        "section",
        { className: "hero panel" },
        React.createElement("p", { className: "eyebrow" }, "Minimal runnable migration"),
        React.createElement("h1", null, "FableMap · FastAPI + React"),
        React.createElement(
          "p",
          null,
          "当前版本把后端切到 FastAPI，把前端入口切到 React，先保留 nearby -> world -> preview 这条最小可运行链路。"
        ),
        React.createElement(
          "div",
          { className: "tag-row" },
          React.createElement("span", { className: "tag" }, "FastAPI backend"),
          React.createElement("span", { className: "tag" }, "React frontend"),
          React.createElement("span", { className: "tag" }, "Minimal runnable MVP")
        )
      ),
      React.createElement(
        "div",
        { className: "grid" },
        React.createElement(
          "section",
          { className: "panel" },
          React.createElement("h2", null, "Backend connection"),
          React.createElement("label", { htmlFor: "server-base" }, "API base URL"),
          React.createElement(
            "div",
            { className: "row-2" },
            React.createElement("input", {
              id: "server-base",
              type: "text",
              value: apiBase,
              onChange: (event) => setApiBase(event.target.value),
            }),
            React.createElement(
              "button",
              {
                type: "button",
                className: "secondary",
                disabled: checking,
                onClick: checkBackend,
              },
              checking ? "Checking..." : "Recheck"
            )
          ),
          React.createElement(
            "p",
            { className: "status" },
            React.createElement("span", { className: `dot${statusOk ? " ok" : ""}` }),
            React.createElement("span", null, statusText)
          ),
          React.createElement("p", { className: "note muted" }, statusDetail)
        ),
        React.createElement(
          "section",
          { className: "panel" },
          React.createElement("h2", null, "Generate nearby world"),
          React.createElement(
            "div",
            { className: "row" },
            React.createElement(
              "div",
              null,
              React.createElement("label", { htmlFor: "lat" }, "Latitude"),
              React.createElement("input", {
                id: "lat",
                type: "number",
                step: "0.000001",
                value: form.lat,
                onChange: (event) => updateForm("lat", event.target.value),
              })
            ),
            React.createElement(
              "div",
              null,
              React.createElement("label", { htmlFor: "lon" }, "Longitude"),
              React.createElement("input", {
                id: "lon",
                type: "number",
                step: "0.000001",
                value: form.lon,
                onChange: (event) => updateForm("lon", event.target.value),
              })
            ),
            React.createElement(
              "div",
              null,
              React.createElement("label", { htmlFor: "radius" }, "Radius (m)"),
              React.createElement("input", {
                id: "radius",
                type: "number",
                min: "1",
                step: "1",
                value: form.radius,
                onChange: (event) => updateForm("radius", event.target.value),
              })
            )
          ),
          React.createElement(
            "div",
            { className: "row-2" },
            React.createElement(
              "div",
              null,
              React.createElement("label", { htmlFor: "mode" }, "Mode"),
              React.createElement(
                "select",
                {
                  id: "mode",
                  value: form.mode,
                  onChange: (event) => updateForm("mode", event.target.value),
                },
                React.createElement("option", { value: "live" }, "Live OSM"),
                React.createElement("option", { value: "fixture" }, "Fixture demo")
              )
            ),
            React.createElement(
              "div",
              null,
              React.createElement("label", { htmlFor: "seed" }, "Seed"),
              React.createElement("input", {
                id: "seed",
                type: "text",
                placeholder: "optional stable seed",
                value: form.seed,
                onChange: (event) => updateForm("seed", event.target.value),
              })
            )
          ),
          React.createElement(
            "div",
            { className: "actions" },
            React.createElement(
              "button",
              {
                type: "button",
                disabled: submitting,
                onClick: () => submitNearby(false),
              },
              submitting ? "Submitting..." : "Generate preview"
            ),
            React.createElement(
              "button",
              {
                type: "button",
                className: "secondary",
                disabled: submitting,
                onClick: () => submitNearby(true),
              },
              "Refresh live map"
            )
          )
        ),
        React.createElement(
          "section",
          { className: "panel" },
          React.createElement("h2", null, "Result"),
          errorText
            ? React.createElement("p", { className: "note" }, errorText)
            : result
              ? React.createElement(
                  "div",
                  { className: "result-card" },
                  React.createElement("div", null, React.createElement("strong", null, "World ID:"), " ", result.world_id || "-"),
                  React.createElement("div", null, React.createElement("strong", null, "Theme:"), " ", result.region_theme || "-"),
                  React.createElement("div", null, React.createElement("strong", null, "Faction:"), " ", result.dominant_faction || "-"),
                  React.createElement(
                    "div",
                    null,
                    React.createElement("strong", null, "Counts:"),
                    ` POI ${result.poi_count ?? "-"} · Roads ${result.road_count ?? "-"} · Landmarks ${result.landmark_count ?? "-"}`
                  ),
                  React.createElement(
                    "div",
                    null,
                    React.createElement("strong", null, "Provider:"),
                    ` ${result.provider || "-"} · `,
                    React.createElement("strong", null, "Cache:"),
                    ` ${result.cache_status || "-"}`
                  ),
                  React.createElement("div", null, React.createElement("strong", null, "Generated at:"), " ", result.generated_at || "-"),
                  React.createElement(
                    "div",
                    { className: "link-row" },
                    React.createElement("a", { href: result.preview_url, target: "_blank", rel: "noreferrer" }, "Open preview"),
                    React.createElement("a", { href: result.world_url, target: "_blank", rel: "noreferrer" }, "Open world.json"),
                    React.createElement("a", { href: result.manifest_url, target: "_blank", rel: "noreferrer" }, "Open manifest.json")
                  )
                )
              : React.createElement("p", { className: "note" }, "No result yet. Start FastAPI and generate one preview.")
        )
      ),
      React.createElement(
        "section",
        { className: "panel preview-panel" },
        React.createElement("h2", null, "Preview"),
        React.createElement("p", { className: "note" }, "生成成功后会直接嵌入 API 返回的 bundle preview。"),
        previewUrl
          ? React.createElement("iframe", { src: previewUrl, title: "FableMap preview" })
          : React.createElement("div", { className: "preview-empty" }, "Preview not generated yet.")
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(React.createElement(App));
