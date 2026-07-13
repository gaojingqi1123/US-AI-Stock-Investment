import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { TRPCProvider } from '@/providers/trpc'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <TRPCProvider>
    <HashRouter>
      <App />
    </HashRouter>
  </TRPCProvider>,
)
