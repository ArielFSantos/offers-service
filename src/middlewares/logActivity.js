import Activity from '../models/Activity.js';

const getModelNameFromUrl = url => {
  if (url.includes('card')) return 'Card';
  if (url.includes('list')) return 'List';
  if (url.includes('boards')) return 'Board';
  // Adicionar mais condições conforme necessário
  return null;
};

const logActivity = async (req, res, next) => {
  const { method, originalUrl, body } = req;
  const userInfo = req.headers['user-info']
    ? JSON.parse(req.headers['user-info'])
    : false;

  if (userInfo) {
    const { login, user } = userInfo;
    try {
      // Obter dados antigos do banco de dados se for uma atualização ou exclusão
      let oldData = null;
      if (['PUT', 'PATCH', 'DELETE'].includes(method)) {
        const modelName = getModelNameFromUrl(originalUrl);
        if (modelName) {
          const model = require(`../../v2/models/Board`)[modelName];
          const id =
            req.params.id ||
            req.params.listId ||
            req.params.cardId ||
            req.params.boardId;
          oldData = body;
        }
      }

      await Activity.create({
        login,
        user,
        content: `${method} ${originalUrl}`,
        collectionModel: getModelNameFromUrl(originalUrl),
        collectionName: originalUrl.split('/')[1],
        collectionObjectId:
          req.params.id ||
          req.params.listId ||
          req.params.cardId ||
          req.params.boardId,
        oldData,
        read: false,
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  next();
};

export default logActivity;
