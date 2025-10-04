import mongoose from 'mongoose';
import Activity from './logActivity.js';

const logActivity = async (req, res, next) => {
  try {
    const {
      method,
      originalUrl,
      headers,
      body,
      params,
      query,
      ip,
      hostname,
    } = req;
    const user = headers['user-info']
      ? JSON.parse(decodeURIComponent(headers['user-info']))
      : false;

    if (!user) {
      return next();
    }

    req.headers['user-info'] = JSON.stringify(user);

    const collectionName =
      originalUrl.split('/')[1] === 'v2'
        ? originalUrl.split('/')[3]
        : originalUrl.split('/')[2];
    const collectionObjectId =
      params.id ||
      params.listId ||
      params.cardId ||
      params.boardId ||
      params.userId ||
      params.orderId ||
      params.offerId ||
      params.demandId ||
      params.addressId ||
      params.proposalId ||
      params.loginId ||
      params.ticketId ||
      params.operationId;

    const activity = new Activity({
      device: user.device || null,
      login: user.login || null,
      user: user.user || null,
      content: `${method} ${originalUrl} ${ip}`,
      collectionModel: 'LOG',
      collectionName,
      collectionObjectId,
      read: false,
      oldData: {},
      logData: {
        method,
        originalUrl,
        headers,
        body,
        params,
        query,
        ip,
        hostname,
      },
      method,
      routeAcessed: user.routeAcessed || [],
      lastActivity: new Date(),
    });

    await activity.save();
  } catch (error) {
    return next(new Error('Failed to log activity:', error));
  }
  next();
};

export default logActivity;
