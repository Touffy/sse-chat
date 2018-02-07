# Server-Sent Events Demo App

This is a toy chat app designed to showcase a simple, barebones (and dependecy-free) node.js implementation of an [event-stream](https://html.spec.whatwg.org/multipage/server-sent-events.html) server with support for Last-Event-ID.

## how do I run it?

```sh
npm start
```

It will serve the chat API (consisting of `GET /` and `POST /send`) on port 8916 by default.

As of this writing, it is not a standalone server: the node.js app will only serve the API. You are expected to use an HTTP server like nginx to serve the static files inside the 'front' directory, and, if you'd like to, reverse-proxy the API. A sample nginx proxy configuration is provided in the 'nginx' directory because proxying event-streams isn't completely straightforward. You don't *have* to proxy the node app, though, since it implements CORS on its own.

## should I deploy this on my real-world, commercial website?

It was presented in front of an audience including [Oleg](https://github.com/olegskl) so it makes some effort at security, preventing buffer overflows, script injections, and refusing to serve more than 1k simultaneous streams. Since it has no dependency, it is safe from npm-based attacks. It is entirely vulnerable to DOS attacks.

It is very fast and memory-efficient, and writes nothing to the filesystem (no logs either).

And no. Why would you? it's a *toy* for *showcasing a technology*!

## license

[MIT](https://tldrlegal.com/license/mit-license)
