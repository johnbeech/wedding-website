var lastUpdateTimeout = false

const app = new Vue({
  el: '#playlist',
  data: {
    message: 'Hello Spotify!',
    auth: {},
    searchTerm: '',
    advice: false,
    addAllAdvice: false,
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
    },
    removeTrack: (trackId) => {
      console.log('Request track be removed from playlist', trackId)
      removeTrackRequestForPlaylist(trackId)
    },
    addAllRequestsToSpotify
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
    item.requestedByCurrentUser = item.added_by.id === app.auth.id
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
  try {
    let items =  app.search.results.tracks.items
    items = items.filter(track => track.id === trackId)
    items.forEach(n => {
      n.inPlaylist = true
    })
    app.search.results.tracks.items = items
  }
  catch(ex) {
    // ok, that didn't work...
  }
  app.advice = `Adding your track request to our play list...`

  $.getJSON('/views/playlist.php?requestTrack=' + trackId + '&for=' + '5R5M56FezDVaAQGGtataHy')
    .done(data => {
      const events = data
      mergeEventsWithPlaylist({ events })
      try {
        let items =  app.search.results.tracks.items
        items = items.filter(track => track.id === trackId)
        items.forEach(n => {
          n.inPlaylist = true
        })
        app.search.results.tracks.items = items
      }
      catch(ex) {
        // ok, that didn't work...
      }
      app.advice = `Thank you! Added your track request to our play list :)`
    })
}

const playlistId = '5R5M56FezDVaAQGGtataHy'
function removeTrackRequestForPlaylist(trackId) {
  app.advice = `Removing that track request from our play list...`
  $.getJSON('/views/playlist.php?removeTrackRequest=' + trackId + '&for=' + playlistId)
    .done(data => {
      const events = data
      mergeEventsWithPlaylist({ events })
      app.advice = `Thank you for improving (?) the quality of our play list :D`
    })
}

function addTrackToPlaylist(trackId) {
  // only works for tracklist owner
  $.getJSON('/views/playlist.php?addTrack=' + trackId + '&to=' + playlistId)
    .done(data => {
      const playlist = data
      mergeEventsWithPlaylist({ playlist })
    })
}

function addAllRequestsToSpotify() {
  app.addAllAdvice = `Just a moment, adding all those track requests to your play list...`
  $.getJSON('/views/playlist.php?addAllRequestsToSpotify=1&playlist=' + playlistId)
    .done(data => {
      const { detail } = data
      if (detail) {
        app.addAllAdvice = `Unable to update playlist: ${detail}`
      }
      else {
        app.addAllAdvice = `Added all those track requests to your play list :)`
      }
    })
    .fail(err => {
      app.addAllAdvice = `Unable to update playlist, not sure why. Network error? :(`
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
