// server.ts
import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = Number(process.env.PORT) || 3e3;
var isProduction = process.env.NODE_ENV === "production";
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});
function sanitizeString(str) {
  if (typeof str !== "string") return "";
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/on\w+\s*=\s*["'][^"']*["']/gi, "").replace(/javascript\s*:/gi, "").trim();
}
function sanitizeObject(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }
  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      if (value.startsWith("data:image/")) {
        clean[key] = value;
      } else {
        clean[key] = sanitizeString(value);
      }
    } else if (typeof value === "object" && value !== null) {
      clean[key] = sanitizeObject(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}
app.use((req, _res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
});
var rateLimitStore = /* @__PURE__ */ new Map();
var loginAttemptStore = /* @__PURE__ */ new Map();
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now - entry.firstRequest > 6e4) {
      rateLimitStore.delete(ip);
    }
  }
  for (const [ip, entry] of loginAttemptStore.entries()) {
    if (now > entry.lockedUntil) {
      loginAttemptStore.delete(ip);
    }
  }
}, 3e5);
function apiRateLimiter(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const entry = rateLimitStore.get(ip) || { count: 0, firstRequest: now };
  if (now - entry.firstRequest > 6e4) {
    entry.count = 1;
    entry.firstRequest = now;
  } else {
    entry.count++;
  }
  rateLimitStore.set(ip, entry);
  if (entry.count > 300) {
    return res.status(429).json({
      error: "Too many requests. Please slow down to protect server availability.",
      retryAfter: 60
    });
  }
  next();
}
function adminLoginRateLimiter(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const lockout = loginAttemptStore.get(ip);
  if (lockout && now < lockout.lockedUntil) {
    const remainingSec = Math.ceil((lockout.lockedUntil - now) / 1e3);
    return res.status(429).json({
      error: `Too many failed login attempts. Account access is temporarily locked for security. Please try again in ${remainingSec} seconds.`,
      retryAfter: remainingSec
    });
  }
  next();
}
var activeCsrfTokens = /* @__PURE__ */ new Set();
app.get("/api/csrf-token", (_req, res) => {
  const token = crypto.randomBytes(32).toString("hex");
  activeCsrfTokens.add(token);
  if (activeCsrfTokens.size > 5e3) {
    const first = activeCsrfTokens.values().next().value;
    if (first) activeCsrfTokens.delete(first);
  }
  res.json({ csrfToken: token });
});
function verifyCsrfToken(req, res, next) {
  const token = req.headers["x-csrf-token"];
  if (!token || !activeCsrfTokens.has(token)) {
    return res.status(403).json({
      error: "Security Error: Invalid or missing CSRF token. Please refresh the page and try again."
    });
  }
  next();
}
var ADMIN_USERNAME = "admin";
var ADMIN_EMAIL = "admin@nextrealestate.com";
var ADMIN_PASSWORD_SALT = "next_re_salt_983749281749214";
var EXPECTED_PASSWORD_HASH = crypto.pbkdf2Sync("Next2026!", ADMIN_PASSWORD_SALT, 1e5, 64, "sha512").toString("hex");
var adminSessions = /* @__PURE__ */ new Map();
function requireAdminRole(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Access Denied: Administrator authentication token required for this action."
    });
  }
  const token = authHeader.replace("Bearer ", "").trim();
  const session = adminSessions.get(token);
  if (!session) {
    return res.status(401).json({
      error: "Unauthorized: Session invalid or expired. Please sign in again."
    });
  }
  if (Date.now() > session.expiresAt) {
    adminSessions.delete(token);
    return res.status(401).json({
      error: "Session Expired: For security, your admin session has expired. Please sign in again."
    });
  }
  if (session.role !== "admin") {
    return res.status(403).json({
      error: "Forbidden: You do not have permission to perform administrative mutations."
    });
  }
  next();
}
app.post("/api/admin/login", adminLoginRateLimiter, (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }
  const cleanUser = String(username).trim();
  const isUserMatch = cleanUser.toLowerCase() === ADMIN_USERNAME.toLowerCase() || cleanUser.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const computedHash = crypto.pbkdf2Sync(String(password), ADMIN_PASSWORD_SALT, 1e5, 64, "sha512").toString("hex");
  const computedBuf = Buffer.from(computedHash);
  const expectedBuf = Buffer.from(EXPECTED_PASSWORD_HASH);
  const isPasswordMatch = computedBuf.length === expectedBuf.length && crypto.timingSafeEqual(computedBuf, expectedBuf);
  if (isUserMatch && isPasswordMatch) {
    loginAttemptStore.delete(ip);
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 24 * 60 * 60 * 1e3;
    adminSessions.set(token, {
      token,
      username: cleanUser,
      role: "admin",
      expiresAt
    });
    return res.json({
      success: true,
      token,
      username: cleanUser,
      role: "admin",
      expiresAt,
      message: "Authentication successful. Admin role confirmed."
    });
  }
  const attempt = loginAttemptStore.get(ip) || { attempts: 0, lockedUntil: 0 };
  attempt.attempts++;
  if (attempt.attempts >= 5) {
    attempt.lockedUntil = Date.now() + 15 * 60 * 1e3;
  }
  loginAttemptStore.set(ip, attempt);
  const remaining = Math.max(0, 5 - attempt.attempts);
  return res.status(401).json({
    error: `Invalid administrative credentials. ${remaining} attempts remaining before temporary lockout.`
  });
});
app.post("/api/admin/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "").trim();
    adminSessions.delete(token);
  }
  res.json({ success: true, message: "Logged out successfully." });
});
app.get("/api/admin/session", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.json({ authenticated: false, role: "public" });
  }
  const token = authHeader.replace("Bearer ", "").trim();
  const session = adminSessions.get(token);
  if (!session || Date.now() > session.expiresAt) {
    return res.json({ authenticated: false, role: "public" });
  }
  res.json({
    authenticated: true,
    username: session.username,
    role: session.role,
    expiresAt: session.expiresAt
  });
});
var propertyMap = /* @__PURE__ */ new Map();
var propertyListCache = [];
var propertyETag = `W/"initial-${Date.now()}"`;
var DATA_FILE = path.join(__dirname, "custom-properties-store.json");
function updateCaches() {
  propertyListCache = Array.from(propertyMap.values());
  propertyETag = `W/"${Date.now()}-${propertyMap.size}"`;
}
function persistStore() {
  try {
    const customProps = propertyListCache.filter((p) => p.id.startsWith("custom-"));
    fs.writeFileSync(DATA_FILE, JSON.stringify(customProps, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist properties to disk", err);
  }
}
function loadInitialProperties() {
  try {
    const propertiesFilePath = path.join(__dirname, "src", "data", "properties.ts");
    if (fs.existsSync(propertiesFilePath)) {
      const content = fs.readFileSync(propertiesFilePath, "utf-8");
      const match = content.match(/export const mockProperties: Property\[\] = (\[[\s\S]*?\]);\n/);
      if (match) {
        const baseline = new Function(`return ${match[1]}`)();
        for (const item of baseline) {
          propertyMap.set(item.id, item);
        }
      }
    }
  } catch (err) {
    console.warn("Could not parse mock properties dynamically, starting with empty baseline", err);
  }
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
      if (Array.isArray(data)) {
        for (const item of data) {
          propertyMap.set(item.id, item);
        }
      }
    }
  } catch (err) {
    console.warn("Could not load custom properties file", err);
  }
  updateCaches();
}
loadInitialProperties();
app.get("/api/properties", apiRateLimiter, (req, res) => {
  if (req.headers["if-none-match"] === propertyETag) {
    return res.status(304).end();
  }
  res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
  res.setHeader("ETag", propertyETag);
  const {
    location,
    propertyType,
    saleOrRental,
    buildingAge,
    areaRange,
    category,
    search
  } = req.query;
  let results = propertyListCache.filter((p) => !p.isArchived);
  if (category && typeof category === "string" && category !== "all") {
    results = results.filter((p) => p.category === category);
  }
  if (propertyType && typeof propertyType === "string" && propertyType !== "all") {
    const low = propertyType.toLowerCase();
    results = results.filter(
      (p) => p.type.toLowerCase() === low || p.commercialSubtype?.toLowerCase() === low
    );
  }
  if (saleOrRental && typeof saleOrRental === "string") {
    const isRental = saleOrRental === "rent";
    results = results.filter((p) => p.isRental === isRental);
  }
  if (buildingAge && typeof buildingAge === "string" && buildingAge !== "all") {
    results = results.filter((p) => p.buildingAge === buildingAge);
  }
  if (location && typeof location === "string" && location.trim() !== "") {
    const queryLocs = location.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    results = results.filter((p) => {
      const loc = (p.location || "").toLowerCase();
      const locAr = (p.locationAr || "").toLowerCase();
      const dist = (p.district || "").toLowerCase();
      const distAr = (p.districtAr || "").toLowerCase();
      const neigh = (p.neighborhood || "").toLowerCase();
      const neighAr = (p.neighborhoodAr || "").toLowerCase();
      const zone = (p.zone || "").toLowerCase();
      return queryLocs.some(
        (q) => loc.includes(q) || locAr.includes(q) || dist.includes(q) || distAr.includes(q) || neigh.includes(q) || neighAr.includes(q) || zone.includes(q)
      );
    });
  }
  if (search && typeof search === "string" && search.trim() !== "") {
    const q = search.trim().toLowerCase();
    results = results.filter(
      (p) => p.title.toLowerCase().includes(q) || p.titleAr.toLowerCase().includes(q) || p.referenceNo.toLowerCase().includes(q)
    );
  }
  results.sort((a, b) => {
    const aIsCustom = a.id.startsWith("custom-");
    const bIsCustom = b.id.startsWith("custom-");
    if (aIsCustom && !bIsCustom) return -1;
    if (!aIsCustom && bIsCustom) return 1;
    return (b.createdAt || "").localeCompare(a.createdAt || "");
  });
  res.json({
    total: results.length,
    properties: results
  });
});
app.get("/api/properties/:id", apiRateLimiter, (req, res) => {
  const property = propertyMap.get(req.params.id);
  if (!property) {
    return res.status(404).json({ error: "Property listing not found." });
  }
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  res.json(property);
});
app.post("/api/inquiries", apiRateLimiter, (req, res) => {
  const { name, phone, message, propertyId } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone number are required." });
  }
  console.log(`[Lead Inquiry] Property: ${propertyId || "General"} | Client: ${name} (${phone})`);
  res.json({
    success: true,
    message: "Your inquiry has been received. Our advisory team will reach out shortly."
  });
});
app.post(
  "/api/admin/properties",
  requireAdminRole,
  verifyCsrfToken,
  (req, res) => {
    const item = req.body;
    if (!item.title || !item.location || !item.price) {
      return res.status(400).json({
        error: "Validation Error: Title, location, and price are mandatory."
      });
    }
    const id = `custom-${Date.now()}`;
    const newProp = {
      id,
      title: item.title,
      titleAr: item.titleAr || item.title,
      location: item.location,
      locationAr: item.locationAr || item.location,
      district: item.district || "Beirut",
      districtAr: item.districtAr || "\u0628\u064A\u0631\u0648\u062A",
      neighborhood: item.neighborhood || "Central",
      neighborhoodAr: item.neighborhoodAr || "\u0627\u0644\u0648\u0633\u0637",
      zone: item.zone || "Beirut",
      zoneAr: item.zoneAr || "\u0628\u064A\u0631\u0648\u062A",
      price: Number(item.price) || 1e5,
      currency: item.currency || "USD",
      isRental: Boolean(item.isRental),
      type: item.type || "Apartment",
      typeAr: item.typeAr || "\u0634\u0642\u0629 \u0633\u0643\u0646\u064A\u0629",
      category: item.category || "residential",
      commercialSubtype: item.commercialSubtype,
      beds: item.beds ? Number(item.beds) : 3,
      baths: item.baths ? Number(item.baths) : 2,
      areaSqm: Number(item.areaSqm) || 120,
      buildingAge: item.buildingAge || "0_2",
      buildingAgeLabel: item.buildingAgeLabel || "0-2 Years",
      buildingAgeLabelAr: item.buildingAgeLabelAr || "\u062D\u062F\u064A\u062B (0-2 \u0633\u0646\u0629)",
      imageUrl: item.imageUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
      isFeatured: Boolean(item.isFeatured),
      isPlatinum: Boolean(item.isPlatinum),
      isArchived: false,
      referenceNo: item.referenceNo || `NXT-${Math.floor(1e3 + Math.random() * 9e3)}`,
      condition: item.condition || "ready",
      paymentType: item.paymentType || "cash",
      amenities: item.amenities || ["Covered Parking", "Elevator", "Modern Finish"],
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    propertyMap.set(id, newProp);
    updateCaches();
    persistStore();
    res.status(201).json({
      success: true,
      property: newProp,
      message: "Listing successfully published by Administrator."
    });
  }
);
app.put(
  "/api/admin/properties/:id",
  requireAdminRole,
  verifyCsrfToken,
  (req, res) => {
    const id = req.params.id;
    const existing = propertyMap.get(id);
    if (!existing) {
      return res.status(404).json({ error: "Property not found." });
    }
    const updates = req.body;
    const updated = {
      ...existing,
      ...updates,
      id
      // Preserve immutable ID
    };
    propertyMap.set(id, updated);
    updateCaches();
    persistStore();
    res.json({
      success: true,
      property: updated,
      message: "Listing successfully updated by Administrator."
    });
  }
);
app.delete(
  "/api/admin/properties/:id",
  requireAdminRole,
  verifyCsrfToken,
  (req, res) => {
    const id = req.params.id;
    if (!propertyMap.has(id)) {
      return res.status(404).json({ error: "Property not found." });
    }
    propertyMap.delete(id);
    updateCaches();
    persistStore();
    res.json({
      success: true,
      message: "Property listing permanently removed by Administrator."
    });
  }
);
app.post(
  "/api/admin/properties/:id/archive",
  requireAdminRole,
  verifyCsrfToken,
  (req, res) => {
    const id = req.params.id;
    const existing = propertyMap.get(id);
    if (!existing) {
      return res.status(404).json({ error: "Property not found." });
    }
    existing.isArchived = !existing.isArchived;
    existing.archivedAt = existing.isArchived ? (/* @__PURE__ */ new Date()).toISOString() : void 0;
    propertyMap.set(id, existing);
    updateCaches();
    persistStore();
    res.json({
      success: true,
      isArchived: existing.isArchived,
      message: existing.isArchived ? "Listing archived successfully." : "Listing restored to active marketplace."
    });
  }
);
app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    concurrencyReady: true,
    totalProperties: propertyMap.size,
    activeSessions: adminSessions.size
  });
});
async function startServer() {
  const distPath = path.join(__dirname, "dist");
  app.use(
    express.static(distPath, {
      maxAge: "1y",
      etag: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
        } else if (filePath.match(/\.(js|css|svg|png|jpg|jpeg|webp|woff2)$/)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      }
    })
  );
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
  process.on("uncaughtException", (err) => {
    console.error("CRITICAL: Uncaught Exception caught gracefully:", err);
  });
  process.on("unhandledRejection", (reason) => {
    console.error("CRITICAL: Unhandled Rejection caught gracefully:", reason);
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Next Real Estate] High-Concurrency Server running on http://0.0.0.0:${PORT}`);
    console.log(`[Security] RBAC, PBKDF2 Password Hashing, CSRF & Anti-XSS Protection active.`);
  });
}
startServer();
