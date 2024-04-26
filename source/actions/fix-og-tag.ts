import { createAction, getURLs } from "./_utils.ts";

type URLFixer = (url: URL) => string;

const fixers = {
	instagram: (url) => {
		url.host = "ddinstagram.com";
		url.search = "";

		return url.toString();
	},
	x: (url) => {
		url.host = "fxtwitter.com";
		url.search = "";

		return url.toString();
	},
} satisfies Record<string, URLFixer>;

const fixersMap = new Map([
	["instagram.com", fixers.instagram],
	["twitter.com", fixers.x],
	["x.com", fixers.x],
]);

export const fixOGTag = createAction("message::url", async (ctx) => {
	const urls = getURLs(ctx.message.entities, ctx.message.text);

	await Promise.all(
		urls.map((url) => {
			const fixer = fixersMap.get(url.host);

			if (fixer === undefined) {
				return;
			}

			return ctx.api.sendMessage(ctx.message.chat.id, fixer(url), {
				disable_notification: true,
				reply_parameters: {
					message_id: ctx.message.message_id,
					allow_sending_without_reply: true,
				},
			});
		}),
	);
});
