import url from 'url';

import _ from 'underscore';
import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';

import { settings } from '../../settings/server';
import { addServerUrlToIndex } from '../lib/Assets';
import https from 'https';

const indexHtmlWithServerURL = addServerUrlToIndex(Assets.getText('livechat/index.html'));

WebApp.connectHandlers.use(
	'/livechat',
	Meteor.bindEnvironment((req, res, next) => {
		const reqUrl = url.parse(req.url);
		if (reqUrl.pathname !== '/') {
			return next();
		}

		res.setHeader('content-type', 'text/html; charset=utf-8');

		let domainWhiteList = settings.get('Livechat_AllowedDomainsList');
		if (req.headers.referer && !_.isEmpty(domainWhiteList.trim())) {
			domainWhiteList = _.map(domainWhiteList.split(','), function (domain) {
				return domain.trim();
			});

			const referer = url.parse(req.headers.referer);
			if (!_.contains(domainWhiteList, referer.host)) {
				res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
				return next();
			}

			res.setHeader('Content-Security-Policy', `frame-ancestors ${referer.protocol}//${referer.host}`);
		} else {
			// TODO need to remove inline scripts from this route to be able to enable CSP here as well
			res.removeHeader('Content-Security-Policy');
		}

		res.write(indexHtmlWithServerURL);
		res.end();
	}),
);

// Your new SSE endpoint that calls the AI model and streams the response
WebApp.connectHandlers.use(
	'/ai-chat-agent',
	Meteor.bindEnvironment(async (req, res) => {
		// Set headers for SSE
		res.setHeader('Content-Type', 'text/event-stream');
		res.setHeader('Cache-Control', 'no-cache');
		res.setHeader('Connection', 'keep-alive');
		res.setHeader('Access-Control-Allow-Origin', '*');

		const reqUrl = url.parse(req.url, true);

		if (reqUrl.pathname !== '/') {
			return next();
		}

		const message = reqUrl.query.text;
		console.log("🚀 ~ message:", message, req.body)
		const roomId = reqUrl.query.rid;

		if (!message || !roomId) {
			return res.status(400).json({ error: 'Missing text or rid parameter' });
		}

		// The URL of your AI model's API
		const aiModelUrl = new URL('https://wf.ultatel.com:5678/webhook/ultatel-support');

		const requestBody = JSON.stringify({
			text: message,
			rid: roomId,
		});

		// Configure the request options for the https module
		const options = {
			hostname: aiModelUrl.hostname,
			path: aiModelUrl.pathname,
			port: aiModelUrl.port,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(requestBody),
			},
			body: requestBody,
		};

		const aiReq = https.request(options, (aiRes) => {
			// Check for a successful response code
			if (aiRes.statusCode !== 200) {
				console.error('AI model request failed with status:', aiRes.statusCode);
				res.write(`data: ${JSON.stringify({ error: `AI model returned status code ${aiRes.statusCode}` })}\n\n`);
				return res.end();
			}

			// Listen for data chunks from the AI model's stream
			aiRes.on('data', (chunk) => {
				// 1. Convert the chunk (Buffer) to a string.
				const chunkString = chunk.toString();

				// 2. Parse the string as a JSON object.
				try {
					const data = JSON.parse(chunkString);

					// 3. Check if the parsed object has a 'content' field.
					if (data.content) {
						// 4. Re-format the 'content' as a new SSE message.
						//    The format must be 'data: [your content]\n\n'
						const sseMessage = `data: ${JSON.stringify(data.content)}\n\n`;

						// 5. Write the correctly formatted message to the client.
						res.write(sseMessage);
					}
				} catch (error) {
					console.error('Error parsing chunk from AI model:', error);
				}
			});

			// When the AI model's stream ends, end the connection to the client
			aiRes.on('end', () => {
				console.log("end nesma <3 ")
				res.write('event: complete\ndata: {}\n\n');
				setTimeout(() => {
					res.end();
				}, 50);
			});

			aiRes.on('error', (err) => {
				console.error('Error with AI model stream:', err);
				res.write(`data: ${JSON.stringify({ error: 'Stream error from AI model' })}\n\n`);
				res.end();
			});
		});

		// Handle errors with the request itself
		aiReq.on('error', (err) => {
			console.error('Request to AI model failed:', err);
			res.write(`data: ${JSON.stringify({ error: 'Request to AI model failed' })}\n\n`);
			res.end();
		});

		// Send the request body and end the request
		aiReq.write(requestBody);
		aiReq.end();

		// Handle client disconnect to clean up the request
		req.on('close', () => {
			aiReq.destroy(); // Abort the request to the AI model
		});
	}),
);
