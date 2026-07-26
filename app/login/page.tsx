// app/login/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  // State untuk custom pop-up lupa password
  const [showLupaModal, setShowLupaModal] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, remember }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login gagal");
      }

      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLupa = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowLupaModal(true);
  };

  const closeLupaModal = () => {
    setShowLupaModal(false);
  };

  return (
    <>
      {/* Fonts & Material Symbols */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined"
      />

      <style>{`
        :root {
          --surface: oklch(0.985 0.005 60);
          --on-surface: oklch(0.2 0.02 20);
          --on-surface-variant: oklch(0.45 0.02 20);
          --surface-container-lowest: #ffffff;
          --primary: oklch(0.42 0.15 25);
          --primary-container: oklch(0.55 0.19 28);
          --primary-fixed: oklch(0.95 0.03 30);
          --tertiary-fixed: oklch(0.92 0.05 80);
          --outline: oklch(0.55 0.02 30);
          --outline-variant: oklch(0.88 0.01 30);
          --error: oklch(0.55 0.22 27);
        }
        .login-page * { box-sizing: border-box; }
        .login-page {
          font-family: "Inter", sans-serif;
          background: var(--surface);
          color: var(--on-surface);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          position: relative;
        }
        .login-gradient {
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(1200px 600px at 10% 10%, oklch(0.95 0.03 30 / 0.6), transparent 60%),
            radial-gradient(1000px 500px at 90% 90%, oklch(0.92 0.05 80 / 0.5), transparent 60%),
            linear-gradient(180deg, oklch(0.98 0.005 60), oklch(0.95 0.02 30));
        }
        .card {
          position: relative; z-index: 10;
          width: 100%; max-width: 1000px;
          display: flex; flex-direction: column;
          background: var(--surface-container-lowest);
          border-radius: 12px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          overflow: hidden; min-height: 600px;
        }
        @media (min-width: 768px) { .card { flex-direction: row; } }

        .brand {
          display: none; width: 50%; position: relative;
          flex-direction: column; justify-content: space-between;
          padding: 3rem; overflow: hidden; color: white;
        }
        @media (min-width: 768px) { .brand { display: flex; } }
        .brand-bg { position: absolute; inset: 0; z-index: 0; }
        .brand-img {
          width: 100%; height: 100%;
          background-size: cover; background-position: center;
          background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuC5Pi9zICXDGMeCE33-I8i9nvkXxuAac46UctxkrEtOdwUcPcVBLXYF-R9wNJsyLoGAnoBYXEOehmqYl9C9K1J9npk4W_DeeVg83ElgYg70M-3dxLwdAIX9RM8Bmo7EfTcoMnSArhP1pt-bgeE7yKqdhFV0Lo0PvbYH28Cy_FyqiWRLC26fgEXqanDl02PZA5iDzxIS691-vzZpYfn8wXz_XuScwgJlknwuAY2JDNz9M_RCTOoDxE44');
        }
        .brand-overlay {
          position: absolute; inset: 0;
          background: color-mix(in oklab, var(--primary) 80%, transparent);
          mix-blend-mode: multiply;
        }
        .brand-content { position: relative; z-index: 1; }
        .brand-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem; }
        .brand-header img { height: 4rem; width: auto; }
        .brand-divider { height: 3rem; width: 1px; background: rgba(255,255,255,0.2); }
        .brand-title { font-size: 1.25rem; font-weight: 700; letter-spacing: -0.01em; }
        .brand-subtitle { font-size: 0.75rem; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.15em; }
        .brand-h1 {
          font-family: "Playfair Display", serif;
          font-size: clamp(2.25rem, 4vw, 3rem);
          font-weight: 700; line-height: 1.1; margin-top: 3rem;
        }
        .brand-p { margin-top: 1.5rem; font-size: 1.125rem; max-width: 22rem; color: var(--primary-fixed); opacity: 0.9; }
        .brand-footer {
          position: relative; z-index: 1; margin-top: auto;
          padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; gap: 1rem;
          color: var(--tertiary-fixed); font-size: 0.75rem;
          text-transform: uppercase; letter-spacing: 0.1em;
        }

        /* Back button styling - pojok kiri atas */
        .back-button {
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(118,0,9,0.2);
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          transition: all 0.2s ease;
          color: #760009;
          text-decoration: none;
        }
        .back-button:hover {
          background: #760009;
          color: #ffffff;
          transform: scale(1.05);
          box-shadow: 0 4px 16px rgba(118,0,9,0.25);
        }
        .back-button .material-symbols-outlined {
          font-size: 28px;
        }

        .form-side {
          width: 100%; padding: 2rem;
          display: flex; flex-direction: column; justify-content: center;
          background: var(--surface-container-lowest);
        }
        @media (min-width: 768px) { .form-side { width: 50%; padding: 3rem; } }
        .form-inner { max-width: 24rem; width: 100%; margin: 0 auto; }
        .mobile-header { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 2.5rem; }
        @media (min-width: 768px) { .mobile-header { display: none; } }
        .mobile-header img { height: 4rem; margin-bottom: 1rem; }
        .mobile-header h2 { font-size: 1.5rem; font-weight: 700; color: var(--primary); margin: 0; }
        .mobile-header p { font-size: 0.75rem; color: var(--outline); margin: 0; }

        .heading h3 { font-size: 1.5rem; font-weight: 700; margin: 0 0 0.5rem; color: var(--on-surface); }
        .heading p { color: var(--on-surface-variant); margin: 0; }
        .heading { margin-bottom: 2.5rem; }

        .field { display: flex; flex-direction: column; gap: 0.5rem; }
        .field label { font-size: 0.75rem; color: var(--on-surface-variant); }
        .field-row { display: flex; justify-content: space-between; align-items: center; }
        .link { font-size: 0.75rem; color: var(--primary); text-decoration: none; cursor: pointer; }
        .link:hover { text-decoration: underline; }
        .input-wrap { position: relative; }
        .input-wrap input {
          width: 100%; padding: 0.75rem 3rem;
          background: var(--surface);
          border: 1px solid var(--outline-variant);
          border-radius: 6px; outline: none;
          font-family: inherit; font-size: 1rem;
          color: var(--on-surface);
          transition: all 0.15s;
        }
        .input-wrap input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 20%, transparent);
        }
        .icon-left, .icon-right {
          position: absolute; top: 50%; transform: translateY(-50%);
          color: var(--outline);
        }
        .icon-left { left: 1rem; }
        .icon-right { right: 1rem; background: none; border: 0; cursor: pointer; padding: 0; }
        .icon-right:hover { color: var(--on-surface); }

        .remember { display: flex; align-items: center; gap: 0.5rem; }
        .remember input[type="checkbox"] {
          width: 1.1rem;
          height: 1.1rem;
          accent-color: var(--primary);
          cursor: pointer;
        }
        .remember label {
          color: var(--on-surface-variant);
          font-size: 0.875rem;
          cursor: pointer;
        }

        .submit {
          width: 100%; padding: 0.875rem 1.5rem;
          background: linear-gradient(to right, var(--primary), var(--primary-container));
          color: white; font-weight: 600; border: 0; border-radius: 6px;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          transition: transform 0.1s, box-shadow 0.15s;
        }
        .submit:hover { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15); transform: scale(1.01); }
        .submit:active { transform: scale(0.99); }
        .submit:disabled { opacity: 0.8; cursor: not-allowed; }

        .form { display: flex; flex-direction: column; gap: 1.5rem; }

        .footer {
          margin-top: 3rem; padding-top: 2rem;
          border-top: 1px solid color-mix(in oklab, var(--outline-variant) 40%, transparent);
          display: flex; flex-direction: column; gap: 1rem; align-items: center;
        }
        .footer p { font-size: 0.875rem; color: var(--on-surface-variant); text-align: center; margin: 0; }
        .footer-links { display: flex; gap: 1.5rem; color: var(--outline); font-size: 0.75rem; }
        .footer-links a { color: inherit; text-decoration: none; }
        .footer-links a:hover { color: var(--primary); }

        .toast {
          position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
          background: color-mix(in oklab, white 80%, transparent);
          backdrop-filter: blur(12px);
          border-left: 4px solid var(--error);
          padding: 1rem 1.5rem; border-radius: 6px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15);
          display: flex; align-items: center; gap: 0.75rem;
          z-index: 50; color: var(--on-surface);
        }
        .toast .material-symbols-outlined { color: var(--error); }

        @keyframes loading-spin { to { transform: rotate(360deg); } }
        .animate-loading { animation: loading-spin 1s linear infinite; }
        .arrow-hover { transition: transform 0.15s; }
        .submit:hover .arrow-hover { transform: translateX(4px); }

        /* Custom Modal Lupa Password */
        .lupa-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 999;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease-out;
        }
        .lupa-modal-box {
          background: #fff;
          border-radius: 20px;
          max-width: 420px;
          width: 90%;
          padding: 32px 28px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          text-align: center;
          animation: scaleIn 0.25s ease-out;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .lupa-modal-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #fee2e2;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .lupa-modal-icon .material-symbols-outlined {
          font-size: 40px !important;
          color: #760009;
        }
        .lupa-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #1c1b1f;
          margin-bottom: 8px;
        }
        .lupa-modal-desc {
          font-size: 14px;
          color: #534341;
          margin-bottom: 24px;
          line-height: 1.5;
        }
        .lupa-modal-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        .lupa-modal-actions button {
          padding: 10px 24px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
        }
        .lupa-modal-actions .btn-primary {
          background: #760009;
          color: #fff;
        }
        .lupa-modal-actions .btn-primary:hover {
          background: #5a0007;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div className="login-page">
        {/* ✅ Tombol Kembali di pojok kiri atas */}
        <Link
          href="/beranda"
          className="back-button"
          title="Kembali ke Beranda"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>

        <div className="login-gradient" />

        <main className="card">
          {/* Brand side */}
          <aside className="brand">
            <div className="brand-bg">
              <div className="brand-img" />
              <div className="brand-overlay" />
            </div>

            <div className="brand-content">
              <div className="brand-header">
                <img
                  alt="Logo KPU"
                  src="https://kalteng.kpu.go.id/assets/img/logo-kpu.png"
                />
                <div className="brand-divider" />
                <div>
                  <div className="brand-title">Ruang Baca JDIH</div>
                  <div className="brand-subtitle">
                    Sistem Perpustakaan Resmi
                  </div>
                </div>
              </div>
              <h1 className="brand-h1">Akses Administratif Aman</h1>
              <p className="brand-p">
                Akses portal manajemen terpusat untuk dokumen hukum dan catatan
                perpustakaan Komisi Pemilihan Umum.
              </p>
            </div>

            <div className="brand-footer">
              <span className="material-symbols-outlined">verified_user</span>
              <span>Lingkungan Terenkripsi &amp; Tersertifikasi</span>
            </div>
          </aside>

          {/* Form side */}
          <section className="form-side">
            <div className="mobile-header">
              <img
                alt="Logo KPU"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxX8nm1QdTt9d1KvrodfOOUWw_cYndBBmreMD_g7gcGNCMweYU2WjqfB1y1N33Q79iNtgGlc7KsIq5FfxuyWCQDs-HD6-QkVRbE8x5QWpd2m7pwrDTRZgOcDgUojnRrpv5KpkHmw4YLj4s5ZT5Yit119CunecOL2YiTkLV-MeociIvQM66mt7jzoJ4mU0HUqoRHQpcpVAa1jcw-oHtER4uRsdil2D5mv3Ht1hOFwcAg-4Gr1pQ6Od8"
              />
              <h2>Ruang Baca JDIH</h2>
              <p>Sistem Perpustakaan Resmi</p>
            </div>

            <div className="form-inner">
              <div className="heading">
                <h3>Login Admin</h3>
                <p>
                  Silakan masukkan kredensial Anda untuk mengelola database
                  perpustakaan.
                </p>
              </div>

              <form className="form" onSubmit={handleLogin}>
                <div className="field">
                  <label htmlFor="username">Username</label>
                  <div className="input-wrap">
                    <span className="material-symbols-outlined icon-left">
                      person
                    </span>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan username admin"
                    />
                  </div>
                </div>

                <div className="field">
                  <div className="field-row">
                    <label htmlFor="password">Password</label>
                    <a href="#" className="link" onClick={handleLupa}>
                      Lupa?
                    </a>
                  </div>
                  <div className="input-wrap">
                    <span className="material-symbols-outlined icon-left">
                      lock
                    </span>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="icon-right"
                      onClick={() => setShowPassword((s) => !s)}
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="remember">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <label htmlFor="remember">Ingat perangkat ini</label>
                </div>

                <button type="submit" className="submit" disabled={loading}>
                  <span>
                    {loading ? "Memverifikasi..." : "Masuk ke Dashboard"}
                  </span>
                  {loading ? (
                    <span className="animate-loading material-symbols-outlined">
                      progress_activity
                    </span>
                  ) : (
                    <span className="material-symbols-outlined arrow-hover">
                      arrow_forward
                    </span>
                  )}
                </button>
              </form>

              <div className="footer">
                <p>
                  Pemberitahuan Keamanan: Hanya untuk akses resmi. Semua
                  aktivitas dicatat dan dipantau.
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Toast Error */}
        {error && (
          <div className="toast">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* ===== MODAL LUPA PASSWORD ===== */}
      {showLupaModal && (
        <div className="lupa-modal-overlay" onClick={closeLupaModal}>
          <div className="lupa-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="lupa-modal-icon">
              <span className="material-symbols-outlined">help</span>
            </div>
            <h3 className="lupa-modal-title">Lupa Password?</h3>
            <p className="lupa-modal-desc">
              Silakan hubungi administrator untuk mereset password Anda.
            </p>
            <div className="lupa-modal-actions">
              <button className="btn-primary" onClick={closeLupaModal}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
