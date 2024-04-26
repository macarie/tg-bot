import {
	type BaseSchema,
	type Output,
	object,
	regex,
	safeParse,
	string,
} from "valibot";

export const validateEnv = <Schema extends BaseSchema>(
	schema: Schema,
): Output<Schema> => {
	const result = safeParse(schema, Bun.env);

	if (result.success === false) {
		console.log(result.issues);
		console.error(
			`❌ Invalid environment variables:\n\n${result.issues
				.map(
					({ message, path }) =>
						`  - ${message}${
							path ? ` (\`${path.map(({ key }) => key).join(".")}\`)` : ""
						}`,
				)
				.join("\n")}\n`,
		);

		throw new Error(
			"Invalid environment variables, check the console for more details.",
		);
	}

	return result.output;
};

const EnvSchema = object({
	TOKEN: string([
		regex(
			/^\d+:[\w-]+$/,
			"Expected token to be in the `<digits>:<alphanumeric>` format",
		),
	]),
});

export const env = validateEnv(EnvSchema);
