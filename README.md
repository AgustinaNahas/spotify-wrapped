# 🎵 Spotify Stats Analyzer

Una aplicación web moderna construida con Next.js que te permite analizar tu historial de reproducción de Spotify de manera visual e interactiva.

## 🚀 Características

- **Interfaz moderna**: Diseño inspirado en Spotify con colores y estilos característicos
- **Drag & Drop**: Arrastra y suelta múltiples archivos JSON de historial
- **Estadísticas completas**: 
  - Tiempo total de escucha
  - Canciones y artistas más reproducidos
  - Análisis por día de la semana y mes
  - Días con más actividad musical
- **Responsive**: Funciona perfectamente en desktop y móvil
- **Procesamiento rápido**: Todo se procesa en el cliente sin enviar datos a servidores

## 📋 Requisitos

- Node.js 18+ 
- npm o yarn

## 🛠️ Instalación

1. Clona o descarga este proyecto
2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta la aplicación en modo desarrollo:
```bash
npm run dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## 📁 Cómo obtener tus archivos de Spotify

1. Ve a [Spotify Privacy Settings](https://www.spotify.com/account/privacy/)
2. Solicita una copia de tus datos
3. Descarga el archivo ZIP que te envían por email
4. Extrae el archivo y busca los archivos `StreamingHistory_music_*.json`
5. Sube estos archivos a la aplicación

## 🎯 Uso

1. Abre la aplicación web
2. Arrastra y suelta tus archivos `StreamingHistory_music_*.json` en el área designada
3. ¡Disfruta explorando tus estadísticas de música!

## 🏗️ Construcción para producción

### Desarrollo local:
```bash
npm run build
npm start
```

### Deploy a GitHub Pages:
```bash
npm run deploy
```

## 🚀 Deploy automático a GitHub Pages

La aplicación está configurada para deploy automático a GitHub Pages:

1. **Haz fork** de este repositorio
2. **Habilita GitHub Pages** en tu repositorio:
   - Ve a Settings → Pages
   - Source: "GitHub Actions"
3. **Haz push** a la rama `main` y el deploy se ejecutará automáticamente
4. **Tu aplicación estará disponible** en: `https://tu-usuario.github.io/spotify/`

### Deploy manual:
```bash
# Clona el repositorio
git clone https://github.com/tu-usuario/spotify.git
cd spotify

# Instala dependencias
npm install

# Construye para producción
npm run build

# Los archivos estáticos estarán en la carpeta 'out'
```

## 🛡️ Privacidad

- **Todos los datos se procesan localmente** en tu navegador
- **No se envían datos a ningún servidor**
- **No se almacenan archivos** en ningún lugar
- **Procesamiento 100% privado**

## 🎨 Tecnologías utilizadas

- **Next.js 14** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos modernos
- **React Dropzone** - Subida de archivos drag & drop

## 📊 Estadísticas incluidas

- ⏱️ **Tiempo total de escucha** (horas y minutos)
- 🎵 **Top 10 canciones más reproducidas**
- 🎤 **Top 10 artistas por cantidad de canciones únicas**
- ⏰ **Top 10 artistas por tiempo total de escucha**
- 📅 **Top 10 días con más actividad musical**
- 📊 **Distribución por día de la semana**
- 📈 **Distribución por mes**
- ⏭️ **Análisis de canciones salteadas** (menos de 20 segundos)
  - Total de canciones salteadas
  - Tasa de salto (porcentaje)
  - Top 10 canciones más salteadas
  - Top 10 artistas más salteados

## 🌐 Demo en vivo

Puedes ver una demo de la aplicación en: [https://tu-usuario.github.io/spotify/](https://tu-usuario.github.io/spotify/)

## 📝 Notas sobre GitHub Pages

- La aplicación funciona completamente en el cliente (no requiere servidor)
- Todos los archivos se generan como HTML/CSS/JS estáticos
- Compatible con GitHub Pages y cualquier hosting estático
- Los datos de Spotify nunca salen de tu navegador

¡Disfruta explorando tu música! 🎶
