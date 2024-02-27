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
  const searchResults = await xata.db.games.search(query);
  res.send(searchResults);
});

app.get('/projects/:id', async (req: Request, res: Response) => {
  const projectId = req.params.id;
  if (!projectId) {
    res.status(400).send('Mod id is required');
  }
  const project = await xata.db.projects.read(projectId);

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
    //project_type: 
  }
  res.send(mod);
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


