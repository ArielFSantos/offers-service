// Função que busca todas as ofertas processadas relacionadas aos IDs dos endereços e aos critérios do filtro
import ProcessedOffer from '../../models/ProcessedOffer.js';

export const fetchProcessedOffers = async (addressIds, validOffers, isBuyAddress) => {
  const addressFilter = isBuyAddress ? { to: { $in: addressIds } } : { from: { $in: addressIds } };
  try {
    return await ProcessedOffer.find({
      offer: { $in: validOffers },
      isActive: true,
      ...addressFilter,
    }).lean();
  } catch (error) {
    throw new Error('Erro na busca de ofertas Processadas');
  }
};
