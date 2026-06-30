import "./css/home.css";

export default function Home() {
  return (
    <section className="hero" id="inicio">
      <div className="hero__accent hero__accent--red" aria-hidden="true" />
      <div className="hero__accent hero__accent--yellow" aria-hidden="true" />

      <div className="hero__content">
        

        <h1 className="hero__title">
          Red Bull
          <span className="hero__title-highlight"> Quantum-Twin</span>
          <span className="hero__title-year"> 2026</span>
        </h1>

        <p className="hero__description">
          Plataforma de gemelo digital para telemetría y análisis de rendimiento
          en Formula 1. Bienvenido al panel principal.
        </p>

        <div className="hero__divider" aria-hidden="true">
          <span className="hero__divider-line hero__divider-line--red" />
          <span className="hero__divider-line hero__divider-line--yellow" />
          <span className="hero__divider-line hero__divider-line--blue" />
        </div>
      </div>
    </section>
  );
}
