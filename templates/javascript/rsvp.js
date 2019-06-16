var lastUpdateTimeout = false

const app = new Vue({
  el: '#rsvp',
  data: {
    accessToken: false,
    submitted: false,
    submitting: false,
    message: 'Please complete the form to RSVP',
    howMany: 0,
    person1: {
      name: '',
      hasDietaryRequirements: 'unknown',
      dietaryRequirementsText: ''
    },
    person2: {
      name: '',
      hasDietaryRequirements: 'unknown',
      dietaryRequirementsText: ''
    },
    attending: 'unknown'
  },
  methods: {
    submitRSVPForm
  }
})

function copy(data) {
  return JSON.parse(JSON.stringify(data))
}

function submitRSVPForm() {
  console.log('Yay an RSVP form submission!')
  const model = app
  const data = copy({
    howMany: model.howMany,
    person1: model.person1,
    person2: model.person2,
    attending: model.attending
  })
  console.log('Sending the RSVP data somewhere:', data)
  model.submitting = true
  sendFormData(data)
}

function requestAccessToken() {
  $.getJSON('/views/rsvp.php')
    .done(data => {
      const { accessToken } = data
      app.accessToken = accessToken
      // only show form when access token is received
      const rsvpEl = document.getElementById('rsvp')
      rsvpEl.style.display = 'block'
    })
}

function sendFormData(event) {
  $.ajax({
     url: '/views/rsvp.php',
     type: 'POST',
     dataType: 'json',
     data: {
       action: 'recordEvent',
       event: JSON.stringify(event),
     },
     success: function() {
       app.rsvpSuccess = 'Recorded your RSVP'
       app.submitting = false
       app.submitted = true
     },
     error: function() {
       app.rsvpSuccess = 'Unable to record your RSVP ... please get in touch with Hannah or John!'
     },
     beforeSend: setHeader
  })

  function setHeader(xhr) {
    xhr.setRequestHeader('Access-Token', app.accessToken)
  }

  app.rsvpSuccess = 'Just a moment while we record your RSVP.'
}

requestAccessToken()
