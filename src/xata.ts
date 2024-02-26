// Generated by Xata Codegen 0.29.1. Please do not edit.
import { buildClient } from "@xata.io/client";
import type {
  BaseClientOptions,
  SchemaInference,
  XataRecord,
} from "@xata.io/client";

const tables = [
  {
    name: "games",
    columns: [
      { name: "name", type: "string", unique: true },
      { name: "description", type: "text" },
      { name: "slug", type: "text" },
      { name: "banner_url", type: "text" },
      { name: "icon_url", type: "text" },
    ],
    revLinks: [
      { column: "game", table: "projects" },
      { column: "game", table: "categories" },
      { column: "game", table: "loader" },
    ],
  },
  {
    name: "projects",
    columns: [
      { name: "title", type: "string", notNull: true, defaultValue: "no name" },
      { name: "body", type: "text" },
      { name: "slug", type: "string", unique: true },
      { name: "game", type: "link", link: { table: "games" } },
      { name: "categories", type: "multiple" },
      { name: "status", type: "string" },
      { name: "downloads", type: "int" },
      { name: "summary", type: "string" },
      { name: "iron_url", type: "text" },
      { name: "approved", type: "datetime" },
      { name: "webhook_sent", type: "bool" },
      { name: "color", type: "int" },
      { name: "organization", type: "link", link: { table: "organizations" } },
    ],
  },
  {
    name: "categories",
    columns: [
      { name: "game", type: "link", link: { table: "games" } },
      { name: "category", type: "string" },
      { name: "icon", type: "text" },
    ],
  },
  { name: "tags", columns: [] },
  {
    name: "loader",
    columns: [
      { name: "loader", type: "string" },
      { name: "game", type: "link", link: { table: "games" } },
      { name: "icon", type: "text" },
      { name: "project_type", type: "string" },
    ],
  },
  {
    name: "users",
    columns: [
      { name: "github_id", type: "string", unique: true },
      { name: "username", type: "string", unique: true },
    ],
    revLinks: [{ column: "user", table: "team_members" }],
  },
  {
    name: "organizations",
    columns: [
      { name: "slug", type: "string", unique: true },
      { name: "description", type: "text" },
      {
        name: "name",
        type: "string",
        notNull: true,
        defaultValue: "Mod Makers",
      },
      { name: "team", type: "link", link: { table: "teams" }, unique: true },
    ],
    revLinks: [{ column: "organization", table: "projects" }],
  },
  {
    name: "teams",
    columns: [],
    revLinks: [
      { column: "team", table: "organizations" },
      { column: "team", table: "team_members" },
    ],
  },
  {
    name: "team_members",
    columns: [
      { name: "team", type: "link", link: { table: "teams" } },
      { name: "user", type: "link", link: { table: "users" } },
      { name: "accepted", type: "bool", notNull: true, defaultValue: "false" },
      { name: "role", type: "string" },
      { name: "is_owner", type: "bool", notNull: true, defaultValue: "false" },
    ],
  },
] as const;

export type SchemaTables = typeof tables;
export type InferredTypes = SchemaInference<SchemaTables>;

export type Games = InferredTypes["games"];
export type GamesRecord = Games & XataRecord;

export type Projects = InferredTypes["projects"];
export type ProjectsRecord = Projects & XataRecord;

export type Categories = InferredTypes["categories"];
export type CategoriesRecord = Categories & XataRecord;

export type Tags = InferredTypes["tags"];
export type TagsRecord = Tags & XataRecord;

export type Loader = InferredTypes["loader"];
export type LoaderRecord = Loader & XataRecord;

export type Users = InferredTypes["users"];
export type UsersRecord = Users & XataRecord;

export type Organizations = InferredTypes["organizations"];
export type OrganizationsRecord = Organizations & XataRecord;

export type Teams = InferredTypes["teams"];
export type TeamsRecord = Teams & XataRecord;

export type TeamMembers = InferredTypes["team_members"];
export type TeamMembersRecord = TeamMembers & XataRecord;

export type DatabaseSchema = {
  games: GamesRecord;
  projects: ProjectsRecord;
  categories: CategoriesRecord;
  tags: TagsRecord;
  loader: LoaderRecord;
  users: UsersRecord;
  organizations: OrganizationsRecord;
  teams: TeamsRecord;
  team_members: TeamMembersRecord;
};

const DatabaseClient = buildClient();

const defaultOptions = {
  databaseURL:
    "https://Niklas-Wojtkowiak-s-workspace-ovvl73.us-east-1.xata.sh/db/xata-astro",
};

export class XataClient extends DatabaseClient<DatabaseSchema> {
  constructor(options?: BaseClientOptions) {
    super({ ...defaultOptions, ...options }, tables);
  }
}

let instance: XataClient | undefined = undefined;

export const getXataClient = () => {
  if (instance) return instance;

  instance = new XataClient();
  return instance;
};