let lastUpdateTimeout = false

const timeUntil = (function () {
  const SECOND = 1000
  const MINUTE = SECOND * 60
  const HOUR = MINUTE * 60
  const DAY = HOUR * 24
  const WEEK = DAY * 7
  const MONTH = DAY * 30.417
  const YEAR = DAY * 365.25

  function describeTimeUntil (input) {
    let unit, value, plural, past
    const ms = Math.abs(input)

    if (ms < SECOND) {
      return {
        value: ms,
        unit: 'millisecond',
        string: 'now',
        past: (input < 0)
      }
    } else if (ms < 2 * MINUTE) {
      value = Math.floor(ms / SECOND)
      unit = 'second'
    } else if (ms < 2 * HOUR) {
      value = Math.floor(ms / MINUTE)
      unit = 'minute'
    } else if (ms < 2 * DAY) {
      value = Math.floor(ms / HOUR)
      unit = 'hour'
    } else if (ms < 3 * WEEK) {
      value = Math.round(ms / DAY)
      unit = 'day'
    } else if (ms < 3 * MONTH) {
      value = Math.round(ms / WEEK)
      unit = 'week'
    } else if (ms < 2 * YEAR) {
      value = Math.round(ms / MONTH)
      unit = 'month'
    } else {
      value = Math.floor(ms / YEAR)
      unit = 'year'
    }

    plural = (value > 1) ? 's' : ''
    past = (input < 0) ? 'ago' : ''

    return {
      unit: unit,
      value: value,
      string: [value, unit + plural, past].join(' ').trim(),
      past: (input < 0)
    }
  }

  function timeUntil (date, context) {
    context = context || new Date()
    var diff = date.getTime() - context.getTime()

    return describeTimeUntil(diff)
  }

  return timeUntil
})()

const app = new Vue({
  el: '#attendee-list',
  data: {
    accessToken: '',
    responses: [],
    serverTime: false,
    message: false
  },
  filters: {
    filedate,
    timeSince
  },
  watch: {
    accessToken: (nextSearch, prevSearch) => {
      if (lastUpdateTimeout) {
        clearTimeout(lastUpdateTimeout)
      }
      lastUpdateTimeout = setTimeout(() => {
        requestAttendeeList(nextSearch)
      }, 800)
    }
  }
})

function timeSince(date) {
  const age = timeUntil(date, app.serverTime || new Date())
  return age.string
}

function filedate(string) {
  const datepart = string.substr(0, 19)
  const date = new Date(datepart)
  console.log('Parsed date', datepart, date)
  return date
}

function requestAttendeeList() {
  app.message = 'Requesting attendee list...'
  $.ajax({
     url: '/views/attendee-list.php',
     type: 'POST',
     dataType: 'json',
     data: {
       action: 'recordEvent',
       event: JSON.stringify(event)
     },
     success: function(data) {
       app.message = false
       app.responses = data.responses || [],
       app.serverTime = new Date(data.serverTime)
     },
     error: function() {
       app.message = 'Unable to load attendee list! Please check your password'
     },
     beforeSend: setHeader
  })

  function setHeader(xhr) {
    xhr.setRequestHeader('Access-Token', app.accessToken)
  }

  app.rsvpSuccess = 'Just a moment while we record your RSVP.'
}

requestAttendeeList()

const appEl = document.getElementById('attendee-list')
appEl.style.display = 'block';
