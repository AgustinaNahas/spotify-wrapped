# 📊 Configuración de Google Analytics

Esta aplicación está configurada para usar Google Analytics 4 (GA4) para rastrear el uso de la aplicación.

## 🚀 Pasos para configurar

### 1. Crear una cuenta de Google Analytics

1. Ve a [Google Analytics](https://analytics.google.com/)
2. Crea una cuenta si no tienes una
3. Crea una nueva propiedad (Property)
4. Selecciona **Google Analytics 4** (GA4)

### 2. Obtener tu ID de medición

1. En tu propiedad de GA4, ve a **Administración** (engranaje abajo a la izquierda)
2. En la columna **Propiedad**, haz clic en **Flujos de datos**
3. Haz clic en tu flujo de datos web
4. Copia tu **ID de medición** (formato: `G-XXXXXXXXXX`)

### 3. Configurar la variable de entorno

1. Crea un archivo `.env.local` en la raíz del proyecto (si no existe)
2. Agrega tu ID de Google Analytics:

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**Ejemplo:**
```bash
NEXT_PUBLIC_GA_ID=G-ABC123XYZ789
```

### 4. Para producción (GitHub Pages)

Si estás usando GitHub Pages, necesitas configurar la variable de entorno en tu repositorio:

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Agrega una nueva variable de repositorio:
   - **Name:** `NEXT_PUBLIC_GA_ID`
   - **Value:** Tu ID de Google Analytics (ej: `G-ABC123XYZ789`)

### 5. Verificar que funciona

1. Ejecuta la aplicación: `npm run dev`
2. Abre la aplicación en tu navegador
3. Abre las herramientas de desarrollador (F12)
4. Ve a la pestaña **Network** y busca peticiones a `google-analytics.com` o `googletagmanager.com`
5. También puedes verificar en Google Analytics → Tiempo real → Visitas en tiempo real

## 📝 Notas importantes

- **Privacidad:** Google Analytics solo rastrea métricas de uso (páginas visitadas, tiempo en página, etc.)
- **No se envían datos personales:** Los datos de Spotify que suben los usuarios se procesan solo en su navegador
- **Desarrollo local:** En desarrollo, Analytics solo funcionará si tienes configurado `NEXT_PUBLIC_GA_ID` en `.env.local`
- **Producción:** Asegúrate de configurar la variable de entorno en tu plataforma de hosting

## 🔍 Qué se rastrea

- Páginas visitadas
- Tiempo en la página
- Eventos de interacción (clics en botones)
- Dispositivos y navegadores utilizados
- Ubicación geográfica (país/ciudad, no dirección exacta)

## 🛠️ Desactivar Analytics

Si no quieres usar Google Analytics, simplemente no configures la variable `NEXT_PUBLIC_GA_ID`. El componente de Analytics detectará automáticamente que no está configurado y no cargará los scripts.

