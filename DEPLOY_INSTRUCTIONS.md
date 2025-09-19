# 🚀 Instrucciones de Deploy a GitHub Pages

## ⚠️ Configuración necesaria en GitHub

Para que el deploy funcione correctamente, necesitas configurar los permisos en tu repositorio:

### 1. Habilitar GitHub Pages
1. Ve a tu repositorio en GitHub
2. Ve a **Settings** → **Pages**
3. En **Source**, selecciona **"GitHub Actions"**
4. Guarda los cambios

### 2. Configurar permisos del repositorio
1. Ve a **Settings** → **Actions** → **General**
2. En la sección **"Workflow permissions"**:
   - Selecciona **"Read and write permissions"**
   - Marca la casilla **"Allow GitHub Actions to create and approve pull requests"**
3. Guarda los cambios

### 3. Verificar el environment
1. Ve a **Settings** → **Environments**
2. Deberías ver un environment llamado **"github-pages"**
3. Si no existe, se creará automáticamente en el primer deploy

## 🔧 Solución de problemas

### Error: "Permission denied to github-actions[bot]"
- **Causa:** Permisos insuficientes del workflow
- **Solución:** Seguir los pasos 1 y 2 arriba

### Error: "Environment not found"
- **Causa:** El environment github-pages no existe
- **Solución:** Se crea automáticamente, pero puedes crearlo manualmente en Settings → Environments

### Error: "Pages build failed"
- **Causa:** Error en el build de Next.js
- **Solución:** Verificar que el código compile localmente con `npm run build`

## ✅ Verificación del deploy

Una vez configurado correctamente:

1. Haz push a la rama `main`
2. Ve a **Actions** en tu repositorio
3. Verifica que el workflow se ejecute sin errores
4. Tu aplicación estará disponible en: `https://tu-usuario.github.io/spotify/`

## 📝 Notas importantes

- El deploy solo se ejecuta en pushes a la rama `main`
- Los archivos se generan en la carpeta `out/`
- La aplicación funciona completamente en el cliente (no requiere servidor)
- Todos los datos se procesan localmente en el navegador del usuario
