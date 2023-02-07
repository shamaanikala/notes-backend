//const http = require('http')
const express = require('express')
const app = express()

app.use(express.json())


const cors = require('cors')
app.use(cors())

app.use(express.static('build'))


let notes = [
    {
      id: 1,
      content: "HTML is easy",
      important: true
    },
    {
      id: 2,
      content: "Browser can execute only JavaScript",
      important: false
    },
    {
      id: 3,
      content: "GET and POST are the most important methods of HTTP protocol",
      important: true
    },
    {
      id: 4,
      content: "Poistettava",
      important: false
    }
  ]
  


  
  // oma middleware
  const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:', request.path)
    console.log('Body:', request.body)
    console.log('---')
    next()
  }

  app.use(requestLogger) // json jälkeen!

  // app.get('/', (req,res) => {
  //   res.send('<h1>Hello Earthair</h1>')
  //   console.log('GET / received',Date())
  // })

  app.get('/api/notes', (req,res) => {
    res.json(notes)
    console.log('GET /api/notes received',Date())
  })

  app.get('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = notes.find(note => note.id === id)
    //console.log(note.id,typeof note.id, id, typeof id, note.id === id)
    //console.log(id, note)
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  })

  app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id)
    console.log('DELETE',id)
    response.status(204).end()
  })


  const generateId = () => {
    const maxId = notes.length > 0
      ? Math.max(...notes.map(n => n.id))
      : 0
    return maxId + 1
  }

  app.post('/api/notes', (request,response) => {
    console.log('POST')
    console.log(request.headers)

    const body = request.body
    
    if (!body.content) {
      return response.status(400).json({
        eror: 'content missing'
      })
    }

    const note = {
      content: body.content,
      important: body.important || false,
      id: generateId(),
    }
    notes = notes.concat(note)

    response.json(note)
  })
    
  // middleware routejen jälkeen
  const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
  }

  app.use(unknownEndpoint)
  

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
