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
  // Estadísticas de canciones salteadas
  totalSkippedSongs: number
  topSkippedSongs: Array<{ trackName: string; artistName: string; count: number }>
  topSkippedArtists: Array<{ artistName: string; skippedCount: number; totalSongs: number; skipPercentage: number }>
  skipRate: number
  // Canciones más salteadas por artista
  topSkippedSongsByArtist: Record<string, Array<{ trackName: string; count: number }>>
}

interface StatsDisplayProps {
  stats: ProcessedStats
}

export default function StatsDisplay({ stats }: StatsDisplayProps) {
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const hours = Math.floor(ms / 3600000)
    return `${minutes} min (${hours} horas)`
  }

  return (
    <div className="space-y-8">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="spotify-card text-center">
          <h3 className="text-2xl font-bold text-spotify-green mb-2">
            {Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m
          </h3>
          <p className="text-gray-300">Minutos escuchados</p>
        </div>
        
        <div className="spotify-card text-center">
          <h3 className="text-2xl font-bold text-spotify-green mb-2">
            {stats.totalSongs.toLocaleString()}
          </h3>
          <p className="text-gray-300">Canciones escuchadas</p>
        </div>
        
        <div className="spotify-card text-center">
          <h3 className="text-2xl font-bold text-spotify-green mb-2">
            {stats.totalArtists.toLocaleString()}
          </h3>
          <p className="text-gray-300">Artistas escuchados</p>
        </div>
      </div>

      {/* Top canciones */}
      <div className="spotify-card">
        <h2 className="text-xl font-bold text-spotify-green mb-4">
          🎵 Canciones más escuchadas
        </h2>
        <div className="space-y-2">
          {stats.topSongs.map((song, index) => (
            <div key={`${song.trackName}-${song.artistName}`} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-spotify-green font-bold text-lg">#{index + 1}</span>
                <div>
                  <p className="font-semibold">{song.trackName}</p>
                  <p className="text-gray-400 text-sm">{song.artistName}</p>
                </div>
              </div>
              <span className="text-spotify-green font-semibold">{song.count} veces</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top artistas por canciones */}
      <div className="spotify-card">
        <h2 className="text-xl font-bold text-spotify-green mb-4">
          🎤 Artistas más escuchados (por cantidad de canciones)
        </h2>
        <div className="space-y-2">
          {stats.topArtistsBySongs.map((artist, index) => (
            <div key={artist.artistName} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-spotify-green font-bold text-lg">#{index + 1}</span>
                <p className="font-semibold">{artist.artistName}</p>
              </div>
              <span className="text-spotify-green font-semibold">{artist.uniqueSongs} canciones</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top artistas por tiempo */}
      <div className="spotify-card">
        <h2 className="text-xl font-bold text-spotify-green mb-4">
          ⏱️ Artistas más escuchados (por tiempo)
        </h2>
        <div className="space-y-2">
          {stats.topArtistsByTime.map((artist, index) => (
            <div key={artist.artistName} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-spotify-green font-bold text-lg">#{index + 1}</span>
                <p className="font-semibold">{artist.artistName}</p>
              </div>
              <span className="text-spotify-green font-semibold">{formatTime(artist.totalTime)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Días con más música */}
      <div className="spotify-card">
        <h2 className="text-xl font-bold text-spotify-green mb-4">
          📅 Días que más música escuchaste
        </h2>
        <div className="space-y-2">
          {stats.topDays.map((day, index) => (
            <div key={day.date} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-spotify-green font-bold text-lg">#{index + 1}</span>
                <p className="font-semibold">{day.date}</p>
              </div>
              <span className="text-spotify-green font-semibold">{formatTime(day.totalTime)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Por día de la semana */}
      <div className="spotify-card">
        <h2 className="text-xl font-bold text-spotify-green mb-4">
          📊 Por día de la semana
        </h2>
        <div className="grid grid-cols-7 gap-2">
          {stats.byDayOfWeek.map((dayData) => (
            <div key={dayData.day} className="p-3 bg-gray-700 rounded-lg text-center">
              <h3 className="font-semibold text-spotify-green text-sm mb-2">{dayData.day.slice(0, 3)}</h3>
              <div className="mb-2">
                <div className="w-full bg-gray-600 rounded-full h-2 mb-1">
                  <div 
                    className="bg-spotify-green h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.max(dayData.percentage, 2)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400">{dayData.percentage.toFixed(1)}%</p>
              </div>
              <p className="text-xs text-gray-300">{dayData.minutes} min</p>
              <p className="text-xs text-gray-400">({dayData.hours}h)</p>
            </div>
          ))}
        </div>
      </div>

      {/* Por mes */}
      <div className="spotify-card">
        <h2 className="text-xl font-bold text-spotify-green mb-4">
          📈 Por mes
        </h2>
        <div className="space-y-3">
          {stats.byMonth.map((monthData) => (
            <div key={monthData.month} className="p-4 bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-spotify-green">{monthData.month}</h3>
                <div className="text-right">
                  <p className="text-sm text-gray-300">{monthData.minutes} min</p>
                  <p className="text-xs text-gray-400">({monthData.hours} horas)</p>
                </div>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-3">
                <div 
                  className="bg-spotify-green h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.max(monthData.percentage, 1)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">{monthData.percentage.toFixed(1)}% del total</p>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas de canciones salteadas */}
      <div className="spotify-card">
        <h2 className="text-xl font-bold text-red-400 mb-4">
          ⏭️ Análisis de Canciones Salteadas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-red-900/20 rounded-lg border border-red-500/30">
            <h3 className="text-2xl font-bold text-red-400 mb-2">
              {stats.totalSkippedSongs.toLocaleString()}
            </h3>
            <p className="text-gray-300">Canciones salteadas</p>
            <p className="text-sm text-gray-400">(&lt; 20 segundos)</p>
          </div>
          
          <div className="text-center p-4 bg-red-900/20 rounded-lg border border-red-500/30">
            <h3 className="text-2xl font-bold text-red-400 mb-2">
              {stats.skipRate}%
            </h3>
            <p className="text-gray-300">Tasa de salto</p>
            <p className="text-sm text-gray-400">Porcentaje total</p>
          </div>
          
          <div className="text-center p-4 bg-red-900/20 rounded-lg border border-red-500/30">
            <h3 className="text-2xl font-bold text-red-400 mb-2">
              {stats.topSkippedSongs.length > 0 ? stats.topSkippedSongs[0].count : 0}
            </h3>
            <p className="text-gray-300">Máximo saltos</p>
            <p className="text-sm text-gray-400">Una sola canción</p>
          </div>
        </div>
      </div>

      {/* Top canciones salteadas */}
      <div className="spotify-card">
        <h2 className="text-xl font-bold text-red-400 mb-4">
          ⏭️ Canciones más salteadas
        </h2>
        <div className="space-y-2">
          {stats.topSkippedSongs.length > 0 ? (
            stats.topSkippedSongs.map((song, index) => (
              <div key={`${song.trackName}-${song.artistName}`} className="flex justify-between items-center p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                <div className="flex items-center space-x-3">
                  <span className="text-red-400 font-bold text-lg">#{index + 1}</span>
                  <div>
                    <p className="font-semibold">{song.trackName}</p>
                    <p className="text-gray-400 text-sm">{song.artistName}</p>
                  </div>
                </div>
                <span className="text-red-400 font-semibold">{song.count} saltos</span>
              </div>
            ))
          ) : (
            <div className="text-center p-8 text-gray-400">
              <p className="text-lg">🎉 ¡No salteaste ninguna canción!</p>
              <p className="text-sm">O no tienes suficientes datos de canciones salteadas.</p>
            </div>
          )}
        </div>
      </div>

      {/* Top artistas salteados */}
      <div className="spotify-card">
        <h2 className="text-xl font-bold text-red-400 mb-4">
          ⏭️ Artistas más salteados
        </h2>
        <div className="space-y-2">
          {stats.topSkippedArtists.length > 0 ? (
            stats.topSkippedArtists.map((artist, index) => (
              <div key={artist.artistName} className="flex justify-between items-center p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                <div className="flex items-center space-x-3">
                  <span className="text-red-400 font-bold text-lg">#{index + 1}</span>
                  <div>
                    <p className="font-semibold">{artist.artistName}</p>
                    <p className="text-sm text-gray-400">{artist.totalSongs} canciones total</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-red-400 font-semibold text-lg">{artist.skipPercentage.toFixed(1)}%</span>
                  <p className="text-sm text-gray-400">{artist.skippedCount} saltos</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-8 text-gray-400">
              <p className="text-lg">🎉 ¡No salteaste ningún artista!</p>
              <p className="text-sm">O no tienes suficientes datos de canciones salteadas.</p>
            </div>
          )}
        </div>
      </div>

      {/* Canciones más salteadas por artista */}
      <div className="spotify-card">
        <h2 className="text-xl font-bold text-red-400 mb-4">
          ⏭️ Canciones más salteadas por artista
        </h2>
        <div className="space-y-6">
          {stats.topSkippedArtists.slice(0, 5).map((artist) => {
            const artistSongs = stats.topSkippedSongsByArtist[artist.artistName]
            if (!artistSongs || artistSongs.length === 0) return null
            
            return (
              <div key={artist.artistName} className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-400 mb-3">
                  {artist.artistName} ({artist.skipPercentage.toFixed(1)}% de saltos)
                </h3>
                <p className="text-sm text-gray-400 mb-3">
                  {artist.skippedCount} de {artist.totalSongs} canciones saltadas
                </p>
                <div className="space-y-2">
                  {artistSongs.map((song, index) => (
                    <div key={song.trackName} className="flex justify-between items-center p-2 bg-gray-600 rounded">
                      <div className="flex items-center space-x-3">
                        <span className="text-red-400 font-bold">#{index + 1}</span>
                        <p className="font-medium">{song.trackName}</p>
                      </div>
                      <span className="text-red-400 font-semibold">{song.count} saltos</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
