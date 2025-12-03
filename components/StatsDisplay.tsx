import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, ScatterChart, ComposedChart, Bar, ReferenceDot } from 'recharts'

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

interface StatsDisplayProps {
  stats: ProcessedStats
}

export default function StatsDisplay({ stats }: StatsDisplayProps) {
  const [artistViewMode, setArtistViewMode] = useState<'songs' | 'time'>('songs')
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const hours = Math.floor(ms / 3600000)
    return `${minutes} min (${hours} horas)`
  }

  // Procesar datos para el gráfico combinado
  const chartData = stats.byMonth.map(monthData => {
    // Buscar si este mes contiene alguno de los días pico
    const monthName = monthData.month
    const topDaysInMonth = stats.topDays.filter(day => {
      const dayDate = new Date(day.date)
      const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                         "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
      return monthNames[dayDate.getMonth()] === monthName
    })
    
    return {
      ...monthData,
      hasTopDay: topDaysInMonth.length > 0,
      topDayMinutes: topDaysInMonth.length > 0 ? Math.floor(topDaysInMonth[0].totalTime / 60000) : 0,
      topDayDate: topDaysInMonth.length > 0 ? topDaysInMonth[0].date : null
    }
  })

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-12">
      {/* Estadísticas principales mejoradas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="spotify-card text-center group hover:scale-[1.01] transition-all duration-300 hover:shadow-lg hover:shadow-spotify-green/10 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
          <div className="text-3xl sm:text-4xl mb-3 animate-float">⏱️</div>
          <h3 className="text-2xl sm:text-3xl font-bold text-spotify-green mb-2">
            {Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m
          </h3>
          <p className="text-gray-300 text-sm sm:text-base">Minutos escuchados</p>
        </div>
        
        <div className="spotify-card text-center group hover:scale-[1.01] transition-all duration-300 hover:shadow-lg hover:shadow-spotify-green/10 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
          <div className="text-3xl sm:text-4xl mb-3 animate-float" style={{animationDelay: '0.5s'}}>🎵</div>
          <h3 className="text-2xl sm:text-3xl font-bold text-spotify-green mb-2">
            {stats.totalSongs.toLocaleString()}
          </h3>
          <p className="text-gray-300 text-sm sm:text-base">Canciones escuchadas</p>
        </div>
        
        <div className="spotify-card text-center group hover:scale-[1.01] transition-all duration-300 hover:shadow-lg hover:shadow-spotify-green/10 sm:col-span-2 lg:col-span-1 animate-fadeInUp" style={{animationDelay: '0.3s'}}>
          <div className="text-3xl sm:text-4xl mb-3 animate-float" style={{animationDelay: '1s'}}>🎤</div>
          <h3 className="text-2xl sm:text-3xl font-bold text-spotify-green mb-2">
            {stats.totalArtists.toLocaleString()}
          </h3>
          <p className="text-gray-300 text-sm sm:text-base">Artistas escuchados</p>
        </div>
      </div>

      {/* Top canciones */}
      <div className="spotify-card animate-fadeInUp" style={{animationDelay: '0.4s'}}>
        <h2 className="text-lg sm:text-xl font-bold text-spotify-green mb-4 sm:mb-6 flex items-center">
          <span className="text-2xl sm:text-3xl mr-2">🎵</span>
          Canciones más escuchadas
        </h2>
        <div className="space-y-2 sm:space-y-3">
          {stats.topSongs.map((song, index) => (
            <div key={`${song.trackName}-${song.artistName}`} className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200 group border border-white/10">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <span className="text-spotify-green font-bold text-lg sm:text-xl flex-shrink-0">#{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm sm:text-base truncate">{song.trackName}</p>
                  <p className="text-gray-400 text-xs sm:text-sm truncate">{song.artistName}</p>
                </div>
              </div>
              <span className="text-spotify-green font-semibold text-sm sm:text-base flex-shrink-0 ml-2">{song.count} veces</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top artistas con toggle */}
      <div className="spotify-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-spotify-green mb-4 sm:mb-0 flex items-center">
            <span className="text-2xl sm:text-3xl mr-2">🎤</span>
            Artistas más escuchados
          </h2>
          
          {/* Toggle para cambiar vista */}
          <div className="flex bg-white/10 rounded-lg p-1 border border-white/20">
            <button
              onClick={() => setArtistViewMode('songs')}
              className={`px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base font-medium transition-all duration-200 flex items-center space-x-2 ${
                artistViewMode === 'songs'
                  ? 'bg-spotify-green text-black shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🎵</span>
              <span>Canciones</span>
            </button>
            <button
              onClick={() => setArtistViewMode('time')}
              className={`px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base font-medium transition-all duration-200 flex items-center space-x-2 ${
                artistViewMode === 'time'
                  ? 'bg-spotify-green text-black shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>⏱️</span>
              <span>Tiempo</span>
            </button>
          </div>
        </div>
        
        <div className="space-y-2 sm:space-y-3">
          {artistViewMode === 'songs' ? (
            stats.topArtistsBySongs.map((artist, index) => (
              <div key={artist.artistName} className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200 group border border-white/10">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <span className="text-spotify-green font-bold text-lg sm:text-xl flex-shrink-0">#{index + 1}</span>
                  <p className="font-semibold text-sm sm:text-base truncate">{artist.artistName}</p>
                </div>
                <span className="text-spotify-green font-semibold text-sm sm:text-base flex-shrink-0 ml-2">{artist.uniqueSongs} canciones</span>
              </div>
            ))
          ) : (
            stats.topArtistsByTime.map((artist, index) => (
              <div key={artist.artistName} className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200 group border border-white/10">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <span className="text-spotify-green font-bold text-lg sm:text-xl flex-shrink-0">#{index + 1}</span>
                  <p className="font-semibold text-sm sm:text-base truncate">{artist.artistName}</p>
                </div>
                <span className="text-spotify-green font-semibold text-sm sm:text-base flex-shrink-0 ml-2">{formatTime(artist.totalTime)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Días con más música */}
      <div className="spotify-card">
        <h2 className="text-lg sm:text-xl font-bold text-spotify-green mb-4 sm:mb-6 flex items-center">
          <span className="text-2xl sm:text-3xl mr-2">📅</span>
          Días que más música escuchaste
        </h2>
        <div className="space-y-2 sm:space-y-3">
          {stats.topDays.map((day, index) => (
            <div key={day.date} className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200 group border border-white/10">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <span className="text-spotify-green font-bold text-lg sm:text-xl flex-shrink-0">#{index + 1}</span>
                <p className="font-semibold text-sm sm:text-base">{day.date}</p>
              </div>
              <span className="text-spotify-green font-semibold text-sm sm:text-base flex-shrink-0 ml-2">{formatTime(day.totalTime)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Por día de la semana */}
      <div className="spotify-card">
        <h2 className="text-lg sm:text-xl font-bold text-spotify-green mb-4 sm:mb-6 flex items-center">
          <span className="text-2xl sm:text-3xl mr-2">📊</span>
          Por día de la semana
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-3">
          {stats.byDayOfWeek.map((dayData) => (
            <div key={dayData.day} className="p-3 sm:p-4 bg-white/5 rounded-lg text-center hover:bg-white/10 transition-colors duration-200 group border border-white/10">
              <h3 className="font-semibold text-spotify-green text-xs sm:text-sm mb-2 sm:mb-3">{dayData.day.slice(0, 3)}</h3>
              <div className="mb-2 sm:mb-3">
                <div className="w-full bg-white/10 rounded-full h-2 sm:h-3 mb-1 sm:mb-2">
                  <div 
                    className="bg-spotify-green h-2 sm:h-3 rounded-full transition-all duration-500 group-hover:shadow-sm group-hover:shadow-spotify-green/30" 
                    style={{ width: `${Math.max(dayData.percentage, 2)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400">{dayData.percentage.toFixed(1)}%</p>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 font-medium">{dayData.minutes} min</p>
              <p className="text-xs text-gray-400">({dayData.hours}h)</p>
            </div>
          ))}
        </div>
      </div>

      {/* Por mes - Gráfico histórico */}
      <div className="spotify-card">
        <h2 className="text-lg sm:text-xl font-bold text-spotify-green mb-4 sm:mb-6 flex items-center">
          <span className="text-2xl sm:text-3xl mr-2">📈</span>
          Evolución mensual de escucha
        </h2>
        <div className="h-64 sm:h-80 lg:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="month" 
                stroke="rgba(255, 255, 255, 0.6)"
                fontSize={12}
                tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis 
                stroke="rgba(255, 255, 255, 0.6)"
                fontSize={12}
                tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                tickFormatter={(value) => `${value}m`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(29, 185, 84, 0.3)',
                  borderRadius: '8px',
                  color: 'white'
                }}
                labelStyle={{ color: '#1DB954', fontWeight: 'bold' }}
                formatter={(value: number, name: string) => {
                  if (name === 'minutes') return [`${value} minutos`, 'Total del mes']
                  if (name === 'topDayMinutes') return [`${value} minutos`, 'Día pico']
                  return [value, name]
                }}
                labelFormatter={(label) => `Mes: ${label}`}
              />
              {/* Línea principal para evolución mensual */}
              <Line 
                type="monotone" 
                dataKey="minutes" 
                stroke="#1DB954" 
                strokeWidth={3}
                dot={(props) => {
                  const { cx, cy, payload } = props
                  // Si este mes tiene un día pico, usar un punto especial
                  if (payload?.hasTopDay) {
                    return (
                      <g>
                        {/* Punto normal de la línea */}
                        <circle cx={cx} cy={cy} r={4} fill="#1DB954" strokeWidth={2} stroke="#1ed760" />
                        {/* Punto destacado para día pico - usando azul de Spotify */}
                        <circle cx={cx} cy={cy} r={8} fill="none" stroke="#1E3A8A" strokeWidth={2} opacity={0.8} />
                        <circle cx={cx} cy={cy} r={6} fill="#3B82F6" opacity={0.7} />
                      </g>
                    )
                  }
                  // Punto normal para meses sin día pico
                  return <circle cx={cx} cy={cy} r={4} fill="#1DB954" strokeWidth={2} stroke="#1ed760" />
                }}
                activeDot={{ r: 8, stroke: '#1DB954', strokeWidth: 2, fill: '#1ed760' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Leyenda */}
        <div className="flex justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-spotify-green"></div>
            <span className="text-gray-300">Total mensual</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-3 h-3 bg-spotify-green rounded-full"></div>
              <div className="absolute inset-0 w-3 h-3 border-2 border-blue-500 rounded-full opacity-60"></div>
            </div>
            <span className="text-gray-300">Día pico</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-center">
          {chartData.map((monthData) => (
            <div key={monthData.month} className={`p-2 rounded-lg border transition-all duration-200 ${
              monthData.hasTopDay 
                ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/15' 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}>
              <p className="text-xs text-spotify-green font-semibold">{monthData.month.slice(0, 3)}</p>
              <p className="text-xs text-gray-300">{monthData.minutes}m</p>
              <p className="text-xs text-gray-400">{monthData.percentage.toFixed(1)}%</p>
              {monthData.hasTopDay && (
                <div className="mt-1">
                  <p className="text-xs text-blue-400 font-medium">🔥 {monthData.topDayMinutes}m</p>
                  <p className="text-xs text-blue-300">{monthData.topDayDate}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Información adicional sobre días pico */}
        {stats.topDays.length > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-lg border border-blue-500/20">
            <h3 className="text-sm font-semibold text-blue-400 mb-2 flex items-center">
              <span className="text-lg mr-2">🔥</span>
              Días con más música escuchada
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {stats.topDays.slice(0, 6).map((day, index) => (
                <div key={day.date} className="flex justify-between items-center p-2 bg-white/5 rounded border border-white/10">
                  <div>
                    <p className="text-xs text-gray-300 font-medium">#{index + 1}</p>
                    <p className="text-xs text-gray-400">{day.date}</p>
                  </div>
                  <p className="text-xs text-blue-400 font-semibold">{Math.floor(day.totalTime / 60000)}m</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas de canciones salteadas (análisis mejorado) */}
      <div className="spotify-card">
        <h2 className="text-lg sm:text-xl font-bold text-red-400 mb-4 sm:mb-6 flex items-center">
          <span className="text-2xl sm:text-3xl mr-2">⏭️</span>
          Análisis Avanzado de Reproducciones
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <div className="text-center p-4 sm:p-6 bg-red-500/10 rounded-lg border border-red-500/20 hover:bg-red-500/15 transition-colors duration-200 group">
            <div className="text-3xl sm:text-4xl mb-3">⏭️</div>
            <h3 className="text-xl sm:text-2xl font-bold text-red-400 mb-2">
              {stats.totalSkippedSongs.toLocaleString()}
            </h3>
            <p className="text-gray-300 text-sm sm:text-base">Saltos reales</p>
            <p className="text-xs sm:text-sm text-gray-400">Interrumpidas</p>
          </div>
          
          <div className="text-center p-4 sm:p-6 bg-blue-500/10 rounded-lg border border-blue-500/20 hover:bg-blue-500/15 transition-colors duration-200 group">
            <div className="text-3xl sm:text-4xl mb-3">🔄</div>
            <h3 className="text-xl sm:text-2xl font-bold text-blue-400 mb-2">
              {stats.totalRestartSongs.toLocaleString()}
            </h3>
            <p className="text-gray-300 text-sm sm:text-base">Reinicios</p>
            <p className="text-xs sm:text-sm text-gray-400">Desde el inicio</p>
          </div>
          
          <div className="text-center p-4 sm:p-6 bg-red-500/10 rounded-lg border border-red-500/20 hover:bg-red-500/15 transition-colors duration-200 group">
            <div className="text-3xl sm:text-4xl mb-3">📊</div>
            <h3 className="text-xl sm:text-2xl font-bold text-red-400 mb-2">
              {stats.skipRate}%
            </h3>
            <p className="text-gray-300 text-sm sm:text-base">Tasa de salto</p>
            <p className="text-xs sm:text-sm text-gray-400">Real</p>
          </div>
          
          <div className="text-center p-4 sm:p-6 bg-blue-500/10 rounded-lg border border-blue-500/20 hover:bg-blue-500/15 transition-colors duration-200 group">
            <div className="text-3xl sm:text-4xl mb-3">📈</div>
            <h3 className="text-xl sm:text-2xl font-bold text-blue-400 mb-2">
              {stats.restartRate}%
            </h3>
            <p className="text-gray-300 text-sm sm:text-base">Tasa de reinicio</p>
            <p className="text-xs sm:text-sm text-gray-400">Reproducciones</p>
          </div>
        </div>
      </div>

      {/* Top canciones salteadas vs reiniciadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Canciones realmente salteadas */}
        <div className="spotify-card">
          <h2 className="text-lg sm:text-xl font-bold text-red-400 mb-4 sm:mb-6 flex items-center">
            <span className="text-2xl sm:text-3xl mr-2">⏭️</span>
            Canciones realmente salteadas
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {stats.topSkippedSongs.length > 0 ? (
              stats.topSkippedSongs.map((song, index) => (
                <div key={`${song.trackName}-${song.artistName}`} className="flex justify-between items-center p-3 sm:p-4 bg-red-500/10 rounded-lg border border-red-500/20 hover:bg-red-500/15 transition-colors duration-200 group">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <span className="text-red-400 font-bold text-lg sm:text-xl flex-shrink-0">#{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm sm:text-base truncate">{song.trackName}</p>
                      <p className="text-gray-400 text-xs sm:text-sm truncate">{song.artistName}</p>
                    </div>
                  </div>
                  <span className="text-red-400 font-semibold text-sm sm:text-base flex-shrink-0 ml-2">{song.count} saltos</span>
                </div>
              ))
            ) : (
              <div className="text-center p-6 sm:p-8 text-gray-400">
                <div className="text-4xl sm:text-5xl mb-4">🎉</div>
                <p className="text-base sm:text-lg font-medium">¡No salteaste ninguna canción!</p>
                <p className="text-sm sm:text-base mt-2">O no tienes suficientes datos de canciones salteadas.</p>
              </div>
            )}
          </div>
        </div>

        {/* Canciones reiniciadas */}
        <div className="spotify-card">
          <h2 className="text-lg sm:text-xl font-bold text-blue-400 mb-4 sm:mb-6 flex items-center">
            <span className="text-2xl sm:text-3xl mr-2">🔄</span>
            Canciones reiniciadas
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {stats.topRestartSongs.length > 0 ? (
              stats.topRestartSongs.map((song, index) => (
                <div key={`${song.trackName}-${song.artistName}`} className="flex justify-between items-center p-3 sm:p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 hover:bg-blue-500/15 transition-colors duration-200 group">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <span className="text-blue-400 font-bold text-lg sm:text-xl flex-shrink-0">#{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm sm:text-base truncate">{song.trackName}</p>
                      <p className="text-gray-400 text-xs sm:text-sm truncate">{song.artistName}</p>
                    </div>
                  </div>
                  <span className="text-blue-400 font-semibold text-sm sm:text-base flex-shrink-0 ml-2">{song.count} reinicios</span>
                </div>
              ))
            ) : (
              <div className="text-center p-6 sm:p-8 text-gray-400">
                <div className="text-4xl sm:text-5xl mb-4">🎵</div>
                <p className="text-base sm:text-lg font-medium">¡No reiniciaste ninguna canción!</p>
                <p className="text-sm sm:text-base mt-2">O no tienes suficientes datos de reinicios.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top artistas salteados vs reiniciados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Artistas más salteados */}
        <div className="spotify-card">
          <h2 className="text-lg sm:text-xl font-bold text-red-400 mb-4 sm:mb-6 flex items-center">
            <span className="text-2xl sm:text-3xl mr-2">⏭️</span>
            Artistas más salteados
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {stats.topSkippedArtists.length > 0 ? (
              stats.topSkippedArtists.map((artist, index) => (
                <div key={artist.artistName} className="flex justify-between items-center p-3 sm:p-4 bg-red-500/10 rounded-lg border border-red-500/20 hover:bg-red-500/15 transition-colors duration-200 group">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <span className="text-red-400 font-bold text-lg sm:text-xl flex-shrink-0">#{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm sm:text-base truncate">{artist.artistName}</p>
                      <p className="text-xs sm:text-sm text-gray-400">{artist.totalSongs} canciones total</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="text-red-400 font-semibold text-lg sm:text-xl">{artist.skipPercentage.toFixed(1)}%</span>
                    <p className="text-xs sm:text-sm text-gray-400">{artist.skippedCount} saltos</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-6 sm:p-8 text-gray-400">
                <div className="text-4xl sm:text-5xl mb-4">🎉</div>
                <p className="text-base sm:text-lg font-medium">¡No salteaste ningún artista!</p>
                <p className="text-sm sm:text-base mt-2">O no tienes suficientes datos de canciones salteadas.</p>
              </div>
            )}
          </div>
        </div>

        {/* Artistas con más reinicios */}
        <div className="spotify-card">
          <h2 className="text-lg sm:text-xl font-bold text-blue-400 mb-4 sm:mb-6 flex items-center">
            <span className="text-2xl sm:text-3xl mr-2">🔄</span>
            Artistas con más reinicios
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {stats.topRestartArtists.length > 0 ? (
              stats.topRestartArtists.map((artist, index) => (
                <div key={artist.artistName} className="flex justify-between items-center p-3 sm:p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 hover:bg-blue-500/15 transition-colors duration-200 group">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <span className="text-blue-400 font-bold text-lg sm:text-xl flex-shrink-0">#{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm sm:text-base truncate">{artist.artistName}</p>
                      <p className="text-xs sm:text-sm text-gray-400">{artist.totalSongs} canciones total</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="text-blue-400 font-semibold text-lg sm:text-xl">{artist.restartPercentage.toFixed(1)}%</span>
                    <p className="text-xs sm:text-sm text-gray-400">{artist.restartCount} reinicios</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-6 sm:p-8 text-gray-400">
                <div className="text-4xl sm:text-5xl mb-4">🎵</div>
                <p className="text-base sm:text-lg font-medium">¡No reiniciaste ningún artista!</p>
                <p className="text-sm sm:text-base mt-2">O no tienes suficientes datos de reinicios.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Canciones más salteadas y reiniciadas por artista */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Canciones más salteadas por artista */}
        <div className="spotify-card">
          <h2 className="text-lg sm:text-xl font-bold text-red-400 mb-4 sm:mb-6 flex items-center">
            <span className="text-2xl sm:text-3xl mr-2">⏭️</span>
            Canciones más salteadas por artista
          </h2>
          <div className="space-y-4 sm:space-y-6">
            {stats.topSkippedArtists.slice(0, 3).map((artist) => {
              const artistSongs = stats.topSkippedSongsByArtist[artist.artistName]
              if (!artistSongs || artistSongs.length === 0) return null
              
              return (
                <div key={artist.artistName} className="bg-white/5 rounded-lg p-4 sm:p-6 hover:bg-white/10 transition-colors duration-200 group border border-white/10">
                  <h3 className="text-base sm:text-lg font-semibold text-red-400 mb-2 sm:mb-3">
                    {artist.artistName} ({artist.skipPercentage.toFixed(1)}% de saltos)
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                    {artist.skippedCount} de {artist.totalSongs} canciones saltadas
                  </p>
                  <div className="space-y-2 sm:space-y-3">
                    {artistSongs.map((song, index) => (
                      <div key={song.trackName} className="flex justify-between items-center p-2 sm:p-3 bg-white/5 rounded hover:bg-white/10 transition-colors duration-200 border border-white/5">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <span className="text-red-400 font-bold text-sm sm:text-base flex-shrink-0">#{index + 1}</span>
                          <p className="font-medium text-sm sm:text-base truncate">{song.trackName}</p>
                        </div>
                        <span className="text-red-400 font-semibold text-sm sm:text-base flex-shrink-0 ml-2">{song.count} saltos</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Canciones más reiniciadas por artista */}
        <div className="spotify-card">
          <h2 className="text-lg sm:text-xl font-bold text-blue-400 mb-4 sm:mb-6 flex items-center">
            <span className="text-2xl sm:text-3xl mr-2">🔄</span>
            Canciones más reiniciadas por artista
          </h2>
          <div className="space-y-4 sm:space-y-6">
            {stats.topRestartArtists.slice(0, 3).map((artist) => {
              const artistSongs = stats.topRestartSongsByArtist[artist.artistName]
              if (!artistSongs || artistSongs.length === 0) return null
              
              return (
                <div key={artist.artistName} className="bg-white/5 rounded-lg p-4 sm:p-6 hover:bg-white/10 transition-colors duration-200 group border border-white/10">
                  <h3 className="text-base sm:text-lg font-semibold text-blue-400 mb-2 sm:mb-3">
                    {artist.artistName} ({artist.restartPercentage.toFixed(1)}% de reinicios)
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                    {artist.restartCount} de {artist.totalSongs} canciones reiniciadas
                  </p>
                  <div className="space-y-2 sm:space-y-3">
                    {artistSongs.map((song, index) => (
                      <div key={song.trackName} className="flex justify-between items-center p-2 sm:p-3 bg-white/5 rounded hover:bg-white/10 transition-colors duration-200 border border-white/5">
                        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                          <span className="text-blue-400 font-bold text-sm sm:text-base flex-shrink-0">#{index + 1}</span>
                          <p className="font-medium text-sm sm:text-base truncate">{song.trackName}</p>
                        </div>
                        <span className="text-blue-400 font-semibold text-sm sm:text-base flex-shrink-0 ml-2">{song.count} reinicios</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
