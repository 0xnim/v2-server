import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

import { getXataClient } from './xata.ts';
const xata = getXataClient();

dotenv.config();
// import env variables from 'pub.env'
dotenv.config({ path: 'pub.env' });

const APPLICATION_VERSION = process.env.VERSION;


// IMPORT ROUTES

import miscRoutes from './routes/miscRoutes.ts'
import gameRoutes from './routes/gameRoutes.ts';
import categoryRoutes from './routes/categoryRoutes.ts'
import searchRoutes from './routes/searchRoutes.ts';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// ROUTES
app.use('/v2', miscRoutes);
app.use('/v2/games', gameRoutes);
app.use('/v2/categories', categoryRoutes);
app.use('/v2/', searchRoutes); // In anticipation of different root search, the path is mostly defined in the searchRoutes.ts file


app.get('/projects/:id', async (req: Request, res: Response) => {
  const projectId = req.params.id;
  if (!projectId) {
    res.status(400).send('Mod id is required');
  }
  const project = await xata.db.projects.read(projectId);
  const versions = await xata.db.versions.select(['id', 'game_versions']).filter({ "project.id": projectId }).getMany();
  const versionIds = versions.map((version: any) => version.id);
  const organization = await xata.db.organizations.read(project.organization.id);
  // game versions are versions[].game_versions in an array
  // map through the versions and get the game_versions ids array
  const gameVersionIds = versions.map((version: any) => version.game_versions);
  // flatten the array of arrays
  const gameVersionIdsFlat = gameVersionIds.flat();

  const gameVersionMap = {
    $any: gameVersionIdsFlat
    .filter((id: any) => id !== null)
    .map((id) => ({ id: id }))
  };

  const gameVersions = await xata.db.game_versions.select([/*'id', 'game', */'version_number']).filter(gameVersionMap).getMany();

  // list of version numbers from  gameVersions[0].version_number
  const versionNumbers = gameVersions.map((version: any) => version.version_number);

  let mod = {
    slug: project.slug,
    title: project.title,
    description: project.description,
    categories: project.categories,
    client_side: project.client_side,
    server_side: project.server_side,
    body: project.body,
    status: project.status,
    game: project.game,
    project_type: project.project_type,
    downloads: project.downloads,
    icon_url: project.icon_url,
    color: project.color,
    id: project.id,
    team: organization.team.id,
    published: project.xata.createdAt,
    updated: project.xata.updatedAt,
    approved: project.approved,
    versions: versionIds,
    game_verions: versionNumbers, 
    loaders: project.loaders,
  }
  res.send(mod);
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


