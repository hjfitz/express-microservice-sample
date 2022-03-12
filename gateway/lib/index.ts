import type {Request, Response} from 'express'
import express from 'express'
import pino from 'express-pino-logger'
import cloneDeep from 'lodash/cloneDeep'
import axios, {AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse, Method} from 'axios'

const app = express()

app.use(pino())

interface ProxyOpts {
	replaceFunc?: (url: string) => string
	timeout?: number
}

function proxy(to: string, opts?: ProxyOpts) {
	let baseURL = to
	if (opts?.replaceFunc) {
		baseURL = opts.replaceFunc(to)
	}
	const remote = axios.create({baseURL, validateStatus: () => true})
	return async function proxyMiddleware(req: Request, res: Response) {
		console.log(`Proxying request to ${req.url}`)
		const {'content-length': _, ...headers} = cloneDeep(req.headers) as AxiosRequestHeaders
		const method = req.method as Method
		try {
			const config: AxiosRequestConfig = { method, headers  }
			if (req.body) {
				config.data = cloneDeep(req.body)
			}
			console.log(config)
			const resp = await remote(req.url, config)
			console.log(resp.config)
			res.status(resp.status).send(resp.data ?? resp.statusText)
		} catch (err) {
			res.status(500).send('Internal Server Error')
		}
	}
}

app.use(express.json())

app.use('/users', proxy('http://localhost:3001/users', {
	replaceFunc: url => url.replace('/users', '')
}))

app.listen(3000, () => {
	console.log('app listening on localhost:3000')
})
