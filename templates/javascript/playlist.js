var lastUpdateTimeout = false

const app = new Vue({
  el: '#playlist',
  data: {
    message: 'Hello Spotify!',
    auth: {},
    searchTerm: '',
    advice: false,
    search: {
      results: {
        tracks: {
          items: false
        }
      }
    },
    playlist: {
      items: false
    },
    dupes: {}
  },
  methods: {
    connectWithSpotify: (event) => {
      document.location = '/views/playlist.php'
    },
    addTrack: (trackId) => {
      console.log('Request track be added to playlist', trackId)
      requestTrackForPlaylist(trackId)
    }
  },
  filters: {
    pretty: (data) => JSON.stringify(data, null, 2)
  },
  watch: {
    searchTerm: (nextSearch, prevSearch) => {
      if (lastUpdateTimeout) {
        clearTimeout(lastUpdateTimeout)
      }
      lastUpdateTimeout = setTimeout(() => {
        searchFor(nextSearch)
      }, 800)
    }
  }
})

function searchFor(text) {
  if (!text) {
    return
  }
  app.advice = 'Searching...'
  $.getJSON('/views/playlist.php?search=' + text)
    .done(data => {
      const tracks = data.tracks
      const items = tracks.items
      if (items && items.length === 1) {
        app.advice = `1 result returned:`
      }
      else if (items && items.length > 1) {
        app.advice = `${tracks.items.length} results returned:`
      }
      else {
        app.advice = `No results returned for: "${text}"`
      }

      items.forEach(track => {
        track.artUrl = (track.album.images.filter(n => n.width === 64)[0] || {}).url
        track.inPlaylist = app.dupes[track.id] ? true : false
      })

      app.search.results = data
    }).fail(( jqxhr, textStatus, error ) => {
      app.advice = `Unable to contact server: ${textStatus} ${error}`
    })
}

function mergeEventsWithPlaylist({ playlist, events }) {
  events = events || []
  playlist = playlist || {}
  let items = playlist.items || app.playlist.items || []

  // process events
  events.forEach(event => {
    if (event.requestTrack) {
      const item = {
        track: event.requestTrack,
        added_at: event.datetime,
        added_by: event.user
      }
      items.push(item)
    }
    if (event.removeTrackRequest) {
      items = items.filter(n => n.track.id !== event.removeTrackRequest)
    }
  })

  // dedupe
  app.dupes = {}
  items = items.filter(item => {
    const track = item.track
    if (app.dupes[track.id]) {
      // filter out dupes
      return false
    }
    app.dupes[track.id] = track
    // keep uniques
    return true
  })

  // add artwork
  items.forEach(item => {
    const track = item.track
    track.artUrl = (track.album.images.filter(n => n.width === 64)[0] || {}).url
  })

  playlist.items = items
  app.playlist = playlist
}

function getPlaylistTracks() {
  $.getJSON('/views/playlist.php?playlist=5R5M56FezDVaAQGGtataHy')
    .done(data => {
      const { playlist, events } = data
      mergeEventsWithPlaylist({ playlist, events })
    })
}

function requestTrackForPlaylist(trackId) {
  $.getJSON('/views/playlist.php?requestTrack=' + trackId + '&for=' + '5R5M56FezDVaAQGGtataHy')
    .done(data => {
      const events = data
      mergeEventsWithPlaylist({ events })
      try {
        app.search.results.tracks.items = app.search.results.tracks.items.filter(item => item.track.id === trackId)
      }
      catch(ex) {
        // ok, that didn't work...
      }
      app.advice = `Thank you! Added your track request to our play list :)`
    })
}

function removeTrackRequestForPlaylist(trackId) {
  $.getJSON('/views/playlist.php?removeTrackRequest=' + trackId + '&for=' + '5R5M56FezDVaAQGGtataHy')
    .done(data => {
      const events = data
      mergeEventsWithPlaylist({ events })
    })
}

function addTrackToPlaylist(trackId) {
  // only works for tracklist owner
  $.getJSON('/views/playlist.php?addTrack=' + trackId + '&to=' + '5R5M56FezDVaAQGGtataHy')
    .done(data => {
      const playlist = data
      mergeEventsWithPlaylist({ playlist })
    })
}

function getCredentials() {
  $.getJSON('/views/playlist.php?me=1')
    .done(data => {
      app.auth = data
      app.advice = data.advice
      getPlaylistTracks()
    }).fail(( jqxhr, textStatus, error ) => {
      app.auth = {
        error: [textStatus, ', ', error].join('')
      }
    })
}

getCredentials()

const playlistEl = document.getElementById('playlist')
playlistEl.style.display = 'block';
