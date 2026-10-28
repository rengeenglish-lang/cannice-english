// Local HTTPS termination for secure-cookie/email-login browser tests. Never used in production.
import fs from 'node:fs';
import https from 'node:https';
import http from 'node:http';
if (process.env.CI !== 'true') throw new Error('This proxy is for CI only');
https.createServer({key:fs.readFileSync('/tmp/netfener-test.key'),cert:fs.readFileSync('/tmp/netfener-test.crt')},(request,response)=>{
  const upstream=http.request({hostname:'127.0.0.1',port:3000,path:request.url,method:request.method,headers:{...request.headers,'x-forwarded-proto':'https','x-forwarded-host':'localhost:3443'}},result=>{response.writeHead(result.statusCode,result.headers);result.pipe(response);});
  upstream.on('error',()=>{response.writeHead(502);response.end('Starting application');});
  request.pipe(upstream);
}).listen(3443,'127.0.0.1');
