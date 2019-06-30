const app = new Vue({
  el: '#pledge-manager',
  data: {}
})

function requestAccessToken() {
  $.getJSON('/views/pledge-manager.php')
    .done(data => {
      const { accessToken } = data
      app.accessToken = accessToken
      // only show form when access token is received
      const pledgeEl = document.getElementById('pledge-manager')
      pledgeEl.style.display = 'block'
    })
}

requestAccessToken()
