import type { Context, Filter, FilterQuery, Middleware } from "grammy";
import type { MessageEntity } from "grammy/types";

export const createAction: <Event extends FilterQuery>(
	event: Event,
	...middleware: Middleware<Filter<Context, Event>>[]
) => { event: Event; middleware: Middleware<Filter<Context, Event>> } = (
	event,
	...middleware
) => ({
	event,
	middleware: (ctx, next) =>
		Promise.all(
			middleware.map((middleware) => {
				const fn =
					typeof middleware === "function" ? middleware : middleware.middleware;

				let hasCalledNext = false;

				const wrappedNext = () => {
					hasCalledNext = true;

					return next();
				};

				Promise.resolve(fn(ctx, wrappedNext)).then(() => {
					if (hasCalledNext) {
						return;
					}

					return next();
				});
			}),
		),
});

export const getURLs = (
	entities: MessageEntity[] | undefined,
	message: string | undefined,
) =>
	(entities ?? []).flatMap(({ type, offset, length }) => {
		if (type === "url" && message !== undefined) {
			const url = new URL(message.slice(offset, offset + length));

			url.host = url.host.replace("www.", "");

			return url;
		}
		return [];
	});
