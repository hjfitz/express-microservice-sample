import express from 'express'
import pino from 'express-pino-logger'

import proxy from './proxy'

const app = express()

app.use(pino())


app.use(express.json())

app.use('/users', proxy('http://localhost:3001/users', {
	replaceFunc: url => url.replace('/users', '')
}))

app.listen(3000, () => {
	console.log('app listening on localhost:3000')
})
