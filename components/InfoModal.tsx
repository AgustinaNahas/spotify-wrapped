'use client'

import { useEffect } from 'react'

interface InfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  // Cerrar con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeInUp"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-spotify-green/20 to-green-500/10 border-b border-white/10 p-6 flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center">
              <span className="text-xl">ℹ️</span>
            </div>
            <h2 className="text-2xl font-bold text-spotify-green">
              Cómo obtener tus datos de Spotify
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors duration-200 text-gray-400 hover:text-white"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6 sm:p-8">
          <div className="space-y-8">
            {/* Introducción */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-spotify-green mb-3 flex items-center">
                <span className="text-2xl mr-2">📋</span>
                Introducción
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Para analizar tus estadísticas de escucha, necesitas descargar tu historial de reproducción de Spotify. 
                Este proceso es completamente seguro y tus datos se procesan solo en tu navegador, sin enviarse a ningún servidor.
              </p>
            </div>

            {/* Paso 1 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <h3 className="text-xl font-bold text-white">Accede a tu cuenta de Spotify</h3>
              </div>
              <div className="ml-12 sm:ml-14 bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  Ve a la página de <strong className="text-spotify-green">Privacidad de Spotify</strong> en tu navegador:
                </p>
                <div className="bg-black/50 rounded-lg p-4 border border-spotify-green/30">
                  <code className="text-spotify-green break-all">
                    https://www.spotify.com/account/privacy/
                  </code>
                </div>
                <p className="text-gray-400 text-sm">
                  💡 <strong>Nota:</strong> Debes estar logueado con tu cuenta de Spotify para acceder a esta sección.
                </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <h3 className="text-xl font-bold text-white">Solicita tu historial de reproducción</h3>
              </div>
              <div className="ml-12 sm:ml-14 bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  En la sección <strong className="text-spotify-green">"Datos de tu cuenta"</strong>, busca la opción:
                </p>
                <div className="bg-gradient-to-r from-spotify-green/20 to-green-500/10 rounded-lg p-4 border border-spotify-green/30">
                  <p className="text-spotify-green font-semibold text-lg mb-2">
                    📥 "Descargar tus datos"
                  </p>
                  <p className="text-gray-300 text-sm">
                    O busca específicamente: <strong>"Historial de reproducción"</strong> o <strong>"Streaming History"</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <h3 className="text-xl font-bold text-white">Selecciona el rango de tiempo</h3>
              </div>
              <div className="ml-12 sm:ml-14 bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  Cuando solicites la descarga, Spotify te permitirá elegir el período de tiempo. Para obtener estadísticas completas:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  <li>Selecciona <strong className="text-spotify-green">"Último año"</strong> o el rango más amplio disponible</li>
                  <li>O selecciona <strong className="text-spotify-green">"Todo el historial"</strong> si está disponible</li>
                  <li>Asegúrate de incluir el <strong className="text-spotify-green">historial de música</strong> (no solo podcasts)</li>
                </ul>
              </div>
            </div>

            {/* Paso 4 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center font-bold text-lg">
                  4
                </div>
                <h3 className="text-xl font-bold text-white">Confirma la solicitud de datos</h3>
              </div>
              <div className="ml-12 sm:ml-14 bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  Después de seleccionar el rango de tiempo y los datos que deseas descargar, Spotify te pedirá que confirmes la solicitud:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-gray-300 ml-4">
                  <li>Revisa que el rango de tiempo seleccionado sea correcto</li>
                  <li>Verifica que hayas seleccionado el <strong className="text-spotify-green">historial de reproducción de música</strong></li>
                  <li>Confirma tu dirección de correo electrónico donde recibirás la notificación</li>
                  <li>Haz clic en el botón <strong className="text-spotify-green">"Solicitar"</strong> o <strong className="text-spotify-green">"Confirmar solicitud"</strong></li>
                </ol>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mt-4">
                  <p className="text-green-300 text-sm">
                    ✅ <strong>Confirmación:</strong> Después de confirmar, verás un mensaje indicando que tu solicitud ha sido recibida. Spotify te enviará un email cuando tus datos estén listos.
                  </p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
                  <p className="text-yellow-300 text-sm">
                    ⚠️ <strong>Importante:</strong> El proceso puede tardar entre 1 y 30 días. Asegúrate de revisar tu correo regularmente, incluyendo la carpeta de spam.
                  </p>
                </div>
              </div>
            </div>

            {/* Paso 5 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center font-bold text-lg">
                  5
                </div>
                <h3 className="text-xl font-bold text-white">Descarga el archivo ZIP</h3>
              </div>
              <div className="ml-12 sm:ml-14 bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  Una vez que Spotify procese tu solicitud, recibirás un email con el enlace de descarga:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-gray-300 ml-4">
                  <li>Revisa tu correo electrónico asociado a Spotify</li>
                  <li>Busca el email de <strong className="text-spotify-green">"Tus datos de Spotify están listos"</strong></li>
                  <li>Haz clic en el enlace de descarga</li>
                  <li>Descarga el archivo <code className="bg-black/50 px-2 py-1 rounded text-spotify-green">my_spotify_data.zip</code></li>
                </ol>
              </div>
            </div>

            {/* Paso 6 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center font-bold text-lg">
                  6
                </div>
                <h3 className="text-xl font-bold text-white">Extrae y sube los archivos</h3>
              </div>
              <div className="ml-12 sm:ml-14 bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
                <p className="text-gray-300 leading-relaxed mb-4">
                  Después de descargar el ZIP, necesitas extraerlo y encontrar los archivos correctos:
                </p>
                <div className="space-y-3">
                  <div className="bg-black/50 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-300 mb-2"><strong className="text-spotify-green">1. Extrae el ZIP:</strong></p>
                    <p className="text-gray-400 text-sm ml-4">Haz clic derecho en el archivo → "Extraer todo" o usa un programa como WinRAR, 7-Zip, etc.</p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-300 mb-2"><strong className="text-spotify-green">2. Busca estos archivos:</strong></p>
                    <div className="ml-4 space-y-1 text-sm text-gray-400">
                      <p>📁 <code className="bg-black/50 px-2 py-1 rounded">StreamingHistory_music_0.json</code></p>
                      <p>📁 <code className="bg-black/50 px-2 py-1 rounded">StreamingHistory_music_1.json</code></p>
                      <p>📁 <code className="bg-black/50 px-2 py-1 rounded">StreamingHistory_music_2.json</code></p>
                      <p className="text-gray-500 text-xs mt-2">(Puede haber más archivos numerados)</p>
                    </div>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-white/10">
                    <p className="text-gray-300 mb-2"><strong className="text-spotify-green">3. Opciones para subir:</strong></p>
                    <ul className="ml-4 space-y-2 text-sm text-gray-400">
                      <li>✅ <strong>Opción A:</strong> Sube el archivo ZIP completo directamente</li>
                      <li>✅ <strong>Opción B:</strong> Sube los archivos JSON individuales (todos los StreamingHistory_music_*.json)</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mt-4">
                  <p className="text-green-300 text-sm">
                    ✅ <strong>Tip:</strong> Es más fácil subir el ZIP completo. La aplicación lo procesará automáticamente.
                  </p>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-bold text-purple-400 mb-3 flex items-center">
                <span className="text-xl mr-2">💡</span>
                Información adicional
              </h3>
              <div className="space-y-3 text-gray-300 text-sm">
                <p>
                  <strong className="text-purple-400">⏱️ Tiempo de procesamiento:</strong> Spotify puede tardar entre 1 y 30 días en preparar tus datos.
                </p>
                <p>
                  <strong className="text-purple-400">🔒 Privacidad:</strong> Todos los datos se procesan localmente en tu navegador. No se envían a ningún servidor.
                </p>
                <p>
                  <strong className="text-purple-400">📊 Datos incluidos:</strong> El historial incluye todas las canciones que has escuchado, con fecha, hora y duración de reproducción.
                </p>
                <p>
                  <strong className="text-purple-400">🎵 Formato:</strong> Los archivos están en formato JSON, que es un formato estándar de datos.
                </p>
              </div>
            </div>

            {/* Enlaces útiles */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-spotify-green mb-4 flex items-center">
                <span className="text-xl mr-2">🔗</span>
                Enlaces útiles
              </h3>
              <div className="space-y-2">
                <a 
                  href="https://www.spotify.com/account/privacy/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-spotify-green hover:text-green-400 transition-colors duration-200"
                >
                  <span>→</span>
                  <span>Página de Privacidad de Spotify</span>
                </a>
                <a 
                  href="https://support.spotify.com/article/understanding-my-data/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-spotify-green hover:text-green-400 transition-colors duration-200"
                >
                  <span>→</span>
                  <span>Ayuda de Spotify sobre datos</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-r from-gray-900 to-black border-t border-white/10 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-spotify-green hover:bg-green-500 text-black font-semibold rounded-lg transition-colors duration-200"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}

