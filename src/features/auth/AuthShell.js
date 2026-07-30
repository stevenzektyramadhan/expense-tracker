// Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V4
// Hallmark · genre: modern-minimal · macrostructure: Split Studio · design-system: Calm Ledger · designed-as-app
import Image from "next/image";

export default function AuthShell({
  children,
  description,
  footer,
  title,
}) {
  return (
    <main className="auth-shell">
      <section className="auth-shell__brand" aria-label="Tentang kiteCatat">
        <div className="auth-shell__brand-lockup">
          <Image
            src="/kitecatat_pwa_192.png"
            alt=""
            width={56}
            height={56}
            className="auth-shell__logo"
            priority
          />
          <p className="auth-shell__wordmark" aria-label="kiteCatat">
            <span>kite</span>
            <strong>Catat</strong>
          </p>
        </div>

        <div className="auth-shell__brand-copy">
          <p className="auth-shell__brand-title">
            Catat pengeluaran ketika terjadi. Tinjau sisanya tanpa menebak.
          </p>
          <p className="auth-shell__brand-description">
            kiteCatat menyatukan uang saku, pengeluaran, pendapatan tambahan,
            dan ringkasan bulanan dalam satu catatan pribadi.
          </p>
        </div>
      </section>

      <section className="auth-shell__panel">
        <div className="auth-shell__card">
          <header className="auth-shell__heading">
            <h1>{title}</h1>
            <p>{description}</p>
          </header>

          <div className="auth-shell__content">{children}</div>

          {footer ? <footer className="auth-shell__footer">{footer}</footer> : null}
        </div>
      </section>
    </main>
  );
}
