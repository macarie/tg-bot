import { Bot } from "grammy";
import * as allActions from "./actions.ts";
import { env } from "./env.ts";

const bot = new Bot(env.TOKEN);

for (const [event, actions] of Object.entries(
	Object.groupBy(Object.values(allActions), ({ event }) => event),
) as [
	(typeof allActions)[keyof typeof allActions]["event"],
	(typeof allActions)[keyof typeof allActions][],
][]) {
	bot.on(
		event,
		...actions.reduce<(typeof actions)[number]["middleware"][]>(
			(middlewares, { middleware }) => {
				middlewares.push(middleware);

				return middlewares;
			},
			[],
		),
	);
}

bot.start();
