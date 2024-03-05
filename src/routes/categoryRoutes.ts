import express from 'express';
import { Request, Response } from 'express';
import { getXataClient } from '../xata.ts';
import { checkIfNumber } from '../utils/utils.ts';

const router = express.Router();
const xata = getXataClient();


router.get('/:id', async (req: Request, res: Response) => {
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


export default router;
