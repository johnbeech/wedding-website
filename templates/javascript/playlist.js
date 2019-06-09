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
          items: []
        }
      }
    },
    playlist: {
      tracks: []
    }
  },
  methods: {
    connectWithSpotify: (event) => {
      document.location = '/views/playlist.php'
    },
    addTrack: (trackId) => {
      console.log('TODO: Add track to playlist', trackId)
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

      tracks.items.forEach(track => {
        track.artUrl = (track.album.images.filter(n => n.width === 64)[0] || {}).url
      })

      app.search.results = data
    }).fail(( jqxhr, textStatus, error ) => {
      app.advice = `Unable to contact server: ${textStatus} ${error}`
    })
}

function getCredentials() {
  $.getJSON('/views/playlist.php?me=1')
    .done(data => {
      app.auth = data
      app.advice = data.advice
    }).fail(( jqxhr, textStatus, error ) => {
      app.auth = {
        error: [textStatus, ', ', error].join('')
      }
    })
}

getCredentials()

const playlistEl = document.getElementById('playlist')
playlistEl.style.display = 'block';
