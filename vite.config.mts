import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(async () => ({
  plugins: [tailwindcss(), vue()],
  test: {
    includeSource: ['src/**/*.{js,ts}'],
  },
}))
