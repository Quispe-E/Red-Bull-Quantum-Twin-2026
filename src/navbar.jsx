import { useState } from "react"
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import redbullImg from './assets/rb3.png'
import { Link } from "react-router-dom"
import "./css/navbar.css";


function Navbar() {
    return (
       <nav className="nav">
            <div className="logo-container">
                <img src={redbullImg} className="logo-img"/>
                <h2 className="logo">Red Bull Quantum-Twin 2026</h2>
            </div>

            <div className="links">
                <Link to="/home" className="link">Inicio</Link>
                <Link to="/graficas" className="link">Gráficas</Link>
                <Link to="/alertas" className="link">Alertas</Link>
            </div>
    </nav>
    )
}

export default Navbar