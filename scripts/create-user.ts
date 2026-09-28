import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { z } from "zod";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const cliSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  name: z.string().max(100).optional(),
});

function parseArgs(args: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        result[key] = next;
        i++;
      } else {
        result[key] = "true";
      }
    }
  }
  return result;
}

async function run() {
  const rawArgs = process.argv.slice(2);
  const parsedArgs = parseArgs(rawArgs);

  const validation = cliSchema.safeParse({
    email: parsedArgs.email,
    password: parsedArgs.password,
    name: parsedArgs.name,
  });

  if (!validation.success) {
    console.error("❌ Validation failed:");
    for (const issue of validation.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    console.error("\nUsage: npm run user:create -- --email <email> --password <password> [--name <name>]");
    process.exit(1);
  }

  const { email, password, name } = validation.data;

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.error(`❌ User with email "${email}" already exists.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: name || null,
    },
  });

  console.info(`✓ Successfully created user: ${user.email} (ID: ${user.id})`);
}

run()
  .catch((err) => {
    console.error("❌ Error creating user:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
