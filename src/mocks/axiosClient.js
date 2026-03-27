export const createAxiosClient = () => {
  return {
    get: async () => ({
      id: 'offline_app',
      public_settings: {
        auth_required: false
      }
    })
  };
};
