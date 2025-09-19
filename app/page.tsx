'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import JSZip from 'jszip'
import StatsDisplay from '../components/StatsDisplay'

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
  // Nuevas estadísticas de canciones salteadas
  totalSkippedSongs: number
  topSkippedSongs: Array<{ trackName: string; artistName: string; count: number }>
  topSkippedArtists: Array<{ artistName: string; skippedCount: number; totalSongs: number; skipPercentage: number }>
  skipRate: number
  // Canciones más salteadas por artista
  topSkippedSongsByArtist: Record<string, Array<{ trackName: string; count: number }>>
}

export default function Home() {
  const [stats, setStats] = useState<ProcessedStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-spotify-green mb-4">
          🎵 Spotify Stats Analyzer
        </h1>
        <p className="text-gray-300 text-lg">
          Sube tus archivos de historial de Spotify y descubre tus estadísticas de escucha
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-8">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-spotify-green bg-green-900/20' 
              : 'border-gray-600 hover:border-spotify-green hover:bg-gray-800/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-6xl mb-4">📁</div>
          {isDragActive ? (
            <p className="text-spotify-green text-lg">¡Suelta los archivos aquí!</p>
          ) : (
            <div>
              <p className="text-lg mb-2">
                Arrastra y suelta tu archivo ZIP de Spotify o archivos <code>StreamingHistory_music_*.json</code> aquí
              </p>
              <p className="text-gray-400">
                o haz clic para seleccionar archivos
              </p>
              <p className="text-sm text-gray-500 mt-2">
                💡 <strong>Tip:</strong> Puedes subir directamente el ZIP que descargas de Spotify
              </p>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-spotify-green"></div>
          <p className="mt-2 text-gray-300">Procesando archivos...</p>
        </div>
      )}

      {error && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-300">
            {error}
          </div>
        </div>
      )}

      {stats && <StatsDisplay stats={stats} />}
    </div>
  )
}

function processSpotifyData(history: SpotifyTrack[]): ProcessedStats {
  // Filtrar canciones con al menos 30 segundos de reproducción
  const filteredHistory = history.filter(song => song.msPlayed >= 30000)
  
  // Filtrar canciones salteadas (menos de 20 segundos)
  const skippedHistory = history.filter(song => song.msPlayed < 20000)
  
  
  const sum = filteredHistory.reduce((total, x) => x.msPlayed + total, 0)
  
  const songs: Array<{ count: number; trackName: string; artistName: string }> = []
  const artistas: Array<{ totalTime: number; uniqueSongs: string[]; artistName: string }> = []
  const days: Array<{ endTime: string; totalTime: number }> = []
  
  // Arrays para canciones salteadas
  const skippedSongs: Array<{ count: number; trackName: string; artistName: string }> = []
  const skippedArtists: Array<{ artistName: string; skippedCount: number; totalSongs: number; skipPercentage: number }> = []
  
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
  
  // Procesar canciones salteadas
  skippedHistory.forEach((song) => {
    // Contar canciones salteadas
    const foundSkippedSong = skippedSongs.find(s => s.artistName === song.artistName && s.trackName === song.trackName)
    if (foundSkippedSong) {
      foundSkippedSong.count += 1
    } else {
      skippedSongs.push({ count: 1, trackName: song.trackName, artistName: song.artistName })
    }
    
    // Contar artistas más salteados
    const foundSkippedArtist = skippedArtists.find(s => s.artistName === song.artistName)
    if (foundSkippedArtist) {
      foundSkippedArtist.skippedCount += 1
    } else {
      const totalSongs = artistTotalSongs[song.artistName] || 0
      skippedArtists.push({ 
        artistName: song.artistName, 
        skippedCount: 1, 
        totalSongs: totalSongs,
        skipPercentage: 0 // Se calculará después
      })
    }
  })
  
  
  // Calcular porcentaje de saltos para cada artista
  skippedArtists.forEach(artist => {
    artist.skipPercentage = artist.totalSongs > 0 ? (artist.skippedCount / artist.totalSongs) * 100 : 0
  })
  
  // Calcular tasa de salto
  const totalSongs = history.length
  const skipRate = totalSongs > 0 ? (skippedHistory.length / totalSongs) * 100 : 0
  
  // Agrupar canciones salteadas por artista
  const skippedSongsByArtist: Record<string, Array<{ trackName: string; count: number }>> = {}
  skippedSongs.forEach(song => {
    if (!skippedSongsByArtist[song.artistName]) {
      skippedSongsByArtist[song.artistName] = []
    }
    skippedSongsByArtist[song.artistName].push({
      trackName: song.trackName,
      count: song.count
    })
  })
  
  // Ordenar canciones por artista (top 3 por artista)
  Object.keys(skippedSongsByArtist).forEach(artist => {
    skippedSongsByArtist[artist].sort((a, b) => b.count - a.count)
    skippedSongsByArtist[artist] = skippedSongsByArtist[artist].slice(0, 3)
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
    // Estadísticas de canciones salteadas
    totalSkippedSongs: skippedHistory.length,
    topSkippedSongs: skippedSongs
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    topSkippedArtists: skippedArtists
      .sort((a, b) => b.skippedCount - a.skippedCount)
      .slice(0, 10),
    skipRate: Math.round(skipRate * 100) / 100,
    topSkippedSongsByArtist: skippedSongsByArtist
  }
}
