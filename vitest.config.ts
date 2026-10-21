import { defineConfig } from 'vitest/config'

export default defineConfig({
  define: {
    'import.meta.env.VITE_API_HOST_URL': JSON.stringify('http://localhost:8080'),
    'import.meta.env.VITE_SOCKET_URL': JSON.stringify('ws://localhost:8080/ws'),
  },
  test: {
    coverage: {
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/main.tsx',
        'src/setupTests.ts',
      ],
      include: ['src/**/*.{ts,tsx}'],
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
    },
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: './src/setupTests.ts',
    globals: true,
  },
})
