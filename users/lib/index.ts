import bodyParser from 'body-parser'
import express from 'express'
import pino from 'express-pino-logger'

const app = express()



app.use(express.json())
app.use(pino())
app.use((req, res) => {
   console.log(req.body)
   res.send('OK')
})

app.listen(3001, () => {
   console.log('listening on http://localhost:3001')
})
