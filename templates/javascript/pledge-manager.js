const app = new Vue({
  el: '#pledge-manager',
  data: {
    pledgeConfig: {},
    accessToken: false
  },
  filters: {
    total
  }
})

function total(pledges) {
  return pledges.reduce((acc, pledge) => {
    const amount = pledge.amount && pledge.amount.value || 0
    return acc + amount
  }, 0)
}

function requestAccessToken() {
  $.getJSON('/views/pledge-manager.php')
    .done(data => {
      const { accessToken } = data
      app.accessToken = accessToken
      // only show form when access token is received
      const pledgeEl = document.getElementById('pledge-manager')
      pledgeEl.style.display = 'block'
      fetchPledgeConfig()
    })
}

function fetchPledgeConfig() {
  $.ajax({
     url: '/views/pledge-manager.php?action=fetchPledgeConfig',
     type: 'GET',
     dataType: 'json',
     data: {},
     success: function(data) {
       app.pledgeConfig = data
     },
     error: function() {
       app.error = 'Unable to load pledges'
     },
     beforeSend: setHeader
  })
}

function setHeader(xhr) {
  xhr.setRequestHeader('Access-Token', app.accessToken)
}

requestAccessToken()
