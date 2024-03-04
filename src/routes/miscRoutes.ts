// routes/miscRoutes.ts
import express from 'express';
import { Request, Response } from 'express';
//import { getXataClient } from '../xata.ts';

// import dotenv
import dotenv from 'dotenv';
dotenv.config({ path: 'pub.env' });

const APPLICATION_VERSION = process.env.VERSION;

const router = express.Router();
//const xata = getXataClient();


const welcome = {
    about: "Welcome astronaut!",
    documentation: "https://docs.example.com",
    name: "astro-server",
    version: APPLICATION_VERSION
  };


router.get('/', (req: Request, res: Response) => {
  res.send(welcome);
});


export default router;
