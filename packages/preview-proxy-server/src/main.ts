import bodyParser from 'body-parser'
import express from 'express'
import fetch, { Headers } from 'node-fetch'

const app = express()

app.use(bodyParser.json())

function copyHeader(headerName: string, to: Headers, from: Headers) {
  const hdrVal = from.get(headerName)
  if (hdrVal) {
    to.set(headerName, hdrVal)
  }
}
app.all('*', async (req, res) => {
  console.log('req:', req.url)
  // if options send do CORS preflight
  if (req.method === 'OPTIONS') {
    res
      .status(200)
      .set({
        'Access-Control-Allow-Origin': req.get('origin') || '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers':
          'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-goog-visitor-id, x-origin, x-youtube-client-version, Accept-Language, Range, Referer',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'true',
      })
      .send()
    return
  } else {
    const url = new URL(req.url, `http://localhost/`)
    if (!url.searchParams.has('__host')) {
      res.status(400).send('Request is formatted incorrectly. Please include __host in the query string')
      return
    }

    // Set the URL host to the __host parameter
    url.host = url.searchParams.get('__host')!
    url.protocol = 'https'
    url.port = '443'
    url.searchParams.delete('__host')

    // Copy headers from the request to the new request
    const request_headers = new Headers(JSON.parse(url.searchParams.get('__headers') || '{}'))
    const reqHeaders = new Headers(req.headers as { [key: string]: string })
    copyHeader('range', request_headers, reqHeaders)
    !request_headers.has('user-agent') && copyHeader('user-agent', request_headers, reqHeaders)
    url.searchParams.delete('__headers')

    // console.log('URL:', url, "METHOD:", req.method, "headers:",request_headers, "BODY:", req.body )
    // console.log(request_headers, reqHeaders)

    console.log('fetching:', url)

    // Make the request to YouTube
    const fetchRes = await fetch(url, {
      method: req.method,
      headers: request_headers,
      body: JSON.stringify(req.body),
    })

    // Construct the return headers
    const headers = new Headers()

    // copy content headers
    copyHeader('content-length', headers, fetchRes.headers)
    copyHeader('content-type', headers, fetchRes.headers)
    copyHeader('content-disposition', headers, fetchRes.headers)
    copyHeader('accept-ranges', headers, fetchRes.headers)
    copyHeader('content-range', headers, fetchRes.headers)

    // add cors headers
    headers.set('Access-Control-Allow-Origin', req.get('origin') || '*')
    headers.set('Access-Control-Allow-Headers', '*')
    headers.set('Access-Control-Allow-Methods', '*')
    headers.set('Access-Control-Allow-Credentials', 'true')

    const rawHeaders = Object.assign({}, headers.raw())
    const processedHeaders = {} as { [key: string]: string }
    Object.keys(rawHeaders).forEach((key) => (processedHeaders[key] = rawHeaders[key][0]))

    // const buffer = Buffer.from(fetchRes.body, 'base64');
    //
    // zlib.unzip(buffer, { finishFlush: zlib.constants.Z_SYNC_FLUSH }, (err, buffer) => {
    //   if (err) {
    //     console.error('An error occurred:', err);
    //   }
    //   console.log(JSON.parse(buffer.toString()));
    // });

    const jsonBody = await fetchRes.json()
    console.log(jsonBody)

    // console.log(fetchRes.body)

    // Return the proxied response
    res.status(fetchRes.status).set(processedHeaders).send(jsonBody)
  }
})

const port = 4500

app.listen(port, () => {
  console.log('start')
  console.log(`Example app listening on port ${port}`)
})
