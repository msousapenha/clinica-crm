import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Troque "clinica-crm" pelo nome exato do seu repositório no GitHub
  base: '/clinica-crm/',
})