import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const genres = pgEnum("genres", [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Thriller",
  "Western",
]);

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name"),
  gh_username: text("gh_username"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const sessions = pgTable(
  "sessions",
  {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => {
    return {
      userIdIdx: index().on(table.userId),
    };
  },
);

export const verificationTokens = pgTable(
  "verificationTokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => {
    return {
      compositePk: primaryKey({ columns: [table.identifier, table.token] }),
    };
  },
);

export const accounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    refreshTokenExpiresIn: integer("refresh_token_expires_in"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    oauth_token_secret: text("oauth_token_secret"),
    oauth_token: text("oauth_token"),
  },
  (table) => {
    return {
      userIdIdx: index().on(table.userId),
      compositePk: primaryKey({
        columns: [table.provider, table.providerAccountId],
      }),
    };
  },
);

export const Movies = pgTable(
  "movies",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    genre: genres("genre"),
    rating: integer("rating"),
    title: text("title"),
    description: text("description"),
    content: text("content"),
    slug: text("slug")
      .notNull()
      .$defaultFn(() => createId()),
    image: text("image"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
    published: boolean("published").default(false).notNull(),
    userId: text("userId").references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  },
  (table) => {
    return {
      userIdIdx: index().on(table.userId),
    };
  },
);

export const reviews = pgTable(
  "reviews",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    rating: integer("rating"),
    content: text("content"),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
    userId: text("userId").references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    movieId: text("movieId").references(() => Movies.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  },
  (table) => {
    return {
      userIdIdx: index().on(table.userId),
      movieIdIdx: index().on(table.movieId),
    };
  },
);

export const actor = pgTable(
  "actor",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name"),
    image: text("image"),
    age: integer("age"),
  },
  (table) => {
    return {
      nameIdx: index().on(table.name),
    };
  },
);

export const ratings = pgTable(
  "ratings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    rating: integer("rating").notNull(), // Rating value (e.g. 1-5 or 1-10)
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" })
      .notNull()
      .$onUpdate(() => new Date()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    movieId: text("movieId")
      .notNull()
      .references(() => Movies.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (table) => {
    return {
      userIdIdx: index().on(table.userId),
      movieIdIdx: index().on(table.movieId),
    };
  },
);

export const movieActors = pgTable(
  "movie_actors",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    movieId: text("movie_id")
      .notNull()
      .references(() => Movies.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    actorId: text("actor_id")
      .notNull()
      .references(() => actor.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (table) => {
    return {
      movieActorIdx: index().on(table.movieId, table.actorId),
    };
  },
);

export const director = pgTable(
  "director",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name"),
    image: text("image"),
    age: integer("age"),
  },
  (table) => {
    return {
      nameIdx: index().on(table.name),
    };
  },
);

export const movieDirectors = pgTable(
  "movie_directors",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey(),
    movieId: text("movie_id")
      .notNull()
      .references(() => Movies.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    directorId: text("director_id")
      .notNull()
      .references(() => director.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (table) => {
    return {
      movieDirectorIdx: index().on(table.movieId, table.directorId),
    };
  },
);

export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, { references: [users.id], fields: [ratings.userId] }),
  movie: one(Movies, { references: [Movies.id], fields: [ratings.movieId] }),
}));

export const movieRelations = relations(Movies, ({ one, many }) => ({
  user: one(users, { references: [users.id], fields: [Movies.userId] }),
  reviews: many(reviews),
  ratings: many(ratings),
  movieActors: many(movieActors),
  movieDirectors: many(movieDirectors),
}));

export const actorRelations = relations(actor, ({ many }) => ({
  movieActors: many(movieActors),
}));

export const directorRelations = relations(director, ({ many }) => ({
  movieDirectors: many(movieDirectors),
}));

export const movieActorsRelations = relations(movieActors, ({ one }) => ({
  movie: one(Movies, {
    references: [Movies.id],
    fields: [movieActors.movieId],
  }),
  actor: one(actor, { references: [actor.id], fields: [movieActors.actorId] }),
}));

export const movieDirectorsRelations = relations(movieDirectors, ({ one }) => ({
  movie: one(Movies, {
    references: [Movies.id],
    fields: [movieDirectors.movieId],
  }),
  director: one(director, {
    references: [director.id],
    fields: [movieDirectors.directorId],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { references: [users.id], fields: [sessions.userId] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { references: [users.id], fields: [accounts.userId] }),
}));

export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  movies: many(Movies),
  reviews: many(reviews),
  ratings: many(ratings),
}));

export type SelectMovie = typeof Movies.$inferSelect;
export type SelectUser = typeof users.$inferSelect;
export type SelectReview = typeof reviews.$inferSelect;
export type SelectSession = typeof sessions.$inferSelect;
export type SelectAccount = typeof accounts.$inferSelect;
export type SelectActor = typeof actor.$inferSelect;
export type SelectDirector = typeof director.$inferSelect;
export type SelectRating = typeof ratings.$inferSelect;
