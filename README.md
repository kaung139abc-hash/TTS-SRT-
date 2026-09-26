# FloatDesk - Phone Taskbar & Floating Window OS

FloatDesk is a mobile-optimized Floating Window Multi-Tasking OS & Taskbar Launcher with full support for Android phone deep links, taskbar permission manager, touch-resizable windows, and phone app shortcuts.

---

## 📁 App Production Build Files (တည်ဆောက်ထားသော ဖိုင်များ)

This repository includes the complete compiled production build inside the **`dist/`** folder:
- **`dist/index.html`** - Main HTML entry point
- **`dist/assets/`** - Bundled JavaScript & CSS production files

You can host the **`dist/`** folder directly on **GitHub Pages**, **Vercel**, **Netlify**, or **Cloudflare Pages**.

---

## 📱 Features (ပါဝင်သော စနစ်များ)

1. **🛡️ Taskbar Required Permissions Manager**:
   - `SYSTEM_ALERT_WINDOW` (Display over other apps)
   - `BIND_ACCESSIBILITY_SERVICE` (Accessibility navigation controls)
   - `PACKAGE_USAGE_STATS` (Usage access for running app indicators)
   - Battery optimization whitelist (Unrestricted background running)
   - Xiaomi HyperOS / MIUI "Display pop-up windows in background" guide
   - Samsung One UI, Oppo ColorOS, Vivo FuntouchOS brand setup guides
   - ADB commands & Shizuku (No-PC) guide

2. **🪟 Freeform Floating Windows**:
   - Movable touch drag bar with pointer capture
   - Touch-friendly resize corner (Bottom-Right)
   - Quick size preset toggles (S / M / L / Max)
   - Always-on-top Pin & Opacity sliders (30% - 100%)

3. **📱 40+ Pre-Configured Phone Apps**:
   - Phone Dialer, SMS Messages, Contacts, Settings, Wi-Fi, Files
   - Google Suite (Play Store, Chrome, YouTube, Gmail, Maps, Drive, Photos)
   - Myanmar Banking (KBZPay, WavePay, AYA Pay, CB Pay)
   - Social (Facebook, TikTok, Telegram, Viber, WhatsApp, Instagram, Discord)
   - Camera & Gallery, Audio Music Player, Calculator, Clock, Notes, Tasks

---

## 🚀 How to Run Locally (စက်ထဲတွင် Run နည်း)

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production (outputs to dist/)
npm run build
```
