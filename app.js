const express = require('express')
const moviesJson = require('./movies.json')
const uuid = require('uuid')
const { validateMovie, validateParcialMovie } = require('./schemas/movies')
const cors = require('cors')

const app = express()
app.use(express.json())
app.disable('x-powered-by')

// CONFIGURACION DE CORS PARA ACEPTAR CIERTOS ORIGENES
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234',
      'http://movies.com',
      'http://midu.dev'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))

app.get('/', (req, res) => {
  res.json('Hola mundito')
})

app.get('/movies', (req, res) => {
  const { genre } = req.query
  if (genre) {
    const moviesFiltered = moviesJson.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    return res.json({ total: moviesFiltered.length, movies: moviesFiltered })
  }
  res.json({ total: moviesJson.length, movies: moviesJson })
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieById = moviesJson.find(movie => movie.id === id)
  if (movieById) return res.json(movieById)
  res.status(400).json({ message: 'Movie not found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) return res.status(400).json({ error: JSON.parse(result.error.message) })

  const newMovie = {
    id: uuid.v4(),
    ...result.data
  }

  moviesJson.push(newMovie)
  res.status(201).json(newMovie)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = moviesJson.findIndex(movie => movie.id === id)
  if (movieIndex === -1) return res.status(404).json({ message: 'Movie not found' })
  moviesJson.splice(movieIndex, 1)
  return res.json({ message: 'Movie deleted' })
})

app.patch('/movies/:id', (req, res) => {
  const { id } = req.params
  const result = validateParcialMovie(req.body)

  if (!result.success) return res.status(400).json({ error: JSON.parse(result.error.message) })

  const movieIndex = moviesJson.findIndex(movie => movie.id === id)

  if (movieIndex === -1) return res.status(404).json({ message: 'Movie not found' })

  const updateMovie = {
    ...moviesJson[movieIndex],
    ...result.data
  }
  moviesJson[movieIndex] = updateMovie

  res.json(result)
})

const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => {
  console.log(`server linten in http://localhost:${PORT}`)
})
