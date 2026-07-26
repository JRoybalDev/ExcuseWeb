import { eq } from "drizzle-orm";
import { user } from "../db/schema.ts";
import { auth } from "./auth.ts";
import { db } from "./db.ts";
import { env } from "./env.ts";
import { logger } from "./logger.ts";

export async function seedBootstrapAdmin() {
  if (env.authMode !== "better-auth" || !env.betterAuthBootstrapAdminEmail || !env.betterAuthBootstrapAdminPassword) {
    return;
  }

  const [existing] = await db.select().from(user).where(eq(user.email, env.betterAuthBootstrapAdminEmail)).limit(1);

  if (existing) {
    if (!String(existing.role).split(",").includes("admin")) {
      await db.update(user).set({ role: "admin", updatedAt: new Date() }).where(eq(user.id, existing.id));
      logger.info("seed.admin_role_applied", {
        email: existing.email
      });
    }
    return;
  }

  await auth.api.createUser({
    body: {
      email: env.betterAuthBootstrapAdminEmail,
      password: env.betterAuthBootstrapAdminPassword,
      name: env.betterAuthBootstrapAdminName,
      role: "admin"
    }
  });

  logger.info("seed.admin_created", {
    email: env.betterAuthBootstrapAdminEmail
  });
}
