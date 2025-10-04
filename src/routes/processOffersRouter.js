import { Router } from 'express';
import ProcessedOffersRPAController from '../processedOffers/controller.js';
import ProcessedBestOffersRPAController from '../processedBestOffers/controller.js';
    
const processOffersRouter = Router();

// Rotas para Processamento de Ofertas
processOffersRouter.get('/rpa/offers/process', ProcessedOffersRPAController.processOffers);
processOffersRouter.get('/rpa/offers/create-queue/all', ProcessedOffersRPAController.createAllOffersQueue);
processOffersRouter.get('/rpa/offers/create-queue/one/:id', ProcessedOffersRPAController.createOfferQueue);
processOffersRouter.get('/rpa/offers/process/one/address/:id', ProcessedOffersRPAController.processOffersForOneAddress);

// Rotas para Processamento de Melhores Ofertas
processOffersRouter.get('/rpa/best-offers/process', ProcessedBestOffersRPAController.processBest);
processOffersRouter.get('/rpa/best-offers/process/one/:id', ProcessedBestOffersRPAController.processBestOneAddress);
processOffersRouter.get('/rpa/best-offers/create-queue/all', ProcessedBestOffersRPAController.createQueueAll);
processOffersRouter.get('/rpa/best-offers/create-queue/one/:id', ProcessedBestOffersRPAController.createQueueByAddress);


export default processOffersRouter;
