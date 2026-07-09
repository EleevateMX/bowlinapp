# 📦 Empaquetar StrikeLab MX para iOS (Xcode)

Guía paso a paso para convertir la PWA en una app de iOS con Capacitor y
abrirla en Xcode. **Todo esto se hace en una Mac** (Xcode solo existe en macOS).

---

## 0. Prerrequisitos (una sola vez)

- **macOS** con **Xcode** instalado (App Store) y abierto al menos una vez para
  aceptar la licencia.
- **CocoaPods**: `sudo gem install cocoapods` (o `brew install cocoapods`).
- **Node 18+** y el repo clonado.
- Una **cuenta de Apple Developer** (gratis para probar en tu iPhone; de pago
  $99/año para publicar en la App Store).

```bash
# Verifica que todo esté listo
xcodebuild -version
pod --version
node --version
```

---

## 1. Instalar dependencias y compilar el web

```bash
cd bowlinapp
npm install
npm run build        # genera dist/, que es lo que Capacitor empaqueta
```

> La app corre en **modo demo** sin `.env` (partidas locales), así que puedes
> empaquetar y probar en el iPhone sin backend. Para datos reales, llena `.env`
> antes del `npm run build`.

---

## 2. Crear el proyecto iOS (una sola vez)

```bash
npx cap add ios      # crea la carpeta ios/ y corre pod install
```

Esto genera el proyecto Xcode en `ios/App/App.xcworkspace`.

---

## 3. Generar íconos y splash desde el logo

Los recursos fuente ya están en `resources/` (`icon.png` 1024×1024,
`splash.png` y `splash-dark.png` 2732×2732). Genera todos los tamaños de iOS:

```bash
npm install -D @capacitor/assets
npx capacitor-assets generate --ios
```

Esto llena el `AppIcon.appiconset` y el `LaunchScreen` con tu logo.

---

## 4. Sincronizar y abrir en Xcode

```bash
npm run build        # cada vez que cambies el código web
npx cap sync ios     # copia dist/ + plugins al proyecto iOS
npx cap open ios     # abre Xcode
```

En Xcode:

1. Selecciona el proyecto **App** en el panel izquierdo.
2. En **Signing & Capabilities**, elige tu **Team** (tu cuenta de Apple).
   Xcode firma la app automáticamente.
3. Arriba, elige un **simulador** (p. ej. iPhone 15) o tu **iPhone conectado**.
4. Pulsa **▶︎ Run**.

La app se instala y arranca. 🎳

---

## 5. Bucle de desarrollo

Cada vez que cambies algo del código web:

```bash
npm run build && npx cap sync ios
```

Luego vuelve a Xcode y pulsa ▶︎. (No necesitas repetir `cap add`.)

---

## Datos del proyecto

| Campo | Valor |
|---|---|
| App ID (bundle) | `mx.strikelab.app` |
| Nombre | StrikeLab |
| Orientación | Vertical |
| Color de fondo / splash | `#0a0e1a` |
| Config | `capacitor.config.ts` |

---

## Notas

- **`ios/` no se versiona** (está en `.gitignore`): se regenera con
  `npx cap add ios`. Si prefieres commitearlo (recomendado para equipos),
  quita `ios/` del `.gitignore`.
- **Barra de estado y splash** ya están integrados en el código
  (`src/lib/native.ts`) y se adaptan al tema claro/oscuro.
- **Safe areas** (notch / home indicator) se respetan vía
  `viewport-fit=cover` y `env(safe-area-inset-*)` en el CSS.
- Para **publicar en la App Store**: en Xcode, Product → Archive, y sigue el
  asistente de distribución (requiere cuenta de pago y una ficha en App Store
  Connect).
