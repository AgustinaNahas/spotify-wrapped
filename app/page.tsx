'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import JSZip from 'jszip'
import StatsDisplay from '../components/StatsDisplay'
import InfoModal from '../components/InfoModal'

interface SpotifyTrack {
  endTime: string
  artistName: string
  trackName: string
  msPlayed: number
}

interface ProcessedStats {
  totalMinutes: number
  totalSongs: number
  topSongs: Array<{ trackName: string; artistName: string; count: number }>
  totalArtists: number
  topArtistsBySongs: Array<{ artistName: string; uniqueSongs: number }>
  topArtistsByTime: Array<{ artistName: string; totalTime: number }>
  topDays: Array<{ date: string; totalTime: number }>
  byDayOfWeek: Array<{ day: string; minutes: number; hours: number; percentage: number }>
  byMonth: Array<{ month: string; minutes: number; hours: number; percentage: number }>
  // Estadísticas de canciones salteadas (análisis mejorado)
  totalSkippedSongs: number
  totalRestartSongs: number
  topSkippedSongs: Array<{ trackName: string; artistName: string; count: number }>
  topRestartSongs: Array<{ trackName: string; artistName: string; count: number }>
  topSkippedArtists: Array<{ artistName: string; skippedCount: number; totalSongs: number; skipPercentage: number }>
  topRestartArtists: Array<{ artistName: string; restartCount: number; totalSongs: number; restartPercentage: number }>
  skipRate: number
  restartRate: number
  // Canciones más salteadas por artista
  topSkippedSongsByArtist: Record<string, Array<{ trackName: string; count: number }>>
  topRestartSongsByArtist: Record<string, Array<{ trackName: string; count: number }>>
}

export default function Home() {
  const [stats, setStats] = useState<ProcessedStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)

  const onDrop = async (acceptedFiles: File[]) => {
    setLoading(true)
    setError(null)
    
    try {
      const allTracks: SpotifyTrack[] = []
      
      // Procesar cada archivo
      for (const file of acceptedFiles) {
        if (file.name.toLowerCase().endsWith('.zip')) {
          // Procesar archivo ZIP
          const zip = new JSZip()
          let zipContent: JSZip
          
          try {
            zipContent = await zip.loadAsync(file)
          } catch (zipError) {
            setError('Error al leer el archivo ZIP. Asegúrate de que el archivo no esté corrupto.')
            console.error('Error loading ZIP:', zipError)
            return
          }
          
          // Buscar archivos que coincidan con el patrón StreamingHistory_music_*.json
          // Buscar en todas las rutas, incluyendo subdirectorios
          const musicHistoryFiles = Object.keys(zipContent.files).filter(fileName => {
            // Ignorar directorios y buscar archivos JSON que coincidan con el patrón
            const zipFile = zipContent.files[fileName]
            if (zipFile.dir) return false
            
            // Buscar archivos que coincidan con StreamingHistory_music_*.json en cualquier ubicación
            return fileName.match(/StreamingHistory_music_\d+\.json$/i) || 
                   fileName.match(/.*[\/\\]StreamingHistory_music_\d+\.json$/i)
          })
          
          if (musicHistoryFiles.length === 0) {
            // Intentar buscar cualquier archivo JSON relacionado con streaming
            const allJsonFiles = Object.keys(zipContent.files).filter(fileName => {
              const zipFile = zipContent.files[fileName]
              if (zipFile.dir) return false
              return fileName.toLowerCase().includes('streaming') && 
                     fileName.toLowerCase().endsWith('.json')
            })
            
            if (allJsonFiles.length === 0) {
              // Listar algunos archivos del ZIP para ayudar al usuario
              const sampleFiles = Object.keys(zipContent.files)
                .filter(f => !zipContent.files[f].dir)
                .slice(0, 5)
                .map(f => `  - ${f}`)
                .join('\n')
              
              setError(`No se encontraron archivos StreamingHistory_music_*.json en el ZIP.\n\nArchivos encontrados en el ZIP:\n${sampleFiles}\n\nAsegúrate de que el ZIP contenga archivos de historial de reproducción de Spotify.`)
              return
            } else {
              // Usar los archivos encontrados aunque no coincidan exactamente con el patrón
              musicHistoryFiles.push(...allJsonFiles)
            }
          }
          
          // Extraer y procesar cada archivo JSON encontrado
          for (const fileName of musicHistoryFiles) {
            try {
              const jsonFile = zipContent.files[fileName]
              if (!jsonFile.dir) {
                const text = await jsonFile.async('text')
                const data = JSON.parse(text)
                
                // Verificar que sea un array de objetos con la estructura esperada
                if (Array.isArray(data) && data.length > 0) {
                  // Verificar que tenga la estructura básica de un track de Spotify
                  if (data[0].hasOwnProperty('endTime') || data[0].hasOwnProperty('ts')) {
                    allTracks.push(...data)
                  } else {
                    console.warn(`El archivo ${fileName} no tiene la estructura esperada de Spotify`)
                  }
                } else {
                  console.warn(`El archivo ${fileName} no es un array válido`)
                }
              }
            } catch (fileError) {
              console.error(`Error procesando ${fileName}:`, fileError)
              // Continuar con otros archivos aunque uno falle
            }
          }
        } else if (file.name.toLowerCase().endsWith('.json')) {
          // Procesar archivo JSON individual
          try {
            const text = await file.text()
            const data = JSON.parse(text)
            if (Array.isArray(data)) {
              allTracks.push(...data)
            } else {
              setError('El archivo JSON no contiene un array válido de datos.')
              return
            }
          } catch (jsonError) {
            setError(`Error al procesar el archivo JSON: ${file.name}. Asegúrate de que sea un archivo válido de Spotify.`)
            console.error('Error parsing JSON:', jsonError)
            return
          }
        }
      }

      if (allTracks.length === 0) {
        setError('No se encontraron datos válidos de Spotify en los archivos. Verifica que el ZIP contenga archivos StreamingHistory_music_*.json o archivos JSON de historial de reproducción.')
        return
      }

      // Normalizar los datos (algunos formatos de Spotify usan 'ts' en lugar de 'endTime')
      const normalizedTracks = allTracks.map(track => {
        // Si el track tiene 'ts' en lugar de 'endTime', convertir
        const trackAny = track as any
        if (trackAny.ts && !track.endTime) {
          return {
            ...track,
            endTime: trackAny.ts
          }
        }
        return track
      })

      // Procesar los datos
      const processedStats = processSpotifyData(normalizedTracks)
      setStats(processedStats)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al procesar los archivos: ${errorMessage}\n\nAsegúrate de que:\n- El archivo ZIP no esté corrupto\n- Contenga archivos StreamingHistory_music_*.json\n- Los archivos JSON sean válidos`)
      console.error('Error completo:', err)
    } finally {
      setLoading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'],
      'application/x-zip': ['.zip']
    },
    multiple: true
  })

  // Función genérica para cargar un archivo por defecto
  const loadDefaultDataFile = async (fileName: string, displayName: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // Determinar el basePath correcto (para GitHub Pages)
      let basePath = ''
      if (typeof window !== 'undefined') {
        const pathParts = window.location.pathname.split('/').filter(p => p)
        if (pathParts.length > 0 && pathParts[0] !== '') {
          basePath = `/${pathParts[0]}`
        }
      }
      
      // Intentar diferentes rutas posibles
      const possiblePaths = [
        `${basePath}/${fileName}`,
        `/${fileName}`,
        `${basePath ? basePath : ''}/${fileName}`,
        `./${fileName}`
      ]
      
      // Eliminar duplicados
      const uniquePaths = Array.from(new Set(possiblePaths))
      
      let file: File | null = null
      let lastError: Error | null = null
      
      for (const path of uniquePaths) {
        try {
          console.log('Intentando cargar desde:', path)
          const response = await fetch(path, {
            method: 'GET',
            headers: {
              'Accept': 'application/zip, application/octet-stream, */*'
            }
          })
          
          console.log(`Response para ${path}:`, {
            status: response.status,
            ok: response.ok,
            contentType: response.headers.get('content-type'),
            contentLength: response.headers.get('content-length')
          })
          
          if (response.ok) {
            const blob = await response.blob()
            console.log('Blob cargado, tamaño:', blob.size, 'bytes, tipo:', blob.type)
            
            if (blob.size === 0) {
              throw new Error('El archivo está vacío')
            }
            
            file = new File([blob], displayName, { type: blob.type || 'application/zip' })
            break
          } else {
            lastError = new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err))
          console.warn(`Error al cargar desde ${path}:`, err)
          continue
        }
      }
      
      if (!file) {
        throw lastError || new Error('No se pudo cargar el archivo desde ninguna ruta')
      }
      
      // Procesar el archivo usando la misma lógica que onDrop
      await onDrop([file])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al cargar el archivo de ejemplo: ${errorMessage}\n\nNota: El archivo puede no estar disponible en GitHub Pages debido a limitaciones de tamaño. Por favor, sube tu propio archivo ZIP usando el área de carga arriba.`)
      console.error('Error loading default data:', err)
      setLoading(false)
    }
  }

  // Funciones específicas para cada archivo
  const load2025Data = () => loadDefaultDataFile('my_spotify_data.zip', 'my_spotify_data.zip')
  const load2024Data = () => loadDefaultDataFile('spotify_account_data_2024.zip', 'Spotify Account Data 2024.zip')

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header mejorado */}
        <div className="text-center mb-8 sm:mb-12 relative">
          {/* Botón de información */}
          <button
            onClick={() => setIsInfoModalOpen(true)}
            className="absolute top-0 right-0 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full border border-white/20 hover:border-spotify-green/50 transition-all duration-200 group"
            aria-label="Información sobre cómo obtener datos"
            title="Cómo obtener tus datos de Spotify"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300 group-hover:text-spotify-green transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-spotify-green rounded-full mb-4 sm:mb-6 shadow-lg shadow-spotify-green/25 animate-float">
            <span className="text-2xl sm:text-3xl">🎵</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-spotify-green to-green-400 bg-clip-text text-transparent mb-3 sm:mb-4">
            Spotify Stats Analyzer
          </h1>
          <p className="text-gray-300 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            Sube tus archivos de historial de Spotify y descubre tus estadísticas de escucha
          </p>
        </div>

        {/* Zona de drop mejorada */}
        <div className="max-w-3xl mx-auto mb-8 sm:mb-12">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 lg:p-12 text-center cursor-pointer transition-all duration-300 transform hover:scale-[1.005] ${
              isDragActive 
                ? 'border-spotify-green bg-green-500/10 shadow-lg shadow-spotify-green/20' 
                : 'border-white/20 hover:border-spotify-green hover:bg-white/5 hover:shadow-lg hover:shadow-white/10'
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-5xl sm:text-6xl lg:text-7xl mb-4 sm:mb-6 transition-transform duration-300 hover:scale-110">📁</div>
            {isDragActive ? (
              <div className="space-y-2">
                <p className="text-spotify-green text-lg sm:text-xl font-semibold">¡Suelta los archivos aquí!</p>
                <p className="text-gray-400 text-sm">Los archivos se procesarán automáticamente</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-base sm:text-lg lg:text-xl font-medium text-gray-200">
                  Arrastra y suelta tu archivo ZIP de Spotify
                </p>
                <p className="text-sm sm:text-base text-gray-400">
                  o archivos <code className="bg-white/10 px-2 py-1 rounded text-spotify-green border border-white/10">StreamingHistory_music_*.json</code>
                </p>
                <p className="text-gray-500 text-sm">
                  o haz clic para seleccionar archivos
                </p>
                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-gray-400">
                    💡 <strong className="text-spotify-green">Tip:</strong> Puedes subir directamente el ZIP que descargas de Spotify
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botones para cargar datos de ejemplo - Solo visible cuando no hay datos cargados */}
        {!stats && (
          <div className="max-w-3xl mx-auto mb-8 sm:mb-12">
            <div className="text-center mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2">
                📊 Datos de ejemplo
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Prueba la aplicación con datos reales
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Botón 2025 */}
              <button
                onClick={load2025Data}
                disabled={loading}
                className="px-4 py-3 bg-gradient-to-r from-spotify-green to-green-500 hover:from-green-500 hover:to-green-600 text-black font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-spotify-green/25 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center space-y-1"
              >
                <span className="text-lg">🎵</span>
                <span className="text-sm">2025</span>
              </button>
              
              {/* Botón 2024 */}
              <button
                onClick={load2024Data}
                disabled={loading}
                className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center space-y-1"
              >
                <span className="text-lg">🎤</span>
                <span className="text-sm">2024</span>
              </button>
            </div>
            
            {/* Comentario gracioso */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20 text-center">
              <p className="text-sm text-gray-300 leading-relaxed">
                <span className="text-purple-400 font-semibold">💀 Aviso importante:</span> Estos son mis datos reales de Spotify. 
                <br/>Juzguen mi gusto musical todo lo que quieran—yo me juzgo mucho más que ustedes. 
              </p>
              <p className="text-xs text-gray-500 mt-2 italic">
                (Sí, me escuché esa canción 47 veces. No, no me arrepiento.)
              </p>
            </div>
          </div>
        )}

        {/* Loading mejorado */}
        {loading && (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-gray-600 border-t-spotify-green"></div>
                <div className="absolute inset-0 inline-block animate-ping rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-spotify-green/30"></div>
              </div>
              <div className="space-y-2">
                <p className="text-gray-300 text-lg sm:text-xl font-medium">Procesando archivos...</p>
                <p className="text-gray-400 text-sm">Esto puede tomar unos momentos</p>
              </div>
            </div>
          </div>
        )}

        {/* Error mejorado */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 sm:p-6 text-red-300 shadow-lg shadow-red-500/20">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">⚠️</div>
                <div>
                  <h3 className="font-semibold text-red-200 mb-2">Error al procesar archivos</h3>
                  <p className="text-sm leading-relaxed">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Display */}
        {stats && <StatsDisplay stats={stats} />}
      </div>

      {/* Modal de información */}
      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
    </div>
  )
}

// Función para analizar patrones de saltos y distinguir entre saltos reales y reproducciones desde el inicio
function analyzeSkipPatterns(history: SpotifyTrack[]): {
  realSkips: SpotifyTrack[]
  restarts: SpotifyTrack[]
} {
  const realSkips: SpotifyTrack[] = []
  const restarts: SpotifyTrack[] = []
  
  // Agrupar por canción (artista + nombre)
  const songGroups: Record<string, SpotifyTrack[]> = {}
  
  history.forEach(song => {
    const trackName = song.trackName?.trim() || ''
    const artistName = song.artistName?.trim() || ''
    
    // Solo procesar canciones con datos válidos
    if (!trackName || !artistName) {
      return
    }
    
    const key = `${artistName}|||${trackName}`
    if (!songGroups[key]) {
      songGroups[key] = []
    }
    songGroups[key].push(song)
  })
  
  // Analizar cada grupo de canciones
  Object.values(songGroups).forEach(songGroup => {
    // Ordenar por tiempo
    songGroup.sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime())
    
    for (let i = 0; i < songGroup.length; i++) {
      const currentSong = songGroup[i]
      
      // Si la canción duró menos de 20 segundos, es candidata a ser salteada
      if (currentSong.msPlayed < 20000) {
        const isRestart = checkIfRestart(songGroup, i)
        
        if (isRestart) {
          restarts.push(currentSong)
        } else {
          realSkips.push(currentSong)
        }
      }
    }
  })
  
  return { realSkips, restarts }
}

// Función para determinar si una reproducción corta es un reinicio desde el principio
function checkIfRestart(songGroup: SpotifyTrack[], currentIndex: number): boolean {
  const currentSong = songGroup[currentIndex]
  
  // Buscar la siguiente reproducción de la misma canción
  for (let i = currentIndex + 1; i < songGroup.length; i++) {
    const nextSong = songGroup[i]
    
    // Si encontramos otra reproducción de la misma canción
    if (nextSong.artistName === currentSong.artistName && 
        nextSong.trackName === currentSong.trackName) {
      
      // Calcular el tiempo entre reproducciones
      const timeBetween = new Date(nextSong.endTime).getTime() - new Date(currentSong.endTime).getTime()
      
      // Si la siguiente reproducción es muy cercana en tiempo (menos de 5 minutos)
      // y dura más tiempo, probablemente es un reinicio
      if (timeBetween < 300000 && nextSong.msPlayed > currentSong.msPlayed) {
        return true
      }
      
      // Si la siguiente reproducción es inmediata (menos de 30 segundos)
      // probablemente es un reinicio
      if (timeBetween < 30000) {
        return true
      }
    }
  }
  
  return false
}

function processSpotifyData(history: SpotifyTrack[]): ProcessedStats {
  // Filtrar canciones con datos inválidos (nombres vacíos, nulos o solo espacios)
  const validHistory = history.filter(song => {
    const hasValidTrackName = song.trackName && 
                               typeof song.trackName === 'string' && 
                               song.trackName.trim().length > 0
    const hasValidArtistName = song.artistName && 
                                typeof song.artistName === 'string' && 
                                song.artistName.trim().length > 0
    return hasValidTrackName && hasValidArtistName && song.msPlayed > 0
  })
  
  // Ordenar el historial por tiempo para analizar secuencias
  const sortedHistory = [...validHistory].sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime())
  
  // Filtrar canciones con al menos 30 segundos de reproducción
  const filteredHistory = sortedHistory.filter(song => song.msPlayed >= 30000)
  
  // Análisis avanzado de canciones salteadas
  const { realSkips, restarts } = analyzeSkipPatterns(sortedHistory)
  
  
  const sum = filteredHistory.reduce((total, x) => x.msPlayed + total, 0)
  
  const songs: Array<{ count: number; trackName: string; artistName: string }> = []
  const artistas: Array<{ totalTime: number; uniqueSongs: string[]; artistName: string }> = []
  const days: Array<{ endTime: string; totalTime: number }> = []
  
  // Arrays para canciones salteadas (nuevo análisis)
  const realSkippedSongs: Array<{ count: number; trackName: string; artistName: string }> = []
  const restartSongs: Array<{ count: number; trackName: string; artistName: string }> = []
  const realSkippedArtists: Array<{ artistName: string; skippedCount: number; totalSongs: number; skipPercentage: number }> = []
  const restartArtists: Array<{ artistName: string; restartCount: number; totalSongs: number; restartPercentage: number }> = []
  
  // Contar canciones totales por artista (incluyendo salteadas y no salteadas)
  const artistTotalSongs: Record<string, number> = {}
  
  const conteoPorMes: Record<string, number> = {}
  const conteoPorDiaSemana: Record<string, number> = {}
  
  const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
  
  // Primero, contar todas las canciones por artista (total)
  validHistory.forEach((song) => {
    const artistName = song.artistName?.trim() || ''
    if (artistName) {
      artistTotalSongs[artistName] = (artistTotalSongs[artistName] || 0) + 1
    }
  })
  
  filteredHistory.forEach((song) => {
    // Validar que la canción tenga datos válidos antes de procesar
    const trackName = song.trackName?.trim() || ''
    const artistName = song.artistName?.trim() || ''
    
    if (!trackName || !artistName) {
      return // Saltar canciones con datos inválidos
    }
    
    // Contar canciones
    const foundSong = songs.find(s => s.artistName === artistName && s.trackName === trackName)
    if (foundSong) {
      foundSong.count += 1
    } else {
      songs.push({ count: 1, trackName: trackName, artistName: artistName })
    }
    
    // Contar artistas
    const foundArtist = artistas.find(s => s.artistName === artistName)
    if (foundArtist) {
      foundArtist.totalTime += song.msPlayed
      foundArtist.uniqueSongs = Array.from(new Set([trackName, ...foundArtist.uniqueSongs]))
    } else {
      artistas.push({ 
        totalTime: song.msPlayed, 
        uniqueSongs: [trackName], 
        artistName: artistName 
      })
    }
    
    // Contar días
    const foundDay = days.find(s => s.endTime.split(" ")[0] === song.endTime.split(" ")[0])
    if (foundDay) {
      foundDay.totalTime += song.msPlayed
    } else {
      days.push({ endTime: song.endTime, totalTime: song.msPlayed })
    }
    
    // Contar por mes y día de la semana
    const fecha = new Date(song.endTime)
    const mes = fecha.getMonth()
    const nombreMes = meses[mes]
    const diaSemana = fecha.getDay()
    const nombreDia = diasSemana[diaSemana]
    
    conteoPorMes[nombreMes] = (conteoPorMes[nombreMes] || 0) + song.msPlayed
    conteoPorDiaSemana[nombreDia] = (conteoPorDiaSemana[nombreDia] || 0) + song.msPlayed
  })
  
  // Procesar saltos reales
  realSkips.forEach((song) => {
    const trackName = song.trackName?.trim() || ''
    const artistName = song.artistName?.trim() || ''
    
    if (!trackName || !artistName) {
      return // Saltar canciones con datos inválidos
    }
    
    // Contar canciones realmente salteadas
    const foundSkippedSong = realSkippedSongs.find(s => s.artistName === artistName && s.trackName === trackName)
    if (foundSkippedSong) {
      foundSkippedSong.count += 1
    } else {
      realSkippedSongs.push({ count: 1, trackName: trackName, artistName: artistName })
    }
    
    // Contar artistas más salteados
    const foundSkippedArtist = realSkippedArtists.find(s => s.artistName === song.artistName)
    if (foundSkippedArtist) {
      foundSkippedArtist.skippedCount += 1
    } else {
      const totalSongs = artistTotalSongs[song.artistName] || 0
      realSkippedArtists.push({ 
        artistName: song.artistName, 
        skippedCount: 1, 
        totalSongs: totalSongs,
        skipPercentage: 0 // Se calculará después
      })
    }
  })
  
  // Procesar reinicios
  restarts.forEach((song) => {
    const trackName = song.trackName?.trim() || ''
    const artistName = song.artistName?.trim() || ''
    
    if (!trackName || !artistName) {
      return // Saltar canciones con datos inválidos
    }
    
    // Contar canciones reiniciadas
    const foundRestartSong = restartSongs.find(s => s.artistName === artistName && s.trackName === trackName)
    if (foundRestartSong) {
      foundRestartSong.count += 1
    } else {
      restartSongs.push({ count: 1, trackName: trackName, artistName: artistName })
    }
    
    // Contar artistas con más reinicios
    const foundRestartArtist = restartArtists.find(s => s.artistName === song.artistName)
    if (foundRestartArtist) {
      foundRestartArtist.restartCount += 1
    } else {
      const totalSongs = artistTotalSongs[song.artistName] || 0
      restartArtists.push({ 
        artistName: song.artistName, 
        restartCount: 1, 
        totalSongs: totalSongs,
        restartPercentage: 0 // Se calculará después
      })
    }
  })
  
  
  // Calcular porcentajes para saltos reales
  realSkippedArtists.forEach(artist => {
    artist.skipPercentage = artist.totalSongs > 0 ? (artist.skippedCount / artist.totalSongs) * 100 : 0
  })
  
  // Calcular porcentajes para reinicios
  restartArtists.forEach(artist => {
    artist.restartPercentage = artist.totalSongs > 0 ? (artist.restartCount / artist.totalSongs) * 100 : 0
  })
  
  // Calcular tasas
  const totalSongs = sortedHistory.length
  const realSkipRate = totalSongs > 0 ? (realSkips.length / totalSongs) * 100 : 0
  const restartRate = totalSongs > 0 ? (restarts.length / totalSongs) * 100 : 0
  
  // Agrupar canciones salteadas por artista
  const realSkippedSongsByArtist: Record<string, Array<{ trackName: string; count: number }>> = {}
  realSkippedSongs.forEach(song => {
    if (!realSkippedSongsByArtist[song.artistName]) {
      realSkippedSongsByArtist[song.artistName] = []
    }
    realSkippedSongsByArtist[song.artistName].push({
      trackName: song.trackName,
      count: song.count
    })
  })
  
  // Agrupar canciones reiniciadas por artista
  const restartSongsByArtist: Record<string, Array<{ trackName: string; count: number }>> = {}
  restartSongs.forEach(song => {
    if (!restartSongsByArtist[song.artistName]) {
      restartSongsByArtist[song.artistName] = []
    }
    restartSongsByArtist[song.artistName].push({
      trackName: song.trackName,
      count: song.count
    })
  })
  
  // Ordenar canciones por artista (top 3 por artista)
  Object.keys(realSkippedSongsByArtist).forEach(artist => {
    realSkippedSongsByArtist[artist].sort((a, b) => b.count - a.count)
    realSkippedSongsByArtist[artist] = realSkippedSongsByArtist[artist].slice(0, 3)
  })
  
  Object.keys(restartSongsByArtist).forEach(artist => {
    restartSongsByArtist[artist].sort((a, b) => b.count - a.count)
    restartSongsByArtist[artist] = restartSongsByArtist[artist].slice(0, 3)
  })
  
  return {
    totalMinutes: Math.floor(sum / 60000),
    totalSongs: songs.length,
    topSongs: songs
      .filter(s => s.trackName && s.trackName.trim().length > 0 && s.artistName && s.artistName.trim().length > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(s => ({ trackName: s.trackName.trim(), artistName: s.artistName.trim(), count: s.count })),
    totalArtists: artistas.length,
    topArtistsBySongs: artistas
      .sort((a, b) => b.uniqueSongs.length - a.uniqueSongs.length)
      .slice(0, 10)
      .map(s => ({ artistName: s.artistName, uniqueSongs: s.uniqueSongs.length })),
    topArtistsByTime: artistas
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, 10)
      .map(s => ({ artistName: s.artistName, totalTime: s.totalTime })),
    topDays: days
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, 10)
      .map(s => ({ date: s.endTime.split(" ")[0], totalTime: s.totalTime })),
    byDayOfWeek: (() => {
      const totalTime = Object.values(conteoPorDiaSemana).reduce((sum, time) => sum + time, 0)
      const dayOrder = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
      return dayOrder.map(day => {
        const time = conteoPorDiaSemana[day] || 0
        return {
          day,
          minutes: Math.floor(time / 60000),
          hours: Math.floor(time / 3600000),
          percentage: totalTime > 0 ? (time / totalTime) * 100 : 0
        }
      })
    })(),
    byMonth: (() => {
      const totalTime = Object.values(conteoPorMes).reduce((sum, time) => sum + time, 0)
      const monthOrder = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
      return monthOrder.map(month => {
        const time = conteoPorMes[month] || 0
        return {
          month,
          minutes: Math.floor(time / 60000),
          hours: Math.floor(time / 3600000),
          percentage: totalTime > 0 ? (time / totalTime) * 100 : 0
        }
      })
    })(),
    // Estadísticas de canciones salteadas (nuevo análisis)
    totalSkippedSongs: realSkips.length,
    totalRestartSongs: restarts.length,
    topSkippedSongs: realSkippedSongs
      .filter(s => s.trackName && s.trackName.trim().length > 0 && s.artistName && s.artistName.trim().length > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(s => ({ trackName: s.trackName.trim(), artistName: s.artistName.trim(), count: s.count })),
    topRestartSongs: restartSongs
      .filter(s => s.trackName && s.trackName.trim().length > 0 && s.artistName && s.artistName.trim().length > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(s => ({ trackName: s.trackName.trim(), artistName: s.artistName.trim(), count: s.count })),
    topSkippedArtists: realSkippedArtists
      .sort((a, b) => b.skippedCount - a.skippedCount)
      .slice(0, 10),
    topRestartArtists: restartArtists
      .sort((a, b) => b.restartCount - a.restartCount)
      .slice(0, 10),
    skipRate: Math.round(realSkipRate * 100) / 100,
    restartRate: Math.round(restartRate * 100) / 100,
    topSkippedSongsByArtist: realSkippedSongsByArtist,
    topRestartSongsByArtist: restartSongsByArtist
  }
}

