import Queue_bestOffers from '../../../app/models/Queue_bestOffers';

export default async function createQueuesByAddress(addresses, isBuyAddress, lastQueueLot) {
  let lotNumber = lastQueueLot || 0;
  const batchSize = 100;
  const batches = [];
  for (let i = 0; i < addresses.length; i += batchSize) {
    batches.push(addresses.slice(i, i + batchSize));
  }

  const bulkOperations = batches.map(batch => ({
    updateOne: {
      filter: {
        addresses: { $in: batch.map(addr => addr._id) }
      },
      update: {
        $set: {
          addresses: batch.map(addr => addr._id),
          lot: ++lotNumber,
          processing: false,
          errorMessages: {},
          isBuyAddress, // Indica se é um endereço de compra ou venda
        },
      },
      upsert: true,
    },
  }));

  if (bulkOperations.length > 0) {
    await Queue_bestOffers.bulkWrite(bulkOperations);
    console.log(`Filas de ${isBuyAddress ? 'compra' : 'venda'} criadas para ${bulkOperations.length} lotes de endereços.`);
  }
}
