import app from './app'

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`FleetFlow API rodando na porta ${PORT}`)
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`)
})
