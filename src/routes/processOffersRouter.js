import { Router } from 'express';
import ProcessedOffersRPAController from '../processedOffers/controller.js';
import ProcessedBestOffersRPAController from '../processedBestOffers/controller.js';
    
const processOffersRouter = Router();

processOffersRouter.post('/rpa/offers', ProcessedOffersRPAController.processOffers);
processOffersRouter.post('/rpa/best-offers', ProcessedBestOffersRPAController.processBest);

export default processOffersRouter;
