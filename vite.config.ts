import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

const manualChunks = (id: string) => {
  if (!id.includes('node_modules')) return undefined;
  if (id.includes('react-router-dom')) return 'router';
  if (id.includes('recharts')) return 'charts';
  if (id.includes('framer-motion')) return 'motion';
  if (id.includes('@radix-ui') || id.includes('cmdk') || id.includes('vaul') || id.includes('sonner')) return 'ui';
  if (id.includes('react')) return 'react-vendor';
  return undefined;
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  
  return {
    server: {
      host: '::',
      port: 8080,
      hmr: {
        overlay: true,
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    },
    build: {
      outDir: 'dist',
      sourcemap: isDev,
      minify: isDev ? false : 'terser',
      terserOptions: isDev ? {} : {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks,
          entryFileNames: 'js/[name]-[hash].js',
          chunkFileNames: 'js/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (name && name.endsWith('.css')) {
              return 'css/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
    },
    define: {
      __DEV__: JSON.stringify(isDev),
    },
  };
});
