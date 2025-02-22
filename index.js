require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const app = express()
const Note = require('./models/note')
const cors = require('cors')

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}


const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(cors())
app.use(express.json())
app.use(requestLogger)
app.use(express.static('build'))


let notes = []

  app.get('/', (req,res) => {
    res.send('<h1>Hello Earthair</h1>')
    console.log('GET / received',Date())
  })

  app.get('/api/notes', (req,res) => {
    Note.find({}).then(notes => {
      res.json(notes)
    })
    console.log('GET /api/notes received',Date())
  })

  app.get('/api/notes/:id', (request, response, next) => {
    Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        //console.log('Palvelin sanoo: 404 :(')
        response.status(404).end()
      }
    })
    .catch(error => next(error))
  })

  app.delete('/api/notes/:id', (request, response, next) => {
    Note.findByIdAndRemove(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
  })


  const generateId = () => {
    const maxId = notes.length > 0
      ? Math.max(...notes.map(n => n.id))
      : 0
    return maxId + 1
  }

  app.post('/api/notes', (request,response, next) => {
    console.log('POST')
    console.log(request.headers)

    const body = request.body
    
    if (body.content === undefined) {
      return response.status(400).json({error: 'content missing'})
    }

    const note = new Note({
      content: body.content,
      important: body.important || false,
      //id: generateId(),
    })
    //notes = notes.concat(note)
    note.save().then(savedNote => {
      response.json(savedNote)
    })
    .catch(error => next(error))
  })

// viestin sisällön muokkaus
app.put('/api/notes/:id', (request, response, next) => {
  const { content, important } = request.body
  
  Note.findByIdAndUpdate(
    request.params.id,
    { content, important },
    { new: true, runValidators: true, context: 'query'}
  )
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})
    
  // middleware routejen jälkeen
  // näin ei ole https://github.com/fullstack-hy2020/part3-notes-backend/blob/part3-3/index.js ??
  // const unknownEndpoint = (request, response) => {
  //   response.status(404).send({error: 'unknown endpoint'})
  // }

  // tämä vain tänne ja tuo ylös
  app.use(unknownEndpoint)
  app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
