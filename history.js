const history = require('./Spotify Account Data/StreamingHistory_music_0.json');

const sum = history.reduce((total, x) => { return x.msPlayed + total }, 0)

var songs = []
var artistas = []
var days = []

const conteoPorMes = {};
const conteoPorDiaSemana = {};

// Días de la semana (para asignar nombres)
const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

history.forEach((song) => {
    const foundSong = songs.filter((s) => s.artistName === song.artistName && s.trackName === song.trackName)
    if (foundSong && foundSong.length > 0){
        foundSong[0].count += 1;
    } else {
        songs.push({count: 1, ...song})
    }

    const foundArtist = artistas.filter((s) => s.artistName === song.artistName)
    if (foundArtist && foundArtist.length > 0){
        foundArtist[0].totalTime += song.msPlayed;
        foundArtist[0].uniqueSongs = [...new Set([song.trackName, ...foundArtist[0].uniqueSongs])];
    } else {
        artistas.push({totalTime: song.msPlayed, uniqueSongs: [songs], artistName: song.artistName})
    }

    const foundDay = days.filter((s) => s.endTime.split(" ")[0] === song.endTime.split(" ")[0])
    if (foundDay && foundDay.length > 0){
        foundDay[0].totalTime += song.msPlayed;
    } else {
        days.push({endTime: song.endTime, totalTime: song.msPlayed})
    }

    const fecha = new Date(song.endTime);
    
    // Extraemos el mes (1-12)
    const mes = fecha.getMonth(); // Enero = 0 en getMonth()
    const nombreMes = meses[mes];

    // Contamos por mes
    if (!conteoPorMes[nombreMes]) {
        conteoPorMes[nombreMes] = song.msPlayed;
    }
    conteoPorMes[nombreMes]+=song.msPlayed;

    // Extraemos el día de la semana (0-6)
    const diaSemana = fecha.getDay(); // Domingo = 0 en getDay()
    const nombreDia = diasSemana[diaSemana];

    // Contamos por día de la semana
    if (!conteoPorDiaSemana[nombreDia]) {
        conteoPorDiaSemana[nombreDia] = song.msPlayed;
    }
    conteoPorDiaSemana[nombreDia]+=song.msPlayed;

})

const fs = require('fs');

const output = {
    "Minutos escuchados": parseInt(sum / 60000),
    "Canciones escuchadas": songs.length,
    "Canciones más escuchadas": songs
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map((s) => `${s.trackName} (${s.artistName}) (${s.count} veces)`),
    "Artistas escuchados": artistas.length,
    "Artistas más escuchados por cantidad de canciones": artistas
        .sort((a, b) => b.uniqueSongs.length - a.uniqueSongs.length)
        .slice(0, 10)
        .map((s) => `${s.artistName} (${s.uniqueSongs.length} canciones)`),
    "Artistas más escuchados por cantidad de tiempo": artistas
        .sort((a, b) => b.totalTime - a.totalTime)
        .slice(0, 10)
        .map((s) => `${s.artistName} (${parseInt(s.totalTime / 60000)} minutos)`),
    "Días que más música escuché": days
        .sort((a, b) => b.totalTime - a.totalTime)
        .slice(0, 10)
        .map((s) => `${s.endTime.split(" ")[0]} (${parseInt(s.totalTime / 60000)} minutos) (${parseInt(s.totalTime / 3600000)} horas)`),
    "Por día de la semana": conteoPorDiaSemana,
    "Por mes": conteoPorMes
};

fs.writeFileSync('spotify_summary.json', JSON.stringify(output, null, 2));

console.log("Summary saved to 'spotify_summary.json'");