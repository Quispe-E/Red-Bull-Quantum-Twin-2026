import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './css/App.css'
import { Routes, Route, Navigate } from 'react-router-dom'

import Navbar from './navbar.jsx'
import Graficas from './graficas.jsx'
import Home from './home.jsx'


function App() {
  return (
    <div>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Navigate to={"/home"} replace/>}/>
        <Route path="/home" element={<Home/>} />
        <Route path="/graficas" element={<Graficas/>} />
      </Routes>
    </div>
  )

  
  
}

export default App
