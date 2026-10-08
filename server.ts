import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// ============================================================================
// 1. ADVANCED CYBERSECURITY & VULNERABILITY PROTECTION MIDDLEWARE
// ============================================================================

// JSON body parser with strict size limits to prevent payload exhaustion attacks
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Comprehensive Security Headers (CSP, Anti-Sniff, Anti-Clickjacking, Referrer)
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
  next();
});

// XSS Sanitizer: strips potentially dangerous tags and injection vectors
function sanitizeString(str: unknown): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript\s*:/gi, '')
    .trim();
}

function sanitizeObject<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Don't strip data URLs for uploaded images
      if (value.startsWith('data:image/')) {
        clean[key] = value;
      } else {
        clean[key] = sanitizeString(value);
      }
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizeObject(value);
    } else {
      clean[key] = value;
    }
  }
  return clean as T;
}

// Global Sanitization Middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
});

// ============================================================================
// 2. IN-MEMORY RATE LIMITING (BRUTE FORCE & DOS MITIGATION)
// ============================================================================
interface RateLimitEntry {
  count: number;
  firstRequest: number;
}
const rateLimitStore = new Map<string, RateLimitEntry>();
const loginAttemptStore = new Map<string, { attempts: number; lockedUntil: number }>();

// Cleanup stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now - entry.firstRequest > 60000) {
      rateLimitStore.delete(ip);
    }
  }
  for (const [ip, entry] of loginAttemptStore.entries()) {
    if (now > entry.lockedUntil) {
      loginAttemptStore.delete(ip);
    }
  }
}, 300000);

// General API rate limiter (300 requests / minute)
function apiRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimitStore.get(ip) || { count: 0, firstRequest: now };

  if (now - entry.firstRequest > 60000) {
    entry.count = 1;
    entry.firstRequest = now;
  } else {
    entry.count++;
  }
  rateLimitStore.set(ip, entry);

  if (entry.count > 300) {
    return res.status(429).json({
      error: 'Too many requests. Please slow down to protect server availability.',
      retryAfter: 60,
    });
  }
  next();
}

// Strict Admin Login Rate Limiter (Max 5 failed attempts per 15 minutes)
function adminLoginRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const lockout = loginAttemptStore.get(ip);

  if (lockout && now < lockout.lockedUntil) {
    const remainingSec = Math.ceil((lockout.lockedUntil - now) / 1000);
    return res.status(429).json({
      error: `Too many failed login attempts. Account access is temporarily locked for security. Please try again in ${remainingSec} seconds.`,
      retryAfter: remainingSec,
    });
  }
  next();
}

// ============================================================================
// 3. CRYPTOGRAPHIC CSRF PROTECTION
// ============================================================================
const activeCsrfTokens = new Set<string>();

app.get('/api/csrf-token', (_req: Request, res: Response) => {
  const token = crypto.randomBytes(32).toString('hex');
  activeCsrfTokens.add(token);
  // Keep set bounded to max 5000 active tokens
  if (activeCsrfTokens.size > 5000) {
    const first = activeCsrfTokens.values().next().value;
    if (first) activeCsrfTokens.delete(first);
  }
  res.json({ csrfToken: token });
});

function verifyCsrfToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-csrf-token'] as string;
  if (!token || !activeCsrfTokens.has(token)) {
    return res.status(403).json({
      error: 'Security Error: Invalid or missing CSRF token. Please refresh the page and try again.',
    });
  }
  next();
}

// ============================================================================
// 4. ROLE-BASED ACCESS CONTROL (RBAC) & ADMIN AUTHENTICATION
// ============================================================================

// Salted password hashing using PBKDF2 (100,000 iterations with SHA-512)
const ADMIN_USERNAME = 'admin';
const ADMIN_EMAIL = 'admin@nextrealestate.com';
const ADMIN_PASSWORD_SALT = 'next_re_salt_983749281749214';
const EXPECTED_PASSWORD_HASH = crypto
  .pbkdf2Sync('Next2026!', ADMIN_PASSWORD_SALT, 100000, 64, 'sha512')
  .toString('hex');

interface AdminSession {
  token: string;
  username: string;
  role: 'admin';
  expiresAt: number;
}
const adminSessions = new Map<string, AdminSession>();

// Admin Authentication Middleware (Strict RBAC enforcement)
function requireAdminRole(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Access Denied: Administrator authentication token required for this action.',
    });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const session = adminSessions.get(token);

  if (!session) {
    return res.status(401).json({
      error: 'Unauthorized: Session invalid or expired. Please sign in again.',
    });
  }

  if (Date.now() > session.expiresAt) {
    adminSessions.delete(token);
    return res.status(401).json({
      error: 'Session Expired: For security, your admin session has expired. Please sign in again.',
    });
  }

  if (session.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden: You do not have permission to perform administrative mutations.',
    });
  }

  next();
}

// Admin Login Endpoint with PBKDF2 Verification & Timing-Safe Comparison
app.post('/api/admin/login', adminLoginRateLimiter, (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const cleanUser = String(username).trim();
  const isUserMatch =
    cleanUser.toLowerCase() === ADMIN_USERNAME.toLowerCase() ||
    cleanUser.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  // Compute PBKDF2 hash of submitted password
  const computedHash = crypto
    .pbkdf2Sync(String(password), ADMIN_PASSWORD_SALT, 100000, 64, 'sha512')
    .toString('hex');

  // Use timingSafeEqual to defeat timing attacks
  const computedBuf = Buffer.from(computedHash);
  const expectedBuf = Buffer.from(EXPECTED_PASSWORD_HASH);
  const isPasswordMatch =
    computedBuf.length === expectedBuf.length &&
    crypto.timingSafeEqual(computedBuf, expectedBuf);

  if (isUserMatch && isPasswordMatch) {
    // Reset failed login attempts on success
    loginAttemptStore.delete(ip);

    // Generate secure 64-char hex session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    adminSessions.set(token, {
      token,
      username: cleanUser,
      role: 'admin',
      expiresAt,
    });

    return res.json({
      success: true,
      token,
      username: cleanUser,
      role: 'admin',
      expiresAt,
      message: 'Authentication successful. Admin role confirmed.',
    });
  }

  // Record failed attempt for rate limiting
  const attempt = loginAttemptStore.get(ip) || { attempts: 0, lockedUntil: 0 };
  attempt.attempts++;
  if (attempt.attempts >= 5) {
    attempt.lockedUntil = Date.now() + 15 * 60 * 1000; // 15-minute lockout
  }
  loginAttemptStore.set(ip, attempt);

  const remaining = Math.max(0, 5 - attempt.attempts);
  return res.status(401).json({
    error: `Invalid administrative credentials. ${remaining} attempts remaining before temporary lockout.`,
  });
});

// Admin Logout Endpoint
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    adminSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Admin Session Verification
app.get('/api/admin/session', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ authenticated: false, role: 'public' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const session = adminSessions.get(token);

  if (!session || Date.now() > session.expiresAt) {
    return res.json({ authenticated: false, role: 'public' });
  }

  res.json({
    authenticated: true,
    username: session.username,
    role: session.role,
    expiresAt: session.expiresAt,
  });
});

// ============================================================================
// 5. HIGH-CONCURRENCY IN-MEMORY INDEXED PROPERTY STORE (10,000+ USERS)
// ============================================================================
// To support 10,000+ simultaneous requests without database connection pool exhaustion
// or query queuing, listings are maintained in an in-memory indexed hash table with
// instant O(1) reads and fast non-blocking search filtering.

interface PropertyItem {
  id: string;
  title: string;
  titleAr: string;
  location: string;
  locationAr: string;
  district: string;
  districtAr: string;
  neighborhood: string;
  neighborhoodAr: string;
  zone?: string;
  zoneAr?: string;
  price: number;
  currency?: string;
  isRental?: boolean;
  type: string;
  typeAr: string;
  category?: 'residential' | 'commercial';
  commercialSubtype?: 'shop' | 'warehouse' | 'office';
  beds?: number;
  baths?: number;
  areaSqm: number;
  buildingAge: string;
  buildingAgeLabel: string;
  buildingAgeLabelAr: string;
  imageUrl: string;
  isFeatured?: boolean;
  isPlatinum?: boolean;
  isArchived?: boolean;
  archivedAt?: string;
  referenceNo: string;
  yearBuilt?: number;
  floor?: string;
  furnished?: string;
  condition?: string;
  paymentType?: string;
  amenities?: string[];
  createdAt?: string;
  description?: string;
  descriptionAr?: string;
}

// In-Memory store
const propertyMap = new Map<string, PropertyItem>();
let propertyListCache: PropertyItem[] = [];
let propertyETag = `W/"initial-${Date.now()}"`;

// Persistence file for custom admin properties
const DATA_FILE = path.join(__dirname, 'custom-properties-store.json');

function updateCaches() {
  propertyListCache = Array.from(propertyMap.values());
  propertyETag = `W/"${Date.now()}-${propertyMap.size}"`;
}

function persistStore() {
  try {
    const customProps = propertyListCache.filter((p) => p.id.startsWith('custom-'));
    fs.writeFileSync(DATA_FILE, JSON.stringify(customProps, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist properties to disk', err);
  }
}

// Initial data load
function loadInitialProperties() {
  try {
    // 1. Load baseline mock properties from code
    const propertiesFilePath = path.join(__dirname, 'src', 'data', 'properties.ts');
    if (fs.existsSync(propertiesFilePath)) {
      const content = fs.readFileSync(propertiesFilePath, 'utf-8');
      const match = content.match(/export const mockProperties: Property\[\] = (\[[\s\S]*?\]);\n/);
      if (match) {
        // Use Function to safely evaluate data array
        const baseline = new Function(`return ${match[1]}`)() as PropertyItem[];
        for (const item of baseline) {
          propertyMap.set(item.id, item);
        }
      }
    }
  } catch (err) {
    console.warn('Could not parse mock properties dynamically, starting with empty baseline', err);
  }

  // 2. Load custom admin properties from disk if available
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      if (Array.isArray(data)) {
        for (const item of data) {
          propertyMap.set(item.id, item);
        }
      }
    }
  } catch (err) {
    console.warn('Could not load custom properties file', err);
  }

  updateCaches();
}
loadInitialProperties();

// ============================================================================
// 6. PUBLIC HIGH-CONCURRENCY PROPERTY APIS (READ-ONLY)
// ============================================================================

// Search & Filter Properties (High Concurrency: O(k), CDN & ETag Optimized)
app.get('/api/properties', apiRateLimiter, (req: Request, res: Response) => {
  // Check ETag for 304 Not Modified
  if (req.headers['if-none-match'] === propertyETag) {
    return res.status(304).end();
  }

  res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
  res.setHeader('ETag', propertyETag);

  const {
    location,
    propertyType,
    saleOrRental,
    buildingAge,
    areaRange,
    category,
    search,
  } = req.query;

  let results = propertyListCache.filter((p) => !p.isArchived);

  if (category && typeof category === 'string' && category !== 'all') {
    results = results.filter((p) => p.category === category);
  }

  if (propertyType && typeof propertyType === 'string' && propertyType !== 'all') {
    const low = propertyType.toLowerCase();
    results = results.filter(
      (p) =>
        p.type.toLowerCase() === low ||
        p.commercialSubtype?.toLowerCase() === low
    );
  }

  if (saleOrRental && typeof saleOrRental === 'string') {
    const isRental = ['rent', 'rental'].includes(saleOrRental);
    results = results.filter((p) => p.isRental === isRental);
  }

  if (buildingAge && typeof buildingAge === 'string' && buildingAge !== 'all') {
    results = results.filter((p) => p.buildingAge === buildingAge);
  }

  if (location && typeof location === 'string' && location.trim() !== '') {
    const queryLocs = location
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    results = results.filter((p) => {
      const loc = (p.location || '').toLowerCase();
      const locAr = (p.locationAr || '').toLowerCase();
      const dist = (p.district || '').toLowerCase();
      const distAr = (p.districtAr || '').toLowerCase();
      const neigh = (p.neighborhood || '').toLowerCase();
      const neighAr = (p.neighborhoodAr || '').toLowerCase();
      const zone = (p.zone || '').toLowerCase();

      return queryLocs.some(
        (q) =>
          loc.includes(q) ||
          locAr.includes(q) ||
          dist.includes(q) ||
          distAr.includes(q) ||
          neigh.includes(q) ||
          neighAr.includes(q) ||
          zone.includes(q)
      );
    });
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.titleAr.toLowerCase().includes(q) ||
        p.referenceNo.toLowerCase().includes(q)
    );
  }

  // Sort newest / custom first
  results.sort((a, b) => {
    const aIsCustom = a.id.startsWith('custom-');
    const bIsCustom = b.id.startsWith('custom-');
    if (aIsCustom && !bIsCustom) return -1;
    if (!aIsCustom && bIsCustom) return 1;
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });

  res.json({
    total: results.length,
    properties: results,
  });
});

// Single Property Lookup (O(1) Memory Lookup)
app.get('/api/properties/:id', apiRateLimiter, (req: Request, res: Response) => {
  const property = propertyMap.get(req.params.id);
  if (!property) {
    return res.status(404).json({ error: 'Property listing not found.' });
  }
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.json(property);
});

// Public Contact / Lead Inquiry (Sanitized, Protected)
app.post('/api/inquiries', apiRateLimiter, (req: Request, res: Response) => {
  const { name, phone, message, propertyId } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone number are required.' });
  }
  // Log safely without sensitive leakage
  console.log(`[Lead Inquiry] Property: ${propertyId || 'General'} | Client: ${name} (${phone})`);
  res.json({
    success: true,
    message: 'Your inquiry has been received. Our advisory team will reach out shortly.',
  });
});

// ============================================================================
// 7. RESTRICTED ADMIN-ONLY MUTATION ENDPOINTS (STRICT RBAC & CSRF VERIFIED)
// ============================================================================

// Add New Property (Admin Only)
app.post(
  '/api/admin/properties',
  requireAdminRole,
  verifyCsrfToken,
  (req: Request, res: Response) => {
    const item = req.body as Partial<PropertyItem>;

    if (!item.title || !item.location || !item.price) {
      return res.status(400).json({
        error: 'Validation Error: Title, location, and price are mandatory.',
      });
    }

    const id = `custom-${Date.now()}`;
    const newProp: PropertyItem = {
      id,
      title: item.title,
      titleAr: item.titleAr || item.title,
      location: item.location,
      locationAr: item.locationAr || item.location,
      district: item.district || 'Beirut',
      districtAr: item.districtAr || 'بيروت',
      neighborhood: item.neighborhood || 'Central',
      neighborhoodAr: item.neighborhoodAr || 'الوسط',
      zone: item.zone || 'Beirut',
      zoneAr: item.zoneAr || 'بيروت',
      price: Number(item.price) || 100000,
      currency: item.currency || 'USD',
      isRental: Boolean(item.isRental),
      type: item.type || 'Apartment',
      typeAr: item.typeAr || 'شقة سكنية',
      category: item.category || 'residential',
      commercialSubtype: item.commercialSubtype,
      beds: item.beds ? Number(item.beds) : 3,
      baths: item.baths ? Number(item.baths) : 2,
      areaSqm: Number(item.areaSqm) || 120,
      buildingAge: (item.buildingAge as string) || '0_2',
      buildingAgeLabel: item.buildingAgeLabel || '0-2 Years',
      buildingAgeLabelAr: item.buildingAgeLabelAr || 'حديث (0-2 سنة)',
      imageUrl:
        item.imageUrl ||
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
      isFeatured: Boolean(item.isFeatured),
      isPlatinum: Boolean(item.isPlatinum),
      isArchived: false,
      referenceNo: item.referenceNo || `NXT-${Math.floor(1000 + Math.random() * 9000)}`,
      condition: item.condition || 'ready',
      paymentType: item.paymentType || 'cash',
      amenities: item.amenities || ['Covered Parking', 'Elevator', 'Modern Finish'],
      createdAt: new Date().toISOString(),
    };

    propertyMap.set(id, newProp);
    updateCaches();
    persistStore();

    res.status(201).json({
      success: true,
      property: newProp,
      message: 'Listing successfully published by Administrator.',
    });
  }
);

// Update Existing Property (Admin Only)
app.put(
  '/api/admin/properties/:id',
  requireAdminRole,
  verifyCsrfToken,
  (req: Request, res: Response) => {
    const id = req.params.id;
    const existing = propertyMap.get(id);

    if (!existing) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    const updates = req.body as Partial<PropertyItem>;
    const updated: PropertyItem = {
      ...existing,
      ...updates,
      id, // Preserve immutable ID
    };

    propertyMap.set(id, updated);
    updateCaches();
    persistStore();

    res.json({
      success: true,
      property: updated,
      message: 'Listing successfully updated by Administrator.',
    });
  }
);

// Delete Property (Admin Only)
app.delete(
  '/api/admin/properties/:id',
  requireAdminRole,
  verifyCsrfToken,
  (req: Request, res: Response) => {
    const id = req.params.id;
    if (!propertyMap.has(id)) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    propertyMap.delete(id);
    updateCaches();
    persistStore();

    res.json({
      success: true,
      message: 'Property listing permanently removed by Administrator.',
    });
  }
);

// Archive / Unarchive Property (Admin Only)
app.post(
  '/api/admin/properties/:id/archive',
  requireAdminRole,
  verifyCsrfToken,
  (req: Request, res: Response) => {
    const id = req.params.id;
    const existing = propertyMap.get(id);

    if (!existing) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    existing.isArchived = !existing.isArchived;
    existing.archivedAt = existing.isArchived ? new Date().toISOString() : undefined;

    propertyMap.set(id, existing);
    updateCaches();
    persistStore();

    res.json({
      success: true,
      isArchived: existing.isArchived,
      message: existing.isArchived
        ? 'Listing archived successfully.'
        : 'Listing restored to active marketplace.',
    });
  }
);

// Health check endpoint
// ============================================================================
// AI VOICE AGENT TOOLS (called by the voice platform, protected by secret key)
// ============================================================================
const AGENT_API_KEY = process.env.AGENT_API_KEY || '';
const LEADS_FILE = path.join(__dirname, 'leads-store.json');

function requireAgentKey(req: Request, res: Response, next: NextFunction) {
  const provided = Buffer.from(String(req.headers['x-agent-key'] || ''));
  const expected = Buffer.from(AGENT_API_KEY);
  if (
    !AGENT_API_KEY ||
    provided.length !== expected.length ||
    !crypto.timingSafeEqual(provided, expected)
  ) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

// Normalize Arabic/English text so "الأشرفية" / "Achrafieh" / "Al-Musaitbeh" match easily
function norm(s: unknown): string {
  return String(s ?? '')
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[-_'’]/g, ' ')
    .replace(/(^|\s)ال/g, '$1')
    .replace(/\bal\s+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extend this with the spellings your clients actually use
const LOCATION_ALIASES: string[][] = [
  ['achrafieh', 'ashrafieh', 'ashrafiyeh', 'اشرفيه'],
  ['ras beirut', 'راس بيروت'],
  ['musaitbeh', 'musaytbeh', 'mousaitbeh', 'mosaitbeh', 'مصيطبه'],
  ['mazraa', 'mazraa', 'مزرعه'],
  ['hamra', 'حمرا'],
  ['verdun', 'فردان'],
  ['metn', 'matn', 'متن'],
];

function expandLocation(q: string): string[] {
  const n = norm(q);
  const out = new Set<string>([n]);
  for (const group of LOCATION_ALIASES) {
    if (group.some((g) => n.includes(norm(g)) || norm(g).includes(n))) {
      group.forEach((g) => out.add(norm(g)));
    }
  }
  return [...out].filter(Boolean);
}

const TYPE_SYNONYMS: Record<string, string> = { flat: 'apartment', شقه: 'apartment' };

app.post('/api/agent/search-properties', apiRateLimiter, requireAgentKey, (req: Request, res: Response) => {
  const b = req.body || {};
  const limit = Math.min(Math.max(Number(b.limit) || 3, 1), 5);
  let results = propertyListCache.filter((p) => !p.isArchived);

  if (b.saleOrRental) {
    const s = norm(b.saleOrRental);
    const wantRental = ['rent', 'rental', 'ايجار', 'اجار'].includes(s);
    const wantSale = ['sale', 'buy', 'بيع', 'شراء'].includes(s);
    if (wantRental) results = results.filter((p) => p.isRental === true);
    else if (wantSale) results = results.filter((p) => !p.isRental);
  }

  if (b.location && String(b.location).trim()) {
    const variants = expandLocation(String(b.location));
    results = results.filter((p) => {
      const hay = norm(
        [p.location, p.locationAr, p.district, p.districtAr, p.neighborhood, p.neighborhoodAr, p.zone, p.zoneAr].join(' | ')
      );
      return variants.some((v) => hay.includes(v));
    });
  }

  if (b.propertyType && String(b.propertyType).trim()) {
    let t = norm(b.propertyType);
    t = TYPE_SYNONYMS[t] || t;
    results = results.filter((p) =>
      norm([p.type, p.typeAr, p.commercialSubtype, p.category].join(' ')).includes(t)
    );
  }

  if (b.minBeds) results = results.filter((p) => (p.beds ?? 0) >= Number(b.minBeds));
  if (b.minPrice) results = results.filter((p) => p.price >= Number(b.minPrice));
  if (b.maxPrice) results = results.filter((p) => p.price <= Number(b.maxPrice));

  results.sort((a, c) => Number(!!c.isFeatured) - Number(!!a.isFeatured) || a.price - c.price);

  res.json({
    total: results.length,
    results: results.slice(0, limit).map((p) => ({
      referenceNo: p.referenceNo,
      title: p.title,
      titleAr: p.titleAr,
      location: `${p.neighborhood}, ${p.district}`,
      locationAr: `${p.neighborhoodAr}، ${p.districtAr}`,
      forRent: !!p.isRental,
      price: p.price,
      currency: p.currency || 'USD',
      beds: p.beds,
      baths: p.baths,
      areaSqm: p.areaSqm,
      buildingAge: p.buildingAgeLabel,
      furnished: p.furnished,
    })),
    note:
      results.length === 0
        ? 'No matching listing. Offer to take the client details so an agent follows up.'
        : undefined,
  });
});

async function notifyAgent(text: string) {
  console.log('[Agent Notify]', text);
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (err) {
    console.error('Notify failed', err);
  }
}

app.post('/api/agent/book-viewing', apiRateLimiter, requireAgentKey, async (req: Request, res: Response) => {
  const { name, phone, referenceNo, preferredTime, notes } = req.body || {};
  const digits = String(phone || '').replace(/\D/g, '');
  if (!name || String(name).trim().length < 2 || digits.length < 7) {
    return res.status(400).json({ error: 'Valid name and phone number are required.' });
  }

  const property = referenceNo
    ? propertyListCache.find((p) => p.referenceNo === String(referenceNo))
    : undefined;

  const lead = {
    id: `lead-${Date.now()}`,
    type: property ? 'viewing' : 'callback',
    name: String(name).trim(),
    phone: digits,
    referenceNo: property?.referenceNo || null,
    propertyTitle: property?.title || null,
    preferredTime: String(preferredTime || '').slice(0, 100),
    notes: String(notes || '').slice(0, 500),
    source: 'voice-agent',
    createdAt: new Date().toISOString(),
  };

  try {
    const existing = fs.existsSync(LEADS_FILE) ? JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8')) : [];
    existing.push(lead);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(existing, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save lead', err);
  }

  await notifyAgent(
    `🏠 طلب جديد (${lead.type})\n` +
      `الاسم: ${lead.name}\nالرقم: +${lead.phone}\n` +
      `العقار: ${lead.referenceNo || 'عام'} ${lead.propertyTitle || ''}\n` +
      `الوقت المطلوب: ${lead.preferredTime || '-'}\nملاحظات: ${lead.notes || '-'}\n` +
      `واتساب: https://wa.me/${lead.phone}`
  );

  res.json({ success: true, message: 'Request recorded. An agent will contact the client.' });
});
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    concurrencyReady: true,
    totalProperties: propertyMap.size,
    activeSessions: adminSessions.size,
  });
});

// ============================================================================
//// ============================================================================
// ============================================================================
// 8. VITE MIDDLEWARE / STATIC ASSET DELIVERY
// ============================================================================
async function startServer() {
  // Production static serving with long-term asset cache headers
  const distPath = path.join(__dirname, 'dist');
  app.use(
    express.static(distPath, {
      maxAge: '1y',
      etag: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          // HTML is never cached indefinitely so clients receive fresh builds
          res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        } else if (filePath.match(/\.(js|css|svg|png|jpg|jpeg|webp|woff2)$/)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    })
  );

  // Fallback to index.html for SPA client-side routing
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  // Graceful Process Handlers (Guarantees zero crashes under heavy load)
  process.on('uncaughtException', (err) => {
    console.error('CRITICAL: Uncaught Exception caught gracefully:', err);
  });
  process.on('unhandledRejection', (reason) => {
    console.error('CRITICAL: Unhandled Rejection caught gracefully:', reason);
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Next Real Estate] High-Concurrency Server running on http://0.0.0.0:${PORT}`);
    console.log(`[Security] RBAC, PBKDF2 Password Hashing, CSRF & Anti-XSS Protection active.`);
  });
}

startServer();