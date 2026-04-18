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
  const publicBasePath = env.VITE_PUBLIC_BASE_PATH || '/'

  return {
    logLevel: 'error',
    // Use an absolute root base by default so deep links like /c/demo load /assets/* correctly.
    // Override with VITE_PUBLIC_BASE_PATH when deploying under a subdirectory.
    base: publicBasePath,
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
      // Target browsers that support native ESM + dynamic import + import.meta
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
      // Explicit hashed filenames so stale caches never serve mismatched assets
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
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
