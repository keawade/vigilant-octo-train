import { z } from "zod";
import type { ZodFormattedError } from "zod";
import { logger } from "./logger.ts";

const envSchema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"]),
  PORT: z.coerce
    .number()
    // Unsigned 16-bit integer
    .int()
    .gte(3000)
    .lte(2 ** 16 - 1)
    .default(3000),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
});

export const formatErrors = (
  errors: ZodFormattedError<Map<string, string>, string>,
) => {
  const collectedErrors = [...errors._errors];

  for (const [name, value] of Object.entries(errors)) {
    if (value && "_errors" in value) {
      collectedErrors.push(`${name}: ${value._errors.join(", ")}`);
    }
  }

  return collectedErrors;
};

const validatedEnv = envSchema.safeParse(process.env);

if (!validatedEnv.success) {
  if (process.env.NODE_ENV !== "production") {
    logger.fatal(
      { env: formatErrors(validatedEnv.error.format()) },
      "❌ Invalid environment variables",
    );
  }

  throw new Error("Invalid environment variables");
}

logger.info("✅ Validated environment variables");

export const env = validatedEnv.data;
