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
        private_key_id: '8c7304526b53cdd0fdc3795f2a76443a89765e08',
        private_key:
          '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5+fYMaAZ+jWiY\nRKIovl+cMXrD/S+mDheJHgepwBDNwvecz5H5RmrY5cog10rrp8OGzaqJUw8ednE6\n+boZm7wFvcMdY349iKg8v+Wfqpce7iBag/2f+HAazCxgEJdvQr2WVQUtt4YTQgR3\nA2asqj3+nzKgOxB19A2tkO0aknnoEuyCm9NAcAoUBcLqeXGpzMhPV3NpUxBcGTQA\nvDdrLJJj6bMp8fmVXkcgP7ZCUggKXRqUYQCv7fBff1c/DcLFBlyVKpRrWV5RtdCF\nWB4sFBKQfOxcWdEyRMxcoPG7+bt8FZ+inC+bKm6V00qO1dEZ1IJ8WT23ZihLqden\nEYtm2wunAgMBAAECggEAGd4KGpyndpe9mhxFv8wG6Wc6b6M6Kusf2+sI3tP/olcB\ncNawM49XUjbX/+xiF9f8SrY1h6c9XZvU0QKmH2S5aMUFrANILk/hMp3wVt536Y3u\ngxiDwOnh0eBfNbdpEMkkLJJDx6GUrP4MN++Jqu988vr6pC3C8t0Qv/j9+amw+hXW\nnPA9+zZvSZRmpu/xGVTDPVRqg/aYZC74I7Z9PHUE6FAAoDS8Q4swaCUyOB7cGlo9\nyjBFXvFH/Fo+rzEBmh9eIZVrvvvMZYATcYwIekHcQRH+tq/AnmJMmgZksIaWAAKT\nCf3Gg8gqrinMZa04PtSH5nvyU8CmgYpfZNMKRhov3QKBgQD13Z/IzN+DKvMXH3R5\ntbXGvGb9KTiGA6xTg5OObG6tYBGp3ivprN8508iOpmhiaFop2iAYfIr6/NuGBj3O\nC6iHmBV+jagWfGBLVWPuXzD4wlrFGpoAdmnYcrxuo65wN3KjeIv6nVmChCyePCIh\ne5pzWiMnUP/1lCWG0gsxAOekqwKBgQDBpGKB9twZ40hG59vsOIGnPTVbPKkHYbmb\ngmgscaPy4RQRUnnCOExjxioqiPCQPavumFq6h7RgTCb0Yoozdc+tcpk5vvs6rn6f\ncUOQx8fGU85w38BBklXZUrA2rjaGcD/DQ6OXgjaSx9GZDuAsXa6Sw1kD6kS29Y7S\nLoCdO/dc9QKBgQDorsjUWYfCdDhBDuTFdsHEhnMVbhhvRDSniONxq48HB99PmtKG\nQLO134dz8Wrijw2dhDBR3DQPmpQLAAcn5AKn6LeW4GtOdIERaou7gV0wX4dV+Hn8\nrBQ540QPlVq2GtOkf6ZCFP4sNfif/Br1AyxFtO2F/PNwL7dgI5Kx2sBfJwKBgCbw\noqqV9N7z2KYBnDUdi90Qrvkg8rC8UzHVgJNnatu9rWZqWnfXEG2D/Ri+nvmynS+G\nzb/y6C/xQGgmpLoCd/feMrftEuJTEr2HblngAul8EuiZ5jSJc+AXA76LPAW+7uOa\nZ3xhQA42Rozr8+KYGDIFPJJP+u974/OaTFzSIUU9AoGAcDixxqG8ibQLD12CQQ1w\n4y97FaXp7BFXy+xkw5AZO7kjkfREX5eG/BR7akhFnK9BsdSQfRDkPSrMu5aEhOzi\nyEBSeFPfKaxHXK4AjTPc/QXfCrYgAtl3ffp+HnYRf86vuzlAPXKTxzGDnhMNIL9e\nRHMKnfDnNczgcf/wqytxF98=\n-----END PRIVATE KEY-----\n',
        client_email:
          'firebase-adminsdk-36wuj@foxdc-app.iam.gserviceaccount.com',
        client_id: '115747306245712106679',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url:
          'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url:
          'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-36wuj%40foxdc-app.iam.gserviceaccount.com',
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
