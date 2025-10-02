import express, { type Express } from "express";
import session from "express-session";
import pgSession from "connect-pg-simple";
import pg from "pg";

const PgStore = pgSession(session);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set");
  }

  app.use(
    session({
      store: new PgStore({
        pool,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  return app;
}
