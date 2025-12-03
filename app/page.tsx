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
          const zipContent = await zip.loadAsync(file)
          
          // Buscar archivos que coincidan con el patrón StreamingHistory_music_*.json
          const musicHistoryFiles = Object.keys(zipContent.files).filter(fileName => 
            fileName.match(/StreamingHistory_music_\d+\.json$/i)
          )
          
          if (musicHistoryFiles.length === 0) {
            setError('No se encontraron archivos StreamingHistory_music_*.json en el ZIP.')
            return
          }
          
          // Extraer y procesar cada archivo JSON encontrado
          for (const fileName of musicHistoryFiles) {
            const jsonFile = zipContent.files[fileName]
            if (!jsonFile.dir) {
              const text = await jsonFile.async('text')
              const data = JSON.parse(text)
              allTracks.push(...data)
            }
          }
        } else if (file.name.toLowerCase().endsWith('.json')) {
          // Procesar archivo JSON individual
          const text = await file.text()
          const data = JSON.parse(text)
          allTracks.push(...data)
        }
      }

      if (allTracks.length === 0) {
        setError('No se encontraron datos válidos de Spotify en los archivos.')
        return
      }

      // Procesar los datos
      const processedStats = processSpotifyData(allTracks)
      setStats(processedStats)
    } catch (err) {
      setError('Error al procesar los archivos. Asegúrate de que sean archivos JSON válidos de Spotify o un ZIP con archivos StreamingHistory_music_*.json.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip']
    },
    multiple: true
  })

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
    const key = `${song.artistName}|||${song.trackName}`
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
  // Ordenar el historial por tiempo para analizar secuencias
  const sortedHistory = [...history].sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime())
  
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
  history.forEach((song) => {
    artistTotalSongs[song.artistName] = (artistTotalSongs[song.artistName] || 0) + 1
  })
  
  filteredHistory.forEach((song) => {
    // Contar canciones
    const foundSong = songs.find(s => s.artistName === song.artistName && s.trackName === song.trackName)
    if (foundSong) {
      foundSong.count += 1
    } else {
      songs.push({ count: 1, trackName: song.trackName, artistName: song.artistName })
    }
    
    // Contar artistas
    const foundArtist = artistas.find(s => s.artistName === song.artistName)
    if (foundArtist) {
      foundArtist.totalTime += song.msPlayed
      foundArtist.uniqueSongs = Array.from(new Set([song.trackName, ...foundArtist.uniqueSongs]))
    } else {
      artistas.push({ 
        totalTime: song.msPlayed, 
        uniqueSongs: [song.trackName], 
        artistName: song.artistName 
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
    // Contar canciones realmente salteadas
    const foundSkippedSong = realSkippedSongs.find(s => s.artistName === song.artistName && s.trackName === song.trackName)
    if (foundSkippedSong) {
      foundSkippedSong.count += 1
    } else {
      realSkippedSongs.push({ count: 1, trackName: song.trackName, artistName: song.artistName })
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
    // Contar canciones reiniciadas
    const foundRestartSong = restartSongs.find(s => s.artistName === song.artistName && s.trackName === song.trackName)
    if (foundRestartSong) {
      foundRestartSong.count += 1
    } else {
      restartSongs.push({ count: 1, trackName: song.trackName, artistName: song.artistName })
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
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(s => ({ trackName: s.trackName, artistName: s.artistName, count: s.count })),
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
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    topRestartSongs: restartSongs
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
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
