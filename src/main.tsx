import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/app.css'
import './cms/cms.css'
import App from './App'
import { EditModeProvider } from './cms/EditModeProvider'
import './styles/responsive.css'
import './styles/typography.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EditModeProvider>
      <App />
    </EditModeProvider>
  </StrictMode>,
)
