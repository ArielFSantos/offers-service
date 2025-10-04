import { Router } from 'express';
import ProcessedOffersRPAController from './controller';

const ProcessedOffersRPARouter = new Router();

ProcessedOffersRPARouter.get(
  '/process',
  ProcessedOffersRPAController.processOffers
);
ProcessedOffersRPARouter.get(
  '/create-queue/all',
  ProcessedOffersRPAController.createAllOffersQueue
);
ProcessedOffersRPARouter.get(
  '/create-queue/one/:id',
  ProcessedOffersRPAController.createOfferQueue
);
ProcessedOffersRPARouter.get(
  '/process/one/address/:id',
  ProcessedOffersRPAController.processOffersForOneAddress
);






export default ProcessedOffersRPARouter;
