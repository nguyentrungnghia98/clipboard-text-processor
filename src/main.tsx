import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import App from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <>
      <App />
      <ToastContainer />
      </>
)

postMessage({ payload: 'removeLoading' }, '*')
