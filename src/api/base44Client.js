import { supabase } from '@/lib/supabaseClient';

/**
 * @typedef {Object} EntityAPI
 * @property {Function} filter
 * @property {Function} create
 * @property {Function} update
 * @property {Function} delete
 * @property {Function} get
 * @property {Function} list
 */

/** @type {Object.<string, any>} */
const toSnakeCase = (value) => value.replace(/([A-Z])/g, '_$1').toLowerCase();

const defaultTableName = (entityName) => {
  const snake = toSnakeCase(entityName);
  return snake.endsWith('s') ? snake : `${snake}s`;
};

const entityTableMap = {
  User: 'users',
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

const getTableName = (entityName) => entityTableMap[entityName] || defaultTableName(entityName);

const columnMap = {
  '*': {
    created_date: 'created_at',
    updated_date: 'updated_at'
  },
  User: {
    full_name: 'full_name'
  },
  BusinessCard: {
    created_by_user_id: 'user_id'
  }
};

const mapField = (entityName, field, direction = 'toDb') => {
  const entityMap = columnMap[entityName] || {};
  const defaultMap = columnMap['*'] || {};
  const merged = { ...defaultMap, ...entityMap };

  if (direction === 'toDb') {
    return merged[field] || field;
  }

  const reverseMap = Object.entries(merged).reduce((acc, [from, to]) => {
    acc[to] = from;
    return acc;
  }, {});

  return reverseMap[field] || field;
};

const mapObject = (entityName, data, direction = 'toDb') => {
  if (!data || typeof data !== 'object') return data;
  return Object.entries(data).reduce((acc, [key, value]) => {
    const mappedKey = mapField(entityName, key, direction);
    acc[mappedKey] = value;
    return acc;
  }, {});
};

const mapRecord = (entityName, record) => mapObject(entityName, record, 'fromDb');

const applyFilters = (query, filters = {}, entityName) => {
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined) return;
    const mappedKey = mapField(entityName, key, 'toDb');
    const column = toSnakeCase(mappedKey);
    query.eq(column, value);
  });
  return query;
};

const applyOrder = (query, order, entityName) => {
  if (!order) return query;
  const desc = order.startsWith('-');
  const field = desc ? order.slice(1) : order;
  const mappedKey = mapField(entityName, field, 'toDb');
  return query.order(toSnakeCase(mappedKey), { ascending: !desc });
};

const applyLimit = (query, limit) => (typeof limit === 'number' ? query.limit(limit) : query);

const createEntityApi = (entityName) => {
  const table = getTableName(entityName);

  return {
    list: async (order, limit) => {
      let query = supabase.from(table).select('*');
      query = applyOrder(query, order, entityName);
      query = applyLimit(query, limit);
      const { data, error } = await query;
      if (error) throw error;
      return Array.isArray(data) ? data.map((item) => mapRecord(entityName, item)) : data;
    },
    filter: async (filters, order, limit) => {
      let query = supabase.from(table).select('*');
      query = applyFilters(query, filters, entityName);
      query = applyOrder(query, order, entityName);
      query = applyLimit(query, limit);
      const { data, error } = await query;
      if (error) throw error;
      return Array.isArray(data) ? data.map((item) => mapRecord(entityName, item)) : data;
    },
    create: async (data) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const user = userData?.user;
      const userEmail = user?.email;
      const payload = mapObject(entityName, data, 'toDb');
      if (userEmail && payload.created_by === undefined) {
        payload.created_by = userEmail;
      }
      if (entityName === 'BusinessCard') {
        if (!user?.id) {
          throw new Error('You must be signed in to create a card.');
        }
        if (payload.user_id === undefined) {
          payload.user_id = user.id;
        }
      }

      const { data: created, error } = await supabase
        .from(table)
        .insert(payload)
        .select('*')
        .single();
      if (error) throw error;
      return mapRecord(entityName, created);
    },
    update: async (id, updates) => {
      const payload = mapObject(entityName, updates, 'toDb');
      const { data: updated, error } = await supabase
        .from(table)
        .update(payload)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return mapRecord(entityName, updated);
    },
    delete: async (id) => {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return { id };
    }
  };
};

const profileTable = import.meta.env.VITE_SUPABASE_PROFILE_TABLE || 'profiles';

const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from(profileTable)
    .select('*')
    .or(`id.eq.${userId},user_id.eq.${userId}`)
    .maybeSingle();

  if (error) {
    return null;
  }
  return data || null;
};

const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from(profileTable)
    .update(updates)
    .or(`id.eq.${userId},user_id.eq.${userId}`)
    .select('*')
    .single();

  if (error) {
    return null;
  }
  return data;
};

export const base44 = {
  auth: {
    me: async () => {
      const { data: userData, error } = await supabase.auth.getUser();
      if (error) throw error;
      const user = userData?.user;
      if (!user) return null;
          const profile = await getUserProfile(user.id);
          return profile ? { ...user, ...mapRecord('User', profile) } : user;
    },
    updateMe: async (updates) => {
      const { data: userData, error } = await supabase.auth.getUser();
      if (error) throw error;
      const user = userData?.user;
      if (!user) throw new Error('No authenticated user');
          const profile = await updateUserProfile(user.id, mapObject('User', updates, 'toDb'));
          return profile ? { ...user, ...mapRecord('User', profile) } : user;
    },
    isAuthenticated: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return Boolean(data?.session);
    },
    logout: async (redirectUrl) => {
      await supabase.auth.signOut();
      if (redirectUrl && typeof window !== 'undefined') {
        window.location.href = redirectUrl;
      }
      return true;
    },
    redirectToLogin: async (redirectUrl = '/login') => {
      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl;
      }
      return true;
    }
  },
  entities: new Proxy({}, {
    get: (_, entityName) => createEntityApi(entityName)
  }),
  functions: {
    invoke: async (name, payload = {}) => {
      const { data, error } = await supabase.functions.invoke(name, { body: payload });
      if (error) throw error;
      return data;
    }
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        if (!file) return { file_url: null };
        const bucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'public';
        const path = `uploads/${Date.now()}_${file.name}`;
        const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
        if (error) throw error;
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return { file_url: data?.publicUrl || null };
      },
      InvokeLLM: async () => {
        throw new Error('InvokeLLM is not configured yet.');
      }
    }
  },
  appLogs: {
    logUserInApp: async () => true
  },
  asServiceRole: {
    entities: new Proxy({}, {
      get: (_, entityName) => createEntityApi(entityName)
    })
  }
};

/**
 * @type {{
 *   auth: {
 *     login: Function,
 *     signup: Function,
 *     isAuthenticated: Function,
 *     logout: Function,
 *     redirectToLogin: Function
 *   },
 *   entities: {
 *     BusinessCard: EntityAPI,
 *     CardView: EntityAPI,
 *     ContactSubmission: EntityAPI,
 *     [key: string]: EntityAPI
 *   },
 *   functions: {
 *     invoke: Function
 *   },
 *   integrations: Object,
 *   appLogs: Object,
 *   asServiceRole: Object
 * }}
 */
