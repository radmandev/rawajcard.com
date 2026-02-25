export const createAxiosClient = ({ baseURL = '', headers = {}, token } = {}) => {
  const buildHeaders = () => {
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    return { ...headers, ...authHeaders };
  };

  const offlineMock = import.meta.env.VITE_OFFLINE_MOCK === 'true';

  return {
    get: async (path) => {
      if (offlineMock) {
        return {
          id: 'offline_app',
          public_settings: {
            auth_required: false
          }
        };
      }

      const response = await fetch(`${baseURL}${path}`, {
        method: 'GET',
        headers: buildHeaders()
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const error = new Error(data?.message || response.statusText);
        error.status = response.status;
        error.data = data;
        throw error;
      }
      return data;
    }
  };
};
