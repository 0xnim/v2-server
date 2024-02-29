import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

import { getXataClient } from './xata.ts';
const xata = getXataClient();

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

function checkIfNumber(value: string) {
  return /^\d+$/.test(value);
}


app.get('/games', async (req: Request, res: Response) => {
  let pageNum  = req.query.page || 0;
  if (pageNum > 0) {
    pageNum = pageNum - 1;
  }
  let offset = pageNum * 50;
  const page = await xata.db.games.getPaginated({
    pagination: { size: 50, offset: offset }
  });
  res.send(page.records);
});

app.get('/game/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    // regex to check if id is made of only numbers
    if (checkIfNumber(id)) {
      const game = await xata.db.games.filter({ slug: id }).getMany(); 
      res.send(game);
    }
    const game = await xata.db.games.read(id);
    res.send(game);
  } catch (error) {
    if (error.status === 404) {
      res.status(404).send('Game not found');
    } else {
      res.status(500).send('Internal server error');
    }
  }
});

app.get('/game/:id/versions', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).send('Game id is required');
    } else if (!checkIfNumber(id)) {
      const versions = await xata.db.game_versions.filter({ "game.slug": id }).getMany();
      res.send(versions);
    } else {
      const versions = await xata.db.game_versions.filter({ "game.id": id }).getMany();
      res.send(versions);
    }
  } catch (error) {
    if (error.status === 404) {
      res.status(404).send('Game not found');
    } else {
      res.status(500).send('Internal server error');
    }
  }
});

app.get('/categories/:id', async (req: Request, res: Response) => {
  const gameId = req.params.id;
  try {
    if (!gameId) {
      res.status(400).send('Game id is required');
    } else if (!checkIfNumber(gameId)) {
      const categories = await xata.db.categories.filter({ "game.slug": gameId }).getMany();
      res.send(categories);
    } else {
      const categories = await xata.db.categories.filter({ "game.id": gameId }).getMany();
      res.send(categories);
    }
  } catch (error) {
    if (error.status === 404) {
      res.status(404).send('Game not found');
    } else {
      res.status(500).send('Internal server error');
    }
  } 
});

// search projects TODO
app.get('/search', async (req: Request, res: Response) => {
  const gameId = req.query.gameId;
  const query = req.query.q;
  if (!query) {
    res.status(400).send('Search query is required');
  }
  if (!gameId) {
    res.status(400).send('Game is required');
  }
  const { records } = await xata.db.projects
    .search(query, {
      filter: {
        "game.id": gameId
      },
      fuzziness: 2,
      prefix: "phrase",
  });
  // map everything
  const slug = records.map((record: any) => record.slug);
  const title = records.map((record: any) => record.title);
  const description = records.map((record: any) => record.description);
  const categories = records.map((record: any) => record.categories);
  const client_side = records.map((record: any) => record.client_side);
  const server_side = records.map((record: any) => record.server_side);
  const project_type = records.map((record: any) => record.project_type);
  const downloads = records.map((record: any) => record.downloads);
  const icon_url = records.map((record: any) => record.icon_url);
  const color = records.map((record: any) => record.color);
  const id = records.map((record: any) => record.id);
  /* Organization Stuff */
  const organizations = records.map((record: any) => record.organization);
  const organizationIds = organizations.map((organization: any) => organization.id);
  const organizationNamesReq = await xata.db.organizations.select(['name']).filter({ id: organizationIds }).getMany();
  const organizationNames = organizationNamesReq.map((organization: any) => organization.name);
  /* Version Stuff */
  
  // array of objects
  const results = records.map((record: any) => {
    return {
      slug: record.slug,
      title: record.title,
      description: record.description,
      categories: record.categories,
      client_side: record.client_side,
      server_side: record.server_side,
      project_type: record.project_type,
      downloads: record.downloads,
      icon_url: record.icon_url,
      color: record.color,
      id: record.id,
      organization: organizationNames[0], // Local index Supposed to be author: 
      // Local index versions:
      date_created: record.xata.createdAt,
      date_modified: record.xata.updatedAt,
      // Local index latest_version:
    }
  });
  res.send(results);


});

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


