var app = new Vue({
  el: '#playlist',
  data: {
    message: 'Hello Spotify!',
    auth: false,
    form: {
      searchTerm: ''
    },
    search: {
      results: []
    },
    playlist: {
      tracks: []
    }
  },
  filters: {
    pretty: (data) => JSON.stringify(data, null, 2)
  }
})

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
