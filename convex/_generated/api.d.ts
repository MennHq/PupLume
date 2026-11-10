/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as app from "../app.js";
import type * as authHelper from "../authHelper.js";
import type * as behavior from "../behavior.js";
import type * as debug from "../debug.js";
import type * as debugLogs from "../debugLogs.js";
import type * as documents from "../documents.js";
import type * as emails from "../emails.js";
import type * as expenses from "../expenses.js";
import type * as family from "../family.js";
import type * as feeding from "../feeding.js";
import type * as grooming from "../grooming.js";
import type * as health from "../health.js";
import type * as http from "../http.js";
import type * as journal from "../journal.js";
import type * as notifications from "../notifications.js";
import type * as potty from "../potty.js";
import type * as puppies from "../puppies.js";
import type * as settings from "../settings.js";
import type * as sleep from "../sleep.js";
import type * as socialization from "../socialization.js";
import type * as tasks from "../tasks.js";
import type * as training from "../training.js";
import type * as users from "../users.js";
import type * as walk from "../walk.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  app: typeof app;
  authHelper: typeof authHelper;
  behavior: typeof behavior;
  debug: typeof debug;
  debugLogs: typeof debugLogs;
  documents: typeof documents;
  emails: typeof emails;
  expenses: typeof expenses;
  family: typeof family;
  feeding: typeof feeding;
  grooming: typeof grooming;
  health: typeof health;
  http: typeof http;
  journal: typeof journal;
  notifications: typeof notifications;
  potty: typeof potty;
  puppies: typeof puppies;
  settings: typeof settings;
  sleep: typeof sleep;
  socialization: typeof socialization;
  tasks: typeof tasks;
  training: typeof training;
  users: typeof users;
  walk: typeof walk;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
