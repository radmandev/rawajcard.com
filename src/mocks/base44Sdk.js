const createId = () => Math.random().toString(36).slice(2, 10);

const nowIso = () => new Date().toISOString();

const defaultData = {
  User: [
    {
      id: 'user_1',
      email: 'emadradman.dev@gmail.com',
      password: '12312312',
      full_name: 'Emad Radman',
      role: 'admin',
      crm_config: {},
      created_date: nowIso()
    },
    {
      id: 'user_2',
      email: 'demo@local.test',
      full_name: 'Offline Demo User',
      role: 'admin',
      crm_config: {},
      created_date: nowIso()
    }
  ],
  BusinessCard: [
    {
      id: 'card_1',
      name: 'Demo Card',
      slug: 'demo',
      status: 'published',
      created_by: 'demo@local.test',
      created_date: nowIso()
    }
  ],
  Subscription: [
    {
      id: 'sub_1',
      plan: 'starter',
      status: 'active',
      created_by: 'demo@local.test',
      created_date: nowIso()
    }
  ],
  Order: [
    {
      id: 'order_1',
      amount: 0,
      currency: 'USD',
      created_by: 'demo@local.test',
      created_date: nowIso()
    }
  ],
  CartItem: [
    {
      id: 'cart_1',
      product_id: 'prod_1',
      name: 'Mock Product',
      price: 0,
      quantity: 1,
      created_date: nowIso()
    }
  ],
  ContactSubmission: [],
  CardView: [],
  CustomTemplate: [],
  CustomizationRequest: [],
  Team: [],
  TeamMember: [],
  ActivityLog: []
};

const createEntityStore = () => {
  const store = new Map();
  Object.entries(defaultData).forEach(([key, items]) => {
    store.set(key, [...items]);
  });
  return store;
};

const createEntityApi = (entityName, store) => {
  const getItems = () => store.get(entityName) || [];
  const setItems = (items) => store.set(entityName, items);

  const sortItems = (items, order) => {
    if (!order) return items;
    const desc = order.startsWith('-');
    const field = desc ? order.slice(1) : order;
    return [...items].sort((a, b) => {
      const av = a?.[field];
      const bv = b?.[field];
      if (av === bv) return 0;
      if (av === undefined) return 1;
      if (bv === undefined) return -1;
      return desc ? (av < bv ? 1 : -1) : (av > bv ? 1 : -1);
    });
  };

  const limitItems = (items, limit) => (typeof limit === 'number' ? items.slice(0, limit) : items);

  const filterItems = (items, filters) => {
    if (!filters || Object.keys(filters).length === 0) return items;
    return items.filter((item) =>
      Object.entries(filters).every(([key, value]) => item?.[key] === value)
    );
  };

  return {
    list: async (order, limit) => {
      const items = getItems();
      return limitItems(sortItems(items, order), limit);
    },
    filter: async (filters, order, limit) => {
      const items = filterItems(getItems(), filters);
      return limitItems(sortItems(items, order), limit);
    },
    create: async (data) => {
      const items = getItems();
      const record = { id: createId(), created_date: nowIso(), ...data };
      setItems([record, ...items]);
      return record;
    },
    update: async (id, updates) => {
      const items = getItems();
      const updated = items.map((item) => (item.id === id ? { ...item, ...updates } : item));
      setItems(updated);
      return updated.find((item) => item.id === id) || null;
    },
    delete: async (id) => {
      const items = getItems();
      setItems(items.filter((item) => item.id !== id));
      return { id };
    }
  };
};

export const createClient = () => {
  const store = createEntityStore();

  const entities = new Proxy({}, {
    get: (_, entityName) => createEntityApi(entityName, store)
  });

  const auth = {
    me: async () => (store.get('User') || [])[0] || null,
    updateMe: async (updates) => {
      const user = (store.get('User') || [])[0];
      if (!user) return null;
      const updated = { ...user, ...updates };
      store.set('User', [updated]);
      return updated;
    },
    isAuthenticated: async () => true,
    logout: async () => true,
    redirectToLogin: async () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return true;
    }
  };

  const functions = {
    invoke: async (name, payload = {}) => {
      switch (name) {
        case 'createPayPalOrder':
          return { error: 'PayPal is temporarily disabled.' };
        case 'capturePayPalPayment':
          return { error: 'PayPal is temporarily disabled.' };
        case 'connectCRM':
        case 'testCRMConnection':
        case 'syncContactsToCRM':
        case 'sendContactToCRM':
          return { ok: true };
        default:
          return { ok: true, name, payload };
      }
    }
  };

  const integrations = {
    Core: {
      UploadFile: async ({ file }) => {
        if (typeof window !== 'undefined' && file instanceof File) {
          return { file_url: URL.createObjectURL(file) };
        }
        return { file_url: 'https://placehold.co/600x400' };
      },
      InvokeLLM: async () => ({ result: 'Mock response (offline mode).' })
    }
  };

  const appLogs = {
    logUserInApp: async () => true
  };

  const asServiceRole = { entities };

  return { auth, entities, functions, integrations, appLogs, asServiceRole };
};
