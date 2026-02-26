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
    // Use relative asset paths so deployments from subfolders (common on shared hosting)
    // do not request scripts/styles from domain root.
    base: './',
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
