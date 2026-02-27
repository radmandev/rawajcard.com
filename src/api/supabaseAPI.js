import { supabase } from '@/lib/supabaseClient';

// Hardcoded admin emails — users with these emails always get admin role
const ADMIN_EMAILS = [
  'emadradman.dev@gmail.com',
  'admin@rawajcard.com'
];

// Table name mapping for entity names
const entityTableMap = {
  User: 'profiles',
  Profile: 'profiles',
  BusinessCard: 'business_cards',
  ContactSubmission: 'contact_submissions',
  CardView: 'card_views',
  Subscription: 'subscriptions',
  Order: 'orders',
  CartItem: 'cart_items',
  CustomTemplate: 'custom_templates',
  CustomizationRequest: 'customization_requests',
  Team: 'teams',
  TeamMember: 'team_members',
  ActivityLog: 'activity_logs'
};

const getTableName = (entityName) => {
  return entityTableMap[entityName] || entityName.toLowerCase();
};

/**
 * Create entity API with CRUD operations
 * @param {string} entityName - Name of the entity
 * @returns {Object} Entity API with filter, list, create, update, delete, get methods
 */
const createEntityApi = (entityName) => {
  const tableName = getTableName(entityName);

  return {
    /**
     * Filter records by conditions
     * @param {Object} filters - Filter conditions
     * @param {string} orderBy - Order by field (e.g., '-created_at')
     * @returns {Promise<Array>} Array of records
     */
    filter: async (filters = {}, orderBy = null) => {
      let query = supabase.from(tableName).select('*');

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query = query.eq(key, value);
        }
      });

      // Apply ordering
      if (orderBy) {
        const isDesc = orderBy.startsWith('-');
        const field = isDesc ? orderBy.slice(1) : orderBy;
        query = query.order(field, { ascending: !isDesc });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    /**
     * List all records with optional ordering and limit
     * @param {string} orderBy - Order by field (e.g., '-created_at')
     * @param {number} limit - Limit number of records
     * @returns {Promise<Array>} Array of records
     */
    list: async (orderBy = null, limit = null) => {
      let query = supabase.from(tableName).select('*');

      // Apply ordering
      if (orderBy) {
        const isDesc = orderBy.startsWith('-');
        const field = isDesc ? orderBy.slice(1) : orderBy;
        query = query.order(field, { ascending: !isDesc });
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    /**
     * Get a single record by ID
     * @param {string} id - Record ID
     * @returns {Promise<Object>} Single record
     */
    get: async (id) => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Create a new record
     * @param {Object} data - Record data
     * @returns {Promise<Object>} Created record
     */
    create: async (data) => {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },

    /**
     * Update a record
     * @param {string} id - Record ID
     * @param {Object} data - Updated data
     * @returns {Promise<Object>} Updated record
     */
    update: async (id, data) => {
      const { data: result, error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },

    /**
     * Delete a record
     * @param {string} id - Record ID
     * @returns {Promise<boolean>} Success status
     */
    delete: async (id) => {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    }
  };
};

/**
 * Probe which columns actually exist in a table by doing SELECT LIMIT 0
 * and parsing "Could not find the 'X' column" errors.
 * Cached per (tableName + sorted column list) so adding new desired columns
 * always triggers a fresh probe.
 */
const _colCache = {};
export const probeTableColumns = async (tableName, desiredColumns) => {
  const cacheKey = tableName + ':' + [...desiredColumns].sort().join(',');
  if (_colCache[cacheKey]) return _colCache[cacheKey];

  const valid = [...desiredColumns];
  while (valid.length > 0) {
    const { error } = await supabase
      .from(tableName)
      .select(valid.join(', '))
      .limit(0);

    if (!error) break; // all remaining columns exist

    const match = error.message?.match(/Could not find the '(.+?)' column/);
    if (match) {
      const bad = match[1];
      const idx = valid.indexOf(bad);
      if (idx !== -1) { valid.splice(idx, 1); continue; }
    }
    break; // different error — stop probing
  }

  _colCache[cacheKey] = valid;
  return valid;
};

/**
 * Build a payload that only includes columns known to exist.
 */
export const safePayload = (desired, validCols) => {
  const set = new Set(validCols);
  return Object.fromEntries(Object.entries(desired).filter(([k]) => set.has(k)));
};

/**
 * Main API client
 */
export const api = {
  // Auth methods
  auth: {
    /**
     * Sign in with email and password
     */
    login: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return data;
    },

    /**
     * Sign up with email and password
     */
    signup: async (email, password, metadata = {}) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
      });
      if (error) throw error;
      return data;
    },

    /**
     * Get current user (merged with profile data including role)
     */
    me: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      const authUser = data?.user || null;
      if (!authUser) return null;

      // Fetch profile to get role and other metadata
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name, crm_config')
        .eq('id', authUser.id)
        .single();

      // Determine role: hardcoded admins always get admin role
      const isHardcodedAdmin = ADMIN_EMAILS.includes(authUser.email);
      const role = isHardcodedAdmin ? 'admin' : (profile?.role || 'user');

      return {
        ...authUser,
        email: authUser.email,
        full_name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
        role,
        crm_config: profile?.crm_config || {},
      };
    },

    /**
     * Update current user metadata
     */
    updateMe: async (updates) => {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });
      if (error) throw error;
      return data?.user || null;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return Boolean(data?.session);
    },

    /**
     * Sign out
     */
    logout: async (redirectUrl) => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      if (redirectUrl && typeof window !== 'undefined') {
        window.location.href = redirectUrl;
      }
      return true;
    },

    /**
     * Redirect to login
     */
    redirectToLogin: async (redirectUrl = '/login') => {
      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl;
      }
      return true;
    }
  },

  // Dynamic entity access
  entities: new Proxy({}, {
    // @ts-ignore
    get: (_, entityName) => createEntityApi(entityName)
  }),

  // Supabase functions (serverless)
  functions: {
    _decodeJwtPayload: (token) => {
      try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = payload + '='.repeat((4 - payload.length % 4) % 4);
        return JSON.parse(atob(padded));
      } catch {
        return null;
      }
    },

    _getAccessToken: async (forceRefresh = false) => {
      const readToken = async () => {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          throw new Error(`Session error: ${sessionError.message}`);
        }
        return sessionData?.session?.access_token || null;
      };

      let token = await readToken();
      if (!token) return null;

      const payload = api.functions._decodeJwtPayload(token);
      const expMs = Number(payload?.exp || 0) * 1000;
      const almostExpired = !expMs || (Date.now() + 60_000) >= expMs;

      if (forceRefresh || almostExpired) {
        const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
        if (!refreshError && refreshed?.session?.access_token) {
          return refreshed.session.access_token;
        }

        if (forceRefresh) {
          const detail = refreshError?.message || 'unknown refresh failure';
          throw new Error(`Session refresh failed: ${detail}. Please log in again.`);
        }

        // Non-forced path: keep existing token, gateway retry flow will decide.
      }

      return token;
    },

    /**
     * Invoke a Supabase Edge Function — explicitly attaches the current JWT
     * so Supabase gateway never returns 401 due to a missing/stale session header
     */
    invoke: async (name, payload = {}) => {
      let token = await api.functions._getAccessToken(false);

      if (!token) {
        throw new Error('Not authenticated — please log in.');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const callFunction = async (jwt) => fetch(`${supabaseUrl}/functions/v1/${name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify(payload),
      });

      let res = await callFunction(token);

      // Supabase gateway rejects invalid/expired JWTs before function code runs.
      // Retry once with a forced refresh to recover OAuth/local-session drift.
      if (res.status === 401) {
        token = await api.functions._getAccessToken(true);
        if (!token) {
          throw new Error('Session expired — please log in again.');
        }
        res = await callFunction(token);
      }

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Function '${name}' returned non-JSON (HTTP ${res.status})`);
      }

      if (!res.ok) {
        const msg = data?.message || data?.error || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data;
    }
  },

  // File integrations
  integrations: {
    Core: {
      /**
       * Compress + convert an image to JPEG via canvas.
       * Handles HEIC/HEIF (iOS), empty MIME types (Android), and oversized files.
       * Falls back to original file if anything goes wrong.
       */
      _compressImage: (file, maxPx = 1400, quality = 0.85) => {
        return new Promise((resolve) => {
          const mimeType = file.type || '';
          // Skip non-images and SVGs (can't canvas-draw SVG reliably)
          if (mimeType === 'image/svg+xml') { resolve(file); return; }
          // For any image/* type (including heic/heif) or empty type, attempt canvas conversion
          if (mimeType && !mimeType.startsWith('image/')) { resolve(file); return; }

          const reader = new FileReader();
          reader.onload = (evt) => {
            const img = new Image();
            img.onload = () => {
              let { width, height } = img;
              if (width > maxPx || height > maxPx) {
                if (width >= height) {
                  height = Math.round((height * maxPx) / width);
                  width = maxPx;
                } else {
                  width = Math.round((width * maxPx) / height);
                  height = maxPx;
                }
              }
              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              // White background (handles PNG transparency → JPEG)
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    resolve(new File([blob], 'image.jpg', { type: 'image/jpeg' }));
                  } else {
                    resolve(file);
                  }
                },
                'image/jpeg',
                quality
              );
            };
            img.onerror = () => resolve(file);
            img.src = evt.target.result;
          };
          reader.onerror = () => resolve(file);
          reader.readAsDataURL(file);
        });
      },

      /**
       * Upload a file to Supabase Storage
       */
      UploadFile: async ({ file }) => {
        if (!file) return { file_url: null };

        // Compress + convert to JPEG (fixes HEIC, empty MIME type, large files)
        let uploadFile = file;
        try {
          uploadFile = await api.integrations.Core._compressImage(file);
        } catch {
          // If compression fails for any reason, fall back to original
          uploadFile = file;
        }

        const bucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'public';
        // Always use a safe UUID-based path to avoid filename issues
        const ext = uploadFile.type === 'image/jpeg' ? 'jpg'
          : uploadFile.type === 'image/png' ? 'png'
          : uploadFile.type === 'image/webp' ? 'webp'
          : 'jpg';
        const path = `uploads/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

        const { data, error } = await supabase.storage.from(bucket).upload(path, uploadFile, {
          upsert: true,
          contentType: uploadFile.type || 'image/jpeg',
        });

        if (error) {
          console.error('Supabase storage upload error:', error);
          throw new Error(error.message || 'Upload failed');
        }

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
        return { file_url: urlData?.publicUrl || null };
      },

      /**
       * Invoke LLM (not yet configured)
       */
      InvokeLLM: async () => {
        throw new Error('InvokeLLM is not configured yet.');
      }
    }
  },

  // App logging
  appLogs: {
    logUserInApp: async (pageName) => {
      // Log user activity (can be extended to save to database)
      console.log('User activity:', pageName);
      return true;
    }
  },

  // Service role access
  asServiceRole: {
    entities: new Proxy({}, {
      // @ts-ignore
      get: (_, entityName) => createEntityApi(entityName)
    })
  }
};

export default api;
