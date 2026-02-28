import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SalaryProvider } from './context/SalaryContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <SalaryProvider>
            <App />
        </SalaryProvider>
    </React.StrictMode>,
)

