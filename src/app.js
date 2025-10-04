import { initializeApp, cert } from 'firebase-admin/app';
import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import HttpError from './models/HttpError.js';
import processOffersRouter from './routes/processOffersRouter.js';
import './database/index.js';
import logActivity from './middlewares/logActivityT.js';

class App {
  constructor() {
    this.server = express();

    this.middlewares();
    this.firebaseSetup();
    this.routes();
  }

  firebaseSetup() {
    initializeApp({
      credential: cert({
        type: 'service_account',
        project_id: 'foxdc-app',
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
      }),
    });
  }

  middlewares() {
    this.server.use(cors());
    this.server.use(express.json({ limit: '50mb' }));
  }

  routes() {
    this.server.disable('x-powered-by');
    this.server.use(logActivity);

    this.server.use('/api', processOffersRouter);

    // Rota não encontrada
    this.server.use((req, res, next) => {
      next(new HttpError('Ops, não conseguimos encontrar a rota informada.', 404));
    });

    // Middleware de erro
    this.server.use((error, req, res, next) => {
      if (res.headersSent) {
        return next(error);
      }

      res.status(error.code || 500).json({
        data: null,
        message: error.message || 'Ocorreu um erro desconhecido.',
        status: 'ERRO',
      });
    });
  }
}

export default new App().server;
