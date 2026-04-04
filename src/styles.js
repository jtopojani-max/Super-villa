const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #0f1b2d;
    --navy-light: #1a2e47;
    --gold: #F7B05B;
    --gold-light: #FACB8A;
    --cream: #f9f5ef;
    --white: #ffffff;
    --border: #e8e2d9;
    --text: #2c3e50;
    --text-muted: #7f8c9a;
    --error: #e74c3c;
    --warning: #d97706;
    --warning-bg: #fff3cd;
    --warning-border: #ffc107;
    --warning-text: #856404;
    --success: #27ae60;
    --lime: #c7d23b;
    --radius: 12px;
    --radius-lg: 20px;
    --shadow: 0 4px 24px rgba(15,27,45,.08);
    --shadow-lg: 0 12px 48px rgba(15,27,45,.15);
    --font-display: 'Playfair Display', serif;
    --font-display-alt: 'Space Grotesk', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --transition: all .25s cubic-bezier(.4,0,.2,1);
  }

  .experience--apartments {
    --navy: #17222d;
    --navy-light: #304255;
    --gold: #f47f52;
    --gold-light: #ffc3aa;
    --cream: #f4f0eb;
    --border: #ddd6cd;
    --text: #22303c;
    --text-muted: #697887;
    --lime: #d9e6f5;
    --shadow: 0 10px 26px rgba(23,34,45,.08);
    --shadow-lg: 0 20px 48px rgba(23,34,45,.16);
  }

  html { scroll-behavior: smooth; }
  body { font-family: var(--font-body); background: var(--cream); color: var(--text); line-height: 1.6; min-height: 100vh; overflow-x: hidden; }
  #root { min-height: 100vh; }

  /* NAVBAR SPACING */
  .with-navbar-space { padding-top: 68px; }
  @media (max-width: 768px) { .with-navbar-space { padding-top: 56px; } }
  @media (max-width: 480px) { .with-navbar-space { padding-top: 50px; } }

  /* NAVBAR */
  .navbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    width: 100%; max-width: none; margin: 0; padding: 0 24px;
    box-sizing: border-box;
    background: rgba(10, 25, 47, 0.42);
    backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
    border-radius: 0;
    height: 68px; display: flex; align-items: center;
    overflow: visible;
  }
  .navbar::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    opacity: 0.04;
    pointer-events: none;
    z-index: 0;
    border-radius: inherit;
  }
  .navbar__inner { max-width: 1280px; margin: 0 auto; width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
  .brand { display: inline-flex; align-items: center; text-decoration: none; cursor: pointer; user-select: none; }
  .brand-mark {
    height: 67px;
    width: auto;
    display: block;
    object-fit: contain;
  }
  .navbar__nav { display: flex; align-items: center; gap: 8px; }
  .navbar__link { color: rgba(255,255,255,.7); text-decoration: none; font-size: .88rem; font-weight: 500; padding: 6px 12px; border-radius: 8px; transition: var(--transition); cursor: pointer; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3); }
  .navbar__link:hover { color: #fff; background: rgba(255,255,255,.08); }
  .navbar__link.is-active { color: #fff; background: rgba(255,255,255,.12); }
  .navbar__actions { display: flex; align-items: center; gap: 10px; }
  .navbar__mobile-controls { display: none; align-items: center; gap: 8px; }
  .navbar__mobile-left { display: none; }
  .navbar__mobile-right { display: none; }
  .navbar__hamburger {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,.2);
    background: rgba(255,255,255,.08);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 4px;
    cursor: pointer;
    transition: var(--transition);
  }
  .navbar__hamburger:hover { background: rgba(255,255,255,.14); }
  .navbar__hamburger span {
    width: 18px;
    height: 2px;
    border-radius: 999px;
    background: #fff;
    transition: transform .22s ease, opacity .22s ease;
  }
  .navbar__hamburger.is-open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
  .navbar__hamburger.is-open span:nth-child(2) { opacity: 0; }
  .navbar__hamburger.is-open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
  .navbar__mobile-overlay {
    position: fixed;
    inset: 0;
    background: rgba(6,12,22,.75);
    backdrop-filter: blur(0);
    -webkit-backdrop-filter: blur(0);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition:
      opacity .3s ease,
      visibility .3s ease,
      backdrop-filter .3s ease,
      -webkit-backdrop-filter .3s ease,
      background .3s ease;
    z-index: 1200;
  }
  .navbar__mobile-overlay.is-open {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    backdrop-filter: blur(35px);
    -webkit-backdrop-filter: blur(35px);
  }
  .navbar__mobile-menu {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: min(85vw, 360px);
    height: 100dvh;
    transform: translateX(-100%);
    visibility: hidden;
    transition:
      transform .3s ease,
      background .3s ease,
      backdrop-filter .3s ease,
      -webkit-backdrop-filter .3s ease,
      visibility .3s ease;
    background: rgba(15, 23, 42, 0.35);
    -webkit-backdrop-filter: blur(0);
    backdrop-filter: blur(0);
    border-right: 1px solid rgba(255, 255, 255, 0.22);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
    z-index: 1300;
    padding: 0 12px 22px;
    overflow: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    display: none;
    flex-direction: column;
    isolation: isolate;
  }
  .navbar__mobile-menu.is-open {
    transform: translateX(0);
    visibility: visible;
    background: rgba(6,12,22,.9);
    -webkit-backdrop-filter: blur(35px);
    backdrop-filter: blur(35px);
    box-shadow: 30px 0 60px rgba(0,0,0,.35);
  }
  .navbar__mobile-menu::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    opacity: 0.04;
    pointer-events: none;
    z-index: 0;
  }
  .navbar__mobile-menu::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,0));
    z-index: -1;
    pointer-events: none;
  }
  .navbar__mobile-menu > * { position: relative; z-index: 1; }
  .navbar__mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 8px;
    flex-shrink: 0;
  }
  .navbar__mobile-close {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,.22);
    background: rgba(255,255,255,.1);
    color: #fff;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--transition);
    flex-shrink: 0;
  }
  .navbar__mobile-close:hover { background: rgba(255,255,255,.14); color: #fff; }
  .navbar__mobile-close:focus-visible {
    outline: 3px solid rgba(247,176,91,.28);
    outline-offset: 2px;
  }
  .navbar__mobile-link {
    width: 100%;
    min-height: 46px;
    border: none;
    background: transparent;
    color: rgba(255,255,255,.92);
    font-family: var(--font-body);
    font-size: .95rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    text-align: left;
    padding: 11px 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: var(--transition);
  }
  .navbar__mobile-link svg, .navbar__mobile-link .ui-icon { width: 18px; color: var(--gold-light); }
  .navbar__mobile-link:hover { background: rgba(255,255,255,.08); }
  .navbar__mobile-auth {
    margin-top: auto;
    border-top: 1px solid rgba(255,255,255,.1);
    padding-top: 16px;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    display: grid;
    gap: 10px;
  }
  .navbar__icon-btn {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,.2);
    background: rgba(255,255,255,.08);
    color: #fff;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    transition: var(--transition);
  }
  .navbar__icon-btn:hover { background: rgba(255,255,255,.14); }
  .navbar__icon-btn--profile { position: relative; }

  .lang-switch {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    min-height: 34px;
    padding: 2px;
    border-radius: 14px;
    background: rgba(255,255,255,.07);
    border: 1px solid rgba(255,255,255,.16);
    box-shadow: none;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    overflow: hidden;
  }
  .lang-switch__btn {
    appearance: none;
    -webkit-appearance: none;
    -webkit-tap-highlight-color: transparent;
    min-width: 44px;
    height: 28px;
    padding: 0 13px;
    border: none;
    border-radius: 10px;
    background: transparent;
    color: rgba(255,255,255,.76);
    font-family: var(--font-display-alt);
    font-size: .74rem;
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: var(--transition);
    box-shadow: none;
    outline: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .lang-switch__btn:hover {
    color: #fff;
    background: rgba(255,255,255,.06);
  }
  .lang-switch__btn.is-active {
    color: var(--navy);
    background: var(--gold);
    box-shadow: none;
  }
  .lang-switch__btn:focus-visible {
    outline: 1px solid rgba(255,255,255,.75);
    outline-offset: 1px;
  }
  .navbar__mobile-lang {
    width: fit-content;
    max-width: 100%;
    margin: 0 0 8px;
    justify-content: flex-start;
    align-self: flex-start;
    min-height: 32px;
    padding: 2px;
    border-radius: 14px;
  }
  .navbar__mobile-lang .lang-switch__btn {
    flex: 0 0 auto;
    min-width: 48px;
    height: 28px;
    padding: 0 12px;
    border-radius: 10px;
    font-size: .72rem;
  }

  /* BUTTONS */
  .btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: var(--radius); font-family: var(--font-body); font-size: .88rem; font-weight: 600; cursor: pointer; border: none; transition: var(--transition); text-decoration: none; white-space: nowrap; }
  .btn--primary { background: var(--gold); color: var(--navy); }
  .btn--primary:hover { background: var(--gold-light); transform: translateY(-1px); }
  .btn--glass { background: rgba(255,255,255,.1) !important; color: #fff !important; border: 1px solid rgba(255,255,255,.25) !important; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: 50px !important; height: 44px; box-sizing: border-box; }
  .btn--glass:hover { background: rgba(255,255,255,.18) !important; transform: translateY(-1px); }
  .btn--glass svg { background: var(--gold); color: var(--navy) !important; border-radius: 50%; padding: 5px; width: 26px; height: 26px; flex-shrink: 0; }
  .btn--ghost { background: transparent; color: rgba(255,255,255,.8); border: 1px solid rgba(255,255,255,.25); }
  .btn--ghost:hover { border-color: rgba(255,255,255,.5); color: #fff; }
  .btn--outline { background: transparent; color: #e74c3c; border: 1.5px solid #e74c3c; }
  .btn--outline:hover { background: #e74c3c; color: var(--white); border-color: #e74c3c; }
  .btn--full { width: 100%; justify-content: center; }
  .btn--danger { background: var(--error); color: #fff; }
  .btn--danger:hover { background: #c0392b; }
  .btn--lg { padding: 13px 28px; font-size: 1rem; }
  .btn--sm { padding: 7px 12px; font-size: .78rem; border-radius: 10px; }
  .btn--whatsapp {
    background-color: #25d366;
    border: 1px solid #25d366;
    padding: 8px 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 15px;
    border-radius: 0.4em;
    transition: 0.3s;
    color: #fff;
    overflow: hidden;
    flex: 0 0 auto;
    text-decoration: none;
    white-space: nowrap;
  }
  .btn--whatsapp.btn--sm {
    padding: 6px 14px;
    font-size: 14px;
    border-radius: 0.4em;
  }
  .btn--whatsapp.btn--lg {
    padding: 10px 20px;
    font-size: 17px;
    border-radius: 0.4em;
  }
  .btn--whatsapp__label {
    margin: 0;
    padding: 0;
    line-height: 1;
    color: #fff;
  }
  .btn--whatsapp__icon {
    margin: 0;
    padding: 0;
    font-size: 1.2em;
    color: #fff;
  }
  .btn--whatsapp:hover {
    background-color: #1ebe57;
    border-color: #1ebe57;
    transform: none;
  }

  .experience-switch {
    display: inline-flex;
    align-items: stretch;
    gap: 5px;
    padding: 5px;
    border-radius: 22px;
    background: linear-gradient(
      160deg,
      rgba(255,255,255,.13) 0%,
      rgba(255,255,255,.05) 50%,
      rgba(0,0,0,.08) 100%
    );
    border: 1px solid rgba(255,255,255,.22);
    border-bottom-color: rgba(0,0,0,.2);
    border-right-color: rgba(0,0,0,.1);
    backdrop-filter: blur(24px) saturate(1.6);
    -webkit-backdrop-filter: blur(24px) saturate(1.6);
    box-shadow:
      0 12px 40px rgba(0,0,0,.35),
      0 2px 8px rgba(0,0,0,.2),
      inset 0 1.5px 0 rgba(255,255,255,.35),
      inset 0 -1px 0 rgba(0,0,0,.2),
      inset 1px 0 0 rgba(255,255,255,.1),
      inset -1px 0 0 rgba(0,0,0,.08);
    position: relative;
  }
  .experience-switch__option {
    border: none;
    min-width: 142px;
    padding: 12px 16px;
    border-radius: 18px;
    background: transparent;
    color: rgba(255,255,255,.55);
    cursor: pointer;
    text-align: left;
    transition: all .24s cubic-bezier(.4,0,.2,1);
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-family: var(--font-body);
    position: relative;
  }
  .experience-switch__option:not(.is-active):hover {
    background: linear-gradient(160deg, rgba(255,255,255,.14) 0%, rgba(255,255,255,.05) 100%);
    color: rgba(255,255,255,.88);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.2),
      inset 0 -1px 0 rgba(0,0,0,.1);
  }
  .experience-switch__option.is-active {
    background: linear-gradient(
      155deg,
      rgba(255,255,255,.30) 0%,
      rgba(255,255,255,.10) 55%,
      rgba(255,255,255,.16) 100%
    );
    color: #fff;
    border-radius: 17px;
    border: 1px solid rgba(255,255,255,.24);
    border-bottom-color: rgba(255,255,255,.08);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.38),
      inset 0 -1px 0 rgba(0,0,0,.06);
  }
  .experience-switch__label { font-size: .94rem; font-weight: 800; }
  .experience-switch__hint { font-size: .72rem; letter-spacing: .06em; text-transform: uppercase; opacity: .7; }

  .experience-catalog .experience-switch {
    background: linear-gradient(160deg, rgba(255,255,255,.88) 0%, rgba(245,244,242,.82) 100%);
    border-color: rgba(0,0,0,.09);
    border-bottom-color: rgba(0,0,0,.14);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    box-shadow:
      0 4px 20px rgba(0,0,0,.1),
      inset 0 1.5px 0 rgba(255,255,255,1),
      inset 0 -1px 0 rgba(0,0,0,.07);
  }
  .experience-catalog .experience-switch__option { color: var(--text-muted); }
  .experience-catalog .experience-switch__option:not(.is-active):hover {
    background: rgba(0,0,0,.05);
    color: var(--text);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.6);
  }
  .experience-catalog .experience-switch__option.is-active {
    background: linear-gradient(160deg, var(--navy) 0%, #0d1e38 100%);
    color: #fff;
    box-shadow:
      0 4px 14px rgba(10,22,40,.28),
      inset 0 1px 0 rgba(255,255,255,.14),
      inset 0 -1px 0 rgba(0,0,0,.18);
  }
  .experience--apartments .experience-catalog .experience-switch__option.is-active {
    background: linear-gradient(160deg, var(--gold) 0%, #e06840 100%);
    color: #fff;
    box-shadow:
      0 4px 14px rgba(244,127,82,.35),
      inset 0 1px 0 rgba(255,255,255,.22),
      inset 0 -1px 0 rgba(0,0,0,.14);
  }

  /* USER MENU */
  .user-menu { position: relative; }
  .user-menu__toggle { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.15); color: #fff; border-radius: 50px; padding: 6px 14px 6px 6px; cursor: pointer; font-family: var(--font-body); font-size: .88rem; font-weight: 500; transition: var(--transition); height: 44px; box-sizing: border-box; }
  .user-menu__toggle:hover { background: rgba(255,255,255,.14); }
  .user-menu__avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--gold); color: var(--navy); font-weight: 700; font-size: .8rem; display: flex; align-items: center; justify-content: center; position: relative; }
  .user-menu__badge { position: absolute; top: -6px; right: -6px; min-width: 18px; height: 18px; border-radius: 9px; background: #e74c3c; color: #fff; font-size: .65rem; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 4px; line-height: 1; border: none; box-sizing: border-box; }
  .user-menu__dropdown { position: absolute; top: calc(100% + 8px); right: 0; background: #fff; border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow-lg); min-width: 200px; overflow: hidden; animation: fadeDown .2s ease; }
  @keyframes fadeDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
  .user-menu__item { display: flex; align-items: center; gap: 10px; padding: 11px 16px; font-size: .88rem; color: var(--text); text-decoration: none; cursor: pointer; background: none; border: none; width: 100%; font-family: var(--font-body); font-weight: 500; transition: var(--transition); }
  .user-menu__item:hover { background: var(--cream); }
  .user-menu__item--danger { color: var(--error); }
  .user-menu__item svg, .user-menu__item .ui-icon { width: 16px; opacity: .7; }

  /* HERO */
  .hero {
    min-height: 100vh;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-x: hidden;
    overflow-y: visible;
    z-index: 5;
  }
.hero__bg { position: absolute; inset: 0; background: url('/hero-bg.png') center/cover no-repeat; }
  .hero__bg::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(10,8,5,.79) 0%, rgba(10,8,5,.53) 50%, rgba(10,8,5,.79) 100%); }
  .hero__content { position: relative; z-index: 8; width: min(1200px, 100%); text-align: center; padding: 120px 24px 60px; scroll-margin-top: 88px; }
  .hero__topbar { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 36px; }
  .hero__highlight {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    border-radius: 999px;
    background: rgba(255,255,255,.09);
    border: 1px solid rgba(255,255,255,.14);
    color: rgba(255,255,255,.82);
    font-size: .8rem;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .hero__highlight::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--gold);
    box-shadow: 0 0 0 6px rgba(255,255,255,.06);
  }
  .hero__copy { max-width: 760px; margin: 0 auto 40px; }
  .hero__label { display: inline-flex; align-items: center; gap: 6px; background: rgba(247,176,91,.15); border: 1px solid rgba(247,176,91,.3); color: var(--gold-light); padding: 6px 16px; border-radius: 50px; font-size: .82rem; font-weight: 600; letter-spacing: .04em; margin-bottom: 24px; text-transform: uppercase; }
  .hero__title { font-family: var(--font-display); font-size: clamp(2.8rem, 6vw, 5rem); color: #fff; line-height: 1.1; margin-bottom: 20px; font-weight: 700; text-shadow: 0 1px 8px rgba(0,0,0,0.18), 0 2px 24px rgba(0,0,0,0.12); }
  .hero__title em { color: var(--gold); font-style: italic; }
  .hero__sub { color: rgba(255,255,255,.65); font-size: 1.1rem; max-width: 500px; margin: 0 auto 40px; font-weight: 300; text-shadow: 0 1px 6px rgba(0,0,0,0.18); }
  .experience--apartments .hero__bg {
    background: url('/apt-hero.jpg') center/cover no-repeat;
  }
  .experience--apartments .hero__bg::before {
    background: linear-gradient(135deg, rgba(10,8,5,.79) 0%, rgba(10,8,5,.53) 50%, rgba(10,8,5,.79) 100%);
  }
  .experience--apartments .hero__bg::after { content: none; }

  .experience--apartments .hero__title { font-family: var(--font-display-alt); font-weight: 700; letter-spacing: -.03em; color: #fff; }
  .experience--apartments .hero__title em { font-style: normal; color: var(--gold); }
  .experience--apartments .hero__sub { font-family: var(--font-body); font-weight: 300; color: rgba(255,255,255,.72); font-size: 1.05rem; }
  .experience--apartments .hero__label {
    font-family: var(--font-body);
    font-weight: 600;
    letter-spacing: .06em;
    background: rgba(244,127,82,.15);
    border-color: rgba(244,127,82,.35);
    color: var(--gold);
  }
  .experience--apartments .hero__label,
  .experience--apartments .hero__highlight { border-radius: 14px; }

  /* SEARCH STRIP */
  .search-shell {
    position: relative;
    z-index: 30;
    max-width: 1140px;
    margin: 0 auto;
    padding: 5px;
    border-radius: 22px;
    background: linear-gradient(
      160deg,
      rgba(255,255,255,.13) 0%,
      rgba(255,255,255,.05) 50%,
      rgba(0,0,0,.08) 100%
    );
    border: 1px solid rgba(255,255,255,.22);
    border-bottom-color: rgba(0,0,0,.2);
    border-right-color: rgba(0,0,0,.1);
    backdrop-filter: blur(24px) saturate(1.6);
    -webkit-backdrop-filter: blur(24px) saturate(1.6);
    box-shadow:
      0 12px 40px rgba(0,0,0,.35),
      0 2px 8px rgba(0,0,0,.2),
      inset 0 1.5px 0 rgba(255,255,255,.35),
      inset 0 -1px 0 rgba(0,0,0,.2),
      inset 1px 0 0 rgba(255,255,255,.1),
      inset -1px 0 0 rgba(0,0,0,.08);
  }
  .experience--apartments .search-shell {
    border-color: rgba(255,255,255,.16);
    background: linear-gradient(145deg, rgba(255,255,255,.10), rgba(255,255,255,.04));
  }
  .search-strip {
    position: relative;
    z-index: 35;
    display: grid;
    grid-template-columns: 1.45fr 1fr 1fr 1fr auto;
    align-items: center;
    background: rgba(13, 26, 44, .26);
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 14px;
    overflow: visible;
  }
  .experience--apartments .search-strip { background: rgba(10,18,26,.26); }
  .search-strip__cell {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 6px;
    padding: 8px 13px;
    min-height: 50px;
    border-right: 1px solid rgba(255,255,255,.12);
    transition: background-color .2s ease;
    isolation: isolate;
  }
  .search-field__label {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: rgba(255,255,255,.66);
    font-size: .69rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
  }
  .search-field__label svg,
  .search-field__label .ui-icon {
    color: var(--gold-light);
    opacity: .92;
  }
  .search-strip__cell--keyword { z-index: 40; position: relative; }
  .search-text {
    width: 100%;
    min-height: 28px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding-right: 2px;
  }
  .search-text__input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: #fff;
    font-family: var(--font-body);
    font-size: .92rem;
    font-weight: 600;
    line-height: 1.2;
  }
  .search-text__input::placeholder {
    color: rgba(255,255,255,.62);
    font-weight: 500;
  }
  .search-text__icon {
    color: rgba(255,255,255,.62);
    font-size: .86rem;
    transition: color .2s ease;
  }
  .search-text.is-open .search-text__icon {
    color: var(--gold-light);
  }
  .search-floating-menu {
    position: absolute;
    z-index: 160;
    list-style: none;
    margin: 0;
    padding: 8px;
    border-radius: 12px;
    background: rgba(255,255,255,.98);
    border: 1px solid #e7e1d8;
    box-shadow: 0 18px 38px rgba(14,28,47,.28);
    overflow-y: auto;
    overflow-x: hidden;
    animation: dropdownFadeIn .16s ease-out;
    backdrop-filter: blur(4px);
  }
  .search-floating-menu--suggest { z-index: 165; }
  .search-strip__cell--keyword .search-floating-menu {
    top: calc(100% + 7px);
    left: 10px;
    right: 10px;
    max-height: 220px;
  }
  .search-floating-menu::-webkit-scrollbar { width: 8px; }
  .search-floating-menu::-webkit-scrollbar-thumb {
    background: rgba(15,27,45,.28);
    border-radius: 999px;
  }
  .search-floating-menu::-webkit-scrollbar-track { background: transparent; }
  @keyframes dropdownFadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .search-suggest__option {
    width: 100%;
    border: none;
    background: transparent;
    text-align: left;
    border-radius: 8px;
    padding: 10px;
    cursor: pointer;
    transition: background-color .16s ease;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .search-suggest__option:hover { background: #f5f2ec; }
  .search-suggest__title {
    color: #253446;
    font-size: .88rem;
    font-weight: 700;
  }
  .search-suggest__meta {
    color: #6f7d8c;
    font-size: .78rem;
    font-weight: 600;
  }
  .search-select {
    width: 100%;
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    border: none;
    background: transparent;
    color: #fff;
    font-family: var(--font-body);
    font-size: .92rem;
    font-weight: 600;
    cursor: pointer;
    text-align: left;
    padding: 0;
    transition: color .2s ease;
  }
  .search-native-wrap {
    width: 100%;
    position: relative;
    min-height: 28px;
    display: flex;
    align-items: center;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,.14);
    background: linear-gradient(135deg, rgba(255,255,255,.14), rgba(255,255,255,.06));
    backdrop-filter: blur(8px);
    padding: 5px 10px;
    transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
  }
  .experience--apartments .search-native-wrap { border-radius: 12px; }
  .search-native-select {
    width: 100%;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    border: none;
    outline: none;
    background: transparent;
    color: #fff;
    font-family: var(--font-body);
    font-size: .9rem;
    font-weight: 600;
    padding-right: 18px;
    line-height: 1.2;
    cursor: pointer;
  }
  .search-native-select option {
    color: #1d2b3d;
    background: #fff;
  }
  .search-native-arrow {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255,255,255,.62);
    font-size: .8rem;
    pointer-events: none;
  }
  .search-native-wrap:hover { border-color: rgba(255,255,255,.14); background: linear-gradient(135deg, rgba(255,255,255,.14), rgba(255,255,255,.06)); }
  .search-native-wrap:focus-within {
    border-color: rgba(232,201,106,.6);
    box-shadow: 0 0 0 3px rgba(247,176,91,.16);
  }
  .search-select__arrow {
    color: rgba(255,255,255,.62);
    font-size: .8rem;
    transition: transform .2s ease, color .2s ease;
    transform-origin: center;
    margin-top: 1px;
  }
  .search-select.is-open .search-select__arrow {
    transform: rotate(180deg);
    color: var(--gold-light);
  }
  .search-strip__cell.is-open {
    z-index: 90;
  }
  .search-select__option {
    width: 100%;
    border: none;
    background: transparent;
    text-align: left;
    color: #253446;
    font-family: var(--font-body);
    font-size: .88rem;
    font-weight: 600;
    border-radius: 8px;
    padding: 9px 10px;
    cursor: pointer;
    transition: background-color .16s ease, color .16s ease;
  }
  .search-select__option:hover,
  .search-select__option.is-selected {
    background: #f5f2ec;
    color: var(--navy);
  }
  .search-strip__cell:focus-within {
    background: rgba(255,255,255,.08);
  }
  .search-strip__btn {
    border: none;
    width: 100%;
    height: 100%;
    min-width: 142px;
    min-height: 54px;
    padding: 0 24px;
    background: linear-gradient(135deg, var(--gold), var(--gold-light));
    color: var(--navy);
    font-family: var(--font-body);
    font-size: .84rem;
    font-weight: 800;
    letter-spacing: .07em;
    text-transform: uppercase;
    cursor: pointer;
    transition: filter .2s ease, transform .2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    box-shadow: inset 0 -1px 0 rgba(0,0,0,.12);
    border-radius: 0 14px 14px 0;
  }
  .experience--apartments .search-strip__btn {
    color: #fff;
    border-radius: 0 14px 14px 0;
    text-transform: none;
    letter-spacing: .02em;
    font-family: var(--font-display-alt);
    font-size: .95rem;
  }
  @media (max-width: 820px) {
    .experience--apartments .search-strip__btn { border-radius: 0 0 12px 12px; }
  }
  .search-strip__btn:focus-visible {
    outline: 3px solid rgba(255,255,255,.42);
    outline-offset: -3px;
  }
  @media (hover: hover) and (pointer: fine) {
    .search-strip__btn:hover {
      filter: brightness(1.08);
      transform: translateY(-1px);
      box-shadow: inset 0 -1px 0 rgba(0,0,0,.12), 0 8px 18px rgba(247,176,91,.34);
    }
  }

  /* PREMIUM HOME SECTION */
  .premium-section {
    position: relative;
    z-index: 1;
    padding: 44px 0 28px;
    overflow: hidden;
    background:
      radial-gradient(circle at top left, rgba(247,176,91,.22), transparent 28%),
      linear-gradient(180deg, #0f1b2d 0%, #111f32 100%);
    border-top: 1px solid rgba(247,176,91,.15);
    border-bottom: 1px solid rgba(247,176,91,.15);
  }
  .premium-section::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(255,255,255,.03), transparent 25%, transparent 75%, rgba(255,255,255,.03));
    pointer-events: none;
  }
  .experience--apartments .premium-section {
    background:
      radial-gradient(circle at top left, rgba(244,127,82,.22), transparent 28%),
      linear-gradient(180deg, #17222d 0%, #1b2935 100%);
  }
  .premium-section .section-title { color: #fff; }
  .premium-section .section-tag {
    background: rgba(255,255,255,.08);
    border: 1px solid rgba(255,255,255,.14);
    color: var(--gold-light);
  }
  .premium-section__head {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 26px;
  }
  .premium-section__copy {
    max-width: 430px;
    color: rgba(255,255,255,.68);
    font-size: .92rem;
    line-height: 1.65;
  }
  .premium-section__skeleton {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }
  .premium-section__empty {
    position: relative;
    z-index: 1;
    min-height: 170px;
    display: grid;
    place-items: center;
    gap: 10px;
    padding: 26px;
    border-radius: 22px;
    border: 1px dashed rgba(255,255,255,.18);
    background: rgba(255,255,255,.05);
    text-align: center;
    color: rgba(255,255,255,.78);
  }
  .premium-section__empty svg {
    font-size: 1.6rem;
    color: var(--gold-light);
  }
  .premium-section__empty p {
    max-width: 520px;
    font-size: .92rem;
    line-height: 1.65;
  }
  .premium-marquee {
    position: relative;
    z-index: 1;
    overflow: hidden;
    mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
  }
  .premium-marquee__track {
    list-style: none;
    display: flex;
    gap: 16px;
    width: max-content;
    padding: 6px 0 2px;
    animation: premiumMarquee var(--premium-duration, 36s) linear infinite;
  }
  .premium-marquee--static .premium-marquee__track { animation: none; }
  .premium-marquee--slides {
    overflow-x: auto;
    overflow-y: visible;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
    touch-action: pan-x;
    scroll-behavior: auto;
    scrollbar-width: none;
  }
  .premium-marquee--slides::-webkit-scrollbar { display: none; }
  .premium-marquee--slides .premium-marquee__track {
    animation: none;
    padding-right: 16px;
  }
  .premium-marquee--slides .premium-marquee__item {
    scroll-snap-align: start;
    scroll-snap-stop: always;
  }
  .premium-marquee__item { flex: 0 0 clamp(252px, 25vw, 316px); }
  @keyframes premiumMarquee {
    from { transform: translateX(0); }
    to { transform: translateX(calc(-50% - 8px)); }
  }
  @media (hover: hover) and (pointer: fine) {
    .premium-marquee:hover .premium-marquee__track,
    .premium-marquee:focus-within .premium-marquee__track { animation-play-state: paused; }
  }
  .premium-card {
    position: relative;
    overflow: hidden;
    padding: 12px;
    border-radius: 22px;
    border: 1px solid rgba(255,255,255,.18);
    background:
      linear-gradient(180deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,.08) 100%);
    backdrop-filter: blur(20px) saturate(140%);
    -webkit-backdrop-filter: blur(20px) saturate(140%);
    box-shadow:
      0 22px 44px rgba(5,12,24,.28),
      inset 0 1px 0 rgba(255,255,255,.22);
    transition: transform .28s ease, box-shadow .28s ease, border-color .28s ease;
  }
  .premium-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(130deg, rgba(255,255,255,.24), transparent 34%),
      radial-gradient(circle at top right, rgba(255,255,255,.14), transparent 38%);
    pointer-events: none;
    opacity: .9;
  }
  .premium-card:hover {
    transform: translateY(-6px);
    border-color: rgba(255,255,255,.28);
    box-shadow:
      0 28px 54px rgba(5,12,24,.34),
      inset 0 1px 0 rgba(255,255,255,.26);
  }
  .premium-card--apartments { border-radius: 18px; }
  .premium-card__frame {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
  }
  .premium-card__media-button {
    width: 100%;
    border: none;
    background: none;
    padding: 0;
    color: inherit;
    cursor: pointer;
    text-align: left;
    display: block;
    border-radius: 18px;
  }
  .premium-card__media-button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255,255,255,.55);
  }
  .premium-card__media {
    position: relative;
    aspect-ratio: 1.08 / 1;
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.14);
    background: linear-gradient(140deg, rgba(255,255,255,.16), rgba(255,255,255,.05));
    box-shadow: inset 0 1px 0 rgba(255,255,255,.16);
  }
  .premium-card__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: saturate(1.08) contrast(1.02);
    transform: scale(1.01);
    transition: transform .45s ease, filter .45s ease;
  }
  .premium-card:hover .premium-card__image {
    transform: scale(1.07);
    filter: saturate(1.14) contrast(1.04);
  }
  .premium-card__placeholder {
    width: 100%;
    height: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(circle at top left, rgba(247,176,91,.28), transparent 28%),
      linear-gradient(145deg, rgba(13,22,36,.95), rgba(17,31,50,.86));
    color: rgba(255,255,255,.46);
  }
  .premium-card__placeholder svg { font-size: 2rem; }
  .premium-card__media-shade {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(5,10,18,.06) 0%, rgba(5,10,18,.08) 34%, rgba(5,10,18,.42) 100%);
    pointer-events: none;
  }
  .premium-card__eyebrow {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 2;
    width: fit-content;
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: 999px;
    background: rgba(7,16,28,.46);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,.16);
    color: #fff;
    font-size: .65rem;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .experience--apartments .premium-card__eyebrow {
    border-radius: 12px;
    background: rgba(35,18,14,.38);
    color: #fff;
  }
  .premium-card__content {
    display: grid;
    gap: 6px;
    padding: 0 4px 4px;
  }
  .premium-section__actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 16px;
  }
  .premium-action-btn {
    --premium-button-border: linear-gradient(135deg, rgba(255,255,255,.58), rgba(131,213,255,.34), rgba(255,255,255,.22));
    --premium-button-fill: linear-gradient(135deg, rgba(12,24,43,.96), rgba(20,47,78,.9));
    --premium-button-text: #fff;
    --premium-button-shadow: 0 16px 30px rgba(5,12,24,.24);
    --premium-button-shadow-hover: 0 22px 36px rgba(5,12,24,.28);
    --premium-button-glow: radial-gradient(circle, rgba(255,255,255,.26), rgba(255,255,255,0) 70%);
    --premium-button-particle: rgba(149,223,255,.92);
    --premium-button-sparkle: rgba(255,255,255,.96);
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 1px;
    border: 0;
    border-radius: 999px;
    background: var(--premium-button-border);
    box-shadow: var(--premium-button-shadow);
    color: var(--premium-button-text);
    font-family: var(--font-body);
    text-decoration: none;
    cursor: pointer;
    isolation: isolate;
    white-space: nowrap;
    transition: transform .18s ease, box-shadow .24s ease, filter .24s ease;
  }
  .premium-action-btn__inner {
    position: relative;
    width: 100%;
    min-height: 44px;
    padding: 12px 28px;
    border-radius: 999px;
    background: var(--premium-button-fill);
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.18),
      inset 0 -10px 18px rgba(11,18,30,.18);
  }
  .premium-action-btn__content {
    position: relative;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 0;
  }
  .premium-action-btn__icon,
  .premium-action-btn__label {
    position: relative;
    z-index: 2;
  }
  .premium-action-btn__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: currentColor;
  }
  .premium-action-btn__icon svg,
  .premium-action-btn__icon .ui-icon {
    width: 20px !important;
    height: 20px !important;
    color: currentColor;
  }
  .premium-action-btn__label {
    font-size: .875rem;
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: .02em;
  }
  .premium-action-btn__glow {
    position: absolute;
    inset: -30% auto auto 50%;
    width: 58%;
    height: 170%;
    transform: translateX(-50%);
    background: var(--premium-button-glow);
    opacity: .45;
    pointer-events: none;
    transition: opacity .24s ease, transform .24s ease;
  }
  .premium-action-btn__sparkle {
    position: absolute;
    z-index: 2;
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: var(--premium-button-sparkle);
    box-shadow:
      0 0 0 2px rgba(255,255,255,.08),
      0 0 14px rgba(255,255,255,.22);
    opacity: .72;
    pointer-events: none;
    transition: transform .24s ease, opacity .24s ease;
  }
  .premium-action-btn__sparkle::before,
  .premium-action-btn__sparkle::after {
    content: "";
    position: absolute;
    inset: 50%;
    width: 10px;
    height: 2px;
    border-radius: 999px;
    background: currentColor;
    transform: translate(-50%, -50%);
    opacity: .68;
  }
  .premium-action-btn__sparkle::after {
    width: 2px;
    height: 10px;
  }
  .premium-action-btn__sparkle--left {
    left: 12px;
    top: 50%;
    transform: translateY(-50%) scale(.85);
  }
  .premium-action-btn__sparkle--right {
    right: 12px;
    top: 50%;
    transform: translateY(-50%) scale(.72);
  }
  .premium-action-btn__particles {
    position: absolute;
    inset: -12px;
    pointer-events: none;
    z-index: 1;
  }
  .premium-action-btn__particle {
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 999px;
    background: var(--premium-button-particle);
    opacity: 0;
    filter: blur(.2px);
    transform: translate3d(0, 0, 0) scale(.45);
    transition: transform .28s ease, opacity .28s ease;
  }
  .premium-action-btn__particle--1 { top: 16%; left: 18%; }
  .premium-action-btn__particle--2 { top: 20%; right: 16%; }
  .premium-action-btn__particle--3 { right: 10%; top: 50%; }
  .premium-action-btn__particle--4 { bottom: 18%; right: 22%; }
  .premium-action-btn__particle--5 { bottom: 14%; left: 20%; }
  .premium-action-btn__particle--6 { left: 9%; top: 52%; }
  .premium-action-btn:not(:disabled):hover {
    transform: scale(1.03);
    box-shadow: var(--premium-button-shadow-hover);
    filter: saturate(1.06);
  }
  .premium-action-btn:not(:disabled):hover .premium-action-btn__glow {
    opacity: .7;
    transform: translateX(-50%) translateY(2px);
  }
  .premium-action-btn:not(:disabled):hover .premium-action-btn__sparkle--left {
    transform: translateY(-50%) translateX(2px) scale(1);
  }
  .premium-action-btn:not(:disabled):hover .premium-action-btn__sparkle--right {
    transform: translateY(-50%) translateX(-2px) scale(.94);
  }
  .premium-action-btn:not(:disabled):hover .premium-action-btn__particle--1 { opacity: 1; transform: translate(-10px, -14px) scale(1); }
  .premium-action-btn:not(:disabled):hover .premium-action-btn__particle--2 { opacity: 1; transform: translate(12px, -12px) scale(1.04); }
  .premium-action-btn:not(:disabled):hover .premium-action-btn__particle--3 { opacity: 1; transform: translate(16px, -3px) scale(.92); }
  .premium-action-btn:not(:disabled):hover .premium-action-btn__particle--4 { opacity: 1; transform: translate(10px, 13px) scale(1); }
  .premium-action-btn:not(:disabled):hover .premium-action-btn__particle--5 { opacity: 1; transform: translate(-12px, 12px) scale(.98); }
  .premium-action-btn:not(:disabled):hover .premium-action-btn__particle--6 { opacity: 1; transform: translate(-15px, 2px) scale(.9); }
  .premium-action-btn:not(:disabled):active {
    transform: scale(.98);
  }
  .premium-action-btn:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px rgba(15,27,45,.24),
      0 0 0 5px rgba(255,255,255,.22),
      var(--premium-button-shadow);
  }
  .premium-action-btn:disabled,
  .premium-action-btn.is-disabled {
    opacity: .62;
    cursor: not-allowed;
    box-shadow: none;
    filter: grayscale(.08);
  }
  .premium-action-btn:disabled .premium-action-btn__glow,
  .premium-action-btn.is-disabled .premium-action-btn__glow,
  .premium-action-btn:disabled .premium-action-btn__sparkle,
  .premium-action-btn.is-disabled .premium-action-btn__sparkle,
  .premium-action-btn:disabled .premium-action-btn__particles,
  .premium-action-btn.is-disabled .premium-action-btn__particles {
    opacity: 0;
  }
  .premium-section__manage-btn {
    --premium-button-border: linear-gradient(135deg, rgba(255,255,255,.62), rgba(132,208,255,.36), rgba(255,255,255,.18));
    --premium-button-fill: linear-gradient(135deg, rgba(8,19,35,.96), rgba(22,48,78,.9));
    --premium-button-text: #fff;
    --premium-button-shadow: 0 16px 30px rgba(5,12,24,.28);
    --premium-button-particle: rgba(143,220,255,.92);
    --premium-button-sparkle: rgba(255,255,255,.96);
  }
  .premium-section__manage-btn.is-upgrade {
    --premium-button-border: linear-gradient(135deg, #fce5a1, #f7b05b 46%, #ffd89e);
    --premium-button-fill: linear-gradient(135deg, #fff5d4, #f8c768 42%, #f3a34d);
    --premium-button-text: #162236;
    --premium-button-shadow: 0 18px 32px rgba(247,176,91,.26);
    --premium-button-shadow-hover: 0 22px 36px rgba(247,176,91,.38);
    --premium-button-glow: radial-gradient(circle, rgba(255,255,255,.46), rgba(255,255,255,0) 70%);
    --premium-button-particle: rgba(248,188,86,.96);
    --premium-button-sparkle: rgba(255,255,255,.98);
  }
  .premium-card__topline {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 10px;
  }
  .premium-card--villas .premium-card__topline {
    align-items: center;
    gap: 12px;
  }
  .premium-card__title {
    color: #f7f8fb;
    font-size: .9rem;
    font-weight: 700;
    line-height: 1.32;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .premium-card--villas .premium-card__title {
    font-size: 1rem;
    line-height: 1.2;
    display: block;
    white-space: nowrap;
    text-overflow: ellipsis;
    flex: 1 1 auto;
  }
  .premium-card__location {
    display: flex;
    align-items: center;
    gap: 7px;
    color: rgba(255,255,255,.68);
    font-size: .75rem;
    min-width: 0;
  }
  .premium-card__location span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .premium-card__location svg, .premium-card__location .ui-icon { flex-shrink: 0; color: rgba(255,255,255,.92); }
  .premium-card--villas .premium-card__location svg, .premium-card--villas .premium-card__location .ui-icon { color: #fff; }
  .premium-card__footer {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-top: 2px;
  }
  .premium-card__price {
    width: fit-content;
    display: inline-flex;
    align-items: center;
    padding: 7px 12px;
    border-radius: 999px;
    background: linear-gradient(135deg, rgba(255,255,255,.16), rgba(255,255,255,.08));
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,.14);
    color: #fff;
    font-size: .78rem;
    font-weight: 800;
    letter-spacing: -.01em;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.12);
    white-space: nowrap;
  }
  .premium-card--villas .premium-card__price {
    flex-shrink: 0;
  }
  .experience--apartments .premium-card__price {
    background: linear-gradient(135deg, rgba(244,127,82,.22), rgba(255,195,170,.18));
    border-color: rgba(255,195,170,.18);
    color: #fff;
  }
  .premium-card--skeleton {
    position: relative;
    overflow: hidden;
    min-height: 250px;
    background: linear-gradient(120deg, rgba(255,255,255,.14), rgba(255,255,255,.08), rgba(255,255,255,.14));
    border-color: rgba(255,255,255,.12);
  }
  .premium-card--skeleton::after {
    content: "";
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent);
    animation: premiumSkeleton 1.5s ease-in-out infinite;
  }
  @keyframes premiumSkeleton {
    to { transform: translateX(100%); }
  }
  @media (prefers-reduced-motion: reduce) {
    .premium-marquee__track,
    .premium-card--skeleton::after {
      animation: none !important;
    }
  }
  @media (prefers-color-scheme: dark) {
    .premium-card {
      background: linear-gradient(180deg, rgba(255,255,255,.14) 0%, rgba(255,255,255,.07) 100%);
      border-color: rgba(255,255,255,.16);
    }
    .premium-card__eyebrow {
      background: rgba(7,16,28,.46);
      color: #fff;
    }
    .prop-card--premium { border-color: var(--gold); box-shadow: 0 4px 24px rgba(247,176,91,.12); }
    .prop-card__premium-badge { background: rgba(30,30,30,.9); box-shadow: 0 2px 8px rgba(0,0,0,.3); }
    .premium-card__title { color: #f5f7fb; }
    .premium-card__location { color: rgba(255,255,255,.72); }
    .premium-card__price {
      background: rgba(255,255,255,.1);
      border-color: rgba(255,255,255,.14);
      color: #fff;
    }
  }

  /* SECTION */
  .container { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
  .section-tag { display: inline-block; background: rgba(247,176,91,.12); color: var(--gold); padding: 4px 14px; border-radius: 50px; font-size: .75rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 10px; }
  .section-title { font-family: var(--font-display); font-size: clamp(1.8rem,3vw,2.6rem); color: var(--navy); font-weight: 700; line-height: 1.2; }
  .experience--apartments .section-tag { border-radius: 14px; }
  .experience--apartments .section-title { font-family: var(--font-display-alt); letter-spacing: -.03em; }

  /* LISTINGS */
  .listings { padding: 80px 0; }
  .section-head { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 20px; margin-bottom: 40px; }
  .section-head--stacked { align-items: center; }
  .filter-pills { display: flex; gap: 8px; flex-wrap: wrap; }
  .filter-pill { padding: 7px 16px; border-radius: 50px; font-size: .82rem; font-weight: 600; border: 1.5px solid var(--border); background: #fff; color: var(--text-muted); cursor: pointer; transition: var(--transition); }
  .filter-pill.active, .filter-pill:hover { background: var(--navy); color: #fff; border-color: var(--navy); }
  .experience--apartments .filter-pill { border-radius: 14px; background: rgba(255,255,255,.75); }
  .experience--apartments .filter-pill.active,
  .experience--apartments .filter-pill:hover { background: var(--gold); color: #fff; border-color: var(--gold); }
  .listings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%),1fr)); gap: 24px; transition: gap .2s ease; }
  .listings__cta { display: flex; justify-content: center; margin-top: 32px; }
  .listings--page { padding-top: 40px; }
  .experience-catalog .experience-switch { margin-left: auto; }

  /* PROPERTY CARD */
  .prop-card { background: #fff; border-radius: 24px; border: 1px solid var(--border); box-shadow: var(--shadow); transition: var(--transition); cursor: pointer; padding: 12px; overflow: hidden; min-width: 0; }
  .prop-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
  .prop-card--premium { position: relative; overflow: visible; border: 2px solid var(--gold); box-shadow: 0 4px 24px rgba(247,176,91,.18); }
  .prop-card--premium:hover { box-shadow: 0 8px 32px rgba(247,176,91,.28); }
  .prop-card__premium-badge { position: absolute; right: -12px; top: -12px; z-index: 3; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,.15); }
  .prop-card__premium-icon { width: 26px; height: 26px; display: block; }
  .prop-card__media { position: relative; border-radius: 18px; overflow: hidden; border: 1px solid #ece6de; }
  .prop-card__img { width: 100%; aspect-ratio: 11.34/8.1; height: auto; object-fit: cover; display: block; transition: opacity .2s ease; }
  .prop-card__img-placeholder { width: 100%; aspect-ratio: 11.34/8.1; height: auto; background: linear-gradient(135deg, #1a2e47, #0f1b2d); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,.25); font-size: 2.5rem; }

  /* Card image slider arrows */
  .prop-card__arrow {
    position: absolute; top: 50%; transform: translateY(-50%); z-index: 3;
    width: 30px; height: 30px; border-radius: 50%;
    background: rgba(255,255,255,.85); border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: .7rem; color: #333; box-shadow: 0 1px 4px rgba(0,0,0,.18);
    opacity: 0; transition: opacity .2s ease;
  }
  .prop-card__media:hover .prop-card__arrow { opacity: 1; }
  .prop-card__arrow--prev { left: 8px; }
  .prop-card__arrow--next { right: 8px; }
  .prop-card__arrow:hover { background: #fff; }

  /* Card image slider dots */
  .prop-card__dots {
    position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); z-index: 3;
    display: flex; gap: 5px;
  }
  .prop-card__dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(255,255,255,.55); cursor: pointer;
    transition: background .2s ease, transform .2s ease;
  }
  .prop-card__dot.is-active { background: #fff; transform: scale(1.3); }
  .prop-card__badge {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 2;
    padding: 7px 11px;
    border-radius: 999px;
    background: rgba(15,27,45,.78);
    color: #fff;
    font-size: .72rem;
    font-weight: 800;
    letter-spacing: .06em;
    text-transform: uppercase;
    backdrop-filter: blur(8px);
  }
  .prop-card__fav-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 2;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: rgba(255,255,255,.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #8d99a8;
    font-size: 1rem;
    transition: all .2s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,.12);
  }
  .prop-card__fav-btn:hover { background: #fff; transform: scale(1.1); }
  .prop-card__fav-btn.is-favorite { color: #e74c3c; }
  .prop-card__body { padding: 16px 10px 10px; }
  .prop-card__title { font-weight: 700; font-size: 1rem; color: var(--navy); margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .prop-card__row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
  .prop-card__location { display: flex; align-items: center; gap: 6px; font-size: .82rem; color: var(--text-muted); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .prop-card__price-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 38px;
    padding: 6px 16px;
    border-radius: 999px;
    background: linear-gradient(135deg, rgba(247,176,91,.16), rgba(232,201,106,.34));
    border: 1px solid rgba(247,176,91,.3);
    color: var(--navy);
    font-weight: 800;
    font-size: 1rem;
    letter-spacing: -.02em;
    box-shadow: 0 10px 22px rgba(247,176,91,.14);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .prop-card__meta { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; font-size: .82rem; color: var(--text); border-top: 1px solid var(--border); padding-top: 12px; margin-top: 12px; }
  .prop-card__meta span { display: flex; align-items: center; justify-content: center; gap: 4px; background: none; border: none; border-radius: 12px; padding: 10px 4px; font-weight: 600; white-space: nowrap; overflow: visible; min-width: 0; }
  .prop-card__meta span svg, .prop-card__meta span .ui-icon { color: #8d99a8; width: 19.8px !important; height: 19.8px !important; flex-shrink: 0; min-width: 19.8px; }
  .prop-card__actions { margin-top: 12px; display: flex; align-items: stretch; gap: 8px; flex-wrap: wrap; }
  .prop-card__actions > .btn { flex: 1 1 0; min-width: 0; }
  .prop-card__actions--owner { margin-top: 8px; }
  .prop-card__actions .btn--outline.btn--sm {
    min-height: 40px;
    justify-content: center;
    padding: 7px 12px;
  }
  .prop-card__actions .btn--danger.btn--sm {
    min-height: 40px;
    justify-content: center;
    padding: 7px 12px;
  }
  .prop-card__actions .btn--whatsapp.btn--sm {
    width: 100%;
    height: 44px;
    border-radius: 12px;
    font-size: 16px;
    flex: 1 1 100%;
  }
  .prop-card__actions .btn--whatsapp__label {
    font-size: 14px;
  }
  .prop-card__actions .btn--whatsapp__icon {
    font-size: 1.2em;
  }
  .btn--outline.is-favorite { border-color: #e74c3c; color: #e74c3c; background: rgba(231,76,60,.10); }
  .btn--outline.is-favorite:hover { background: #e74c3c; color: var(--white); }
  .experience--apartments .prop-card {
    padding: 10px;
    border-radius: 18px;
    background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(250,247,243,.98));
  }
  .experience--apartments .prop-card__media { border-radius: 14px; }
  .experience--apartments .prop-card__badge { border-radius: 12px; background: rgba(23,34,45,.72); }
  .experience--apartments .prop-card__img,
  .experience--apartments .prop-card__img-placeholder { aspect-ratio: 1.134/0.9; height: auto; }
  .experience--apartments .prop-card__price-pill {
    background: linear-gradient(135deg, rgba(244,127,82,.12), rgba(255,195,170,.34));
    border: 1px solid rgba(244,127,82,.24);
    color: var(--gold);
    box-shadow: 0 10px 22px rgba(244,127,82,.14);
  }
  .experience--apartments .prop-card__meta span {
    background: none;
    border-color: transparent;
    border-radius: 10px;
  }
  .experience--apartments .btn--primary { color: #fff; }
  .experience--apartments .btn--outline.is-favorite { border-color: #e74c3c; color: #e74c3c; background: rgba(231,76,60,.10); }

  /* SERVICES */
  .services { background: var(--navy); padding: 80px 0; }
  .services .section-title { color: #fff; }
  .services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px,1fr)); gap: 24px; margin-top: 40px; }
  .service-card { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08); border-radius: var(--radius-lg); padding: 28px 24px; transition: var(--transition); }
  .service-card:hover { background: rgba(255,255,255,.08); transform: translateY(-3px); }
  .service-card__icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(247,176,91,.15); color: var(--gold); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; margin-bottom: 16px; }
  .service-card h3 { font-size: 1rem; color: #fff; margin-bottom: 8px; font-weight: 600; }
  .service-card p { color: rgba(255,255,255,.5); font-size: .85rem; line-height: 1.6; }
  .experience--apartments .service-card { border-radius: 18px; }
  .experience--apartments .service-card__icon { border-radius: 16px; background: rgba(244,127,82,.15); }

  /* CONTACT */
  .contact { padding: 80px 0; }
  .contact__inner { display: grid; grid-template-columns: 1fr 1.2fr; gap: 60px; align-items: start; }
  .contact__item { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 20px; }
  .contact__icon-box { width: 40px; height: 40px; border-radius: 10px; background: rgba(247,176,91,.1); color: var(--gold); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
  .contact__item strong { display: block; font-size: .8rem; text-transform: uppercase; letter-spacing: .06em; color: var(--text-muted); }
  .contact__item span { font-size: .95rem; color: var(--text); font-weight: 500; }
  .contact__icon-box--link { text-decoration: none; transition: var(--transition); }
  .contact__icon-box--link:hover { transform: translateY(-1px); background: rgba(247,176,91,.16); }
  .contact__value-link { display: inline-block; font-size: .95rem; color: var(--text); font-weight: 500; text-decoration: none; transition: var(--transition); }
  .contact__value-link:hover { color: var(--gold); }
  .experience--apartments .contact__icon-box { border-radius: 14px; background: rgba(244,127,82,.12); }

  /* FORMS */
  .form-group { margin-bottom: 18px; }
  .form-group label { display: block; font-size: .82rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: .05em; margin-bottom: 7px; }
  .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 12px 14px; border-radius: var(--radius); border: 1.5px solid var(--border); background: #fff; font-family: var(--font-body); font-size: .92rem; color: var(--text); outline: none; transition: var(--transition); }
  .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(247,176,91,.1); }
  .form-group textarea { resize: vertical; min-height: 100px; }
  .premium-toggle-field {
    display: flex !important;
    align-items: center;
    gap: 12px;
    margin-bottom: 0 !important;
    color: var(--text) !important;
    text-transform: none !important;
    letter-spacing: .01em !important;
  }
  .premium-toggle-field input {
    width: 18px !important;
    height: 18px !important;
    margin: 0;
    accent-color: var(--gold);
    flex-shrink: 0;
  }
  .feature-picker { padding: 18px; border-radius: 18px; border: 1px solid var(--border); background: linear-gradient(180deg, #fff 0%, #fbf8f2 100%); }
  .feature-picker__head { margin-bottom: 14px; }
  .feature-picker__title { color: var(--navy); font-size: .88rem; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; }
  .feature-picker__copy { margin-top: 6px; color: var(--text-muted); font-size: .86rem; line-height: 1.55; }
  .feature-picker__list { display: flex; flex-wrap: wrap; gap: 10px; }
  .feature-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 15px;
    border-radius: 999px;
    border: 1px solid rgba(15,27,45,.12);
    background: #fff;
    color: var(--text);
    font-family: var(--font-body);
    font-size: .84rem;
    font-weight: 700;
    cursor: pointer;
    transition: var(--transition);
  }
  .feature-pill svg, .feature-pill .ui-icon { opacity: .6; }
  .feature-pill.is-active svg, .feature-pill.is-active .ui-icon { opacity: 1; }
  .feature-pill:hover { border-color: rgba(247,176,91,.45); color: var(--navy); transform: translateY(-1px); }
  .feature-pill.is-active { background: var(--navy); color: #fff; border-color: var(--navy); box-shadow: 0 14px 26px rgba(15,27,45,.16); }
  .feature-picker__empty { color: var(--text-muted); font-size: .86rem; line-height: 1.55; }
  .experience--apartments .feature-picker { background: linear-gradient(180deg, #fff 0%, #faf5f1 100%); }
  .experience--apartments .feature-pill { border-radius: 14px; }
  .experience--apartments .feature-pill:hover { border-color: rgba(244,127,82,.34); color: var(--gold); }
  .experience--apartments .feature-pill.is-active { background: var(--gold); color: #fff; border-color: var(--gold); box-shadow: 0 14px 26px rgba(244,127,82,.18); }
  .image-uploader-field { margin-bottom: 18px; }
  .image-uploader__topbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
  .image-uploader__count { display: inline-flex; align-items: center; justify-content: center; padding: 5px 10px; border-radius: 999px; background: rgba(247,176,91,.12); color: var(--navy); font-size: .8rem; font-weight: 700; }
  .image-uploader__cover-hint { color: var(--text-muted); font-size: .82rem; }
  .image-uploader__toggle { display: inline-flex; gap: 4px; padding: 4px; margin-bottom: 14px; background: var(--cream); border: 1px solid var(--border); border-radius: 999px; }
  .image-uploader__toggle-btn { border: none; background: transparent; color: var(--text-muted); border-radius: 999px; padding: 9px 16px; font-family: var(--font-body); font-size: .83rem; font-weight: 700; cursor: pointer; transition: var(--transition); }
  .image-uploader__toggle-btn.is-active { background: #fff; color: var(--navy); box-shadow: 0 10px 24px rgba(15,27,45,.08); }
  .image-uploader__gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 12px; margin-bottom: 14px; }
  .image-uploader__thumb { position: relative; border-radius: 18px; overflow: hidden; background: #dde7f4; min-height: 110px; box-shadow: 0 10px 24px rgba(15,27,45,.08); }
  .image-uploader__thumb.is-uploading { opacity: .88; }
  .image-uploader__thumb-image { display: block; width: 100%; height: 100%; min-height: 110px; object-fit: cover; aspect-ratio: 1 / 1; }
  .image-uploader__thumb-overlay { position: absolute; inset: 0; display: flex; align-items: flex-start; justify-content: space-between; padding: 8px; background: linear-gradient(180deg, rgba(15,27,45,.38) 0%, rgba(15,27,45,0) 58%); }
  .image-uploader__thumb-index { display: inline-flex; align-items: center; justify-content: center; min-width: 42px; padding: 4px 8px; border-radius: 999px; background: rgba(255,255,255,.88); color: var(--navy); font-size: .72rem; font-weight: 700; }
  .image-uploader__thumb-remove { width: 44px; height: 44px; border-radius: 14px; border: none; display: inline-flex; align-items: center; justify-content: center; background: rgba(15,27,45,.82); color: #fff; cursor: pointer; box-shadow: 0 10px 20px rgba(15,27,45,.18); transition: var(--transition); }
  .image-uploader__thumb-remove:hover { background: rgba(15,27,45,.94); }
  .image-uploader__thumb-remove:focus-visible {
    outline: 3px solid rgba(247,176,91,.32);
    outline-offset: 2px;
  }
  .image-uploader__thumb-status { width: 30px; height: 30px; border-radius: 50%; border: none; display: inline-flex; align-items: center; justify-content: center; }
  .image-uploader__thumb-status { color: #fff; }
  .image-uploader__thumb-status--success { background: #22c55e; box-shadow: 0 10px 20px rgba(34,197,94,.3); }
  .image-uploader__thumb-status--uploading { background: rgba(247,176,91,.95); box-shadow: 0 10px 20px rgba(247,176,91,.3); }
  .image-uploader__preview-card { display: grid; grid-template-columns: 148px 1fr; gap: 16px; align-items: center; padding: 14px; margin-bottom: 14px; border-radius: 20px; border: 1px solid var(--border); background: linear-gradient(135deg, #fbf8f2 0%, #fff 100%); }
  .image-uploader__preview-media { position: relative; border-radius: 16px; overflow: hidden; background: #dde7f4; min-height: 110px; }
  .image-uploader__preview-image { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; }
  .image-uploader__preview-badge { position: absolute; top: 10px; right: 10px; width: 32px; height: 32px; border-radius: 50%; background: #22c55e; color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(34,197,94,.3); }
  .image-uploader__preview-copy { display: flex; flex-direction: column; gap: 4px; }
  .image-uploader__preview-copy strong { color: var(--navy); font-size: .94rem; }
  .image-uploader__preview-copy span { color: var(--text-muted); font-size: .85rem; line-height: 1.55; }
  .image-uploader__dropzone { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; padding: 26px 22px; border-radius: 22px; border: 1.5px dashed rgba(247,176,91,.45); background: linear-gradient(180deg, #fff 0%, #fbf7ef 100%); transition: var(--transition); }
  .image-uploader__dropzone.is-dragging { border-color: var(--gold); background: #fff8eb; transform: translateY(-1px); box-shadow: 0 18px 36px rgba(247,176,91,.12); }
  .image-uploader__dropzone:focus-visible { border-color: var(--gold); box-shadow: 0 0 0 4px rgba(247,176,91,.14); outline: none; }
  .image-uploader__dropzone-icon { width: 58px; height: 58px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--gold); background: #fff; border: 1px solid rgba(247,176,91,.18); box-shadow: 0 12px 28px rgba(15,27,45,.08); }
  .image-uploader__dropzone-title { color: var(--navy); font-size: 1rem; }
  .image-uploader__dropzone-copy { color: var(--text-muted); font-size: .88rem; line-height: 1.55; }
  .image-uploader__actions { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; margin-top: 2px; }
  .image-uploader__device-btn { min-width: 230px; justify-content: center; }
  .image-uploader__meta { color: var(--text-muted); font-size: .82rem; line-height: 1.55; }
  .image-uploader__progress { width: 100%; max-width: 420px; margin-top: 8px; }
  .image-uploader__progress-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px; color: var(--navy); font-size: .85rem; }
  .image-uploader__progress-track { width: 100%; height: 10px; border-radius: 999px; background: rgba(15,27,45,.08); overflow: hidden; }
  .image-uploader__progress-fill { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #22c55e 0%, var(--gold) 100%); }
  .image-uploader__url-panel { padding: 16px; border-radius: 20px; border: 1px solid var(--border); background: linear-gradient(180deg, #fff 0%, #fbf8f2 100%); }
  .image-uploader__url-actions { display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: center; }
  .image-uploader__error { margin-top: 12px; margin-bottom: 0; }

  /* FOOTER */
  .footer { background: var(--navy); color: rgba(255,255,255,.5); padding: 60px 0 0; }
  .footer__inner { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 40px; padding-bottom: 40px; }
  .footer__brand p { font-size: .85rem; margin-top: 12px; line-height: 1.6; }
  .footer__brand .brand-mark { height: 62px; }
  .footer__socials { display: flex; gap: 10px; margin-top: 20px; }
  .footer__socials a { width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(255,255,255,.15); color: rgba(255,255,255,.5); display: flex; align-items: center; justify-content: center; text-decoration: none; font-size: .85rem; transition: var(--transition); }
  .footer__socials a:hover { border-color: var(--gold); color: var(--gold); }
  .footer__contact { margin-top: 18px; }
  .footer__contact strong { display: block; margin-bottom: 8px; color: rgba(255,255,255,.72); font-size: .76rem; letter-spacing: .08em; text-transform: uppercase; }
  .footer__contact a { color: rgba(255,255,255,.88); text-decoration: none; font-size: .9rem; transition: var(--transition); }
  .footer__contact a:hover { color: var(--gold); }
  .footer__col h4 { color: #fff; font-size: .82rem; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 16px; font-weight: 700; }
  .footer__col a, .footer__col span { display: block; color: rgba(255,255,255,.5); text-decoration: none; font-size: .88rem; margin-bottom: 10px; transition: var(--transition); cursor: pointer; }
  .footer__col a:hover, .footer__col span:hover { color: var(--gold); }
  .footer__bottom { border-top: 1px solid rgba(255,255,255,.08); padding: 20px 0; text-align: center; font-size: .8rem; }
  .experience--apartments .footer { background: linear-gradient(180deg, #17222d 0%, #101820 100%); }

  /* AUTH */
  .auth-layout { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0f1b2d 0%, #1a2e47 100%); padding: 24px; padding-top: 90px; }
  .auth-card { background: #fff; border-radius: var(--radius-lg); padding: 44px; width: 100%; max-width: 440px; box-shadow: 0 24px 80px rgba(0,0,0,.3); animation: fadeUp .4s ease; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .auth-card__logo { margin-bottom: 28px; }
  .auth-card__title { font-family: var(--font-display); font-size: 1.9rem; color: var(--navy); font-weight: 700; margin-bottom: 6px; }
  .auth-card__subtitle { color: var(--text-muted); font-size: .88rem; margin-bottom: 28px; }
  .auth-input-wrap { margin-bottom: 18px; }
  .auth-input-wrap label { display: block; font-size: .8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 7px; }
  .auth-input { width: 100%; padding: 13px 16px; border-radius: var(--radius); border: 1.5px solid var(--border); font-family: var(--font-body); font-size: .92rem; color: var(--text); outline: none; transition: var(--transition); background: #fff; }
  .auth-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(247,176,91,.12); }
  .auth-divider { text-align: center; color: var(--text-muted); font-size: .82rem; margin: 20px 0; position: relative; }
  .auth-divider::before, .auth-divider::after { content: ''; position: absolute; top: 50%; width: 42%; height: 1px; background: var(--border); }
  .auth-divider::before { left: 0; } .auth-divider::after { right: 0; }
  .auth-social-btn {
    width: 100%;
    min-height: 56px;
    border-radius: 16px;
    border: 1.5px solid rgba(15,27,45,.12);
    background: #fff;
    color: var(--navy);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 0 18px;
    font-family: var(--font-body);
    font-size: .95rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 10px 22px rgba(15,27,45,.06);
    transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease, background .22s ease;
  }
  .auth-social-btn:hover {
    transform: translateY(-1px);
    border-color: rgba(15,27,45,.22);
    background: #fdfbf8;
    box-shadow: 0 14px 26px rgba(15,27,45,.1);
  }
  .auth-social-btn:focus-visible {
    outline: none;
    border-color: var(--gold);
    box-shadow: 0 0 0 4px rgba(247,176,91,.14);
  }
  .auth-social-btn:disabled {
    cursor: not-allowed;
    opacity: .72;
    transform: none;
    box-shadow: 0 8px 20px rgba(15,27,45,.06);
  }
  .auth-social-btn__icon {
    width: 22px;
    height: 22px;
    flex: 0 0 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .auth-social-btn__icon svg {
    width: 100%;
    height: 100%;
    display: block;
  }
  .auth-card__footer { text-align: center; font-size: .88rem; color: var(--text-muted); margin-top: 20px; }
  .auth-card__footer a, .auth-card__footer span { color: var(--gold); font-weight: 600; text-decoration: none; cursor: pointer; }
  .auth-server-error { background: #fdecea; color: var(--error); padding: 11px 14px; border-radius: 8px; font-size: .85rem; font-weight: 500; margin-bottom: 14px; }

  /* CREATE POST */
  .page-form { padding-top: 68px; }
  .page-form__header { background: linear-gradient(135deg, #0f1b2d, #1a2e47); padding: 44px 24px; }
  .page-form__header-inner { max-width: 860px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
  .page-form__header-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
  .page-form__title { font-family: var(--font-display); font-size: 2rem; color: #fff; font-weight: 700; }
  .page-form__subtitle { color: rgba(255,255,255,.55); margin-top: 4px; }
  .page-form__user { color: rgba(255,255,255,.6); font-size: .88rem; }
  .page-form__user strong { color: var(--gold); }
  .form-card { max-width: 860px; margin: 40px auto 80px; padding: 44px; background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow); border: 1px solid var(--border); }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 24px; }
  .form-grid .form-group--full { grid-column: 1 / -1; }
  .submit-btn { background: var(--navy); color: #fff; border: none; border-radius: var(--radius); padding: 14px 32px; font-family: var(--font-body); font-size: .95rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: var(--transition); }
  .submit-btn:hover { background: var(--navy-light); transform: translateY(-1px); }
  .submit-btn:disabled, .btn:disabled { cursor: not-allowed; opacity: .7; transform: none; }
  .experience--apartments .submit-btn { border-radius: 14px; }

  /* PROFILE */
  .profile-layout { display: grid; grid-template-columns: 260px 1fr; gap: 32px; margin-top: 32px; }
  .profile-page { padding-top: 100px; padding-bottom: 80px; }
  .profile-page__title { font-family: var(--font-display); font-size: 2rem; color: var(--navy); }
  .profile-header-actions { display: flex; align-items: center; gap: 10px; }
  .profile-back-btn { display: inline-flex; align-items: center; gap: 7px; }
  .profile-back-btn__label { display: inline; }
  .profile-listings-grid { margin-top: 20px; }
  .profile-sidebar { background: #fff; border-radius: var(--radius-lg); border: 1px solid var(--border); padding: 28px 20px; height: fit-content; box-shadow: var(--shadow); }
  .profile-avatar-wrap { text-align: center; margin-bottom: 24px; }
  .profile-avatar { width: 96px; height: 96px; border-radius: 50%; background: linear-gradient(135deg, var(--navy), var(--navy-light)); display: flex; align-items: center; justify-content: center; font-size: 2.2rem; color: var(--gold); margin: 0 auto 10px; transition: var(--transition); }
  .profile-avatar:hover { transform: scale(1.04); }
  .profile-upload-hint { font-size: .75rem; color: var(--text-muted); }
  .profile-nav { display: flex; flex-direction: column; gap: 4px; }
  .profile-nav-item { display: flex; align-items: center; gap: 10px; padding: 11px 14px; border-radius: var(--radius); border: none; background: none; font-family: var(--font-body); font-size: .88rem; font-weight: 500; color: var(--text-muted); cursor: pointer; transition: var(--transition); text-align: left; }
  .profile-nav-item:hover { background: var(--cream); color: var(--text); }
  .profile-nav-item.active { background: var(--navy); color: #fff; }
  .profile-nav-item svg { width: 16px; text-align: center; }
  .profile-nav-badge { min-width: 18px; height: 18px; border-radius: 9px; background: #e74c3c; color: #fff; font-size: .65rem; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; padding: 0 4px; line-height: 1; margin-left: auto; }
  .profile-content { background: #f8f7f4; border-radius: var(--radius-lg); border: 1px solid var(--border); padding: 36px; box-shadow: var(--shadow); }
  .profile-content h2 { font-family: var(--font-display); font-size: 1.5rem; color: var(--navy); margin-bottom: 28px; font-weight: 700; }
  .my-posts-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 28px;
  }
  .my-posts-header__copy { min-width: 0; }
  .my-posts-header__eyebrow {
    margin: 0 0 8px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: .09em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  .my-posts-header__title {
    margin: 0;
    font-family: var(--font-body) !important;
    font-size: 1.5rem !important;
    font-weight: 700 !important;
    color: #111827;
  }
  .my-posts-header__cta {
    border-radius: 12px;
    padding: 11px 16px;
    flex-shrink: 0;
    box-shadow: 0 1px 2px rgba(15,23,42,.08);
    transition: all .15s ease;
  }
  .my-posts-header__cta:hover {
    box-shadow: 0 8px 18px rgba(15,23,42,.12);
    transform: scale(1.05);
  }
  .profile-status { margin-top: 12px; font-size: .88rem; font-weight: 500; }
  .profile-status.success { color: var(--success); }
  .profile-status.error { color: var(--error); }
  .profile-delete-btn { display: flex; align-items: center; gap: 8px; margin-top: 32px; padding: 10px 18px; border-radius: var(--radius); border: 1.5px solid #fcc; background: none; color: var(--error); font-family: var(--font-body); font-size: .85rem; font-weight: 600; cursor: pointer; transition: var(--transition); }
  .profile-delete-btn:hover { background: #fdecea; }

  .analytics-shell {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .analytics-hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 20px;
    padding: 28px;
    border-radius: 24px;
    border: 1px solid rgba(15,27,45,.08);
    background:
      radial-gradient(circle at top left, rgba(247,176,91,.16), transparent 34%),
      linear-gradient(135deg, rgba(255,255,255,.96) 0%, rgba(248,247,244,.98) 100%);
    box-shadow: 0 24px 50px rgba(15,27,45,.08);
  }
  .analytics-hero__copy { min-width: 0; }
  .analytics-hero__title {
    margin: 0 0 10px;
    font-family: var(--font-display);
    font-size: clamp(1.55rem, 3vw, 2.2rem);
    line-height: 1.06;
    color: var(--navy);
  }
  .analytics-hero__subtitle {
    max-width: 62ch;
    margin: 0;
    color: var(--text-muted);
    font-size: .95rem;
    line-height: 1.68;
  }
  .analytics-hero__aside {
    min-width: 220px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }
  .analytics-hero__meta {
    margin: 0;
    color: var(--text-muted);
    font-size: .84rem;
    text-align: right;
    line-height: 1.6;
  }
  .analytics-plan-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    padding: 0 14px;
    border-radius: 999px;
    font-size: .78rem;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
    border: 1px solid transparent;
  }
  .analytics-plan-badge--premium {
    background: rgba(247,176,91,.16);
    color: #8a5b18;
    border-color: rgba(247,176,91,.25);
  }
  .analytics-plan-badge--business-pro {
    background: rgba(15,27,45,.08);
    color: var(--navy);
    border-color: rgba(15,27,45,.14);
  }
  .analytics-plan-badge--free {
    background: rgba(15,27,45,.05);
    color: var(--text-muted);
    border-color: rgba(15,27,45,.08);
  }
  .analytics-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
  .analytics-toolbar__filters {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px;
    border-radius: 999px;
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(15,27,45,.08);
    box-shadow: 0 12px 26px rgba(15,27,45,.06);
  }
  .analytics-filter {
    border: none;
    background: transparent;
    color: var(--text-muted);
    min-height: 40px;
    padding: 0 16px;
    border-radius: 999px;
    font-family: var(--font-body);
    font-size: .85rem;
    font-weight: 700;
    cursor: pointer;
    transition: var(--transition);
  }
  .analytics-filter.is-active {
    background: var(--navy);
    color: #fff;
    box-shadow: 0 16px 28px rgba(15,27,45,.16);
  }
  .analytics-filter:hover { color: var(--navy); }
  .analytics-toolbar__note {
    color: var(--text-muted);
    font-size: .84rem;
  }
  .analytics-upgrade__panel,
  .analytics-panel,
  .analytics-empty,
  .analytics-error {
    background: rgba(255,255,255,.96);
    border: 1px solid rgba(15,27,45,.08);
    border-radius: 24px;
    box-shadow: 0 18px 40px rgba(15,27,45,.06);
  }
  .analytics-upgrade__panel {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 20px;
    align-items: center;
    padding: 28px;
  }
  .analytics-upgrade__copy h3 {
    margin: 12px 0 10px;
    font-family: var(--font-display);
    font-size: 1.7rem;
    line-height: 1.1;
    color: var(--navy);
  }
  .analytics-upgrade__copy p {
    margin: 0;
    max-width: 58ch;
    color: var(--text-muted);
    line-height: 1.72;
  }
  .analytics-upgrade__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
  }
  .analytics-stat-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 16px;
  }
  .analytics-stat-card {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr);
    gap: 14px;
    align-items: start;
    padding: 20px 18px;
    border-radius: 22px;
    border: 1px solid rgba(15,27,45,.08);
    background: rgba(255,255,255,.96);
    box-shadow: 0 16px 34px rgba(15,27,45,.06);
  }
  .analytics-stat-card--accent {
    background: linear-gradient(180deg, rgba(255,248,236,.95) 0%, rgba(255,255,255,.98) 100%);
  }
  .analytics-stat-card--premium {
    background: linear-gradient(145deg, rgba(15,27,45,.98) 0%, rgba(26,46,71,.96) 100%);
    color: #fff;
  }
  .analytics-stat-card--premium .analytics-stat-card__label,
  .analytics-stat-card--premium .analytics-stat-card__helper {
    color: rgba(255,255,255,.72);
  }
  .analytics-stat-card--locked {
    position: relative;
    overflow: hidden;
  }
  .analytics-stat-card__icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(247,176,91,.14);
    color: var(--gold);
    font-size: 1.1rem;
  }
  .analytics-stat-card--premium .analytics-stat-card__icon {
    background: rgba(255,255,255,.08);
    color: var(--gold-light);
  }
  .analytics-stat-card__copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .analytics-stat-card__label {
    color: var(--text-muted);
    font-size: .78rem;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
  }
  .analytics-stat-card__value {
    color: inherit;
    font-family: var(--font-display);
    font-size: 1.7rem;
    line-height: 1;
  }
  .analytics-stat-card__helper {
    margin: 0;
    color: var(--text-muted);
    font-size: .82rem;
    line-height: 1.55;
  }
  .analytics-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.55fr) minmax(300px, .95fr);
    gap: 18px;
  }
  .analytics-grid--secondary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .analytics-panel {
    padding: 24px;
  }
  .analytics-panel--wide {
    min-width: 0;
  }
  .analytics-block__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }
  .analytics-block__head h3,
  .analytics-block__head h4 {
    margin: 0 0 6px;
    color: var(--navy);
    font-size: 1.08rem;
  }
  .analytics-block__head p {
    margin: 0;
    color: var(--text-muted);
    font-size: .86rem;
    line-height: 1.65;
  }
  .analytics-summary-list {
    display: grid;
    gap: 14px;
    margin: 0;
  }
  .analytics-summary-list > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 18px;
    background: linear-gradient(180deg, #fff 0%, #faf9f6 100%);
    border: 1px solid rgba(15,27,45,.07);
  }
  .analytics-summary-list dt {
    color: var(--text-muted);
    font-size: .84rem;
  }
  .analytics-summary-list dd {
    margin: 0;
    color: var(--navy);
    font-family: var(--font-display);
    font-size: 1.28rem;
  }
  .analytics-mini-cards {
    display: grid;
    gap: 12px;
  }
  .analytics-mini-cards article {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 18px;
    background: linear-gradient(180deg, rgba(255,248,236,.9) 0%, rgba(255,255,255,.98) 100%);
    border: 1px solid rgba(247,176,91,.2);
  }
  .analytics-mini-cards span {
    color: var(--text-muted);
    font-size: .84rem;
  }
  .analytics-mini-cards strong {
    color: var(--navy);
    font-family: var(--font-display);
    font-size: 1.2rem;
  }
  .analytics-table {
    border-radius: 20px;
    border: 1px solid rgba(15,27,45,.08);
    overflow: hidden;
    background: #fff;
  }
  .analytics-table__head,
  .analytics-table__row {
    display: grid;
    grid-template-columns: minmax(220px, 1.4fr) repeat(4, minmax(0, .7fr));
    gap: 12px;
    align-items: center;
    padding: 14px 18px;
  }
  .analytics-table__head {
    background: rgba(15,27,45,.04);
    color: var(--text-muted);
    font-size: .74rem;
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
  }
  .analytics-table__row {
    border-top: 1px solid rgba(15,27,45,.06);
    font-size: .9rem;
    color: var(--navy);
  }
  .analytics-table__listing {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .analytics-table__listing strong {
    color: var(--navy);
    font-size: .94rem;
  }
  .analytics-table__listing small,
  .analytics-table__hint {
    color: var(--text-muted);
    font-size: .8rem;
  }
  .analytics-table__empty {
    padding: 18px;
    border-radius: 18px;
    background: rgba(15,27,45,.03);
    color: var(--text-muted);
    font-size: .9rem;
  }
  .analytics-chart {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .analytics-chart__legend {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    color: var(--text-muted);
    font-size: .82rem;
  }
  .analytics-chart__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
    margin-right: 8px;
  }
  .analytics-chart__dot--views { background: var(--navy); }
  .analytics-chart__dot--leads { background: var(--gold); }
  .analytics-chart__plot {
    min-height: 280px;
    display: grid;
    grid-template-columns: repeat(30, minmax(0, 1fr));
    gap: 8px;
    align-items: end;
    padding: 20px 14px 10px;
    border-radius: 20px;
    border: 1px solid rgba(15,27,45,.08);
    background:
      linear-gradient(180deg, rgba(15,27,45,.02) 0%, rgba(15,27,45,.01) 100%),
      repeating-linear-gradient(
        to top,
        rgba(15,27,45,.06) 0,
        rgba(15,27,45,.06) 1px,
        transparent 1px,
        transparent 54px
      );
  }
  .analytics-chart__slot {
    min-width: 0;
    height: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4px;
    align-items: end;
  }
  .analytics-chart__bar {
    width: 100%;
    border-radius: 999px 999px 6px 6px;
    transition: height .28s ease;
  }
  .analytics-chart__bar--views {
    background: linear-gradient(180deg, rgba(26,46,71,.92) 0%, var(--navy) 100%);
  }
  .analytics-chart__bar--leads {
    background: linear-gradient(180deg, rgba(247,176,91,.95) 0%, #d39138 100%);
  }
  .analytics-chart__label {
    grid-column: 1 / -1;
    margin-top: 8px;
    color: var(--text-muted);
    font-size: .72rem;
    text-align: center;
  }
  .analytics-breakdown-card,
  .analytics-activity-card {
    background: rgba(255,255,255,.96);
    border: 1px solid rgba(15,27,45,.08);
    border-radius: 24px;
    padding: 22px;
    box-shadow: 0 16px 36px rgba(15,27,45,.06);
  }
  .analytics-breakdown-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 12px;
  }
  .analytics-breakdown-list__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 16px;
    background: rgba(15,27,45,.03);
  }
  .analytics-breakdown-list__item span {
    color: var(--text-muted);
    font-size: .86rem;
  }
  .analytics-breakdown-list__item strong {
    color: var(--navy);
    font-size: .94rem;
  }
  .analytics-breakdown-card__empty {
    margin: 0;
    color: var(--text-muted);
    font-size: .88rem;
    line-height: 1.7;
  }
  .analytics-activity-list {
    display: grid;
    gap: 12px;
  }
  .analytics-activity-list__item {
    padding: 14px 16px;
    border-radius: 18px;
    border: 1px solid rgba(15,27,45,.06);
    background: linear-gradient(180deg, #fff 0%, #faf9f6 100%);
  }
  .analytics-activity-list__meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 8px;
  }
  .analytics-activity-list__meta strong {
    color: var(--navy);
    font-size: .92rem;
  }
  .analytics-activity-list__meta span {
    color: var(--text-muted);
    font-size: .82rem;
  }
  .analytics-activity-list__details {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    color: var(--text-muted);
    font-size: .78rem;
  }
  .analytics-locked {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 16px;
    padding: 18px 20px;
    border-radius: 20px;
    border: 1px dashed rgba(247,176,91,.42);
    background: linear-gradient(180deg, rgba(255,250,242,.95) 0%, rgba(255,255,255,.98) 100%);
  }
  .analytics-locked--compact {
    margin-top: 4px;
  }
  .analytics-locked__icon {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(247,176,91,.16);
    color: var(--gold);
  }
  .analytics-locked__copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .analytics-locked__copy strong {
    color: var(--navy);
    font-size: .95rem;
  }
  .analytics-locked__copy p {
    margin: 0;
    color: var(--text-muted);
    font-size: .84rem;
    line-height: 1.62;
  }
  .analytics-empty,
  .analytics-error {
    padding: 34px 24px;
    text-align: center;
  }
  .analytics-empty svg,
  .analytics-error svg {
    font-size: 2.4rem;
    color: var(--gold);
    margin-bottom: 12px;
  }
  .analytics-empty h3 {
    margin: 0 0 10px;
    color: var(--navy);
    font-size: 1.1rem;
  }
  .analytics-empty p,
  .analytics-error p {
    max-width: 54ch;
    margin: 0 auto;
    color: var(--text-muted);
    line-height: 1.7;
  }
  .detail-page__contact-row--link {
    text-decoration: none;
    color: var(--navy);
  }
  .detail-page__contact-row--link:hover {
    color: var(--navy-light);
  }

  /* ADMIN */
  .admin-header { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: var(--navy); border-bottom: 1px solid rgba(247,176,91,.2); padding: 0 24px; height: 64px; display: flex; align-items: center; }
  .admin-header__inner { max-width: 1200px; margin: 0 auto; width: 100%; display: flex; align-items: center; justify-content: space-between; }
  .admin-header__meta { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
  .admin-body { max-width: 1200px; margin: 0 auto; padding: 90px 24px 60px; }
  .admin-body .btn--ghost {
    background: rgba(15,27,45,.05);
    color: var(--navy);
    border: 1.5px solid rgba(15,27,45,.12);
  }
  .admin-body .btn--ghost:hover {
    background: rgba(15,27,45,.1);
    border-color: rgba(15,27,45,.2);
    color: var(--navy);
  }
  .admin-body .btn--ghost svg, .admin-body .btn--ghost .ui-icon { color: var(--navy); }
  .admin-body .btn--success svg, .admin-body .btn--success .ui-icon { color: #fff; }
  .admin-body .btn--danger svg, .admin-body .btn--danger .ui-icon { color: #fff; }
  .admin-body .btn--primary svg, .admin-body .btn--primary .ui-icon { color: var(--navy); }
  .admin-body .admin-tab svg, .admin-body .admin-tab .ui-icon { color: var(--text-muted); }
  .admin-body .admin-tab.active svg, .admin-body .admin-tab.active .ui-icon { color: #fff; }
  .admin-tabs { display: flex; gap: 4px; margin-bottom: 24px; }
  .admin-tab { padding: 10px 20px; border-radius: 10px; font-family: var(--font-body); font-size: .88rem; font-weight: 600; border: 1.5px solid var(--border); background: #fff; color: var(--text-muted); cursor: pointer; transition: var(--transition); display: flex; align-items: center; gap: 7px; }
  .admin-tab.active { background: var(--navy); color: #fff; border-color: var(--navy); }
  .admin-stat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; margin-bottom: 32px; }
  .admin-stat-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; }
  .admin-stat-card__label { font-size: .75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: .07em; font-weight: 700; margin-bottom: 8px; }
  .admin-stat-card__val { font-family: var(--font-display); font-size: 2.2rem; font-weight: 700; color: var(--navy); }
  .admin-stat-card__val.gold { color: var(--gold); }
  .admin-stat-card__val.warning { color: var(--warning); }
  .admin-table { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
  .admin-table-row { display: grid; align-items: center; padding: 14px 20px; border-bottom: 1px solid var(--border); transition: var(--transition); }
  .admin-table-row:last-child { border-bottom: none; }
  .admin-table-row:hover { background: var(--cream); }
  .admin-table-head { background: var(--cream); font-size: .75rem; text-transform: uppercase; letter-spacing: .06em; font-weight: 700; color: var(--text-muted); }
  .admin-table-row.posts-row { grid-template-columns: 1fr 120px 100px 120px 100px; }
  .admin-table-row.users-row { grid-template-columns: 1fr 200px 90px 70px 120px 80px 100px 200px; text-align: center; justify-items: center; }
  .admin-toolbar { display: flex; gap: 12px; align-items: center; padding: 10px 16px; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
  .admin-toolbar__field { flex: 1 1 280px; min-width: 0; }
  .admin-toolbar__select { flex: 0 1 180px; min-width: 0; }
  .admin-toolbar__label { color: var(--text-muted); font-size: .85rem; }
  .admin-table__action-group { display: flex; gap: 6px; flex-wrap: nowrap; align-items: center; }
  .admin-table__action-group button:hover:not(:disabled) { background: var(--cream, #f5f5f0) !important; }
  .admin-table__action-group div[style] button:hover:not(:disabled) { background: var(--cream, #f5f5f0) !important; border-radius: 6px; }
  .badge { display: inline-flex; align-items: center; justify-content: center; padding: 3px 10px; border-radius: 50px; font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
  .badge--admin { background: rgba(247,176,91,.15); color: var(--gold); }
  .badge--user { background: var(--cream); color: var(--text-muted); }
  .admin-empty { text-align: center; padding: 60px 20px; color: var(--text-muted); }
  .admin-empty svg { font-size: 2.5rem; opacity: .25; display: block; margin-bottom: 12px; }
  .admin-premium-summary {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
    background: linear-gradient(180deg, #fff 0%, #fbf8f2 100%);
  }
  .admin-premium-summary p {
    color: var(--text-muted);
    font-size: .84rem;
    line-height: 1.6;
  }
  .admin-premium-summary strong { color: var(--navy); }
  .premium-row {
    grid-template-columns: 88px minmax(200px, 1.5fr) minmax(120px, 1fr) 100px 90px 130px 120px 120px;
    gap: 10px;
  }
  .premium-row__title {
    display: grid;
    gap: 4px;
    min-width: 0;
  }
  .premium-row__title strong,
  .premium-row__title-link {
    font-size: .88rem;
    font-weight: 600;
    color: var(--navy);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    transition: color .15s;
  }
  .premium-row__title-link:hover {
    color: var(--gold);
    text-decoration: underline;
  }
  .premium-row__author-link {
    font-size: .78rem;
    color: var(--text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transition: color .15s;
  }
  .premium-row__author-link:hover {
    color: var(--gold);
    text-decoration: underline;
  }
  .premium-row__title > span {
    font-size: .78rem;
    color: var(--text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .premium-row__location {
    font-size: .82rem;
    color: var(--text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* â”€â”€â”€ Switch toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  .premium-row__switch {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    user-select: none;
  }
  .premium-row__switch input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  .switch-slider {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
    background: #ccc;
    border-radius: 24px;
    transition: background .25s;
    flex-shrink: 0;
  }
  .switch-slider::after {
    content: "";
    position: absolute;
    left: 3px;
    top: 3px;
    width: 18px;
    height: 18px;
    background: #fff;
    border-radius: 50%;
    transition: transform .25s;
    box-shadow: 0 1px 4px rgba(0,0,0,.15);
  }
  .premium-row__switch input:checked + .switch-slider {
    background: var(--gold, #f7b05b);
  }
  .premium-row__switch input:checked + .switch-slider::after {
    transform: translateX(20px);
  }
  .premium-row__switch input:disabled + .switch-slider {
    opacity: .5;
    cursor: not-allowed;
  }
  .switch-label {
    font-size: .82rem;
    font-weight: 700;
    color: var(--text-muted);
    min-width: 28px;
  }
  .premium-row__switch input:checked ~ .switch-label {
    color: var(--gold, #f7b05b);
  }
  .premium-row__hidden {
    visibility: hidden;
  }
  .premium-row__order {
    display: flex;
    align-items: center;
  }
  .premium-row__days {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .premium-row__select {
    width: 100%;
    max-width: 120px;
    padding: 8px 10px;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    background: #fff;
    font-family: var(--font-body);
    font-size: .84rem;
    font-weight: 600;
    color: var(--navy);
    outline: none;
    cursor: pointer;
    appearance: auto;
  }
  .premium-row__select:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 3px rgba(247,176,91,.12);
  }
  .premium-row__input {
    width: 100%;
    max-width: 84px;
    padding: 8px 10px;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    background: #fff;
    font-family: var(--font-body);
    font-size: .86rem;
    font-weight: 700;
    color: var(--navy);
    outline: none;
  }
  .premium-row__input--custom {
    max-width: 64px;
  }
  .premium-row__input:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 3px rgba(247,176,91,.12);
  }
  .premium-row__expires {
    display: flex;
    align-items: center;
  }
  .premium-active-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(34,197,94,.12);
    color: #16a34a;
    font-size: .76rem;
    font-weight: 700;
  }
  .premium-expired-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(239,68,68,.12);
    color: #ef4444;
    font-size: .76rem;
    font-weight: 700;
  }
  .premium-row--expired {
    background: rgba(239,68,68,.04);
  }
  .premium-row__actions {
    display: flex;
    justify-content: flex-end;
  }
  .premium-row__actions .btn {
    min-width: 90px;
    justify-content: center;
  }
  .admin-denied { display: flex; align-items: center; justify-content: center; min-height: 100vh; flex-direction: column; gap: 16px; padding: 24px; text-align: center; }
  .admin-denied__icon { font-size: 3rem; color: var(--error); }
  .admin-denied__title { font-family: var(--font-display); color: var(--navy); }
  .admin-denied__copy { color: var(--text-muted); }
  .spinner { width: 32px; height: 32px; border: 3px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin .7s linear infinite; margin: 0 auto 12px; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* MODAL */
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    padding: 0;
    background: rgba(15,27,45,.8);
    backdrop-filter: blur(8px);
    animation: fadeIn .2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal-card {
    background: #fff;
    border-radius: 0;
    width: 100vw;
    height: 100dvh;
    max-width: none;
    max-height: none;
    overflow-y: auto;
    box-shadow: none;
    animation: fadeUp .3s ease;
  }
  .modal-card__img { display: block; width: 100%; height: 100%; object-fit: contain; }
  .modal-card__img-placeholder { width: 100%; aspect-ratio: 4 / 3; background: linear-gradient(135deg, #1a2e47, #0f1b2d); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,.2); font-size: 3rem; border-radius: 26px; }
  .modal-card__body { padding: 28px; }
  .modal-card__header { display: flex; align-items: center; justify-content: flex-end; padding: 12px 14px 0; background: linear-gradient(180deg, #0f172a 0%, #162234 100%); flex-shrink: 0; }
  .modal-card__close { background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.18); color: #fff; width: 44px; height: 44px; border-radius: 14px; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: var(--transition); z-index: 10; }
  .modal-card__close:hover { background: rgba(255,255,255,.25); }
  .modal-card__close:focus-visible {
    outline: 3px solid rgba(247,176,91,.28);
    outline-offset: 2px;
  }
  .modal-card__img-wrap { position: relative; padding: 0 18px 18px; background: linear-gradient(180deg, #0f172a 0%, #162234 100%); }
  .property-gallery__stage { aspect-ratio: 4 / 3; display: flex; align-items: center; justify-content: center; padding: 18px; border-radius: 26px; overflow: hidden; background:
      radial-gradient(circle at top, rgba(255,255,255,.1), transparent 34%),
      linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.01)); }
  .property-gallery__image { background: transparent; }
  .property-gallery__arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 46px; height: 46px; border-radius: 50%; border: 1px solid rgba(255,255,255,.18); background: rgba(15,23,42,.72); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: var(--transition); backdrop-filter: blur(12px); }
  .property-gallery__arrow:hover { background: rgba(15,23,42,.9); transform: translateY(-50%) scale(1.04); }
  .property-gallery__arrow--prev { left: 30px; }
  .property-gallery__arrow--next { right: 30px; }
  .property-gallery__hud { position: absolute; left: 30px; right: 30px; bottom: 28px; display: flex; align-items: center; justify-content: space-between; gap: 12px; pointer-events: none; }
  .property-gallery__counter,
  .property-gallery__hint { display: inline-flex; align-items: center; justify-content: center; min-height: 34px; padding: 8px 12px; border-radius: 999px; background: rgba(15,23,42,.72); color: #fff; backdrop-filter: blur(10px); font-size: .82rem; }
  .property-gallery__counter { font-weight: 700; }
  .property-gallery__hint { color: rgba(255,255,255,.82); }

  /* Desktop 2-column gallery layout */
  .property-gallery__main-col { position: relative; flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; }
  .modal-card__img-wrap--desktop-gallery {
    display: flex;
    gap: 14px;
    align-items: stretch;
  }
  .modal-card__img-wrap--desktop-gallery .property-gallery__stage {
    aspect-ratio: auto;
    height: 100%;
    flex: 1;
  }
  .modal-card__img-wrap--desktop-gallery .property-gallery__main-col {
    height: clamp(240px, 55vh, 560px);
  }
  .property-gallery__thumbs-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 10px;
    flex: 0 0 33%;
    min-width: 0;
    height: 100%;
  }
  .property-gallery__thumb {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
    border: 2px solid transparent;
    cursor: pointer;
    transition: border-color .2s ease, opacity .2s ease, transform .15s ease;
    opacity: .85;
    background: rgba(0,0,0,.04);
    padding: 0;
  }
  .property-gallery__thumb:hover {
    opacity: 1;
    transform: scale(1.03);
    border-color: rgba(0,0,0,.15);
  }
  .property-gallery__thumb--active {
    opacity: 1;
    border-color: var(--gold, #F7B05B);
    box-shadow: 0 0 0 1px var(--gold, #F7B05B);
  }
  .property-gallery__thumb--active:hover { transform: none; }
  .property-gallery__thumb-img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .modal-meta { display: flex; gap: 0.5cm; flex-wrap: wrap; margin: 14px 0 20px; }
  .modal-meta-item { display: flex; align-items: center; gap: 6px; font-size: 16px; color: #1B2845; }
  .villa-details__back { margin-bottom: 24px; }
  .villa-details__overlay {
    padding: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .villa-details__card { margin: 0 auto; max-width: none; }
  .villa-details__card--modal {
    width: 100vw;
    max-width: none;
    max-height: none;
    height: 100dvh;
    overflow-y: auto;
    border-radius: 0;
  }
  .villa-details__card--modal .modal-card__img-wrap {
    flex: none;
  }
  .villa-details__card--modal .property-gallery__stage,
  .villa-details__card--modal .modal-card__img-placeholder {
    height: clamp(180px, 34dvh, 400px);
    max-height: 100%;
    aspect-ratio: auto;
  }
  .villa-details__card--modal .modal-card__img-wrap--desktop-gallery .property-gallery__stage {
    height: 100%;
  }
  .villa-details__title-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 4px; }
  .villa-details__title-row .prop-card__price-pill { font-size: 1rem; padding: 6px 16px; min-height: 38px; flex-shrink: 0; }
  .villa-details__title { font-family: var(--font-display); font-size: 1.6rem; color: var(--navy); margin: 8px 0 4px; }
  .villa-details__location { font-size: .9rem; color: var(--text-muted); }
  .villa-details__meta { margin-top: 16px; }
  .villa-details__description { margin-top: 16px; padding: 16px 0; color: var(--text-muted); line-height: 1.7; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .villa-details__feature-block { margin-top: 20px; }
  .villa-details__feature-label { color: var(--navy); font-size: .88rem; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; margin-bottom: 12px; }
  .property-features { display: flex; flex-wrap: wrap; gap: 8px; }
  .property-feature { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 8px 14px; border-radius: 999px; background: rgba(247,176,91,.1); color: var(--navy); border: 1.5px solid rgba(247,176,91,.3); font-size: .83rem; font-weight: 600; letter-spacing: .01em; }
  .property-feature svg, .property-feature .ui-icon { color: var(--gold); }
  .experience--apartments .property-feature { background: rgba(23,34,45,.06); color: var(--navy); border-color: rgba(23,34,45,.14); border-radius: 12px; }
  .experience--apartments .property-feature svg, .experience--apartments .property-feature .ui-icon { color: var(--gold); }
  .villa-details__actions { margin-top: 20px; display: flex; gap: 12px; flex-wrap: wrap; }
  .villa-details__actions .btn--outline.is-not-saved { border-color: #999; color: #999; background: transparent; }
  .villa-details__actions .btn--outline.is-not-saved:hover { background: #999; color: #fff; border-color: #999; }

  /* Detail Page â€” full-page premium property view */
  .detail-page { min-height: 70vh; padding-bottom: 80px; background: #f7f7f5; }
  .detail-page__container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
  .detail-page__back { display: inline-flex; align-items: center; gap: 8px; background: none; border: none; color: var(--text-muted); font-size: .88rem; font-weight: 600; cursor: pointer; padding: 20px 0 28px; transition: color .2s ease; }
  .detail-page__back:hover { color: var(--navy); }

  /* Premium White Gallery */
  .premium-gallery { background: #ffffff; border-radius: 20px; padding: 20px; box-shadow: 0 1px 8px rgba(0,0,0,.04); }
  .premium-gallery__content { display: flex; gap: 0; align-items: stretch; }
  .premium-gallery__main { position: relative; flex: 1; min-width: 0; }
  .premium-gallery__stage { width: 100%; aspect-ratio: 16 / 10; border-radius: 14px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f9f9f9; }
  .premium-gallery__image { display: block; width: 100%; height: 100%; object-fit: cover; border-radius: 14px; transition: opacity .3s ease; }
  .premium-gallery__placeholder { width: 100%; aspect-ratio: 16 / 10; background: #f5f5f3; display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 3rem; border-radius: 14px; }

  /* Arrow Buttons â€” minimal circular */
  .premium-gallery__arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 42px; height: 42px; border-radius: 50%; border: 1px solid rgba(0,0,0,.1); background: rgba(255,255,255,.92); color: #333; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .25s ease; backdrop-filter: blur(8px); box-shadow: 0 2px 8px rgba(0,0,0,.06); z-index: 2; font-size: .85rem; }
  .premium-gallery__arrow:hover { background: #fff; border-color: rgba(0,0,0,.18); box-shadow: 0 3px 12px rgba(0,0,0,.1); transform: translateY(-50%) scale(1.05); }
  .premium-gallery__arrow--prev { left: 14px; }
  .premium-gallery__arrow--next { right: 14px; }

  /* Photo Counter */
  .premium-gallery__counter { position: absolute; bottom: 16px; left: 16px; background: rgba(255,255,255,.9); color: #444; font-size: .78rem; font-weight: 600; padding: 6px 14px; border-radius: 20px; backdrop-filter: blur(8px); box-shadow: 0 1px 6px rgba(0,0,0,.06); letter-spacing: .02em; z-index: 2; }

  /* Vertical Thumbnails */
  .premium-gallery__thumbs { display: flex; flex-direction: row; gap: 10px; margin-top: 14px; overflow-x: auto; overflow-y: hidden; padding-bottom: 4px; scrollbar-width: thin; scrollbar-color: #e0e0e0 transparent; }
  .premium-gallery__thumbs::-webkit-scrollbar { height: 3px; }
  .premium-gallery__thumbs::-webkit-scrollbar-track { background: transparent; }
  .premium-gallery__thumbs::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 3px; }
  .premium-gallery__thumb { width: 80px; aspect-ratio: 1; border-radius: 10px; overflow: hidden; border: 2px solid transparent; cursor: pointer; transition: all .25s ease; opacity: .7; background: #f5f5f3; padding: 0; flex-shrink: 0; }
  .premium-gallery__thumb:hover { opacity: 1; border-color: rgba(0,0,0,.12); box-shadow: 0 2px 6px rgba(0,0,0,.06); }
  .premium-gallery__thumb--active { opacity: 1; border-color: var(--gold, #F7B05B); box-shadow: 0 0 0 1px var(--gold, #F7B05B); }
  .premium-gallery__thumb--active:hover { transform: none; }
  .premium-gallery__thumb-img { display: block; width: 100%; height: 100%; object-fit: cover; }

  /* 2-Column Body */
  .detail-page__body { display: grid; grid-template-columns: 1fr; gap: 28px; align-items: start; }
  .detail-page__main { display: flex; flex-direction: column; gap: 20px; min-width: 0; }

  /* Header: label + title + location */
  .detail-page__header { padding-bottom: 0; border-bottom: none; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .detail-page__header .villa-details__title { flex: 1; min-width: 0; }
  .detail-page__fav-btn { width: 40px; height: 40px; border-radius: 50%; border: none; background: rgba(255,255,255,.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; cursor: pointer; color: #8d99a8; font-size: 1.05rem; transition: all .2s ease; box-shadow: 0 2px 8px rgba(0,0,0,.12); flex-shrink: 0; }
  .detail-page__fav-btn:hover { background: #fff; transform: scale(1.1); }
  .detail-page__fav-btn.is-favorite { color: #e74c3c; }
  .detail-page__fav-btn:disabled { opacity: .5; pointer-events: none; }
  .detail-page__sub-header { }
  .detail-page__category-label { display: inline-block; font-size: .72rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--gold, #F7B05B); margin-bottom: 8px; }
  .detail-page .villa-details__title { font-size: 1.75rem; margin: 0 0 6px; }
  .detail-page .villa-details__location { font-size: .9rem; }

  /* White Cards */
  .detail-page__card { background: #fff; border-radius: 18px; padding: 28px; border: 1px solid #eae8e4; }
  .detail-page__card-heading { font-size: .82rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--navy); margin-bottom: 14px; }
  .detail-page__card .villa-details__description { margin-top: 0; padding: 0; border: none; }
  .detail-page__card .villa-details__meta { margin: 0; }
  .detail-page__card .villa-details__feature-block { margin-top: 0; }
  .detail-page__card .villa-details__feature-label { margin-bottom: 14px; }
  .detail-page__card .modal-meta-item { font-size: .82rem; font-weight: 600; background: none; border: none; border-radius: 12px; padding: 10px 8px; }

  /* Sidebar â€” Cards */
  .detail-page__sidebar { display: none; align-self: start; flex-direction: column; gap: 14px; }
  .detail-page__contact-sidebar { display: none; }
  .detail-page__booking-card { background: #fff; border-radius: 20px; padding: 28px 24px; border: 1px solid #eae8e4; box-shadow: 0 2px 16px rgba(0,0,0,.05); }
  .detail-page__booking-card--mobile { display: block; }
  .detail-page__booking-label { font-size: .74rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 16px; }
  .detail-page__booking-price { margin-bottom: 12px; display: flex; align-items: center; gap: 12px; }
  .detail-page__booking-price .prop-card__price-pill { font-size: 1.3rem; padding: 12px 24px; min-height: 48px; }
  .detail-page__whatsapp-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #25D366;
    color: #fff;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    text-decoration: none;
    box-shadow: 0 4px 14px rgba(37,211,102,0.35);
    transition: transform .15s, box-shadow .15s;
    flex-shrink: 0;
  }
  .detail-page__whatsapp-icon:hover {
    transform: translateY(-2px) scale(1.06);
    box-shadow: 0 6px 20px rgba(37,211,102,0.45);
  }
  .detail-page__whatsapp-icon:active { transform: translateY(0) scale(1); }
  .detail-page__booking-hint { font-size: .82rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 0; }

  /* Contact Card */
  .detail-page__contact-card { background: #fff; border-radius: 20px; padding: 28px 24px; border: 1px solid #eae8e4; box-shadow: 0 2px 16px rgba(0,0,0,.05); }
  .detail-page__contact-label { font-size: .74rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 16px; }
  .detail-page__contact-info { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
  .detail-page__contact-row { display: flex; align-items: center; gap: 10px; font-size: .9rem; color: var(--navy); margin: 0; }
  .detail-page__contact-row svg { color: var(--gold, #F7B05B); font-size: .85rem; width: 18px; text-align: center; flex-shrink: 0; }
  .detail-page__contact-row span { word-break: break-word; }

  .detail-page__booking-actions { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
  .detail-page__booking-actions .btn--whatsapp { width: 100%; justify-content: center; }
  .detail-page__booking-actions .btn--outline { width: 100%; justify-content: center; }
  .detail-page__contact-card .btn--ghost { width: 100%; justify-content: center; margin-top: 4px; font-size: .85rem; color: var(--navy); border: 1.5px solid #d5d3cf; background: transparent; font-weight: 600; }
  .detail-page__contact-card .btn--ghost:hover { background: var(--navy); color: #fff; border-color: var(--navy); }
  .detail-page__contact-card .btn--ghost svg { color: var(--gold); }
  .detail-page__contact-card .btn--ghost:hover svg { color: var(--gold-light); }
  .btn--full { width: 100%; justify-content: center; }

  /* Desktop 2-col */
  @media (min-width: 1025px) {
    .detail-page__container { max-width: 1200px; padding: 0 48px; }
    .premium-gallery { border-radius: 18px; padding: 16px; }
    .premium-gallery__stage { aspect-ratio: 16 / 10; }
    .premium-gallery__thumb { width: 80px; }
    .detail-page__body { grid-template-columns: 1fr 340px; gap: 32px; }
    .detail-page .villa-details__title { font-size: 2rem; }
    .detail-page__card { padding: 32px; }
    .detail-page__sidebar { display: flex; position: sticky; top: 88px; }
    .detail-page__contact-sidebar { display: block; }
    .detail-page__contact-main { display: none; }
    .detail-page__booking-card--mobile { display: none; }
  }
  /* Tablet */
  @media (max-width: 1024px) {
    .detail-page__body { grid-template-columns: 1fr; }
    .detail-page__sidebar { display: none !important; }
    .detail-page__contact-main { display: block !important; }
    .detail-page__booking-card--mobile { display: block !important; }
  }
  /* Mobile */
  @media (max-width: 768px) {
    .detail-page__container { padding: 0 16px; }
    .premium-gallery { border-radius: 14px; padding: 12px; }
    .premium-gallery__thumb { width: 60px; }
    .premium-gallery__thumbs { gap: 8px; }
    .premium-gallery__arrow { width: 36px; height: 36px; font-size: .75rem; }
    .premium-gallery__arrow--prev { left: 10px; }
    .premium-gallery__arrow--next { right: 10px; }
    .detail-page__back { padding: 14px 0 20px; }
    .detail-page__card { padding: 22px 18px; border-radius: 14px; }
    .detail-page__booking-card { padding: 24px 18px; border-radius: 14px; }
    .detail-page__contact-card { padding: 24px 18px; border-radius: 14px; }
    .detail-page .villa-details__title { font-size: 1.4rem; }
    .detail-page__main { gap: 16px; }
  }
  @media (max-width: 480px) {
    .premium-gallery { border-radius: 10px; padding: 10px; }
    .premium-gallery__stage { border-radius: 10px; }
    .premium-gallery__image { border-radius: 10px; }
    .premium-gallery__thumb { width: 52px; border-radius: 8px; }
    .premium-gallery__thumbs { gap: 6px; }
    .detail-page__card { border-radius: 12px; padding: 20px 16px; }
    .detail-page__booking-card { border-radius: 12px; padding: 22px 16px; }
    .detail-page__contact-card { border-radius: 12px; padding: 22px 16px; }
  }

  .contact__form-card { margin: 0; }
  .contact__form-card-title { margin-bottom: 10px; }
  .contact__form-card-copy { color: var(--text-muted); margin-bottom: 16px; }

  .alert-success { background: #edf7ee; color: var(--success); padding: 12px 16px; border-radius: 10px; font-size: .9rem; font-weight: 600; margin-bottom: 12px; }

  @media (max-width: 960px) {
    .container { padding: 0 20px; }
    .listings-grid { grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr)); gap: 20px; }
    .form-card,
    .profile-content,
    .profile-sidebar,
    .admin-stat-card {
      padding: 28px 20px;
    }
    .modal-card__body { padding: 24px 20px; }
    .navbar { width: 100%; padding: 0 20px; }
    .navbar__link { font-size: .82rem; padding: 5px 10px; }
    .navbar__inner { gap: 16px; }
    .analytics-hero,
    .analytics-upgrade__panel,
    .analytics-locked {
      grid-template-columns: 1fr;
    }
    .analytics-hero__aside {
      align-items: flex-start;
    }
    .analytics-hero__meta {
      text-align: left;
    }
    .analytics-stat-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .analytics-grid,
    .analytics-grid--secondary {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .container { padding: 0 16px; }
    .hero { min-height: auto; }
    .hero__content { padding: 90px 16px 48px; }
    .hero__topbar { flex-direction: column; align-items: stretch; margin-bottom: 24px; }
    .hero__highlight { justify-content: center; }
    .experience-switch { width: 100%; }
    .experience-switch__option { min-width: 0; flex: 1 1 0; }
    .experience-switch__hint { display: none; }
    .hero__copy { margin-bottom: 28px; }
    .hero__label { margin-bottom: 18px; }
    .hero__sub { font-size: .98rem; margin-bottom: 28px; }
    .search-shell { width: 100%; max-width: 100%; padding: 10px; border-radius: 18px; }
    .premium-section { padding: 34px 0 18px; }
    .premium-section__head { flex-direction: column; align-items: flex-start; margin-bottom: 18px; gap: 10px; }
    .premium-section__copy { max-width: none; font-size: .84rem; line-height: 1.55; }
    .premium-section__skeleton { grid-template-columns: 1fr; }
    .premium-section__empty { min-height: 150px; border-radius: 18px; }
    .premium-marquee { mask-image: none; -webkit-mask-image: none; }
    .premium-marquee--slides { padding-bottom: 6px; scroll-padding-left: 16px; }
    .premium-marquee--slides .premium-marquee__track { gap: 14px; }
    .premium-marquee__item { flex-basis: min(78vw, 290px); }
    .contact__inner { grid-template-columns: 1fr; }
    .services, .contact, .listings { padding: 56px 0; }
    .footer__inner { grid-template-columns: 1fr; }
    .form-grid { grid-template-columns: 1fr; }
    .form-grid .form-group--full { grid-column: 1; }
    .form-card { margin: 24px auto 48px; padding: 24px 18px; border-radius: 18px; }
    .submit-btn { width: 100%; justify-content: center; }
    .page-form__header { padding: 32px 16px; }
    .page-form__header-inner { align-items: flex-start; }
    .page-form__header-actions { width: 100%; display: grid; gap: 12px; }
    .page-form__user { width: 100%; }
    .section-head { margin-bottom: 28px; }
    .section-head--stacked { align-items: flex-start; }
    .section-title { font-size: clamp(1.55rem, 8vw, 2.15rem); }
    .listings-grid { grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr)); gap: 18px; }
    .prop-card { border-radius: 20px; }
    .prop-card__row { flex-wrap: wrap; }
    .prop-card__actions { flex-wrap: wrap; }
    .image-uploader__toggle { display: flex; width: 100%; }
    .image-uploader__toggle-btn { flex: 1 1 0; }
    .image-uploader__topbar { align-items: flex-start; }
    .image-uploader__gallery { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .image-uploader__preview-card { grid-template-columns: 1fr; }
    .image-uploader__dropzone { padding: 22px 16px; }
    .image-uploader__url-actions { grid-template-columns: 1fr; }
    .feature-picker { padding: 16px; }
    .feature-picker__list { gap: 8px; }
    .feature-pill { width: 100%; justify-content: center; }
    .property-gallery__arrow { width: 40px; height: 40px; }
    .property-gallery__arrow--prev { left: 20px; }
    .property-gallery__arrow--next { right: 20px; }
    .property-gallery__hud { left: 20px; right: 20px; bottom: 20px; }
    .prop-card__actions > .btn { flex: 1 1 calc(50% - 4px); }
    .prop-card__actions .btn--outline.btn--sm,
    .prop-card__actions .btn--whatsapp.btn--sm {
      flex: 1 1 calc(50% - 4px);
      width: 100%;
      min-width: 0;
      height: 44px;
      min-height: 44px;
      border-radius: 12px;
    }
    .prop-card__actions .btn--outline.btn--sm {
      font-size: .82rem;
      padding: 0 12px;
    }
    .profile-page { padding-top: 92px; padding-bottom: 56px; }
    .profile-page__title { font-size: clamp(1.6rem, 8vw, 2rem); }
    .profile-layout { grid-template-columns: 1fr; }
    .profile-sidebar, .profile-content { padding: 22px 16px; }
    .profile-header-actions { justify-content: flex-end; }
    .profile-nav { flex-direction: row; flex-wrap: wrap; gap: 8px; }
    .profile-nav-item { flex: 1 1 calc(50% - 4px); justify-content: center; }
    .profile-listings-grid { margin-top: 16px; }
    .analytics-shell { gap: 18px; }
    .analytics-hero,
    .analytics-upgrade__panel,
    .analytics-panel,
    .analytics-breakdown-card,
    .analytics-activity-card,
    .analytics-empty,
    .analytics-error {
      border-radius: 18px;
      padding: 20px 16px;
    }
    .analytics-toolbar {
      align-items: stretch;
    }
    .analytics-toolbar__filters {
      width: 100%;
      overflow-x: auto;
      justify-content: flex-start;
    }
    .analytics-filter {
      white-space: nowrap;
    }
    .analytics-stat-grid {
      grid-template-columns: 1fr;
    }
    .analytics-table {
      overflow-x: auto;
    }
    .analytics-table__head,
    .analytics-table__row {
      min-width: 640px;
    }
    .analytics-chart__plot {
      min-height: 230px;
      gap: 6px;
      padding: 18px 10px 8px;
    }
    .analytics-locked__cta {
      width: 100%;
      justify-content: center;
    }
    .admin-stat-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 20px; }
    .admin-header { padding: 10px 16px; height: auto; min-height: 64px; }
    .admin-header__inner { flex-wrap: wrap; gap: 10px; }
    .admin-header__meta { width: 100%; justify-content: space-between; }
    .admin-body { padding: 104px 16px 40px; }
    .admin-tabs { overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; padding-bottom: 2px; scrollbar-width: none; }
    .admin-tabs::-webkit-scrollbar { display: none; }
    .admin-tab { flex: 0 0 auto; white-space: nowrap; padding: 8px 16px; font-size: .82rem; }
    .admin-toolbar { padding: 12px 16px; }
    .admin-toolbar__field,
    .admin-toolbar__select,
    .admin-toolbar .btn {
      flex: 1 1 100%;
      width: 100%;
      max-width: none !important;
    }
    .admin-toolbar__label { width: 100%; }
    .admin-table-row { padding: 12px 16px; }
    .modal-card { border-radius: 0; }
    .modal-card__img-wrap { padding: 0 14px 14px; }
    .property-gallery__stage,
    .modal-card__img-placeholder { aspect-ratio: 4 / 3; border-radius: 20px; }
    .modal-card__body { padding: 22px 18px; }
    .villa-details__overlay { padding: 0; align-items: stretch; }
    .villa-details__card--modal {
      max-height: none;
      height: 100dvh;
      border-radius: 0;
    }
    .villa-details__card--modal .property-gallery__stage,
    .villa-details__card--modal .modal-card__img-placeholder {
      height: clamp(160px, 28dvh, 260px);
    }
    .villa-details__title-row .prop-card__price-pill { font-size: .85rem; padding: 5px 12px; min-height: 34px; }
    .villa-details__title { font-size: 1.35rem; }
    .villa-details__actions { flex-direction: column; }
    .villa-details__actions > * { width: 100%; justify-content: center; }
    .property-gallery__arrow { width: 38px; height: 38px; }
    .property-gallery__arrow--prev { left: 18px; }
    .property-gallery__arrow--next { right: 18px; }
    .property-gallery__hud { left: 16px; right: 16px; bottom: 16px; gap: 8px; }
    .property-gallery__counter,
    .property-gallery__hint { font-size: .76rem; padding: 7px 10px; }
    .property-gallery__hint { display: none; }
    .property-gallery__thumbs-col { display: none; }
    .modal-card__img-wrap--desktop-gallery { display: block; }
    .modal-card__img-wrap--desktop-gallery .property-gallery__main-col { height: auto; }
    .navbar__nav { display: none; }
    .navbar__actions--desktop { display: none; }
    .navbar__mobile-controls { display: flex; }
    .navbar__mobile-left, .navbar__mobile-right { display: flex; }
    .navbar__mobile-menu { display: flex; }
    .navbar {
      width: 100%;
      top: 0;
      left: 0;
      right: 0;
      padding: 0 14px;
      height: 56px;
      border-radius: 0;
      z-index: 1400;
    }
    .navbar__inner {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 8px;
      width: 100%;
      max-width: 100%;
    }
    .brand {
      position: static;
      transform: none;
      justify-self: center;
      z-index: 2;
      min-width: 0;
    }
    .brand-mark {
      height: 55px;
      width: auto;
    }
    .navbar__mobile-left {
      position: static;
      justify-self: start;
      z-index: 3;
    }
    .navbar__mobile-right {
      position: static;
      justify-self: end;
      gap: 6px;
      z-index: 3;
    }
    .navbar__hamburger,
    .navbar__icon-btn {
      width: 40px;
      height: 40px;
      border-radius: 10px;
    }
    .lang-switch {
      min-height: 32px;
      padding: 2px;
      gap: 2px;
      border-radius: 13px;
    }
    .lang-switch__btn {
      min-width: 42px;
      height: 26px;
      padding: 0 11px;
      border-radius: 9px;
      font-size: .7rem;
    }
    .navbar__mobile-lang {
      min-height: 30px;
      padding: 2px;
      border-radius: 12px;
      margin-bottom: 8px;
    }
    .navbar__mobile-lang .lang-switch__btn {
      min-width: 44px;
      height: 26px;
      padding: 0 11px;
      border-radius: 9px;
      font-size: .7rem;
    }
    .auth-card { padding: 32px 22px; }
    .auth-social-btn {
      min-height: 52px;
      padding: 0 16px;
      font-size: .92rem;
      border-radius: 14px;
    }
  }

  @media (max-height: 760px) {
    .villa-details__card--modal {
      max-height: none;
      height: 100dvh;
    }
    .villa-details__card--modal .modal-card__img-wrap {
      padding: 0 12px 12px;
    }
    .villa-details__card--modal .property-gallery__stage,
    .villa-details__card--modal .modal-card__img-placeholder {
      height: clamp(180px, 30dvh, 280px);
      border-radius: 18px;
    }
    .villa-details__card--modal .modal-card__body {
      padding: 18px 16px;
    }
  }

  @media (max-width: 1080px) {
    .search-shell { max-width: 980px; padding: 8px; }
    .search-strip { grid-template-columns: 1.25fr .95fr .95fr .95fr auto; }
    .search-strip__cell { padding: 8px 10px; min-height: 49px; }
    .search-select, .search-text__input, .search-native-select { font-size: .82rem; }
    .search-strip__btn { min-width: 114px; min-height: 49px; padding: 0 14px; font-size: .74rem; }
  }

  @media (max-width: 820px) {
    .search-shell { padding: 8px; }
    .search-strip { grid-template-columns: 1fr; }
    .search-strip__cell {
      border-right: none;
      border-bottom: 1px solid rgba(255,255,255,.12);
      min-height: 50px;
    }
    .search-strip__btn {
      min-height: 50px;
      width: 100%;
      border-top: 1px solid rgba(255,255,255,.12);
      border-radius: 0 0 12px 12px;
    }
    .search-floating-menu {
      border-radius: 10px;
    }
    .search-strip__cell--keyword .search-floating-menu {
      left: 0;
      right: 0;
      max-height: 190px;
    }
  }

  @media (max-width: 1120px) {
    .admin-table { overflow-x: auto; }
    .admin-table-row.posts-row { min-width: 760px; }
    .admin-table-row.users-row { min-width: 1260px; }
  }
  @media (max-width: 600px) {
    .admin-table-head.premium-row {
      display: none;
    }
    .admin-table .premium-row {
      grid-template-columns: 1fr auto;
      grid-template-rows: auto auto auto auto auto auto;
      gap: 8px 12px;
      padding: 14px 14px;
    }
    .premium-row > span:nth-child(1) {
      grid-column: 1;
      grid-row: 1;
      font-size: .8rem;
    }
    .premium-row > span:nth-child(2) {
      grid-column: 1 / -1;
      grid-row: 2;
    }
    .premium-row > span:nth-child(3) {
      grid-column: 1 / -1;
      grid-row: 3;
      font-size: .78rem;
    }
    .premium-row > label:nth-child(4) {
      grid-column: 2;
      grid-row: 1;
      justify-self: end;
    }
    .premium-row > span:nth-child(5) {
      grid-column: 1;
      grid-row: 4;
    }
    .premium-row > span:nth-child(6) {
      grid-column: 2;
      grid-row: 4;
      justify-self: end;
    }
    .premium-row > span:nth-child(7) {
      grid-column: 1 / -1;
      grid-row: 5;
    }
    .premium-row > span:nth-child(8) {
      grid-column: 1 / -1;
      grid-row: 6;
      justify-self: end;
    }
    .premium-row__actions .btn {
      min-width: 90px;
      min-height: 40px;
      padding: 8px 12px;
    }
    .premium-row__hidden { display: none; }
    .premium-row__select { max-width: none; }
    .admin-table { overflow-x: visible; overflow: visible; }
    .admin-table-row.posts-row { min-width: 0; }
    .admin-table-row.users-row { min-width: 0; }
    .admin-stat-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 20px; }
    .admin-stat-card { padding: 16px 14px; }
    .admin-stat-card__val { font-size: 1.6rem; }
    .admin-stat-card__label { font-size: .7rem; margin-bottom: 4px; }
    .admin-toolbar__filters { width: 100%; }
    .admin-toolbar__filters .auth-input { flex: 1 1 100%; max-width: none !important; }

    /* â”€â”€â”€ USERS CARD LAYOUT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    .admin-table-head.users-row { display: none; }
    .admin-table .users-row {
      grid-template-columns: 1fr auto auto;
      grid-template-rows: auto auto auto auto;
      gap: 5px 8px;
      padding: 14px 14px 12px;
      align-items: center;
    }
    /* Name â€” row 1 col 1 only */
    .users-row > span:nth-child(1) {
      grid-column: 1; grid-row: 1;
      font-size: .9rem !important; font-weight: 700;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;
    }
    /* Email â€” row 2 col 1 only */
    .users-row > span:nth-child(2) {
      grid-column: 1; grid-row: 2;
      font-size: .78rem !important; color: var(--text-muted);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;
    }
    /* Role badge â€” row 1 col 2, rradhitur me emrin */
    .users-row > span:nth-child(3) {
      grid-column: 2; grid-row: 1;
      justify-self: end; align-self: center;
    }
    /* Shpallje â€” row 4 col 1, si gold pill */
    .users-row > span:nth-child(4) {
      grid-column: 1; grid-row: 4;
      display: inline-flex; align-items: center;
      width: fit-content;
      font-size: .72rem !important; font-weight: 600;
      color: var(--gold);
      background: rgba(247,176,91,.1);
      border: 1px solid rgba(247,176,91,.28);
      border-radius: 20px;
      padding: 3px 10px;
    }
    .users-row > span:nth-child(4)::before { content: "Nr. "; }
    .users-row > span:nth-child(4)::after  { content: " shpallje"; font-weight: 400; color: var(--text-muted); }
    /* Phone â€” row 3 col 1 */
    .users-row > span:nth-child(5) {
      grid-column: 1; grid-row: 3;
      font-size: .78rem !important; color: var(--text-muted);
    }
    .users-row > span:nth-child(5)::before { content: "Tel: "; }
    /* Verifikim - hide */
    .users-row > span:nth-child(6) { display: none; }
    /* Date - hide */
    .users-row > span:nth-child(7) { display: none; }
    /* Actions â€” col 3, shtrihet ne te gjitha rreshtat */
    .users-row .admin-table__action-group {
      grid-column: 3; grid-row: 1 / -1;
      align-self: center; justify-self: end;
    }
  }

  @media (max-width: 480px) {
    .navbar {
      width: 100%;
      top: 0;
      left: 0;
      right: 0;
      padding: 0 10px;
      height: 50px;
      border-radius: 0;
    }
    .brand-mark { height: 45px; width: auto; }
    .navbar__hamburger,
    .navbar__icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 9px;
      font-size: .88rem;
    }
    .lang-switch {
      min-height: 30px;
      padding: 2px;
    }
    .lang-switch__btn {
      min-width: 38px;
      height: 24px;
      padding: 0 10px;
      border-radius: 8px;
      font-size: .68rem;
    }
    .navbar__mobile-lang {
      min-height: 28px;
      border-radius: 11px;
      margin-bottom: 7px;
    }
    .navbar__mobile-lang .lang-switch__btn {
      min-width: 40px;
      height: 24px;
      padding: 0 10px;
      border-radius: 8px;
      font-size: .68rem;
    }
    .navbar__hamburger span { width: 16px; }
    .navbar__mobile-right { gap: 5px; }
    .hero__title { font-size: clamp(2.2rem, 12vw, 3rem); }
    .hero__sub { font-size: .92rem; }
    .section-tag { font-size: .68rem; padding: 4px 12px; }
    .premium-section { padding: 28px 0 14px; }
    .premium-section__head { margin-bottom: 16px; gap: 8px; }
    .premium-section__copy { font-size: .8rem; line-height: 1.5; }
    .premium-marquee__track { gap: 12px; }
    .premium-card { padding: 10px; border-radius: 18px; }
    .premium-card__frame { gap: 10px; }
    .premium-card__media { border-radius: 14px; }
    .premium-card__eyebrow { top: 10px; left: 10px; padding: 5px 10px; font-size: .62rem; }
    .premium-card__content { gap: 6px; padding: 0 2px 4px; }
    .premium-card__topline { grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 8px; }
    .premium-card__title {
      font-size: .84rem;
      display: block;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .premium-card--villas .premium-card__title { font-size: .95rem; }
    .premium-card__location { font-size: .74rem; }
    .premium-card__price { font-size: .74rem; padding: 6px 10px; }
    .premium-section__actions { margin-top: 16px; }
    .premium-action-btn { max-width: 100%; }
    .premium-action-btn__inner { min-height: 44px; padding: 10px 24px; }
    .premium-action-btn__label { font-size: .8rem; }
    .premium-action-btn__sparkle--left { left: 10px; }
    .premium-action-btn__sparkle--right { right: 10px; }
    .premium-marquee--slides { scroll-padding-left: 16px; }
    .premium-marquee__item { flex-basis: min(82vw, 248px); }
    .prop-card__img,
    .prop-card__img-placeholder { aspect-ratio: 1/1 !important; height: auto; }
    .prop-card__meta { grid-template-columns: repeat(3, 1fr); gap: 6px; padding-top: 10px; margin-top: 10px; }
    .prop-card__meta span { padding: 7px 2px; font-size: .75rem; border-radius: 10px; gap: 3px; white-space: nowrap; overflow: visible; min-width: 0; }
    .profile-nav-item { flex-basis: 100%; justify-content: flex-start; }
  }

  @media (hover: none) and (pointer: coarse) {
    .premium-card:hover {
      transform: none;
      border-color: rgba(255,255,255,.18);
      box-shadow:
        0 22px 44px rgba(5,12,24,.28),
        inset 0 1px 0 rgba(255,255,255,.22);
    }
    .premium-card:hover .premium-card__image {
      transform: scale(1.01);
      filter: saturate(1.08) contrast(1.02);
    }
    .navbar__mobile-link:hover,
    .navbar__icon-btn:hover,
    .navbar__hamburger:hover,
    .search-native-wrap:hover,
    .search-strip__btn:hover {
      background: initial;
      border-color: inherit;
      transform: none;
      box-shadow: none;
      filter: none;
    }
  }

  /* â”€â”€â”€ STATUS BADGES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  .status-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: .72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .03em;
    white-space: nowrap;
  }
  .status-badge--pending {
    background: #fff3e0;
    color: #e65100;
    border: 1px solid #ffcc80;
  }
  .status-badge--active {
    background: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #a5d6a7;
  }
  .status-badge--rejected {
    background: #fbe9e7;
    color: #c62828;
    border: 1px solid #ef9a9a;
  }

  /* â”€â”€â”€ BTN SUCCESS (for approve) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  .btn--success {
    background: var(--success);
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: var(--transition);
  }
  .btn--success:hover { background: #219a52; }
  .btn--success:disabled { opacity: .5; cursor: not-allowed; }

  /* â”€â”€â”€ MODERATION TABLE ROW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  .moderation-row {
    grid-template-columns: 70px 1.5fr 1fr .7fr 1fr .8fr 1fr;
    gap: 8px;
    align-items: center;
  }
  .moderation-id {
    font-family: var(--font-display-alt);
    font-weight: 700;
    font-size: .82rem;
    color: var(--gold);
  }

  /* â”€â”€â”€ ADMIN TOOLBAR FILTERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  .admin-toolbar__filters {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  /* â”€â”€â”€ REORDER ROW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  .drag-row {
    grid-template-columns: 36px 80px 1.5fr .7fr auto;
    gap: 10px;
    align-items: center;
    transition: background .15s;
  }
  .drag-order {
    font-weight: 700;
    font-size: .82rem;
    color: var(--gold);
    text-align: center;
  }
  .drag-id {
    font-family: var(--font-display-alt);
    font-weight: 700;
    font-size: .82rem;
    color: var(--gold);
    cursor: pointer;
  }
  .drag-id:hover { text-decoration: underline; }
  .drag-id-edit {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .drag-id-input {
    width: 64px;
    padding: 3px 6px;
    border: 1px solid var(--gold);
    border-radius: 6px;
    font-family: var(--font-display-alt);
    font-size: .82rem;
    font-weight: 700;
    color: var(--gold);
    background: var(--white);
    outline: none;
  }
  .drag-id-input:focus { box-shadow: 0 0 0 2px rgba(247,176,91,.25); }
  .drag-id-btn {
    padding: 3px 6px !important;
    min-width: unset !important;
    font-size: .75rem !important;
    line-height: 1 !important;
  }
  .drag-edit-btn {
    padding: 4px !important;
    min-width: unset !important;
    font-size: .78rem !important;
    color: var(--text-muted) !important;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .drag-edit-btn:hover { color: var(--gold) !important; }
  .drag-title { font-weight: 500; font-size: .88rem; }
  .drag-author { font-size: .82rem; color: var(--text-muted); }
  .drag-actions { display: flex; align-items: center; justify-content: flex-end; }
  .drag-price { font-weight: 600; font-size: .88rem; color: var(--gold); }

  /* â”€â”€â”€ ADMIN VIEW POST DETAIL MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  .admin-view-overlay { z-index: 300; align-items: center; justify-content: center; }
  .admin-view-card {
    width: 90vw;
    max-width: 720px;
    max-height: 90vh;
    overflow-y: auto;
    border-radius: 18px;
    display: flex;
    flex-direction: column;
  }
  .admin-view-card .modal-card__img-wrap {
    flex-shrink: 0;
    max-height: 28vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 0;
  }
  .admin-view-card .property-gallery__stage {
    aspect-ratio: unset;
    max-height: 28vh;
    width: 100%;
    padding: 8px;
  }
  .admin-view-card .modal-card__img {
    width: 100%;
    height: 100%;
    max-height: 26vh;
    object-fit: contain;
  }
  .admin-view-card .modal-card__body {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }
  .admin-view__badge-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }
  .admin-view__section {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }
  .admin-view__section-label {
    font-size: .75rem;
    text-transform: uppercase;
    letter-spacing: .06em;
    font-weight: 700;
    color: var(--text-muted);
    margin-bottom: 8px;
  }
  .admin-premium-chip {
    width: fit-content;
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(34,197,94,.12);
    color: #22c55e;
    font-size: .76rem;
    font-weight: 700;
  }
  .admin-premium-panel {
    padding: 16px;
    border: 1px solid var(--border);
    border-radius: 16px;
    background: linear-gradient(180deg, #fff 0%, #fbf8f2 100%);
  }
  .admin-premium-toggle {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: .92rem;
    font-weight: 700;
    color: var(--text);
    cursor: pointer;
  }
  .admin-premium-panel__controls {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 14px;
    align-items: end;
    margin-top: 14px;
  }
  .admin-premium-note {
    margin-top: 10px;
    color: var(--text-muted);
    font-size: .8rem;
    line-height: 1.5;
  }
  .paid-plan-status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    min-height: 28px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: .74rem;
    font-weight: 800;
    letter-spacing: .03em;
    white-space: nowrap;
  }
  .paid-plan-status-badge--pending {
    background: rgba(217,119,6,.14);
    color: #b45309;
  }
  .paid-plan-status-badge--approved {
    background: rgba(34,197,94,.12);
    color: #15803d;
  }
  .paid-plan-status-badge--rejected {
    background: rgba(239,68,68,.12);
    color: #dc2626;
  }
  .paid-plan-status-badge--expired {
    background: rgba(100,116,139,.14);
    color: #475569;
  }
  .paid-plan-status-panel {
    margin-bottom: 22px;
    padding: 24px;
    border: 1px solid rgba(15,27,45,.08);
    border-radius: 24px;
    background: linear-gradient(180deg, rgba(255,255,255,.98) 0%, rgba(251,248,242,.98) 100%);
    box-shadow: 0 18px 36px rgba(15,27,45,.08);
  }
  .paid-plan-status-panel__head {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 18px;
    flex-wrap: wrap;
  }
  .paid-plan-status-panel__head h3 {
    margin: 0 0 8px;
    color: var(--navy);
    font-size: 1.2rem;
  }
  .paid-plan-status-panel__head p {
    margin: 0;
    color: var(--text-muted);
    line-height: 1.65;
  }
  .paid-plan-status-panel__summary {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .paid-plan-status-panel__summary span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 999px;
    background: rgba(15,27,45,.04);
    color: var(--text-muted);
    font-size: .82rem;
    font-weight: 700;
  }
  .paid-plan-status-panel__summary strong {
    color: var(--navy);
    font-size: .95rem;
  }
  .paid-plan-status-panel__banner {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
    padding: 12px 16px;
    border-radius: 18px;
    font-size: .88rem;
    font-weight: 700;
  }
  .paid-plan-status-panel__banner--pending {
    background: rgba(217,119,6,.1);
    color: #b45309;
  }
  .paid-plan-status-panel__grid {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(280px, .9fr);
    gap: 16px;
  }
  .paid-plan-status-panel__requests,
  .paid-plan-status-panel__notifications {
    display: grid;
    gap: 12px;
  }
  .paid-plan-request-card,
  .paid-plan-notification {
    position: relative;
    padding: 16px 56px 16px 18px;
    border-radius: 18px;
    border: 1px solid rgba(15,27,45,.08);
    background: #fff;
    box-shadow: 0 12px 24px rgba(15,27,45,.05);
  }
  .paid-plan-notification__dismiss {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: 1px solid rgba(15,27,45,.08);
    border-radius: 14px;
    background: rgba(15,27,45,.08);
    color: var(--navy);
    cursor: pointer;
    transition: var(--transition);
    font-size: 1rem;
  }
  .paid-plan-notification__dismiss:hover {
    background: rgba(231,76,60,.14);
    color: var(--error);
  }
  .paid-plan-notification__dismiss:focus-visible {
    outline: 3px solid rgba(247,176,91,.24);
    outline-offset: 2px;
  }
  .paid-plan-request-card__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }
  .paid-plan-request-card__head strong,
  .paid-plan-notification strong {
    color: var(--navy);
    display: block;
  }
  .paid-plan-request-card__head span,
  .paid-plan-request-card__meta span,
  .paid-plan-notification p,
  .paid-plan-notification span {
    color: var(--text-muted);
    font-size: .82rem;
    line-height: 1.55;
  }
  .paid-plan-request-card__meta {
    display: grid;
    gap: 4px;
  }
  .paid-plan-request-card__note {
    margin: 10px 0 0;
    padding-top: 10px;
    border-top: 1px solid rgba(15,27,45,.06);
    color: var(--navy);
    font-size: .84rem;
    line-height: 1.6;
  }
  .paid-plan-status-panel__subhead {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--navy);
    margin-bottom: 4px;
  }
  .paid-plan-status-panel__subhead svg {
    color: var(--gold);
    font-size: 1.2rem;
  }
  .paid-plan-status-panel__banner svg {
    font-size: 1.1rem;
  }
  .paid-plan-notification {
    width: 100%;
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr);
    gap: 12px;
    text-align: left;
    cursor: pointer;
  }
  .paid-plan-notification > svg {
    color: var(--gold);
    font-size: 1.15rem;
    margin-top: 2px;
  }
  .paid-plan-notification.is-unread > svg {
    color: var(--warning);
  }
  .paid-plan-notification.is-unread {
    border-color: rgba(247,176,91,.28);
    background: linear-gradient(180deg, rgba(255,249,240,.98) 0%, #fff 100%);
  }
  .paid-plan-status-panel__empty {
    padding: 18px 0 4px;
    color: var(--text-muted);
  }
  .paid-plan-status-panel__empty svg {
    color: var(--gold);
    font-size: 1.1rem;
    vertical-align: -2px;
    margin-right: 6px;
  }
  .paid-plan-status-panel__empty--error {
    color: var(--error);
  }
  .paid-plan-status-panel__empty--error svg {
    color: var(--error);
  }
  .paid-plans-admin {
    display: grid;
    gap: 18px;
  }
  .paid-plans-admin__stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }
  .paid-plans-admin__boards {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .paid-plans-row {
    grid-template-columns: 110px minmax(0, 1.2fr) minmax(0, 1.2fr) 140px 120px 120px 150px;
    gap: 12px;
  }
  .paid-plans-row__user,
  .paid-plans-row__target {
    display: grid;
    gap: 4px;
    min-width: 0;
  }
  .paid-plans-row__user strong,
  .paid-plans-row__target strong {
    color: var(--navy);
    font-size: .88rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .paid-plans-row__user small,
  .paid-plans-row__target small {
    color: var(--text-muted);
    font-size: .8rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .paid-plans-row__actions {
    display: flex;
    justify-content: flex-end;
  }
  .paid-plan-admin-modal {
    position: fixed;
    inset: 0;
    z-index: 120;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  .paid-plan-admin-modal__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(15,27,45,.5);
    backdrop-filter: blur(6px);
  }
  .paid-plan-admin-modal__card {
    position: relative;
    z-index: 1;
    width: min(1120px, 100%);
    max-height: calc(100vh - 48px);
    overflow: auto;
    padding: 26px;
    border-radius: 28px;
    background: #fff;
    box-shadow: 0 28px 80px rgba(15,27,45,.24);
  }
  .paid-plan-admin-modal__head,
  .paid-plan-admin-modal__subhead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .paid-plan-admin-modal__head h3 {
    margin: 0 0 8px;
    color: var(--navy);
    font-size: 1.35rem;
  }
  .paid-plan-admin-modal__grid {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(280px, .9fr);
    gap: 18px;
    margin: 20px 0;
  }
  .paid-plan-admin-modal__meta,
  .paid-plan-admin-modal__proof,
  .paid-plan-admin-modal__controls {
    display: grid;
    gap: 10px;
    padding: 18px;
    border-radius: 20px;
    border: 1px solid rgba(15,27,45,.08);
    background: linear-gradient(180deg, rgba(255,255,255,.98) 0%, rgba(251,248,242,.98) 100%);
  }
  .paid-plan-admin-modal__meta strong {
    color: var(--navy);
  }
  .paid-plan-admin-modal__proof-image {
    width: 100%;
    max-height: 320px;
    object-fit: contain;
    border-radius: 16px;
    background: rgba(15,27,45,.03);
  }
  .paid-plan-admin-modal__proof-file {
    display: grid;
    gap: 4px;
    padding: 16px;
    border-radius: 16px;
    background: rgba(15,27,45,.04);
  }
  .paid-plan-admin-modal__controls {
    margin-top: 18px;
  }
  .paid-plan-admin-modal__inline {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
  .paid-plan-admin-modal__actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .paid-plan-admin-modal__actions .btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 10px 16px;
    border-radius: 12px;
    font-size: .85rem;
    font-weight: 700;
  }
  .paid-plan-admin-modal__actions .btn svg {
    font-size: 1rem;
  }
  .paid-plan-admin-modal__actions .btn--success svg { color: #fff; }
  .paid-plan-admin-modal__actions .btn--danger svg { color: #fff; }
  .paid-plan-admin-modal__actions .btn--primary svg { color: var(--navy); }
  .paid-plan-admin-modal__actions .btn--ghost {
    background: rgba(15,27,45,.05);
    color: var(--navy);
    border: 1.5px solid rgba(15,27,45,.12);
  }
  .paid-plan-admin-modal__actions .btn--ghost:hover {
    background: rgba(15,27,45,.1);
    border-color: rgba(15,27,45,.2);
    color: var(--navy);
  }
  .paid-plan-admin-modal__actions .btn--ghost svg { color: var(--navy); }
  .paid-plan-admin-modal__subhead svg {
    color: var(--gold);
    font-size: 1.1rem;
  }
  .paid-plan-admin-modal__error {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 16px;
    background: rgba(239,68,68,.1);
    color: #dc2626;
    font-size: .86rem;
  }
  .paid-plan-admin-modal__audit {
    display: grid;
    gap: 10px;
    margin-top: 6px;
  }
  .paid-plan-admin-modal__audit-item {
    padding: 14px 16px;
    border-radius: 16px;
    background: rgba(15,27,45,.04);
  }
  .paid-plan-admin-modal__audit-item strong {
    color: var(--navy);
    display: block;
    margin-bottom: 4px;
  }
  .paid-plan-admin-modal__audit-item span,
  .paid-plan-admin-modal__audit-item small,
  .paid-plan-admin-modal__audit-item p {
    color: var(--text-muted);
    font-size: .82rem;
    line-height: 1.55;
  }
  .admin-view__info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 16px;
  }
  .admin-view__info-item {
    font-size: .85rem;
    color: var(--navy);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .admin-view__info-item svg { color: var(--text-muted); font-size: .82rem; }
  .admin-view__info-item strong { color: var(--text-muted); font-weight: 600; }
  .admin-view__actions {
    display: flex;
    gap: 10px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
    flex-wrap: wrap;
  }

  @media (max-width: 600px) {
    .admin-view__info-grid { grid-template-columns: 1fr; }
    .admin-premium-panel__controls { grid-template-columns: 1fr; }
    .admin-view-card { width: 100vw; max-width: none; max-height: none; height: 100dvh; border-radius: 0; }
    .admin-view-card .modal-card__img-wrap { max-height: 25vh; }
    .admin-view-card .property-gallery__stage { max-height: 25vh; }
    .admin-view-card .modal-card__img { max-height: 23vh; }
  }

  /* â”€â”€â”€ MY POSTS LIST (Profile) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  .my-posts-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .my-post-card-wrap {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .my-post-card {
    display: flex;
    flex-direction: column;
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    transition: all .2s ease;
    box-shadow: 0 10px 26px rgba(15,27,45,.10);
    position: relative;
  }
  .my-post-card::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 0;
    background: #f47f52;
    transition: width .2s ease;
  }
  .my-post-card:hover {
    box-shadow: 0 20px 40px rgba(15,27,45,.16);
    transform: scale(1.01);
  }
  .my-post-card:hover::before { width: 4px; }
  .my-post-card__main {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 184px;
    align-items: stretch;
  }
  .my-post-card__top {
    display: grid;
    grid-template-columns: clamp(184px, 23vw, 216px) minmax(0, 1fr);
    align-items: center;
    grid-column: 1;
    column-gap: 20px;
    min-width: 0;
    padding: 16px;
  }
  .my-post-card__image {
    width: 100%;
    height: 176px;
    min-height: 176px;
    overflow: hidden;
    flex-shrink: 0;
    background: #E6F1FB;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #7f9dbb;
    padding: 0;
    border-radius: 12px;
    margin: 0;
  }
  .my-post-card__image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }
  .my-post-card__info {
    flex: 1;
    min-width: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 12px;
  }
  .my-post-card__title-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    flex-wrap: wrap;
  }
  .my-post-card__info h3 {
    font-size: 17px;
    line-height: 1.3;
    font-weight: 500;
    margin: 0;
    min-width: 0;
  }
  .my-post-card__location {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--text-muted);
    margin: 0;
  }
  .my-post-card__location svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
  .my-post-card__price {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin: 0;
  }
  .my-post-card__price-value {
    font-size: 1.875rem;
    line-height: 1;
    font-weight: 700;
    color: #111827;
  }
  .my-post-card__price-suffix {
    font-size: 13px;
    color: var(--text-muted);
  }
  .my-post-card__premium {
    display: flex;
    align-items: center;
    min-height: 24px;
    margin-top: -4px;
  }
  .my-post-card__meta-row {
    display: none;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  .my-post-card__meta-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 28px;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(15,27,45,.05);
    border: 1px solid rgba(15,27,45,.08);
    font-size: 11px;
    font-weight: 700;
    color: var(--navy-light, #223046);
    letter-spacing: .02em;
  }
  .my-post-card__meta-chip--id {
    font-family: var(--font-display-alt), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }
  .my-post-card__meta-separator {
    color: rgba(15,27,45,.35);
    line-height: 1;
  }
  .my-post-card__side {
    grid-column: 2;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    gap: 12px;
    padding: 16px;
    background: var(--color-background-secondary, #FAF8F3);
    border-left: 1px solid rgba(15,27,45,.06);
  }
  .my-post-card__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 16px;
    border-top: 1px solid rgba(15,27,45,.06);
    background: rgba(247,248,250,.72);
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
  }
  .my-post-card__footer-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    min-width: 0;
  }
  .my-post-card__bar-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    margin-left: auto;
    min-width: 0;
  }
  .my-post-card__id {
    font-family: var(--font-display-alt), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-weight: 500;
    font-size: 12px;
    color: var(--text-muted);
    letter-spacing: .02em;
  }
  .my-post-card__premium-btn {
    min-height: 42px;
    padding: 10px 16px;
    border: 1px solid rgba(15,27,45,.12);
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(247,176,91,.98), rgba(250,203,138,.98));
    color: var(--navy, #0f1b2d);
    font-family: var(--font-body);
    font-size: .82rem;
    font-weight: 700;
    line-height: 1.1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    white-space: nowrap;
    cursor: pointer;
    box-shadow: 0 8px 18px rgba(247,176,91,.24);
    transition: background-color .2s ease, border-color .2s ease, color .2s ease, transform .2s ease, box-shadow .2s ease;
  }
  .my-post-card__premium-btn svg,
  .my-post-card__premium-btn .ui-icon {
    width: 14px !important;
    height: 14px !important;
    flex-shrink: 0;
    color: currentColor;
  }
  .my-post-card__premium-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(247,176,91,.32);
  }
  .my-post-card__premium-btn:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255,255,255,.94), 0 0 0 5px rgba(247,176,91,.38);
  }
  .my-post-card__premium-btn.is-manage {
    background: #fff;
    color: var(--navy, #0f1b2d);
    border-color: rgba(15,27,45,.14);
    box-shadow: 0 1px 2px rgba(15,27,45,.05);
  }
  .my-post-card__premium-btn.is-manage:hover {
    background: rgba(15,27,45,.04);
    box-shadow: 0 8px 18px rgba(15,27,45,.08);
  }
  .my-post-card__actions {
    --post-action-neutral-bg: rgba(15,27,45,.04);
    --post-action-neutral-border: rgba(15,27,45,.12);
    --post-action-neutral-text: var(--navy-light, #223046);
    --post-action-neutral-hover-bg: rgba(15,27,45,.08);
    --post-action-neutral-hover-border: rgba(15,27,45,.18);
    --post-action-warning-bg: rgba(217,119,6,.10);
    --post-action-warning-border: rgba(217,119,6,.24);
    --post-action-warning-text: #b45309;
    --post-action-warning-hover-bg: rgba(217,119,6,.17);
    --post-action-warning-hover-border: rgba(217,119,6,.4);
    --post-action-danger-bg: rgba(231,76,60,.10);
    --post-action-danger-border: rgba(231,76,60,.24);
    --post-action-danger-text: #c0392b;
    --post-action-danger-hover-bg: rgba(231,76,60,.17);
    --post-action-danger-hover-border: rgba(231,76,60,.4);
    display: flex;
    flex-shrink: 0;
  }
  .my-post-card__actions > :is(button, a) {
    width: 100%;
    min-height: 42px;
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid transparent;
    background: #fff;
    color: var(--text);
    text-decoration: none;
    font-family: var(--font-body);
    font-size: .82rem;
    font-weight: 600;
    line-height: 1.1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    white-space: nowrap;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(15,27,45,.05);
    transition: background-color .2s ease, border-color .2s ease, color .2s ease, transform .2s ease, box-shadow .2s ease;
  }
  .my-post-card__actions > :is(button, a) svg,
  .my-post-card__actions > :is(button, a) .ui-icon {
    width: 14px !important;
    height: 14px !important;
    flex-shrink: 0;
    color: currentColor;
  }
  .my-post-card__actions > :is(button, a):hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(15,27,45,.08);
  }
  .my-post-card__actions > :is(button, a):focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255,255,255,.94), 0 0 0 5px rgba(15,27,45,.14);
  }
  .my-post-card__actions > :is(button, a):disabled,
  .my-post-card__actions > :is(button, a)[aria-disabled="true"] {
    opacity: .58;
    cursor: not-allowed;
    pointer-events: none;
    transform: none;
    box-shadow: none;
  }
  .my-post-card__actions--side {
    flex-direction: column;
    gap: 12px;
  }
  .my-post-card__actions--footer {
    display: none;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
  }
  .btn--small {
    padding: 9px 12px;
    font-size: .78rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: var(--transition);
  }
  .btn--outline {
    background: transparent;
    border: 1.5px solid #e74c3c;
    color: #e74c3c;
  }
  .btn--outline:hover {
    background: #e74c3c;
    color: var(--white);
  }
  .my-post-card__actions > :is(button, a):first-child {
    background: var(--post-action-neutral-bg);
    border-color: var(--post-action-neutral-border);
    color: var(--post-action-neutral-text);
  }
  .my-post-card__actions > :is(button, a):first-child:hover {
    background: var(--post-action-neutral-hover-bg);
    border-color: var(--post-action-neutral-hover-border);
    color: var(--navy, #0f1b2d);
  }
  .my-post-card__actions > :is(button, a):first-child:focus-visible {
    box-shadow: 0 0 0 2px rgba(255,255,255,.94), 0 0 0 5px rgba(15,27,45,.16);
  }
  .my-post-card__actions > :is(button, a):nth-child(2) {
    background: var(--post-action-warning-bg);
    border-color: var(--post-action-warning-border);
    color: var(--post-action-warning-text);
  }
  .my-post-card__actions > :is(button, a):nth-child(2):hover {
    background: var(--post-action-warning-hover-bg);
    border-color: var(--post-action-warning-hover-border);
    color: #9a4b07;
  }
  .my-post-card__actions > :is(button, a):nth-child(2):focus-visible {
    box-shadow: 0 0 0 2px rgba(255,255,255,.94), 0 0 0 5px rgba(217,119,6,.24);
  }
  .my-post-card__actions > :is(button, a).btn--danger {
    background: var(--post-action-danger-bg);
    border: 1px solid var(--post-action-danger-border);
    color: var(--post-action-danger-text);
  }
  .my-post-card__actions > :is(button, a).btn--danger:hover {
    background: var(--post-action-danger-hover-bg);
    color: #a92c2c;
    border-color: var(--post-action-danger-hover-border);
  }
  .my-post-card__actions > :is(button, a).btn--danger:focus-visible {
    box-shadow: 0 0 0 2px rgba(255,255,255,.94), 0 0 0 5px rgba(231,76,60,.24);
  }
  .my-post-card__status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: .04em;
  }
  .my-post-card__status.status-badge--active {
    background: #d1fae5;
    color: #047857;
    border: 1px solid transparent;
  }
  .my-post-card__status.status-badge--active::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #22c55e;
    box-shadow: 0 0 0 0 rgba(34,197,94,.35);
    animation: my-post-pulse 1.6s ease-in-out infinite;
  }
  .my-post-card__live {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    color: var(--text-muted);
  }
  .my-post-card__live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #2fa44f;
    box-shadow: 0 0 0 3px rgba(47,164,79,.12);
    animation: my-post-pulse 1.6s ease-in-out infinite;
  }
  .my-post-card__status--mobile-chip {
    font-size: 11px;
    padding: 6px 10px;
    letter-spacing: .02em;
  }
  .my-post-card__updated {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 4px;
    font-size: 12px;
    color: #6b7280;
  }
  .my-post-card__updated svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
  @keyframes my-post-pulse {
    0% { box-shadow: 0 0 0 0 rgba(34,197,94,.35); }
    70% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
    100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
  }

  @media (max-width: 768px) {
    .my-posts-header {
      align-items: stretch;
      flex-direction: column;
    }
    .my-posts-header__cta {
      width: 100%;
      justify-content: center;
    }
    .my-post-card__main {
      grid-template-columns: 1fr;
    }
    .my-post-card__top {
      grid-template-columns: minmax(136px, 160px) minmax(0, 1fr);
      grid-column: 1;
      column-gap: 14px;
      align-items: start;
      padding: 16px;
    }
    .my-post-card__image {
      width: 100%;
      height: 148px;
      min-height: 148px;
    }
    .my-post-card__info {
      padding: 0;
      justify-content: flex-start;
    }
    .my-post-card__price-value {
      font-size: 1.55rem;
    }
    .my-post-card__side {
      grid-column: 1;
      border-left: none;
      border-top: 1px solid rgba(15,27,45,.06);
      padding: 14px 16px 16px;
    }
  }

  @media (max-width: 600px) {
    /* â”€â”€â”€ MODERATION CARD LAYOUT (3-column zones) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    .admin-table-head.moderation-row {
      display: none;
    }
    .admin-table .moderation-row {
      grid-template-columns: 1fr 1fr auto;
      grid-template-rows: auto auto auto;
      gap: 6px 10px;
      padding: 14px 14px;
      position: relative;
    }
    /* Column 1 row 1: ID */
    .moderation-row .moderation-id {
      grid-column: 1;
      grid-row: 1;
      font-size: .8rem;
    }
    /* Column 1 row 2: Title */
    .moderation-row > span:nth-child(2) {
      grid-column: 1;
      grid-row: 2;
      font-size: .84rem !important;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }
    /* Column 1 row 3: Location */
    .moderation-row > span:nth-child(3) {
      grid-column: 1;
      grid-row: 3;
      font-size: .78rem !important;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }
    /* Column 2 row 1: Price */
    .moderation-row > span:nth-child(4) {
      grid-column: 2;
      grid-row: 1;
      font-size: .82rem !important;
      text-align: right;
    }
    /* Column 2 row 2: Author */
    .moderation-row > span:nth-child(5) {
      grid-column: 2;
      grid-row: 2;
      font-size: .78rem !important;
      text-align: right;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }
    /* Column 2 row 3: Status badge */
    .moderation-row > span:nth-child(6) {
      grid-column: 2;
      grid-row: 3;
      text-align: right;
    }
    .moderation-row > span:nth-child(6) .status-badge {
      font-size: .68rem;
      padding: 2px 8px;
    }
    /* Column 3: Action button (vertically centered, spans all rows) */
    .moderation-row .admin-table__action-group {
      grid-column: 3;
      grid-row: 1 / -1;
      align-self: center;
      justify-self: end;
    }
    .moderation-row .admin-table__action-group .btn {
      min-width: 40px;
      min-height: 40px;
      padding: 8px !important;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* â”€â”€â”€ DRAG / REORDER ROW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    .drag-row {
      grid-template-columns: 28px 55px 1fr auto;
    }
    .drag-author { display: none; }
    .drag-price { display: none; }
    .my-post-card__main {
      grid-template-columns: 1fr;
    }
    .my-post-card__top {
      grid-template-columns: 50% minmax(0, 1fr);
      grid-column: 1;
      column-gap: 10px;
      align-items: start;
      padding: 14px;
    }
    .my-post-card__image {
      width: 100%;
      height: auto;
      aspect-ratio: 1 / 1;
      min-height: unset;
      border-radius: 10px;
      margin: 0;
    }
    .my-post-card__info {
      padding: 0;
      gap: 9px;
      justify-content: flex-start;
    }
    .my-post-card__title-row {
      order: 1;
      gap: 6px;
    }
    .my-post-card__premium {
      order: 2;
      margin-top: 0;
    }
    .my-post-card__location {
      order: 3;
      font-size: 10px;
      gap: 5px;
    }
    .my-post-card__price {
      order: 4;
      gap: 6px;
    }
    .my-post-card__info h3 {
      font-size: 13.5px;
      line-height: 1.25;
    }
    .my-post-card__title-row .my-post-card__status {
      display: none;
    }
    .my-post-card__status {
      font-size: 9px;
      padding: 3px 7px;
    }
    .my-post-card__price-value {
      font-size: 1.125rem;
    }
    .my-post-card__price-suffix {
      font-size: 10px;
    }
    .my-post-card__bar {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      padding: 16px;
      background: transparent;
    }
    .my-post-card__meta-row--mobile {
      display: flex;
    }
    .my-post-card__meta-chip--id {
      min-height: auto;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: var(--text-muted);
    }
    .my-post-card__side {
      display: none;
    }
    .my-post-card__footer-meta--desktop {
      display: none;
    }
    .my-post-card__bar-right {
      width: 100%;
      flex-direction: column;
      align-items: stretch;
      margin-left: 0;
    }
    .my-post-card__premium-btn {
      align-self: flex-end;
    }
    .my-post-card__actions--footer {
      display: grid;
      width: 100%;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: stretch;
    }
    .my-post-card__actions--footer > :is(button, a):nth-child(3) {
      grid-column: 1 / -1;
    }
    .my-post-card__updated {
      font-size: 11px;
    }
    .my-post-card:hover {
      transform: none;
    }
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     MAP â€” PropertyMap (detail page)
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  .property-map {
    margin-top: 32px;
    background: #fff;
    border-radius: 22px;
    border: 1px solid rgba(26,43,76,.1);
    box-shadow: 0 8px 40px rgba(26,43,76,.1);
    overflow: hidden;
  }
  .property-map__header {
    padding: 20px 24px 0;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }
  .property-map__title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-display);
    font-size: 1.15rem;
    color: var(--navy);
    font-weight: 700;
    margin-bottom: 4px;
  }
  .property-map__title-icon { font-size: 1rem; }
  .property-map__address {
    font-size: .83rem;
    color: var(--text-muted);
    margin-top: 2px;
    padding-left: 2px;
  }
  .property-map__approx-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: .72rem;
    font-weight: 600;
    color: #7a6a3a;
    background: rgba(247,176,91,.1);
    border: 1px solid rgba(247,176,91,.28);
    border-radius: 20px;
    padding: 4px 10px;
    white-space: nowrap;
    margin-top: 4px;
    flex-shrink: 0;
  }
  .property-map__container {
    height: 420px;
    margin: 16px 0 0;
    position: relative;
    border-top: 1px solid rgba(26,43,76,.08);
    border-bottom: 1px solid rgba(26,43,76,.08);
    isolation: isolate;
  }
  .property-map__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 24px;
    background: linear-gradient(to bottom, #f8f7f4, #fff);
    flex-wrap: wrap;
  }
  .property-map__footer-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    width: 100%;
  }
  .property-map__note {
    font-size: .82rem;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .property-map__gmaps-btn, .property-map__dir-btn {
    flex: 1;
    min-width: 140px;
    font-size: .88rem;
    padding: 11px 20px;
    border-radius: 12px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    transition: var(--transition);
    white-space: nowrap;
    font-family: var(--font-body);
    font-weight: 700;
    cursor: pointer;
    letter-spacing: .01em;
  }
  .property-map__gmaps-btn {
    color: var(--navy);
    border: 2px solid var(--navy);
    background: #fff;
    box-shadow: 0 2px 10px rgba(26,43,76,0.06);
  }
  .property-map__gmaps-btn:hover {
    background: var(--navy);
    color: #fff;
    box-shadow: 0 4px 16px rgba(26,43,76,0.18);
    transform: translateY(-1px);
  }
  .property-map__gmaps-btn:active { transform: translateY(0); }
  .property-map__dir-btn {
    background: var(--navy);
    color: #fff;
    border: 2px solid var(--navy);
    box-shadow: 0 4px 14px rgba(26,43,76,0.22);
  }
  .property-map__dir-btn:hover {
    background: #0f1e3a;
    border-color: #0f1e3a;
    box-shadow: 0 6px 20px rgba(26,43,76,0.32);
    transform: translateY(-1px);
  }
  .property-map__dir-btn:active { transform: translateY(0); box-shadow: 0 2px 8px rgba(26,43,76,0.2); }
  .property-map__dir-btn-icon { display: flex; align-items: center; }

  /* Layer switcher */
  .property-map__layers {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 800;
    display: flex;
    gap: 2px;
    background: rgba(255,255,255,.95);
    border-radius: 12px;
    padding: 4px;
    box-shadow: 0 2px 12px rgba(0,0,0,.15);
    backdrop-filter: blur(8px);
  }
  .property-map__layer-btn {
    font-size: 13px;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: 9px;
    border: none;
    background: transparent;
    color: #555;
    cursor: pointer;
    transition: all .2s ease;
    font-family: var(--font-body);
    white-space: nowrap;
  }
  .property-map__layer-btn:hover { background: #f0ece4; color: var(--text); }
  .property-map__layer-btn.active { background: #0a1628; color: #fff; }

  /* Zoom controls */
  .leaflet-control-zoom { border: none !important; box-shadow: 0 2px 12px rgba(0,0,0,.12) !important; border-radius: 10px !important; overflow: hidden; }
  .leaflet-control-zoom a { background: rgba(255,255,255,.95) !important; backdrop-filter: blur(8px) !important; color: #0a1628 !important; font-size: 18px !important; width: 36px !important; height: 36px !important; line-height: 36px !important; border: none !important; transition: background .2s !important; }
  .leaflet-control-zoom a:hover { background: #F7B05B !important; color: #fff !important; }

  /* Leaflet popup override */
  .property-map__popup .leaflet-popup-content-wrapper {
    border-radius: 14px;
    box-shadow: 0 8px 32px rgba(10,22,40,.18);
    font-family: var(--font-body);
    font-size: .85rem;
    border: 1px solid rgba(247,176,91,.25);
    padding: 14px 18px;
  }
  .property-map__popup .leaflet-popup-tip { background: #fff; }
  .property-map__popup .leaflet-popup-close-button { color: var(--navy) !important; font-size: 18px !important; top: 8px !important; right: 10px !important; }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     MAP â€” LocationPicker (create/edit form)
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  .location-picker {
    position: relative;
    background: #faf8f4;
    border: 1.5px solid var(--border);
    border-radius: 14px;
    padding: 20px 22px 18px;
  }
  .location-picker label {
    display: block;
    margin-bottom: 6px;
    font-size: .85rem;
    font-weight: 600;
    color: var(--text);
  }
  .location-picker__label-sub {
    display: block;
    font-size: .75rem;
    font-weight: 400;
    color: var(--text-muted);
    margin-top: 1px;
  }
  .location-picker__search {
    position: relative;
    display: flex;
    align-items: center;
  }
  .location-picker__search-icon {
    position: absolute;
    left: 14px;
    color: var(--gold);
    display: flex;
    align-items: center;
    pointer-events: none;
    z-index: 1;
  }
  .location-picker__input--with-icon {
    padding-left: 42px !important;
  }
  .location-picker__powered {
    font-size: .68rem;
    color: var(--text-muted);
    margin-top: 5px;
    text-align: right;
    opacity: .7;
  }
  .location-picker__input {
    width: 100%;
    padding: 16px 72px 16px 14px;
    min-height: 58px;
    font-size: 1rem;
    border: 1.5px solid var(--border);
    border-radius: 12px;
    font-size: .88rem;
    font-family: var(--font-body);
    background: #fff;
    color: var(--text);
    transition: border-color .2s;
    outline: none;
  }
  .location-picker__input:focus { border-color: var(--gold); }
  .location-picker__spinner {
    position: absolute;
    right: 42px;
    width: 16px;
    height: 16px;
    border: 2px solid var(--border);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .location-picker__clear {
    position: absolute;
    right: 10px;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-muted);
    font-size: 1rem;
    line-height: 1;
    padding: 4px 6px;
    border-radius: 6px;
    transition: var(--transition);
  }
  .location-picker__clear:hover { background: var(--cream); color: var(--text); }

  .location-picker__suggestions {
    position: absolute;
    top: calc(100% + 4px);
    left: 0; right: 0;
    z-index: 1000;
    background: #fff;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,.12);
    list-style: none;
    max-height: 240px;
    overflow-y: auto;
    padding: 4px 0;
  }
  .location-picker__suggestion {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 14px;
    cursor: pointer;
    font-size: .83rem;
    color: var(--text);
    border-bottom: 1px solid var(--border);
    transition: background .15s;
    line-height: 1.4;
  }
  .location-picker__suggestion:last-child { border-bottom: none; }
  .location-picker__suggestion:hover { background: var(--cream); }
  .location-picker__suggestion-icon { flex-shrink: 0; margin-top: 1px; }

  .location-picker__map { margin-top: 14px; }
  .location-picker__hint {
    font-size: .78rem;
    color: var(--text-muted);
    margin-bottom: 8px;
  }
  .location-picker__map-container {
    height: 300px;
    border-radius: 12px;
    overflow: hidden;
    border: 1.5px solid var(--border);
    box-shadow: 0 2px 12px rgba(0,0,0,.08);
  }
  .location-picker__coords {
    margin-top: 8px;
    font-size: .75rem;
    color: var(--text-muted);
    font-family: monospace;
  }

  @media (max-width: 768px) {
    .property-map { border-radius: 16px; }
    .property-map__header { padding: 16px 16px 0; }
    .property-map__container { height: 260px; }
    .property-map__footer { padding: 14px 16px; }
    .property-map__footer-actions { gap: 8px; }
    .property-map__gmaps-btn, .property-map__dir-btn { font-size: .82rem; padding: 10px 14px; min-width: unset; }
    .property-map__layers { right: 10px; top: 10px; }
    .property-map__layer-btn { font-size: .65rem; padding: 4px 7px; }
    .location-picker__map-container { height: 220px; }
    .property-map__title { font-size: 1rem; }
  }

  /* CHAT BUTTON */
  .btn--chat { background: var(--navy); color: #fff; border: none; width: 100%; justify-content: center; }
  .btn--chat svg, .btn--chat .ui-icon { color: var(--gold-light) !important; }
  .btn--chat:hover { background: var(--navy-light, #1a2b4c); transform: translateY(-1px); }
  .btn--chat:hover svg, .btn--chat:hover .ui-icon { color: #fff !important; }
  .navbar__icon-btn--msg { position: relative; }

  /* MESSAGES PAGE */
  .messages-page { height: calc(100vh - 68px); overflow: hidden; background: var(--cream); }
  .messages-page__body { display: grid; grid-template-columns: 340px 1fr; height: 100%; overflow: hidden; max-width: 1280px; margin: 0 auto; }
  .messages-page__sidebar { background: #fff; border-right: 1px solid var(--border); display: flex; flex-direction: column; overflow: hidden; }
  .messages-page__sidebar-header { padding: 12px 16px 10px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .messages-page__title { font-family: var(--font-display); font-size: 1.25rem; color: var(--navy); margin: 0; }
  .messages-page__loading { padding: 20px; color: var(--text-muted); font-size: .88rem; }
  .messages-page__panel { display: flex; flex-direction: column; overflow: hidden; background: var(--cream); }

  /* CONVERSATION LIST */
  .conv-list { list-style: none; padding: 0; margin: 0; overflow-y: auto; flex: 1; }
  .conv-list__item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px; cursor: pointer; border-bottom: 1px solid var(--border); transition: var(--transition); }
  .conv-list__item:hover { background: var(--cream); }
  .conv-list__item.is-active { background: rgba(10,22,40,.06); border-left: 3px solid var(--navy); }
  .conv-list__avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, var(--navy), var(--navy-light, #1a2b4c)); color: var(--gold); font-weight: 700; font-size: .95rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .conv-list__info { flex: 1; min-width: 0; }
  .conv-list__top-row { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 1px; }
  .conv-list__bottom-row { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 2px; }
  .conv-list__name { font-weight: 700; font-size: .9rem; color: var(--navy); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .conv-list__time { font-size: .72rem; color: var(--text-muted); flex-shrink: 0; }
  .conv-list__listing { font-size: .75rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .conv-list__badge { background: var(--gold); color: var(--navy); font-size: .7rem; font-weight: 700; min-width: 18px; height: 18px; border-radius: 999px; display: flex; align-items: center; justify-content: center; padding: 0 5px; flex-shrink: 0; }
  .conv-list__preview { font-size: .78rem; color: var(--text-muted); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .conv-list__empty { padding: 48px 20px; text-align: center; color: var(--text-muted); }
  .conv-list__empty svg { font-size: 2.5rem; margin-bottom: 12px; display: block; opacity: .4; }
  .conv-list__empty p { font-size: .9rem; }

  /* MESSAGE THREAD */
  .msg-thread { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
  .msg-thread--empty { align-items: center; justify-content: center; gap: 12px; color: var(--text-muted); }
  .msg-thread--empty svg { font-size: 3rem; opacity: .3; }
  .msg-thread--empty p { font-size: .95rem; }
  .msg-thread__header { display: flex; align-items: center; gap: 12px; padding: 11px 16px; background: #fff; border-bottom: 1px solid var(--border); flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
  .msg-thread__back { background: transparent; border: none; cursor: pointer; color: var(--navy); font-size: 1.1rem; padding: 6px; border-radius: 8px; display: none; }
  .msg-thread__back:hover { background: var(--cream); }
  .msg-thread__header-info { display: flex; flex-direction: column; }
  .msg-thread__other-name { font-weight: 700; font-size: 1rem; color: var(--navy); }
  .msg-thread__listing-title { font-size: .78rem; color: var(--text-muted); }
  .msg-thread__messages { flex: 1; overflow-y: auto; padding: 12px 12px; display: flex; flex-direction: column; gap: 6px; }
  .msg-thread__no-msgs { text-align: center; color: var(--text-muted); font-size: .85rem; margin: auto; }
  .msg-bubble { max-width: 68%; display: flex; flex-direction: column; }
  .msg-bubble--mine { align-self: flex-end; align-items: flex-end; }
  .msg-bubble--theirs { align-self: flex-start; align-items: flex-start; }
  .msg-bubble__text { padding: 10px 14px; border-radius: 18px; font-size: .9rem; line-height: 1.45; word-break: break-word; margin: 0; }
  .msg-bubble--mine .msg-bubble__text { background: var(--navy); color: #fff; border-bottom-right-radius: 4px; }
  .msg-bubble--theirs .msg-bubble__text { background: #fff; color: var(--text); border: 1px solid var(--border); border-bottom-left-radius: 4px; }
  .msg-bubble__time { font-size: .68rem; color: var(--text-muted); margin-top: 3px; padding: 0 4px; }
  .msg-thread__input-row { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #fff; border-top: 1px solid var(--border); flex-shrink: 0; }
  .msg-thread__input { flex: 1; border: 1px solid var(--border); border-radius: 24px; padding: 10px 18px; font-family: var(--font-body); font-size: .9rem; outline: none; background: var(--cream); transition: var(--transition); }
  .msg-thread__input:focus { border-color: var(--navy); background: #fff; }
  .msg-thread__send-btn { width: 42px; height: 42px; border-radius: 50%; background: var(--navy); color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: .95rem; flex-shrink: 0; transition: var(--transition); }
  .msg-thread__send-btn:hover:not(:disabled) { background: var(--navy-light, #1a2b4c); }
  .msg-thread__send-btn:disabled { opacity: .45; cursor: default; }

  @media (max-width: 768px) {
    .messages-page__body { grid-template-columns: 1fr; height: 100%; }
    .messages-page__sidebar.is-hidden-mobile { display: none; }
    .messages-page__panel.is-hidden-mobile { display: none; }
    .msg-thread__back { display: flex; }
  }

  /* SIMILAR LISTINGS */
  .similar-listings { margin-top: 32px; }
  .similar-listings__title { font-family: var(--font-display); font-size: 1.25rem; color: var(--navy); margin-bottom: 16px; }
  .similar-listings__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .similar-listings__card { background: #fff; border-radius: 14px; border: 1px solid var(--border); overflow: hidden; cursor: pointer; transition: var(--transition); box-shadow: 0 2px 10px rgba(0,0,0,.05); }
  .similar-listings__card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.1); }
  .similar-listings__img-wrap { position: relative; height: 130px; overflow: hidden; background: var(--cream); }
  .similar-listings__img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .3s ease; }
  .similar-listings__card:hover .similar-listings__img { transform: scale(1.04); }
  .similar-listings__img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 1.6rem; }
  .similar-listings__badge { position: absolute; top: 8px; left: 8px; background: rgba(15,27,45,.75); color: #fff; font-size: .7rem; font-weight: 600; padding: 3px 8px; border-radius: 6px; backdrop-filter: blur(4px); }
  .similar-listings__info { padding: 10px 12px 12px; }
  .similar-listings__name { font-size: .88rem; font-weight: 600; color: var(--navy); margin: 0 0 4px; line-height: 1.3; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .similar-listings__loc { font-size: .75rem; color: var(--text-muted); margin: 0 0 6px; display: flex; align-items: center; gap: 4px; }
  .similar-listings__price { font-size: .8rem; font-weight: 700; color: var(--gold); background: rgba(247,176,91,.1); padding: 3px 8px; border-radius: 6px; display: inline-block; }

  @media (max-width: 900px) {
    .similar-listings__grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 480px) {
    .similar-listings__grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .similar-listings__img-wrap { height: 100px; }
  }

  /* GOOGLE LOCATION PICKER â€” confirmed address card */
  .address-confirmed-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: var(--cream);
    border: 1.5px solid var(--gold);
    border-radius: 10px;
    padding: 12px 16px;
    margin-top: 8px;
  }
  .address-confirmed-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 2px; }
  .address-confirmed-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .address-confirmed-info strong { display: block; font-size: 15px; color: var(--navy); font-weight: 700; }
  .address-confirmed-info span { display: block; font-size: 13px; color: #666; line-height: 1.4; }
  .coords-text { font-size: 11px !important; color: #999 !important; font-family: monospace; }
  .location-picker__loading {
    padding: 14px;
    color: var(--text-muted);
    font-size: .85rem;
    background: var(--cream);
    border-radius: 10px;
    border: 1.5px solid var(--border);
    margin-top: 4px;
  }

  /* PHONE INPUT WITH COUNTRY CODE */
  .phone-input-wrapper {
    display: flex;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    background: white;
    transition: border-color .2s;
  }
  .phone-input-wrapper:focus-within { border-color: var(--gold); }
  .phone-warning-banner {
    background: var(--warning-bg);
    color: var(--warning-text);
    border: 1px solid var(--warning-border);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: .82rem;
    margin-top: 8px;
    animation: fadeIn 0.2s ease;
  }
  .phone-code-selector {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 14px;
    background: transparent;
    border: none;
    border-right: none;
    cursor: pointer;
    font-size: 14px;
    color: var(--navy);
    font-weight: 600;
    min-width: 96px;
    white-space: nowrap;
    font-family: var(--font-body);
    transition: background .15s;
    position: relative;
  }
  .phone-code-selector::after {
    content: "";
    position: absolute;
    right: 0;
    top: 25%;
    height: 50%;
    width: 1px;
    background: var(--border);
  }
  .phone-code-selector:hover { background: var(--cream); }
  .phone-number-input {
    flex: 1;
    border: none;
    outline: none;
    padding: 12px;
    font-size: 15px;
    color: var(--navy);
    background: white;
    font-family: var(--font-body);
    min-width: 0;
  }
  .phone-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    background: white;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,.1);
    z-index: 9999;
    min-width: 220px;
    max-height: 300px;
    overflow-y: auto;
    margin-top: 4px;
  }
  .phone-dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    cursor: pointer;
    font-size: 14px;
    color: var(--navy);
    border-bottom: 1px solid var(--border);
    transition: background .15s;
  }
  .phone-dropdown-item:last-child { border-bottom: none; }
  .phone-dropdown-item:hover { background: var(--cream); }
  .phone-dropdown-item.active { background: var(--cream); font-weight: 600; }

  /* â”€â”€ ICON COLORS BY CONTEXT â”€â”€ */

  /* Default: navy on light backgrounds */
  svg[aria-hidden="true"], .ui-icon { color: var(--navy); }

  /* White icons on dark backgrounds */
  .navbar svg, .navbar .ui-icon,
  .navbar__icon-btn svg, .navbar__icon-btn .ui-icon,
  .navbar__mobile-close svg, .navbar__mobile-close .ui-icon,
  .btn--ghost svg, .btn--ghost .ui-icon,
  .btn--danger svg, .btn--danger .ui-icon,
  .btn--whatsapp svg, .btn--whatsapp .ui-icon,
  .admin-header svg, .admin-header .ui-icon,
  .admin-tab.active svg, .admin-tab.active .ui-icon,
  .page-form__header svg, .page-form__header .ui-icon,
  .page-form__header-actions svg, .page-form__header-actions .ui-icon,
  .submit-btn svg, .submit-btn .ui-icon,
  .modal-card__close svg, .modal-card__close .ui-icon,
  .property-gallery__arrow svg, .property-gallery__arrow .ui-icon,
  .profile-nav-item.active svg, .profile-nav-item.active .ui-icon,
  .filter-pill.active svg, .filter-pill.active .ui-icon,
  .feature-pill.is-active svg, .feature-pill.is-active .ui-icon,
  .image-uploader__thumb-remove svg, .image-uploader__thumb-remove .ui-icon,
  .image-uploader__thumb-status svg, .image-uploader__thumb-status .ui-icon,
  .prop-card__badge svg, .prop-card__badge .ui-icon { color: #fff; }

  /* Gold accent icons */
  .navbar__mobile-link svg, .navbar__mobile-link .ui-icon { color: var(--gold-light); }
  .service-card__icon svg, .service-card__icon .ui-icon { color: var(--gold); }
  .search-field__label svg, .search-field__label .ui-icon { color: var(--gold-light); }
  .contact__icon-box { color: var(--gold); }
  .image-uploader__dropzone-icon svg, .image-uploader__dropzone-icon .ui-icon { color: var(--gold); }

  /* Muted icons on light panels */
  .prop-card__meta span svg, .prop-card__meta span .ui-icon { color: #8d99a8; width: 19.8px !important; height: 19.8px !important; flex-shrink: 0; min-width: 19.8px; }
  .prop-card__location svg, .prop-card__location .ui-icon { color: var(--text-muted); width: 14px !important; height: 14px !important; flex-shrink: 0; }
  .prop-card__arrow svg, .prop-card__arrow .ui-icon { color: #333; }
  .user-menu__item svg, .user-menu__item .ui-icon { color: var(--text); opacity: .7; }
  .user-menu__item--danger svg, .user-menu__item--danger .ui-icon { color: var(--error); opacity: 1; }
  .admin-empty svg, .admin-empty .ui-icon { color: var(--text-muted); }
  .profile-nav-item svg, .profile-nav-item .ui-icon { color: var(--text-muted); }

  /* Fav button */
  .prop-card__fav-btn svg, .prop-card__fav-btn .ui-icon { color: #8d99a8; }
  .prop-card__fav-btn.is-favorite svg, .prop-card__fav-btn.is-favorite .ui-icon { color: #e74c3c; }

  /* Placeholder icons (faint white on dark gradient) */
  .prop-card__img-placeholder svg, .prop-card__img-placeholder .ui-icon { color: rgba(255,255,255,.25); }
  .modal-card__img-placeholder svg, .modal-card__img-placeholder .ui-icon { color: rgba(255,255,255,.2); }
  .similar-listings__img-placeholder svg, .similar-listings__img-placeholder .ui-icon { color: rgba(255,255,255,.25); }
  .premium-gallery__placeholder svg, .premium-gallery__placeholder .ui-icon { color: rgba(255,255,255,.25); }

  /* Footer socials */
  .footer__socials a svg { color: rgba(255,255,255,.5); }
  .footer__socials a:hover svg { color: var(--gold); }

  /* Search button (navy on gold bg) */
  .search-strip__btn svg, .search-strip__btn .ui-icon { color: var(--navy); }
  .search-text__icon { color: rgba(255,255,255,.62); }

  /* Primary button: navy on gold, except apartments = white on orange */
  .btn--primary svg, .btn--primary .ui-icon { color: var(--navy); }
  .experience--apartments .btn--primary svg, .experience--apartments .btn--primary .ui-icon { color: #fff; }

  /* Outline button states */
  .btn--outline svg, .btn--outline .ui-icon { color: #e74c3c; }
  .btn--outline:hover svg, .btn--outline:hover .ui-icon { color: #fff; }

  /* Admin denied icon */
  .admin-denied__icon svg, .admin-denied__icon { color: var(--error); }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     REVIEWS SECTION
     â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

  .rv-section {
    margin-top: 32px;
    padding: 0;
  }

  .rv-section__title {
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--navy);
    margin-bottom: 24px;
    letter-spacing: -.01em;
  }

  /* â”€â”€ Stars shared â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  .rv-stars {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    line-height: 1;
  }

  .rv-star--filled { color: var(--gold); }
  .rv-star--empty  { color: #d5d3cf; }

  /* â”€â”€ Star picker (interactive) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  .rv-star-picker {
    display: inline-flex;
    gap: 2px;
  }

  .rv-star-picker__btn {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #d5d3cf;
    transition: color .15s, transform .15s;
    border-radius: 4px;
    line-height: 1;
  }

  .rv-star-picker__btn.is-active { color: var(--gold); }
  .rv-star-picker__btn:hover { transform: scale(1.2); }
  .rv-star-picker__btn:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }

  /* â”€â”€ Rating summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  .rv-summary {
    display: flex;
    align-items: flex-start;
    gap: 32px;
    background: var(--cream);
    border-radius: var(--radius-lg);
    padding: 28px 28px;
    margin-bottom: 28px;
    border: 1px solid var(--border);
  }

  .rv-summary__score {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    min-width: 90px;
    flex-shrink: 0;
  }

  .rv-summary__number {
    font-family: var(--font-display);
    font-size: 2.8rem;
    font-weight: 700;
    color: var(--navy);
    line-height: 1;
  }

  .rv-summary__total {
    font-size: .82rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  .rv-summary__bars {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .rv-summary__row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: .82rem;
    color: var(--text-muted);
  }

  .rv-summary__row-label {
    width: 12px;
    text-align: right;
    font-weight: 600;
    color: var(--navy);
  }

  .rv-summary__row svg { flex-shrink: 0; }

  .rv-summary__bar-track {
    flex: 1;
    height: 8px;
    background: rgba(0,0,0,.06);
    border-radius: 99px;
    overflow: hidden;
  }

  .rv-summary__bar-fill {
    height: 100%;
    background: var(--gold);
    border-radius: 99px;
    transition: width .4s cubic-bezier(.4,0,.2,1);
  }

  .rv-summary__row-count {
    width: 24px;
    text-align: right;
    font-weight: 500;
    font-size: .78rem;
    color: var(--text-muted);
  }

  @media (max-width: 600px) {
    .rv-summary {
      flex-direction: column;
      align-items: stretch;
      gap: 20px;
      padding: 22px 18px;
    }
    .rv-summary__score {
      flex-direction: row;
      gap: 12px;
      min-width: 0;
    }
    .rv-summary__number { font-size: 2.2rem; }
  }

  /* â”€â”€ Review form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  .rv-form {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 28px 28px;
    margin-bottom: 28px;
  }

  .rv-form--guest {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .rv-form__guest-text {
    font-size: .92rem;
    color: var(--text-muted);
    flex: 1;
    min-width: 180px;
  }

  .rv-form__title {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--navy);
    margin-bottom: 20px;
  }

  .rv-form__field {
    margin-bottom: 18px;
  }

  .rv-form__label {
    display: block;
    font-size: .82rem;
    font-weight: 600;
    color: var(--navy);
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: .06em;
  }

  .rv-form__textarea {
    width: 100%;
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 16px;
    font-family: var(--font-body);
    font-size: .92rem;
    color: var(--navy);
    background: var(--cream);
    resize: vertical;
    transition: border-color .2s, box-shadow .2s;
    line-height: 1.6;
  }

  .rv-form__textarea:focus {
    outline: none;
    border-color: var(--gold);
    box-shadow: 0 0 0 3px rgba(247,176,91,.15);
  }

  .rv-form__textarea::placeholder { color: var(--text-muted); opacity: .7; }

  .rv-form__char-count {
    display: block;
    text-align: right;
    font-size: .75rem;
    color: var(--text-muted);
    margin-top: 4px;
  }

  .rv-form__error {
    color: var(--error);
    font-size: .85rem;
    margin-bottom: 12px;
    font-weight: 500;
  }

  .rv-form__success {
    color: var(--success);
    font-size: .85rem;
    margin-bottom: 12px;
    font-weight: 500;
  }

  .rv-form__submit {
    min-width: 180px;
  }

  @media (max-width: 600px) {
    .rv-form { padding: 22px 18px; }
    .rv-form--guest { flex-direction: column; align-items: stretch; }
  }

  /* â”€â”€ Review cards list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  .rv-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .rv-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px 24px;
    transition: box-shadow .2s, border-color .2s;
  }

  .rv-card:hover {
    border-color: rgba(247,176,91,.35);
    box-shadow: 0 4px 20px rgba(247,176,91,.08);
  }

  .rv-card__header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  .rv-card__avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    flex-shrink: 0;
    overflow: hidden;
    background: var(--gold);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .rv-card__avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .rv-card__avatar-initials {
    font-family: var(--font-body);
    font-size: .82rem;
    font-weight: 700;
    color: var(--navy);
    line-height: 1;
  }

  .rv-card__meta {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .rv-card__name {
    font-weight: 600;
    font-size: .92rem;
    color: var(--navy);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .rv-card__date {
    font-size: .78rem;
    color: var(--text-muted);
  }

  .rv-card__comment {
    font-size: .9rem;
    line-height: 1.65;
    color: var(--text);
    margin: 0;
  }

  @media (max-width: 600px) {
    .rv-card { padding: 20px 18px; }
    .rv-card__header { flex-wrap: wrap; gap: 8px; }
    .rv-card__header .rv-stars { width: 100%; margin-top: 4px; }
  }

  /* â”€â”€ Empty / Loading / Error states â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  .rv-empty, .rv-loading, .rv-error {
    text-align: center;
    padding: 48px 20px;
    color: var(--text-muted);
    font-size: .92rem;
  }

  .rv-empty svg { color: var(--border); margin-bottom: 12px; display: inline-block; }
  .rv-error { color: var(--error); }

  /* PRICING */
  .pricing-section {
    position: relative;
    padding: 78px 0;
    background:
      radial-gradient(circle at top left, rgba(247,176,91,.12), transparent 24%),
      linear-gradient(180deg, rgba(255,255,255,.7), rgba(249,245,239,.96));
    overflow: hidden;
  }
  .pricing-section::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255,255,255,.52), transparent 24%, transparent 76%, rgba(15,27,45,.03));
    pointer-events: none;
  }
  .experience--apartments .pricing-section {
    background:
      radial-gradient(circle at top left, rgba(244,127,82,.14), transparent 30%),
      linear-gradient(180deg, rgba(255,255,255,.72), rgba(244,240,235,.96));
  }
  .pricing-section > .container {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 34px;
  }
  .pricing-section__intro {
    position: relative;
    display: grid;
    gap: 24px;
    padding: 28px 30px 26px;
    border-radius: 30px;
    background:
      radial-gradient(circle at top left, rgba(247,176,91,.1), transparent 32%),
      linear-gradient(180deg, rgba(255,255,255,.62), rgba(255,255,255,.34));
    border: 1px solid rgba(15,27,45,.08);
    box-shadow: 0 20px 52px rgba(15,27,45,.06);
    overflow: hidden;
  }
  .pricing-section__intro::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255,255,255,.38), transparent 28%);
    pointer-events: none;
  }
  .pricing-section__plans {
    position: relative;
    padding: 28px;
    border-radius: 28px;
    background: linear-gradient(180deg, rgba(255,255,255,.72), rgba(255,255,255,.9));
    border: 1px solid rgba(15,27,45,.08);
    box-shadow: 0 20px 52px rgba(15,27,45,.08);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
  .pricing-section__plans::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(180deg, rgba(255,255,255,.32), transparent 18%);
    pointer-events: none;
  }
  .pricing-section__shell {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 26px;
  }
  .pricing-section__head {
    display: block;
    position: relative;
    z-index: 1;
  }
  .pricing-section__copy {
    max-width: 760px;
  }
  .pricing-section .section-title {
    max-width: 820px;
    line-height: 1.08;
    letter-spacing: -.035em;
  }
  .pricing-section__subtitle {
    max-width: 620px;
    margin-top: 16px;
    color: var(--text-muted);
    font-size: 1rem;
    line-height: 1.75;
  }
  .pricing-section__trust-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    max-width: none;
    align-items: stretch;
  }
  .pricing-trust-card {
    display: grid;
    grid-template-columns: 46px minmax(0, 1fr);
    align-content: start;
    gap: 12px;
    min-height: 128px;
    height: 100%;
    padding: 18px;
    border-radius: 22px;
    background: linear-gradient(180deg, rgba(255,255,255,.94), rgba(255,255,255,.82));
    border: 1px solid rgba(15,27,45,.08);
    box-shadow: 0 14px 30px rgba(15,27,45,.07);
  }
  .pricing-trust-card__icon {
    width: 46px;
    height: 46px;
    border-radius: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: rgba(247,176,91,.14);
    color: var(--gold);
  }
  .pricing-trust-card strong {
    display: block;
    color: var(--navy);
    font-size: .94rem;
    margin-bottom: 6px;
    line-height: 1.35;
  }
  .pricing-trust-card p {
    color: var(--text-muted);
    font-size: .84rem;
    line-height: 1.65;
  }
  .experience--apartments .pricing-trust-card,
  .experience--apartments .pricing-trust-card__icon { border-radius: 16px; }
  .experience--apartments .pricing-section__plans {
    border-radius: 22px;
  }
  .experience--apartments .pricing-section__intro {
    border-radius: 22px;
  }

  .pricing-cards {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
    align-items: stretch;
  }
  .pricing-card {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    padding: 24px 22px 22px;
    border-radius: 22px;
    border: 1px solid rgba(15,27,45,.08);
    background:
      linear-gradient(180deg, rgba(255,255,255,.98), rgba(250,247,243,.96));
    box-shadow: 0 18px 40px rgba(15,27,45,.08);
    transition: transform .26s ease, box-shadow .26s ease, border-color .26s ease;
  }
  .pricing-card::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(140deg, rgba(255,255,255,.44), transparent 36%);
    pointer-events: none;
  }
  .pricing-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 44px rgba(15,27,45,.11);
    border-color: rgba(247,176,91,.28);
  }
  .pricing-card--featured {
    border-color: rgba(247,176,91,.4);
    background:
      radial-gradient(circle at top right, rgba(247,176,91,.18), transparent 30%),
      linear-gradient(180deg, rgba(255,255,255,.99), rgba(250,246,239,.98));
    box-shadow: 0 20px 46px rgba(247,176,91,.14);
  }
  .pricing-card--business {
    background:
      radial-gradient(circle at top right, rgba(15,27,45,.06), transparent 30%),
      linear-gradient(180deg, rgba(255,255,255,.98), rgba(246,244,240,.98));
  }
  .experience--apartments .pricing-card {
    border-radius: 18px;
    background:
      linear-gradient(180deg, rgba(255,255,255,.98), rgba(248,244,239,.98));
  }
  .pricing-card__header {
    position: relative;
    z-index: 1;
    margin-bottom: 18px;
  }
  .pricing-card__badge {
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: 5px 11px;
    border-radius: 999px;
    background: rgba(15,27,45,.08);
    color: var(--navy);
    font-size: .72rem;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
    margin-bottom: 14px;
  }
  .pricing-card--featured .pricing-card__badge {
    background: rgba(247,176,91,.16);
    color: #8c5d18;
  }
  .pricing-card--business .pricing-card__badge {
    background: rgba(15,27,45,.1);
    color: var(--navy);
  }
  .pricing-card h3 {
    font-family: var(--font-display);
    font-size: 1.42rem;
    color: var(--navy);
    line-height: 1.15;
    margin-bottom: 10px;
  }
  .experience--apartments .pricing-card h3 {
    font-family: var(--font-display-alt);
    letter-spacing: -.03em;
  }
  .pricing-card__price {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-bottom: 12px;
  }
  .pricing-card__price strong {
    font-size: clamp(1.95rem, 3.6vw, 2.5rem);
    line-height: 1;
    letter-spacing: -.05em;
    color: var(--navy);
  }
  .pricing-card__currency {
    font-size: .55em;
    font-weight: 800;
    margin-left: 3px;
    color: var(--gold);
  }
  .pricing-card__price span {
    color: var(--navy);
    font-size: .95rem;
    font-weight: 700;
    opacity: .45;
  }
  .pricing-card__header p {
    color: var(--text-muted);
    font-size: .88rem;
    line-height: 1.68;
  }
  .pricing-card__features {
    position: relative;
    z-index: 1;
    list-style: none;
    display: grid;
    flex: 1 1 auto;
    align-content: start;
    gap: 10px;
    padding: 16px 0 0;
    margin: 0;
    border-top: 1px solid rgba(15,27,45,.08);
  }
  .pricing-card__features li {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr);
    gap: 10px;
    align-items: start;
    color: var(--text);
    font-size: .88rem;
    line-height: 1.5;
  }
  .pricing-card__features li svg {
    margin-top: 3px;
    color: var(--gold);
  }
  .pricing-card__footer {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 0;
    margin-top: auto;
    padding-top: 18px;
  }
  .pricing-card__cta {
    width: 100%;
    min-height: 46px;
    justify-content: center;
    border-radius: 13px;
  }
  .pricing-card__cta--secondary {
    background: transparent;
    color: var(--navy);
    border: 1px solid rgba(15,27,45,.14);
  }
  .pricing-card__cta--secondary:hover {
    background: rgba(15,27,45,.05);
    border-color: rgba(15,27,45,.2);
    transform: translateY(-1px);
  }
  .pricing-card__cta--dark {
    background: var(--navy);
    color: #fff;
    border: 1px solid var(--navy);
  }
  .pricing-card__cta--dark:hover {
    background: var(--navy-light);
    border-color: var(--navy-light);
    transform: translateY(-1px);
  }
  .pricing-section__bottom {
    display: block;
  }
  .pricing-section__notice {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 18px 20px;
    border-radius: 20px;
    background: rgba(15,27,45,.94);
    color: rgba(255,255,255,.82);
    box-shadow: 0 18px 42px rgba(15,27,45,.14);
  }
  .pricing-section__notice svg {
    color: var(--gold);
    flex-shrink: 0;
    margin-top: 2px;
  }
  .pricing-section__notice-copy {
    min-width: 0;
    display: grid;
    gap: 10px;
  }
  .pricing-section__notice-copy strong {
    color: #fff;
    font-size: .96rem;
    line-height: 1.35;
  }
  .pricing-section__notice p {
    font-size: .86rem;
    line-height: 1.68;
  }
  .pricing-section__notice-points {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .pricing-section__notice-point {
    display: inline-flex;
    align-items: center;
    min-height: 32px;
    padding: 6px 11px;
    border-radius: 999px;
    background: rgba(255,255,255,.08);
    border: 1px solid rgba(255,255,255,.12);
    color: rgba(255,255,255,.92);
    font-size: .74rem;
    font-weight: 700;
    letter-spacing: .04em;
  }

  .pricing-faq {
    display: grid;
    grid-template-columns: minmax(220px, 320px) minmax(0, 1fr);
    gap: 20px;
    align-items: start;
  }
  .pricing-faq__intro h3 {
    font-family: var(--font-display);
    font-size: 1.35rem;
    color: var(--navy);
  }
  .experience--apartments .pricing-faq__intro h3 {
    font-family: var(--font-display-alt);
    letter-spacing: -.03em;
  }
  .pricing-faq__list { display: grid; gap: 14px; }
  .pricing-faq__item {
    padding: 18px 20px;
    border-radius: 18px;
    background: rgba(255,255,255,.84);
    border: 1px solid rgba(15,27,45,.08);
    box-shadow: 0 14px 30px rgba(15,27,45,.06);
  }
  .pricing-faq__item summary {
    list-style: none;
    cursor: pointer;
    font-weight: 700;
    color: var(--navy);
    padding-right: 28px;
    position: relative;
  }
  .pricing-faq__item summary::-webkit-details-marker { display: none; }
  .pricing-faq__item summary::after {
    content: "+";
    position: absolute;
    top: 0;
    right: 0;
    color: var(--gold);
    font-size: 1.15rem;
    font-weight: 700;
  }
  .pricing-faq__item[open] summary::after { content: "âˆ’"; }
  .pricing-faq__item p {
    margin-top: 12px;
    color: var(--text-muted);
    font-size: .88rem;
    line-height: 1.7;
  }
  .pricing-faq__item[open] summary::after { content: "\\2212"; }

  .pricing-modal {
    position: fixed;
    inset: 0;
    z-index: 1400;
    padding: 24px;
    background: rgba(8,14,24,.66);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    display: grid;
    place-items: center;
  }
  .pricing-modal__dialog {
    width: min(1080px, 100%);
    max-height: calc(100dvh - 48px);
    overflow: auto;
    border-radius: 28px;
    background:
      linear-gradient(180deg, rgba(255,255,255,.98), rgba(249,245,239,.98));
    border: 1px solid rgba(255,255,255,.24);
    box-shadow: 0 30px 80px rgba(0,0,0,.26);
  }
  .pricing-modal__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    padding: 26px 28px 18px;
    background:
      radial-gradient(circle at top right, rgba(247,176,91,.22), transparent 26%),
      linear-gradient(180deg, rgba(15,27,45,.98), rgba(26,46,71,.98));
    color: #fff;
  }
  .pricing-modal__eyebrow {
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: 5px 12px;
    margin-bottom: 12px;
    border-radius: 999px;
    background: rgba(255,255,255,.12);
    color: var(--gold-light);
    font-size: .72rem;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .pricing-modal__header h3 {
    font-family: var(--font-display);
    font-size: clamp(1.7rem, 4vw, 2.4rem);
    line-height: 1.12;
    margin-bottom: 10px;
  }
  .experience--apartments .pricing-modal__header h3 {
    font-family: var(--font-display-alt);
    letter-spacing: -.03em;
  }
  .pricing-modal__header p {
    max-width: 560px;
    color: rgba(255,255,255,.72);
    font-size: .92rem;
    line-height: 1.7;
  }
  .pricing-modal__close {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,.18);
    background: rgba(255,255,255,.1);
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--transition);
  }
  .pricing-modal__close:hover { background: rgba(255,255,255,.18); }
  .ui-close-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: currentColor;
    font-family: var(--font-body);
    font-size: 20px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: .02em;
  }
  .navbar__mobile-close .ui-close-mark,
  .modal-card__close .ui-close-mark,
  .pricing-modal__close .ui-close-mark,
  .image-uploader__thumb-remove .ui-close-mark,
  .paid-plan-notification__dismiss .ui-close-mark {
    font-size: 24px;
  }

  .pricing-modal__summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    padding: 18px 28px 0;
  }
  .pricing-modal__summary > div {
    padding: 13px 14px;
    border-radius: 16px;
    background: rgba(255,255,255,.74);
    border: 1px solid rgba(15,27,45,.08);
  }
  .pricing-modal__summary span {
    display: block;
    margin-bottom: 6px;
    color: var(--text-muted);
    font-size: .74rem;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .pricing-modal__summary strong {
    color: var(--navy);
    font-size: 1rem;
    line-height: 1.4;
  }
  .pricing-modal__summary em { color: var(--text-muted); font-style: normal; font-weight: 600; }
  .pricing-modal__alert {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 16px 28px 0;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: .88rem;
    line-height: 1.6;
  }
  .pricing-modal__alert--warning {
    background: rgba(247,176,91,.14);
    border: 1px solid rgba(247,176,91,.28);
    color: #805316;
  }
  .pricing-modal__alert--error {
    background: rgba(231,76,60,.1);
    border: 1px solid rgba(231,76,60,.2);
    color: #c0392b;
  }
  .pricing-modal__body {
    display: grid;
    grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr);
    gap: 20px;
    padding: 22px 28px 28px;
  }
  .pricing-methods {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 12px;
  }
  .pricing-methods__button {
    min-height: 50px;
    border-radius: 14px;
    border: 1px solid rgba(15,27,45,.1);
    background: rgba(255,255,255,.74);
    color: var(--navy);
    font-family: var(--font-body);
    font-size: .9rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    cursor: pointer;
    transition: var(--transition);
  }
  .pricing-methods__button:hover {
    border-color: rgba(15,27,45,.2);
    background: rgba(255,255,255,.9);
  }
  .pricing-methods__button svg {
    color: var(--navy);
    transition: color .25s;
  }
  .pricing-methods__button.is-active {
    background: var(--navy);
    border-color: var(--navy);
    color: var(--gold);
    box-shadow: 0 14px 32px rgba(15,27,45,.16);
  }
  .pricing-methods__button.is-active svg {
    color: var(--gold);
  }
  .experience--apartments .pricing-methods__button.is-active {
    background: var(--gold);
    border-color: var(--gold);
    color: var(--navy);
  }
  .experience--apartments .pricing-methods__button.is-active svg {
    color: var(--navy);
  }
  .pricing-payment-card,
  .pricing-modal__form-shell {
    padding: 20px;
    border-radius: 20px;
    background: rgba(255,255,255,.8);
    border: 1px solid rgba(15,27,45,.08);
    box-shadow: 0 18px 38px rgba(15,27,45,.08);
  }
  .pricing-payment-card__header,
  .pricing-modal__form-intro {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }
  .pricing-payment-card__header h4,
  .pricing-modal__form-intro h4 {
    font-size: 1.05rem;
    color: var(--navy);
    margin-bottom: 6px;
  }
  .pricing-payment-card__header p,
  .pricing-modal__form-intro p {
    color: var(--text-muted);
    font-size: .84rem;
    line-height: 1.65;
  }
  .pricing-payment-card__row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    padding: 13px 0;
    border-top: 1px solid rgba(15,27,45,.08);
  }
  .pricing-payment-card__row:first-of-type { border-top: none; padding-top: 0; }
  .pricing-payment-card__meta span {
    display: block;
    margin-bottom: 5px;
    color: var(--text-muted);
    font-size: .74rem;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .pricing-payment-card__meta strong {
    color: var(--navy);
    font-size: .92rem;
    line-height: 1.55;
    word-break: break-word;
  }
  .pricing-copy-btn {
    min-height: 36px;
    padding: 8px 11px;
    border-radius: 11px;
    border: 1px solid rgba(15,27,45,.1);
    background: rgba(15,27,45,.04);
    color: var(--navy);
    font-family: var(--font-body);
    font-size: .78rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    white-space: nowrap;
    flex-shrink: 0;
    cursor: pointer;
    transition: var(--transition);
  }
  .pricing-copy-btn--soft { background: rgba(255,255,255,.74); }
  .pricing-copy-btn:hover { background: rgba(15,27,45,.08); }
  .pricing-bank-contact {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 36px 24px 28px;
    gap: 8px;
  }
  .pricing-bank-contact__icon {
    width: 60px;
    height: 60px;
    border-radius: 18px;
    background: var(--navy);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
    box-shadow: 0 8px 24px rgba(15,27,45,.22);
  }
  .pricing-bank-contact__icon svg {
    width: 30px;
    height: 30px;
    color: var(--gold);
  }
  .pricing-bank-contact h4 {
    font-size: 1.15rem;
    font-family: var(--font-display);
    color: var(--navy);
    margin: 0;
  }
  .pricing-bank-contact p {
    color: var(--text-muted);
    font-size: .86rem;
    line-height: 1.65;
    max-width: 360px;
    margin: 0 0 4px;
  }
  .pricing-bank-contact__form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    max-width: 400px;
    margin-top: 8px;
  }
  .pricing-bank-contact__form input,
  .pricing-bank-contact__form textarea {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1.5px solid var(--border);
    background: #fff;
    font-family: var(--font-body);
    font-size: .88rem;
    color: var(--navy);
    outline: none;
    transition: border-color .2s, box-shadow .2s;
    resize: vertical;
  }
  .pricing-bank-contact__form input:focus,
  .pricing-bank-contact__form textarea:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 3.5px rgba(247,176,91,.15);
  }
  .pricing-bank-contact__form input::placeholder,
  .pricing-bank-contact__form textarea::placeholder {
    color: var(--text-muted);
    opacity: .6;
  }
  .pricing-bank-contact__btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 6px;
    padding: 14px 32px;
    border-radius: 14px;
    background: var(--navy);
    color: var(--gold);
    font-family: var(--font-body);
    font-size: .93rem;
    font-weight: 700;
    letter-spacing: .01em;
    text-decoration: none;
    cursor: pointer;
    border: none;
    transition: transform .22s cubic-bezier(.4,0,.2,1), box-shadow .22s cubic-bezier(.4,0,.2,1), background .2s;
    box-shadow: 0 4px 18px rgba(15,27,45,.18);
    overflow: hidden;
  }
  .pricing-bank-contact__btn::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--navy-light);
    opacity: 0;
    transition: opacity .22s;
  }
  .pricing-bank-contact__btn:hover::before {
    opacity: 1;
  }
  .pricing-bank-contact__btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 32px rgba(15,27,45,.28);
    color: var(--gold-light);
  }
  .pricing-bank-contact__btn:active {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(15,27,45,.2);
  }
  .pricing-bank-contact__btn svg,
  .pricing-bank-contact__btn span {
    position: relative;
    z-index: 1;
  }
  .pricing-bank-contact__btn svg {
    width: 20px;
    height: 20px;
    transition: transform .22s;
  }
  .pricing-bank-contact__btn:hover svg {
    transform: translateX(3px) rotate(-6deg);
  }
  .pricing-bank-contact__btn:disabled {
    opacity: .55;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: 0 4px 14px rgba(15,27,45,.12);
  }
  .pricing-bank-contact__btn:disabled::before { opacity: 0 !important; }
  .pricing-bank-contact__success {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 18px 22px;
    border-radius: 14px;
    background: rgba(39,174,96,.08);
    border: 1px solid rgba(39,174,96,.18);
    color: var(--success);
    font-weight: 600;
    font-size: .9rem;
    margin-top: 10px;
    line-height: 1.5;
  }
  .pricing-bank-contact__success svg {
    width: 26px;
    height: 26px;
    flex-shrink: 0;
    color: var(--success);
  }
  .pricing-bank-contact__error {
    color: var(--error);
    font-size: .82rem;
    text-align: center;
  }
  .pricing-payment-card__split {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 176px;
    gap: 16px;
    align-items: start;
  }
  .pricing-payment-card__stack { display: grid; }
  .pricing-qr {
    display: grid;
    justify-items: center;
    gap: 6px;
    padding: 12px;
    border-radius: 14px;
    background: rgba(15,27,45,.96);
    color: rgba(255,255,255,.8);
  }
  .pricing-qr__frame {
    padding: 8px;
    border-radius: 10px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
  }
  .pricing-qr__frame svg { width: 110px; height: 110px; }
  .pricing-qr strong { font-size: .76rem; color: #fff; }
  .pricing-qr span { text-align: center; font-size: .7rem; line-height: 1.5; }
  .pricing-form__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .pricing-form__field > span {
    display: block;
    margin-bottom: 6px;
    color: var(--text-muted);
    font-size: .78rem;
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
  }
  .pricing-form__field select {
    width: 100%;
    padding: 11px 13px;
    border-radius: var(--radius);
    border: 1.5px solid var(--border);
    background: #fff;
    font-family: var(--font-body);
    font-size: .9rem;
    color: var(--text);
    outline: none;
    transition: var(--transition);
  }
  .pricing-form__field select:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 3px rgba(247,176,91,.1);
  }
  .pricing-form__error {
    display: block;
    margin-top: 6px;
    color: var(--error);
    font-size: .8rem;
    line-height: 1.5;
  }
  .pricing-upload {
    display: block;
    border-radius: 18px;
    border: 1.5px dashed rgba(15,27,45,.16);
    background: rgba(255,255,255,.64);
    cursor: pointer;
    transition: var(--transition);
  }
  .pricing-upload:hover { border-color: rgba(247,176,91,.44); background: rgba(255,255,255,.86); }
  .pricing-upload.has-file { border-color: rgba(39,174,96,.4); background: rgba(39,174,96,.06); }
  .pricing-upload.has-error { border-color: rgba(231,76,60,.4); }
  .pricing-upload input { display: none; }
  .pricing-upload__content {
    display: grid;
    justify-items: center;
    gap: 7px;
    padding: 20px 18px;
    text-align: center;
  }
  .pricing-upload__content svg { color: var(--gold); font-size: 1.4rem; }
  .pricing-upload__content strong { color: var(--navy); }
  .pricing-upload__content span {
    color: var(--text-muted);
    font-size: .82rem;
    line-height: 1.7;
  }
  .pricing-upload__file {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-top: 10px;
    padding: 12px 14px;
    border-radius: 14px;
    background: rgba(15,27,45,.05);
  }
  .pricing-upload__file strong {
    display: block;
    color: var(--navy);
    font-size: .88rem;
  }
  .pricing-upload__file span {
    color: var(--text-muted);
    font-size: .78rem;
  }
  .pricing-form__submit {
    width: 100%;
    justify-content: center;
    margin-top: 8px;
  }
  .pricing-modal__success {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 16px;
    border-radius: 16px;
    background: rgba(39,174,96,.1);
    border: 1px solid rgba(39,174,96,.2);
  }
  .pricing-modal__success svg { color: var(--success); flex-shrink: 0; }
  .pricing-modal__success h5 {
    color: var(--navy);
    font-size: 1rem;
    margin-bottom: 6px;
  }
  .pricing-modal__success p {
    color: var(--text-muted);
    font-size: .88rem;
    line-height: 1.7;
    margin-bottom: 8px;
  }
  .pricing-modal__success strong { color: var(--navy); }
  .pricing-card__cta:focus-visible,
  .pricing-methods__button:focus-visible,
  .pricing-copy-btn:focus-visible,
  .pricing-upload:focus-within,
  .pricing-faq__item summary:focus-visible,
  .pricing-modal__close:focus-visible {
    outline: 3px solid rgba(247,176,91,.24);
    outline-offset: 2px;
  }

  @media (max-width: 1024px) {
    .pricing-faq,
    .pricing-modal__body { grid-template-columns: 1fr; }
    .pricing-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .pricing-section__intro { padding: 24px; }
    .pricing-section__trust-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .pricing-modal__summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 768px) {
    .pricing-section { padding: 58px 0; }
    .pricing-section > .container { gap: 24px; }
    .pricing-section__intro { padding: 18px 16px; border-radius: 22px; }
    .pricing-section__plans { padding: 18px 16px; border-radius: 22px; }
    .pricing-cards,
    .pricing-section__bottom,
    .pricing-form__grid,
    .pricing-methods,
    .pricing-modal__summary { grid-template-columns: 1fr; }
    .pricing-payment-card__split { grid-template-columns: 1fr; }
    .pricing-modal { padding: 10px; }
    .pricing-modal__dialog { max-height: calc(100dvh - 20px); border-radius: 20px; }
    .pricing-modal__header,
    .pricing-modal__body,
    .pricing-modal__summary,
    .pricing-modal__alert { padding-left: 16px; padding-right: 16px; }
    .pricing-modal__header { padding-top: 18px; }
    .pricing-payment-card,
    .pricing-modal__form-shell { padding: 16px; border-radius: 18px; }
    .pricing-card { padding: 20px 18px; border-radius: 18px; }
    .pricing-payment-card__header,
    .pricing-modal__form-intro {
      display: grid;
    }
    .pricing-payment-card__row {
      flex-direction: column;
      align-items: stretch;
    }
    .pricing-payment-card__row .pricing-copy-btn { width: 100%; }
    .pricing-section__notice { padding: 16px; }
    .pricing-section__notice-points { gap: 6px; }
  }
  @media (max-width: 560px) {
    .pricing-section__trust-grid { grid-template-columns: 1fr; }
  }
  @media (prefers-reduced-motion: reduce) {
    .pricing-card,
    .pricing-copy-btn,
    .pricing-methods__button,
    .pricing-modal__close,
    .pricing-upload,
    .pricing-card__cta { transition: none; }
    .pricing-card:hover { transform: none; }
  }
  /* â”€â”€ Review section icon overrides â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  .rv-star-picker__btn svg, .rv-star-picker__btn .ui-icon { color: inherit !important; }
  .rv-stars svg, .rv-stars .ui-icon { color: inherit !important; }
  .rv-summary__row svg, .rv-summary__row .ui-icon { color: inherit !important; }

  /* ADMIN DASHBOARD REFRESH */
  .admin-shell {
    --admin-sidebar-expanded: 296px;
    --admin-sidebar-collapsed: 104px;
    --admin-sidebar-current: var(--admin-sidebar-expanded);
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(247,176,91,.12), transparent 28%),
      radial-gradient(circle at top right, rgba(15,27,45,.06), transparent 26%),
      linear-gradient(180deg, #f6f3ed 0%, #f1ede6 100%);
  }
  .admin-shell--collapsed {
    --admin-sidebar-current: var(--admin-sidebar-collapsed);
  }
  .admin-shell__main {
    min-height: 100vh;
    padding-left: var(--admin-sidebar-current);
    transition: padding-left .24s cubic-bezier(.4,0,.2,1);
  }
  .admin-shell .admin-body {
    max-width: 1500px;
    margin: 0 auto;
    padding: 28px 24px 40px;
  }
  .modern-sidebar__overlay {
    position: fixed;
    inset: 0;
    border: 0;
    background: rgba(7,12,22,.5);
    backdrop-filter: blur(7px);
    -webkit-backdrop-filter: blur(7px);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity .24s ease, visibility .24s ease;
    z-index: 220;
  }
  .modern-sidebar__overlay.is-open {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
  .modern-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: var(--admin-sidebar-current);
    padding: 18px 14px;
    z-index: 230;
    transition: width .24s cubic-bezier(.4,0,.2,1), transform .24s cubic-bezier(.4,0,.2,1), opacity .24s ease;
  }
  .modern-sidebar__panel {
    position: relative;
    height: 100%;
    padding: 18px;
    border-radius: 30px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background:
      radial-gradient(circle at top right, rgba(247,176,91,.18), transparent 34%),
      linear-gradient(180deg, rgba(10,18,31,.98) 0%, rgba(15,27,45,.98) 100%);
    color: #fff;
    border: 1px solid rgba(255,255,255,.08);
    box-shadow: 0 30px 70px rgba(15,27,45,.28);
  }
  .modern-sidebar__panel::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(180deg, rgba(255,255,255,.06) 0%, transparent 30%),
      radial-gradient(circle at bottom left, rgba(255,255,255,.05), transparent 24%);
  }
  .modern-sidebar__panel > * {
    position: relative;
    z-index: 1;
  }
  .modern-sidebar__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
  }
  .modern-sidebar__brand-block {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  }
  .modern-sidebar__brand {
    flex-shrink: 0;
  }
  .modern-sidebar__brand-logo .brand-mark {
    height: 56px;
  }
  .modern-sidebar__brand-copy {
    display: grid;
    gap: 3px;
    min-width: 0;
    transition: opacity .2s ease, width .2s ease;
  }
  .modern-sidebar__eyebrow {
    font-size: .68rem;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: rgba(255,255,255,.46);
  }
  .modern-sidebar__title {
    font-size: 1rem;
    color: #fff;
    white-space: nowrap;
  }
  .modern-sidebar__subtitle {
    font-size: .82rem;
    color: rgba(255,255,255,.68);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .modern-sidebar__header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .modern-sidebar__icon-btn {
    width: 40px;
    height: 40px;
    border-radius: 14px;
    border: 1px solid rgba(247,176,91,.16);
    background: linear-gradient(180deg, rgba(247,176,91,.16) 0%, rgba(255,255,255,.06) 100%);
    color: var(--gold-light);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--transition);
  }
  .modern-sidebar__icon-btn:hover {
    background: linear-gradient(180deg, rgba(247,176,91,.26) 0%, rgba(255,255,255,.12) 100%);
    color: #fff;
    transform: translateY(-1px);
  }
  .modern-sidebar__icon-btn:focus-visible,
  .modern-sidebar__item:focus-visible,
  .modern-sidebar__footer-link:focus-visible,
  .admin-page-header__menu:focus-visible,
  .admin-action-trigger:focus-visible,
  .admin-floating-menu__item:focus-visible {
    outline: 3px solid rgba(247,176,91,.3);
    outline-offset: 2px;
  }
  .modern-sidebar__icon-btn--mobile {
    display: none;
  }
  .modern-sidebar__meta {
    margin-bottom: 18px;
  }
  .modern-sidebar__meta-card {
    display: grid;
    gap: 4px;
    padding: 14px;
    border-radius: 20px;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.08);
  }
  .modern-sidebar__meta-label {
    font-size: .7rem;
    text-transform: uppercase;
    letter-spacing: .16em;
    color: rgba(255,255,255,.48);
  }
  .modern-sidebar__meta-card strong {
    font-size: 1rem;
    color: #fff;
  }
  .modern-sidebar__meta-card small {
    color: rgba(255,255,255,.7);
    line-height: 1.55;
  }
  .modern-sidebar__nav {
    display: grid;
    gap: 8px;
    overflow: auto;
    padding-right: 2px;
  }
  .modern-sidebar__item {
    width: 100%;
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: 1px solid transparent;
    border-radius: 20px;
    background: transparent;
    color: rgba(255,255,255,.72);
    font-family: var(--font-body);
    text-align: left;
    cursor: pointer;
    transition: var(--transition);
  }
  .modern-sidebar__item:hover {
    color: #fff;
    border-color: rgba(255,255,255,.08);
    background: rgba(255,255,255,.05);
    transform: translateX(1px);
  }
  .modern-sidebar__item.is-active {
    color: #fff;
    border-color: rgba(247,176,91,.3);
    background: linear-gradient(135deg, rgba(247,176,91,.18), rgba(255,255,255,.08));
    box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
  }
  .modern-sidebar__item-icon {
    width: 42px;
    height: 42px;
    border-radius: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(180deg, rgba(247,176,91,.14) 0%, rgba(255,255,255,.05) 100%);
    border: 1px solid rgba(247,176,91,.18);
    color: rgba(250,203,138,.95);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
  }
  .modern-sidebar__item.is-active .modern-sidebar__item-icon {
    background: linear-gradient(180deg, rgba(247,176,91,.95) 0%, rgba(250,203,138,.88) 100%);
    border-color: rgba(247,176,91,.42);
    color: var(--navy);
  }
  .modern-sidebar__item:hover .modern-sidebar__item-icon {
    color: #fff;
    border-color: rgba(247,176,91,.24);
  }
  .modern-sidebar__item-copy {
    min-width: 0;
    display: grid;
    gap: 3px;
    transition: opacity .2s ease, width .2s ease;
  }
  .modern-sidebar__item-label {
    font-size: .92rem;
    font-weight: 700;
    line-height: 1.2;
  }
  .modern-sidebar__item-description {
    font-size: .75rem;
    color: rgba(255,255,255,.58);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .modern-sidebar__item-badge {
    min-width: 28px;
    height: 28px;
    padding: 0 8px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: .74rem;
    font-weight: 700;
    color: var(--gold-light);
    background: rgba(247,176,91,.15);
    border: 1px solid rgba(247,176,91,.18);
  }
  .modern-sidebar__footer {
    margin-top: auto;
    padding-top: 16px;
  }
  .modern-sidebar__footer-link {
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,.1);
    background: rgba(255,255,255,.05);
    color: #fff;
    font-family: var(--font-body);
    font-size: .9rem;
    font-weight: 700;
    cursor: pointer;
    transition: var(--transition);
  }
  .modern-sidebar__footer-link:hover {
    background: rgba(255,255,255,.1);
    transform: translateY(-1px);
  }
  .admin-shell--collapsed .modern-sidebar__brand-copy,
  .admin-shell--collapsed .modern-sidebar__meta,
  .admin-shell--collapsed .modern-sidebar__item-copy,
  .admin-shell--collapsed .modern-sidebar__item-badge,
  .admin-shell--collapsed .modern-sidebar__footer-link span {
    width: 0;
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
  }
  .admin-shell--collapsed .modern-sidebar__header {
    flex-direction: column;
    align-items: center;
  }
  .admin-shell--collapsed .modern-sidebar__brand-block {
    justify-content: center;
  }
  .admin-shell--collapsed .modern-sidebar__item {
    grid-template-columns: 1fr;
    justify-items: center;
  }
  .admin-shell--collapsed .modern-sidebar__footer-link {
    padding-left: 0;
    padding-right: 0;
  }
  .admin-page-header {
    display: grid;
    gap: 20px;
    padding: 24px;
    border-radius: 32px;
    background: rgba(255,255,255,.78);
    border: 1px solid rgba(15,27,45,.08);
    box-shadow: 0 24px 60px rgba(15,27,45,.08);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
  .admin-page-header__bar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
  }
  .admin-page-header__intro {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    min-width: 0;
  }
  .admin-page-header__menu {
    width: 46px;
    height: 46px;
    border: 1px solid rgba(15,27,45,.08);
    border-radius: 16px;
    background: #fff;
    color: var(--navy);
    display: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 14px 26px rgba(15,27,45,.08);
  }
  .admin-page-header__copy {
    display: grid;
    gap: 6px;
    min-width: 0;
  }
  .admin-page-header__eyebrow {
    margin: 0;
    font-size: .72rem;
    font-weight: 700;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  .admin-page-header__title {
    margin: 0;
    font-family: var(--font-display-alt);
    font-size: clamp(1.7rem, 2.5vw, 2.35rem);
    line-height: 1.05;
    color: var(--navy);
  }
  .admin-page-header__subtitle {
    margin: 0;
    max-width: 54ch;
    color: var(--text-muted);
    line-height: 1.7;
  }
  .admin-page-header__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 12px;
  }
  .admin-page-header__user {
    display: grid;
    gap: 4px;
    min-width: 190px;
    padding: 12px 16px;
    border-radius: 20px;
    background: linear-gradient(180deg, #fff 0%, #f8f6f2 100%);
    border: 1px solid rgba(15,27,45,.08);
    box-shadow: 0 16px 26px rgba(15,27,45,.05);
  }
  .admin-page-header__user-label {
    font-size: .72rem;
    font-weight: 700;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  .admin-page-header__user strong {
    color: var(--navy);
    font-size: 1rem;
  }
  .admin-page-header__back {
    gap: 8px;
    border-radius: 18px;
    align-self: stretch;
  }
  .admin-content {
    display: grid;
    gap: 24px;
    padding-top: 24px;
  }
  .admin-shell .btn--ghost {
    background: rgba(255,255,255,.92);
    color: var(--navy);
    border: 1px solid rgba(15,27,45,.1);
    box-shadow: 0 12px 24px rgba(15,27,45,.05);
  }
  .admin-shell .btn--ghost:hover {
    background: #fff;
    border-color: rgba(15,27,45,.18);
    color: var(--navy);
  }
  .admin-shell .btn--ghost svg,
  .admin-shell .btn--ghost .ui-icon,
  .admin-shell .btn--primary svg,
  .admin-shell .btn--primary .ui-icon,
  .admin-shell .btn--success svg,
  .admin-shell .btn--success .ui-icon,
  .admin-shell .btn--danger svg,
  .admin-shell .btn--danger .ui-icon {
    color: inherit;
  }
  .admin-shell .btn {
    border-radius: 16px;
  }
  .admin-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 0;
  }
  .admin-tabs--surface {
    flex-wrap: wrap;
    padding: 8px;
    border-radius: 24px;
    border: 1px solid rgba(15,27,45,.08);
    background: rgba(244,239,232,.92);
  }
  .admin-tab {
    padding: 12px 16px;
    border-radius: 18px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-muted);
    font-family: var(--font-body);
    font-size: .88rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: none;
  }
  .admin-tab:hover {
    color: var(--navy);
    border-color: rgba(15,27,45,.08);
    background: rgba(255,255,255,.85);
  }
  .admin-tab.active {
    background: var(--navy);
    color: #fff;
    border-color: var(--navy);
    box-shadow: 0 16px 30px rgba(15,27,45,.18);
  }
  .admin-stat-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 0;
  }
  .admin-stat-card {
    background: linear-gradient(180deg, #fff 0%, #fcfbf8 100%);
    border: 1px solid rgba(15,27,45,.08);
    border-radius: 24px;
    padding: 20px 18px;
    box-shadow: 0 18px 32px rgba(15,27,45,.06);
  }
  .admin-stat-card--dashboard {
    min-height: 150px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .admin-stat-card__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }
  .admin-stat-card__icon {
    width: 42px;
    height: 42px;
    border-radius: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(15,27,45,.06);
    color: var(--navy);
  }
  .admin-stat-card__label {
    margin-bottom: 0;
    font-size: .72rem;
    letter-spacing: .12em;
    color: var(--text-muted);
  }
  .admin-stat-card__val {
    margin-top: 12px;
    font-family: var(--font-display-alt);
    font-size: 2rem;
    line-height: 1;
  }
  .admin-stat-card__hint {
    margin-top: 10px;
    font-size: .82rem;
    line-height: 1.55;
    color: var(--text-muted);
  }
  .admin-table__viewport {
    min-width: 0;
  }
  .admin-table {
    background: rgba(255,255,255,.94);
    border: 1px solid rgba(15,27,45,.08);
    border-radius: 30px;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(15,27,45,.08);
  }
  .admin-table-row {
    padding: 16px 20px;
    gap: 12px;
    border-bottom: 1px solid rgba(15,27,45,.08);
  }
  .admin-table-row:last-child {
    border-bottom: none;
  }
  .admin-table-row:hover {
    background: rgba(15,27,45,.03);
  }
  .admin-table-head {
    background: rgba(248,245,239,.95);
    color: var(--text-muted);
  }
  .moderation-row {
    grid-template-columns: 86px minmax(0, 1.7fr) minmax(0, 1fr) 120px minmax(0, .95fr) 136px 82px;
  }
  .moderation-main {
    min-width: 0;
    display: grid;
    gap: 4px;
  }
  .moderation-details {
    display: contents;
  }
  .moderation-title {
    min-width: 0;
    display: block;
    font-size: .88rem;
    font-weight: 600;
    color: var(--navy);
    line-height: 1.4;
  }
  .moderation-location,
  .moderation-author {
    min-width: 0;
    font-size: .82rem;
    color: var(--text-muted);
    line-height: 1.5;
  }
  .moderation-price {
    font-size: .88rem;
    font-weight: 700;
    color: var(--gold);
    white-space: nowrap;
  }
  .moderation-status {
    min-width: 0;
  }
  .drag-row {
    grid-template-columns: 42px 84px minmax(0, 1.8fr) minmax(0, .9fr) auto;
  }
  .drag-title,
  .drag-author {
    min-width: 0;
    line-height: 1.45;
  }
  .drag-title {
    color: var(--navy);
    font-weight: 600;
  }
  .drag-author {
    color: var(--text-muted);
    font-size: .82rem;
  }
  .users-row {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr) 100px 90px 120px 86px 116px 84px;
  }
  .paid-plans-row {
    grid-template-columns: 110px minmax(0, 1.15fr) minmax(0, 1.15fr) 140px 120px 120px 120px;
  }
  .admin-toolbar {
    gap: 10px;
    padding: 18px 20px;
    border-bottom: 1px solid rgba(15,27,45,.08);
    background: linear-gradient(180deg, rgba(255,255,255,.96) 0%, rgba(248,245,239,.95) 100%);
  }
  .admin-toolbar__filters {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .admin-toolbar--moderation,
  .admin-toolbar--reorder {
    justify-content: space-between;
  }
  .admin-toolbar__filters--moderation {
    flex: 1 1 320px;
  }
  .admin-toolbar__filters--reorder {
    flex: 1 1 240px;
  }
  .admin-segmented {
    display: inline-flex;
    align-items: stretch;
    flex-wrap: nowrap;
    min-width: 0;
  }
  .admin-segmented__option {
    min-width: 0;
    white-space: nowrap;
  }
  .admin-toolbar__field {
    flex: 1 1 280px;
    min-width: 0;
  }
  .admin-toolbar__select {
    flex: 0 1 190px;
    min-width: 0;
  }
  .admin-toolbar__label {
    font-weight: 600;
    color: var(--text-muted);
  }
  .admin-shell .auth-input,
  .admin-shell .admin-toolbar select,
  .admin-shell .admin-toolbar input {
    min-height: 46px;
    border-radius: 16px;
    border: 1px solid rgba(15,27,45,.12);
    background: #fff;
    box-shadow: none;
  }
  .admin-empty {
    padding: 68px 24px;
    background: linear-gradient(180deg, rgba(255,255,255,.88), rgba(247,244,238,.94));
  }
  .admin-action-trigger {
    width: 40px;
    height: 40px;
    border: 1px solid rgba(15,27,45,.12);
    border-radius: 14px;
    background: #fff;
    color: var(--navy);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--transition);
    box-shadow: 0 12px 22px rgba(15,27,45,.06);
  }
  .admin-action-trigger:hover {
    background: var(--cream);
    transform: translateY(-1px);
  }
  .admin-floating-menu {
    z-index: 9999;
    min-width: 190px;
    padding: 8px;
    border-radius: 18px;
    background: rgba(255,255,255,.96);
    border: 1px solid rgba(15,27,45,.08);
    box-shadow: 0 24px 60px rgba(15,27,45,.14);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }
  .admin-floating-menu__item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 0;
    border-radius: 12px;
    background: transparent;
    color: var(--navy);
    font-family: var(--font-body);
    font-size: .86rem;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    transition: var(--transition);
  }
  .admin-floating-menu__item:hover:not(:disabled) {
    background: rgba(15,27,45,.06);
  }
  .admin-floating-menu__item:disabled {
    cursor: not-allowed;
    opacity: .5;
  }
  .admin-floating-menu__item--danger {
    color: var(--error);
  }
  .admin-floating-menu__item--success {
    color: #188450;
  }
  .admin-floating-menu__divider {
    height: 1px;
    margin: 6px 0;
    background: rgba(15,27,45,.08);
  }
  .admin-premium-summary {
    padding: 18px 20px;
    border-bottom: 1px solid rgba(15,27,45,.08);
    background: linear-gradient(180deg, rgba(255,255,255,.96) 0%, rgba(248,244,236,.96) 100%);
  }
  .paid-plans-admin {
    gap: 24px;
  }
  .paid-plans-admin__stats {
    gap: 16px;
  }
  .paid-plans-admin__boards {
    gap: 10px;
  }
  @media (min-width: 901px) {
    .modern-sidebar__overlay {
      display: none;
    }
  }
  @media (max-width: 1320px) {
    .admin-stat-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  @media (max-width: 1120px) {
    .admin-table {
      overflow-x: auto;
    }
    .admin-table--moderation,
    .admin-table--reorder {
      overflow: hidden;
    }
    .admin-table__viewport--moderation,
    .admin-table__viewport--reorder {
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-x: contain;
    }
    .moderation-row {
      min-width: 860px;
    }
    .users-row {
      min-width: 980px;
    }
    .drag-row {
      min-width: 680px;
    }
    .paid-plans-row {
      min-width: 920px;
    }
    .premium-row {
      min-width: 1080px;
    }
  }
  @media (max-width: 900px) {
    .admin-shell__main {
      padding-left: 0;
    }
    .modern-sidebar {
      width: min(88vw, 340px);
      padding: 10px;
      transform: translateX(-108%);
      opacity: 0;
      pointer-events: none;
    }
    .modern-sidebar.is-collapsed {
      width: min(88vw, 340px);
    }
    .modern-sidebar.is-mobile-open {
      transform: translateX(0);
      opacity: 1;
      pointer-events: auto;
    }
    .modern-sidebar__icon-btn--desktop {
      display: none;
    }
    .modern-sidebar__icon-btn--mobile {
      display: inline-flex;
    }
    .admin-page-header__menu {
      display: inline-flex;
    }
    .admin-page-header__bar {
      flex-direction: column;
    }
    .admin-page-header__actions {
      width: 100%;
      justify-content: space-between;
    }
    .admin-tabs--surface {
      flex-wrap: nowrap;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .admin-tabs--surface::-webkit-scrollbar {
      display: none;
    }
    .admin-tabs--surface .admin-tab {
      flex: 0 0 auto;
      white-space: nowrap;
    }
  }
  @media (max-width: 760px) {
    .admin-shell .admin-body {
      padding: 16px 12px 28px;
    }
    .admin-page-header {
      padding: 18px;
      border-radius: 24px;
    }
    .admin-page-header__actions {
      align-items: stretch;
    }
    .admin-page-header__user,
    .admin-page-header__back {
      width: 100%;
      justify-content: center;
    }
    .admin-stat-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .admin-stat-card--dashboard {
      min-height: 0;
    }
    .admin-toolbar {
      padding: 16px;
    }
    .admin-toolbar--moderation,
    .admin-toolbar--reorder {
      align-items: stretch;
    }
    .admin-toolbar .btn,
    .admin-toolbar__field,
    .admin-toolbar__select,
    .admin-toolbar__filters {
      width: 100%;
    }
    .admin-toolbar--moderation .admin-toolbar__field,
    .admin-toolbar--reorder .admin-toolbar__field {
      max-width: none !important;
    }
    .admin-segmented {
      width: 100%;
    }
    .admin-segmented__option {
      flex: 1 1 50%;
      justify-content: center;
    }
    .admin-toolbar__label {
      width: 100%;
    }
    .admin-empty {
      padding: 44px 18px;
    }
    .paid-plans-admin__stats {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 600px) {
    .admin-shell .admin-body {
      padding: 12px 10px 24px;
    }
    .admin-content {
      gap: 18px;
      padding-top: 18px;
    }
    .admin-stat-grid {
      grid-template-columns: 1fr;
    }
    .admin-table {
      border-radius: 22px;
      overflow: visible;
    }
    .admin-table__viewport--moderation,
    .admin-table__viewport--reorder {
      overflow: visible;
    }
    .admin-table--moderation .moderation-row,
    .admin-table--reorder .drag-row {
      min-width: 0;
    }
    .admin-table-head.moderation-row {
      display: none;
    }
    .admin-table--moderation .moderation-row {
      grid-template-columns: minmax(0, 1fr) auto;
      grid-template-areas:
        "id actions"
        "title actions"
        "meta meta";
      gap: 7px 12px;
      padding: 16px;
      align-items: start;
    }
    .admin-table--moderation .moderation-id {
      grid-area: id;
      font-size: .78rem;
    }
    .admin-table--moderation .moderation-main {
      grid-area: title;
      gap: 6px;
    }
    .admin-table--moderation .moderation-details {
      grid-area: meta;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px 10px;
      min-width: 0;
    }
    .admin-table--moderation .moderation-title {
      font-size: .92rem;
      white-space: normal;
      overflow-wrap: anywhere;
    }
    .admin-table--moderation .moderation-location {
      flex: 1 1 100%;
      font-size: .8rem;
      white-space: normal;
      overflow-wrap: anywhere;
    }
    .admin-table--moderation .moderation-price {
      order: 1;
      font-size: .92rem;
      padding: 4px 9px;
      border-radius: 999px;
      background: rgba(247,176,91,.12);
      border: 1px solid rgba(247,176,91,.16);
    }
    .admin-table--moderation .moderation-author {
      order: 2;
      flex: 1 1 140px;
      font-size: .78rem;
      white-space: normal;
      overflow-wrap: anywhere;
    }
    .admin-table--moderation .moderation-status {
      order: 3;
    }
    .admin-table--moderation .moderation-actions {
      grid-area: actions;
      align-self: start;
      justify-self: end;
    }
    .admin-table--moderation .admin-action-trigger {
      min-width: 42px;
      min-height: 42px;
    }
    .admin-table--moderation .admin-premium-chip {
      width: fit-content;
      max-width: 100%;
    }
    .admin-table--reorder .drag-row {
      grid-template-columns: auto minmax(0, 1fr) auto;
      grid-template-areas:
        "order id actions"
        "title title actions"
        "author author actions";
      gap: 7px 10px;
      padding: 16px;
      align-items: start;
    }
    .admin-table--reorder .drag-order {
      grid-area: order;
      align-self: center;
    }
    .admin-table--reorder .drag-id {
      grid-area: id;
      align-self: center;
      white-space: nowrap;
    }
    .admin-table--reorder .drag-title {
      grid-area: title;
      font-size: .92rem;
      font-weight: 700;
      white-space: normal;
      overflow-wrap: anywhere;
    }
    .admin-table--reorder .drag-author {
      grid-area: author;
      display: block;
      font-size: .78rem;
      white-space: normal;
      overflow-wrap: anywhere;
    }
    .admin-table--reorder .drag-actions {
      grid-area: actions;
      justify-self: end;
      align-self: center;
    }
    .admin-table--reorder .drag-id-edit {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
      justify-items: stretch;
      width: min(100%, 126px);
    }
    .admin-table--reorder .drag-id-input {
      grid-column: 1 / -1;
      width: 100%;
      min-width: 0;
      padding: 8px 10px;
    }
    .admin-table--reorder .drag-id-btn {
      min-height: 36px;
      padding: 0 !important;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .admin-toolbar--reorder .admin-segmented--experience {
      flex-direction: column;
      gap: 8px;
    }
    .admin-toolbar--reorder .admin-segmented__option {
      width: 100%;
      border-radius: 16px !important;
    }
    .admin-page-header {
      padding: 16px;
      gap: 16px;
    }
    .admin-page-header__title {
      font-size: 1.45rem;
    }
    .admin-page-header__subtitle {
      font-size: .88rem;
      line-height: 1.6;
    }
    .admin-table-head.paid-plans-row {
      display: none;
    }
    .admin-table .paid-plans-row {
      min-width: 0;
      grid-template-columns: 1fr auto;
      grid-template-rows: auto auto auto auto;
      gap: 8px 12px;
      padding: 16px;
    }
    .paid-plans-row > span:nth-child(1) {
      grid-column: 1;
      grid-row: 1;
    }
    .paid-plans-row > span:nth-child(2) {
      grid-column: 1 / -1;
      grid-row: 2;
    }
    .paid-plans-row > span:nth-child(3) {
      grid-column: 1 / -1;
      grid-row: 3;
    }
    .paid-plans-row > span:nth-child(4) {
      grid-column: 1;
      grid-row: 4;
    }
    .paid-plans-row > span:nth-child(5) {
      grid-column: 2;
      grid-row: 1;
      justify-self: end;
    }
    .paid-plans-row > span:nth-child(6) {
      grid-column: 2;
      grid-row: 2;
      justify-self: end;
    }
    .paid-plans-row__actions {
      grid-column: 2;
      grid-row: 4;
      justify-content: flex-end;
    }
  }
  @media (max-width: 430px) {
    .admin-tabs--surface {
      padding: 6px;
      border-radius: 20px;
    }
    .admin-tab {
      padding: 10px 14px;
      font-size: .82rem;
    }
    .admin-stat-card {
      padding: 16px 15px;
      border-radius: 20px;
    }
    .admin-stat-card__val {
      font-size: 1.75rem;
    }
    .admin-toolbar {
      padding: 14px;
    }
    .admin-table--moderation .moderation-details {
      gap: 7px 8px;
    }
    .admin-table--moderation .moderation-price {
      font-size: .84rem;
    }
    .admin-table--moderation .moderation-author,
    .admin-table--moderation .moderation-location {
      font-size: .76rem;
    }
    .admin-table-row {
      padding-left: 14px;
      padding-right: 14px;
    }
    .admin-empty {
      padding: 36px 14px;
    }
  }
`;



export default CSS;
