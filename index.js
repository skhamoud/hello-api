const http = require('http');
const https = require('https');
const { URL, URLSearchParams } = require('url');
const { StringDecoder } = require('string_decoder');
const fs = require('fs');
const config = require('./config');

const { httpPort, httpsPort } = config;
const router = {
	sample(data, callback) {
		callback(200, { message: 'success' });
	},
	notFound(data, callback) {
		callback(404, { message: 'Not Found' });
	}
};

const httpServer = http.createServer(serversHandler);
httpServer.listen(httpPort, function() {
	console.log(`HTTP Server now listening on port ${httpPort}...`);
});

// Setup https server 
const httpsOptions = {
  key: fs.readFileSync('./https/key.pem'),
  cert: fs.readFileSync('./https/cert.pem')
}
const httpsServer = https.createServer(httpsOptions, function(req, res) {
	serversHandler(req, res, 'https');
});
httpsServer.listen(httpsPort, function() {
	console.log(`HTTPS Server now listening on port ${httpsPort}...`);
});

/** Handles the meat of server logic */
function serversHandler(req, res, protocol = 'http') {
	// Get url and parse it
	const parsedUrl = new URL( req.url, `${protocol}://localhost:${config[protocol+'Port']}` );

	// Get the path, trimmed down from starting and ending slashes
	const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

	// get the query params object
	const query = new URLSearchParams(parsedUrl.searchParams);

	// parse the method
	const method = req.method;

	// Get the headers as an object
	const headers = req.headers;

	// Get the payload if any
	const decoder = new StringDecoder('utf-8');
  let reqPayload = '';
  
	req.on('data', function(chunk) {
		reqPayload += decoder.write(chunk);
  });
  
	req.on('end', () => {
		reqPayload += decoder.end();
		const reqData = {
			path,
			method,
			headers,
			query,
			body: reqPayload
    };
    
		// figure out the handler
    const routeHandler = router[path] ? router[path] : router.notFound;
    
		// route the request to handler
		routeHandler(reqData, function(statusCode, payload) {
			// setup the status codes and Send the response
			statusCode = typeof statusCode === 'number' ? statusCode : 200;
      payload = typeof payload === 'object' ? payload : {};
      res.setHeader('Content-Type','application/json')
			res.writeHead(statusCode);
			res.end(JSON.stringify(payload));
		});
	});
}
