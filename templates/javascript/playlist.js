var lastUpdateTimeout = false

const app = new Vue({
  el: '#playlist',
  data: {
    message: 'Hello Spotify!',
    auth: false,
    searchTerm: '',
    search: {
      results: []
    },
    playlist: {
      tracks: []
    }
  },
  filters: {
    pretty: (data) => JSON.stringify(data, null, 2)
  },
  watch: {
    searchTerm: (nextSearch, prevSearch) => {
      const now = Date.now()
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
  $.getJSON('/views/playlist.php?search=' + text)
    .done(data => {
      app.search.results = data
    }).fail(( jqxhr, textStatus, error ) => {
      app.search.results = {
        error: [textStatus, ', ', error].join('')
      }
    })
}

function getCredentials() {
  $.getJSON('/views/playlist.php?me=1')
    .done(data => {
      app.auth = data
    }).fail(( jqxhr, textStatus, error ) => {
      app.auth = {
        error: [textStatus, ', ', error].join('')
      }
    })
}

getCredentials()

const playlistEl = document.getElementById('playlist')
playlistEl.style.display = 'block';
