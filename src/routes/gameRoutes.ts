import express from 'express';
import { Request, Response } from 'express';
import { getXataClient } from '../xata.ts';

const router = express.Router();
const xata = getXataClient();

import { checkIfNumber } from '../utils/utils.ts';



router.get('/', async (req: Request, res: Response) => {
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

router.get('/:id', async (req: Request, res: Response) => {
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


router.get('/:id/versions', async (req: Request, res: Response) => {
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


export default router;
