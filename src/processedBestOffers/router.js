// src/rpa/processedBestOffers/router.js
import { Router } from 'express';
import ProcessedBestOffersRPAController from './controller';

const ProcessedBestOffersRPARouter = new Router();

ProcessedBestOffersRPARouter.get(
  '/process',
  ProcessedBestOffersRPAController.processBest
);
ProcessedBestOffersRPARouter.get(
  '/process/one/:id',
  ProcessedBestOffersRPAController.processBestOneAddress
);
ProcessedBestOffersRPARouter.get(
  '/create-queue/all',
  ProcessedBestOffersRPAController.createQueueAll
);
ProcessedBestOffersRPARouter.get(
  '/create-queue/one/:id',
  ProcessedBestOffersRPAController.createQueueByAddress
);

export default ProcessedBestOffersRPARouter;
