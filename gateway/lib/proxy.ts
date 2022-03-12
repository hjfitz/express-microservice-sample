import type {Method, AxiosRequestHeaders, AxiosRequestConfig} from 'axios'
import type {Request, Response} from 'express'
import axios from 'axios'
import cloneDeep from 'lodash/cloneDeep'

interface ProxyOpts {
	replaceFunc?: (url: string) => string
	timeout?: number
}

export default function proxy(to: string, opts?: ProxyOpts) {
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
