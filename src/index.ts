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
import projectRoutes from './routes/projectRoutes.ts';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// ROUTES
app.use('/v2', miscRoutes);
app.use('/v2/games', gameRoutes);
app.use('/v2/categories', categoryRoutes);
app.use('/v2/', searchRoutes); // In anticipation of different root search, the path is mostly defined in the searchRoutes.ts file
app.use('/v2/projects', projectRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


