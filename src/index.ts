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
    if (!/^\d+$/.test(id)) {
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


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


