export function getElements() {
  return {
    serverBase: document.getElementById("server-base"),
    checkServer: document.getElementById("check-server"),
    statusDot: document.getElementById("status-dot"),
    statusText: document.getElementById("status-text"),
    healthDetails: document.getElementById("health-details"),
    nearbyForm: document.getElementById("nearby-form"),
    generateButton: document.getElementById("generate-button"),
    refreshButton: document.getElementById("refresh-button"),
    resultBox: document.getElementById("result-box"),
    previewFrame: document.getElementById("preview-frame"),
    lat: document.getElementById("lat"),
    lon: document.getElementById("lon"),
    radius: document.getElementById("radius"),
    mode: document.getElementById("mode"),
  };
}
