
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use (process as any) to bypass TS check for cwd() when node types are missing
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve((process as any).cwd(), "./"),
      },
    },
    define: {
      // Look for common API key names and use the first one found.
      // This makes local setup more forgiving.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.VITE_API_KEY || env.VITE_GEMINI_API_KEY || '')
    }
  }
})