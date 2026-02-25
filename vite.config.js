import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const offlineMock = env.VITE_OFFLINE_MOCK === 'true'

  return {
    logLevel: 'error',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        ...(offlineMock
          ? {
              '@base44/sdk': path.resolve(__dirname, 'src/mocks/base44Sdk.js'),
              '@base44/sdk/dist/utils/axios-client': path.resolve(__dirname, 'src/mocks/axiosClient.js')
            }
          : {})
      }
    },
    plugins: [react()],
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Core React runtime — tiny, always cached separately
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router-dom/') ||
              id.includes('node_modules/scheduler/')
            ) return 'react-core';
            // Supabase client
            if (id.includes('@supabase/')) return 'supabase';
            // Radix UI components
            if (id.includes('@radix-ui/')) return 'radix-ui';
            // TanStack Query
            if (id.includes('@tanstack/')) return 'tanstack';
            // Animation — not needed for public card
            if (id.includes('framer-motion')) return 'framer-motion';
            // Charts — only analytics pages
            if (id.includes('recharts') || id.includes('d3-')) return 'charts';
            // Heavy export tools
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('xlsx')) return 'export-tools';
            // Rich text editor
            if (id.includes('react-quill') || id.includes('quill')) return 'editor';
            // Three.js
            if (id.includes('node_modules/three')) return 'three';
            // Everything else from node_modules
            if (id.includes('node_modules')) return 'vendor';
          }
        }
      }
    }
  }
})

// import react from '@vitejs/plugin-react'
// import { defineConfig, loadEnv } from 'vite'
// import path from 'path'

// // https://vite.dev/config/
// export default defineConfig(({ mode }) => {
//   const env = loadEnv(mode, process.cwd(), '');
//   const offlineMock = env.VITE_OFFLINE_MOCK === 'true';

//   return {
//     logLevel: 'error', // Suppress warnings, only show errors
//     resolve: {
//       alias: {
//         '@': path.resolve(__dirname, 'src'),
//         ...(offlineMock
//           ? {
//               '@base44/sdk': path.resolve(__dirname, 'src/mocks/base44Sdk.js'),
//               '@base44/sdk/dist/utils/axios-client': path.resolve(__dirname, 'src/mocks/axiosClient.js')
//             }
//           : {})
//       }
//     },
//     plugins: [react()]
//   };
// });