const app = new Vue({
  el: '#registry-manager',
  data: {
    registryConfig: {},
    accessToken: false
  },
  filters: {
    total
  }
})

function total(registrys) {
  return registrys.reduce((acc, registry) => {
    const amount = registry.amount && registry.amount.value || 0
    return acc + amount
  }, 0)
}

function requestAccessToken() {
  $.getJSON('/views/registry-manager.php')
    .done(data => {
      const { accessToken } = data
      app.accessToken = accessToken
      // only show form when access token is received
      const registryEl = document.getElementById('registry-manager')
      registryEl.style.display = 'block'
      fetchRegistryConfig()
    })
}

function fetchRegistryConfig() {
  $.ajax({
     url: '/views/registry-manager.php?action=fetchRegistryConfig',
     type: 'GET',
     dataType: 'json',
     data: {},
     success: function(data) {
       app.registryConfig = data
     },
     error: function() {
       app.error = 'Unable to load registrys'
     },
     beforeSend: setHeader
  })
}

function setHeader(xhr) {
  xhr.setRequestHeader('Access-Token', app.accessToken)
}

requestAccessToken()
