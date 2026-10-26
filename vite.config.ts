import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({mode})=>({
  plugins:[react()],
  base:mode==='production'?'/Music-hum-study-website/':'/',
  server:{host:'127.0.0.1'}
}));
