import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig(async () => ({
  plugins: [vue()],
  test: {
    includeSource: ['src/**/*.{js,ts}'],
  },
}))
