# 📦 StrikeLab MX en Xcode → subir build (TestFlight / App Store)

**El proyecto iOS ya está armado y versionado en `ios/`** — con el ícono y el
splash de StrikeLab, bundle id `mx.strikelab.app`, orientación vertical y la
declaración de cifrado lista. Solo falta lo que **obliga a macOS**: `pod
install`, firmar y subir desde Xcode.

---

## 0. Prerrequisitos (una vez)

- **macOS** + **Xcode** (App Store), abierto una vez para aceptar la licencia.
- **CocoaPods**: `sudo gem install cocoapods`.
- **Node 18+**.
- **Cuenta de Apple Developer de PAGO** ($99 USD/año) — obligatoria para subir a
  TestFlight/App Store. (La cuenta gratis solo instala en tu propio iPhone, no
  permite subir builds.)

```bash
xcodebuild -version && pod --version && node --version
```

---

## 1. Preparar y abrir (en tu Mac)

```bash
cd bowlinapp
npm install
npm run build          # genera dist/ (lo que se empaqueta)
npx cap sync ios       # copia dist/ al proyecto + corre pod install
npx cap open ios       # abre Xcode (App.xcworkspace)
```

> No necesitas `npx cap add ios`: el proyecto ya existe. `cap sync` regenera los
> assets web y la config, y hace `pod install`.

La app corre en **modo demo** sin `.env` (partidas locales) — perfecto para
probar en TestFlight sin backend. Para datos reales, llena `.env` antes del
`npm run build`.

---

## 2. Firmar

En Xcode → selecciona el proyecto **App** → pestaña **Signing & Capabilities**:

1. Marca **Automatically manage signing**.
2. En **Team**, elige tu cuenta de Apple Developer.
3. Xcode genera el perfil de firma solo. El **Bundle Identifier** debe quedar
   `mx.strikelab.app`.

---

## 3. Probar (simulador o iPhone)

Elige un simulador (iPhone 15) o tu iPhone conectado → pulsa **▶︎ Run**.

---

## 4. Crear la app en App Store Connect (una vez)

En [appstoreconnect.apple.com](https://appstoreconnect.apple.com) →
**Mis Apps → +** → Nueva App:

- **Plataforma**: iOS
- **Nombre**: StrikeLab (o "StrikeLab MX" si "StrikeLab" está tomado)
- **Idioma principal**: Español (México)
- **Bundle ID**: `mx.strikelab.app` (debe existir en Certificates, Identifiers &
  Profiles; Xcode lo registra al firmar, o créalo ahí)
- **SKU**: `strikelab-mx` (interno, el que quieras)

---

## 5. Subir el build (archive → upload)

En Xcode:

1. Arriba, cambia el destino a **Any iOS Device (arm64)**.
2. Menú **Product → Archive** (compila la versión de distribución).
3. Al terminar se abre el **Organizer** → botón **Distribute App** →
   **App Store Connect → Upload** → siguiente hasta el final.
4. En unos minutos el build aparece en App Store Connect → pestaña **TestFlight**.

**Eso es el "sandbox":** desde TestFlight puedes instalarlo en tu iPhone
(prueba interna) sin publicarlo al público todavía.

---

## ⚠️ Importante antes de VENDER suscripciones en iOS

Apple **exige In-App Purchase** para contenido digital (los planes Plus/Pro).
**No se permite cobrar suscripciones digitales con Stripe dentro de la app de
iOS** — la rechazan en revisión.

Para el build de TestFlight/sandbox no hay problema (pruebas internas). Pero
antes de publicar al público, hay que **implementar Apple IAP** para los planes
en iOS (Stripe se queda para la web). Cuando llegues ahí, avísame y lo montamos
con el plugin de compras de Capacitor.

---

## 6. Bucle de desarrollo

Cada cambio del código web:

```bash
npm run build && npx cap sync ios
```

Luego en Xcode: ▶︎ Run, o Archive para subir un nuevo build. Sube el número de
build en **App → General → Identity → Build** antes de cada Archive nuevo.

---

## Datos del proyecto

| Campo | Valor |
|---|---|
| Bundle ID | `mx.strikelab.app` |
| Display name | StrikeLab |
| Versión / Build | `1.0` / `1` (súbelos para cada upload) |
| Orientación | Vertical (iPhone) |
| Fondo / splash | `#0a0e1a` |
| Cifrado | Exento declarado (`ITSAppUsesNonExemptEncryption=false`) |
