import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            '@/app': resolve(__dirname, './src/app'),
            '@/shared': resolve(__dirname, './src/shared'),
            '@/features': resolve(__dirname, './src/features'),
            '@/styles': resolve(__dirname, './src/styles'),
            '@/assets': resolve(__dirname, './src/assets'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
})
