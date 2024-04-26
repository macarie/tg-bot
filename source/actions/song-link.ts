import { createAction, getURLs } from "./_utils.ts";

const resolvableServices = [
	// https://music.apple.com/en/album/1736841064
	"music.apple.com",
	// https://open.spotify.com/album/3wCKwy1cHwBUCW4RQFvHHQ
	"open.spotify.com",
];

export const songLink = createAction("message::url", async (ctx) => {
	const urls = getURLs(ctx.update.message.entities, ctx.message.text);

	await Promise.all(
		urls.map(async (url) => {
			if (!resolvableServices.includes(url.host)) {
				return;
			}

			try {
				const response = await fetch(
					`https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(
						url.toString(),
					)}`,
				);
				const json = await response.json();

				if (typeof json.pageUrl !== "string") {
					return;
				}

				return ctx.api.sendMessage(ctx.message.chat.id, json.pageUrl, {
					disable_notification: true,
					reply_parameters: {
						message_id: ctx.message.message_id,
						allow_sending_without_reply: true,
					},
				});
			} catch {}
		}),
	);
});
