const server = location.origin + ':8916/'
const ui = {
  log: document.querySelector('main'),
  form: document.forms.chat,
  sendButton: document.querySelector('form button')
}

// sending
ui.form.addEventListener('submit', event => {
  event.preventDefault()
  ui.sendButton.disabled = true
  fetch(server + 'send', {
    method: 'POST',
    body: ui.form.text.value
  })
  .then(() => ui.sendButton.disabled = false)
  .catch(() => setTimeout(() => ui.sendButton.disabled = false), 2000)
  ui.form.text.value = ''
})

// receiving
const source = new EventSource(server)

source.addEventListener('message', event => {
  const data = JSON.parse(event.data)
  const p = ui.log.appendChild(document.createElement('p'))
  const t = p.appendChild(document.createElement('time'))
  t.dateTime = data.time
  t.textContent = new Date(data.time).toLocaleTimeString()
  p.appendChild(document.createElement('b')).textContent = data.author
  p.appendChild(document.createTextNode(data.text))
})
source.addEventListener('join', event => {
  const p = ui.log.appendChild(document.createElement('p'))
  p.className = 'status'
  p.textContent = `${event.data} s'est connecté.`
})
source.addEventListener('quit', event => {
  const p = ui.log.appendChild(document.createElement('p'))
  p.className = 'status'
  p.textContent = `${event.data} est parti.`
})