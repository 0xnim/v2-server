import express from 'express';
import { Request, Response } from 'express';
import { getXataClient } from '../xata.ts';

const router = express.Router();
const xata = getXataClient();


router.get('/search', async (req: Request, res: Response) => {
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


export default router;
