var lastUpdateTimeout = false

const app = new Vue({
  el: '#rsvp',
  data: {
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
  console.log('TODO: Send the RSVP data somewhere', data)
}

const rsvpEl = document.getElementById('rsvp')
rsvpEl.style.display = 'block'
