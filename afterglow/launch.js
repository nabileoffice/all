var STORE_KEY = "afterglow.goldhen.cacheReady";
var panel = document.getElementById("cachePanel");
var statusTitle = document.getElementById("msgs");
var cacheText = document.getElementById("cache");
var started = false;

function rememberCacheReady() {
  try { localStorage.setItem(STORE_KEY, "1"); } catch (e) {}
}

function cacheWasReady() {
  try { return localStorage.getItem(STORE_KEY) === "1"; } catch (e) { return false; }
}

function showCacheReady() {
  rememberCacheReady();
  statusTitle.textContent = "Offline cache loaded successfully";
  cacheText.textContent = "Exit the browser completely, then reopen this page. GoldHEN will start automatically.";
  var ram = document.getElementById("ramBox");
  if (ram) ram.style.display = "none";
  document.getElementById("spin").style.display = "none";
}

function startGoldHen() {
  if (started) return;
  started = true;
  if (panel) panel.style.display = "none";
  document.body.className = "";
  var ram = document.getElementById("ramBox");
  if (ram) ram.textContent = "RAM: starting GoldHEN...";
  try {
    history.replaceState(null, "", "index.html?log=1&afterglow=run&mode=goldhen");
  } catch (e) {}
  import("./jb.js");
}

var appCache = null;
try { appCache = window.applicationCache || null; } catch (e) {}

if (!appCache) {
  statusTitle.textContent = "Offline cache unavailable";
  cacheText.textContent = "This browser does not support Application Cache. Use the console browser.";
  document.getElementById("spin").style.display = "none";
} else {
  var status = null;
  try { status = appCache.status; } catch (e) {}

  if (status === appCache.IDLE && cacheWasReady()) {
    startGoldHen();
  } else if (status === appCache.IDLE || status === appCache.UPDATEREADY) {
    showCacheReady();
  } else {
    cacheText.textContent = "Loading the offline cache...";
  }

  ["checking", "downloading", "progress", "cached", "noupdate", "updateready", "error", "obsolete"].forEach(function (eventName) {
    try {
      appCache.addEventListener(eventName, function () {
        var current = null;
        try { current = appCache.status; } catch (e) {}
        if (eventName === "cached") {
          showCacheReady();
        } else if (eventName === "noupdate") {
          if (cacheWasReady()) startGoldHen();
          else showCacheReady();
        } else if (eventName === "updateready") {
          showCacheReady();
        } else if (eventName === "downloading") {
          statusTitle.textContent = "Downloading offline cache";
          cacheText.textContent = "Please wait until all files are loaded, then exit and reopen the browser.";
        } else if (eventName === "error" && current !== appCache.IDLE) {
          statusTitle.textContent = "Cache loading failed";
          cacheText.textContent = "Check the connection and reopen the page.";
        }
      }, false);
    } catch (e) {}
  });
}
