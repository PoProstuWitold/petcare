import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	build: {
		outDir: '../resources/static/',
		emptyOutDir: true
	},
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:8080',
				changeOrigin: true
			}
		}
	}
})
