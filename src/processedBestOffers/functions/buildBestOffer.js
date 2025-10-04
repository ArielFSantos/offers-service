export const getDeliveryFormatMonth = deliveryDeadline => {
  return deliveryDeadline === 'spot'
    ? 'spot'
    : moment(deliveryDeadline).format('MM/YYYY');
}

//Construção do objeto newBest
export const buildBestOffer = (address, grains, processedOffers, isBuyAddress) => {
  const newBest = {
    type: isBuyAddress ? 'buying' : 'selling',
    name: address?.user?.name || 'Sem usuário vinculado',
    nameAddress: address?.name,
    userPromoter: address?.user?.isPromotor || false,
    nameCity: address?.city?.name,
    nameUf: address?.city?.uf,
    idAddress: address._id.toString(),
    simulated: address?.simulated,
    promotor: address?.user?.promotor || null,
    latitude: address?.farmLocation?.coordinates[1],
    longitude: address?.farmLocation?.coordinates[0],
    phone: address?.user?.phone || 'Sem usuário vinculado',
    offers: [],
  };

  const offersMap = new Map();

  processedOffers.forEach(ps => {
    const grain = grains.find(g => g.code === parseInt(ps.grain));
    if (!grain) return;

    const key = `${grain.code}_${ps.isGanhaGanha}_${getDeliveryFormatMonth(ps.deliveryDeadline)}`;

    let existingOffer = offersMap.get(key);

    if (!existingOffer) {
      const newOffer = {
        bagPrice: ps.bagPrice,
        code: grain.code,
        deliveryDeadline: ps.deliveryDeadline,
        name: grain.name,
        image: grain.image,
        offer: ps.offer,
        distance: ps.distance,
        transaction: ps._id,
        isGanhaGanha: ps.isGanhaGanha,
        isFobCity: ps.isFobCity,
        isFobWarehouse: ps.isFobWarehouse,
      };
      offersMap.set(key, newOffer);
    } else {
      if ((!isBuyAddress && ps.bagPrice > existingOffer.bagPrice) ||
        (isBuyAddress && ps.bagPrice < existingOffer.bagPrice)) {
        existingOffer.bagPrice = ps.bagPrice;
        existingOffer.offer = ps.offer;
        existingOffer.distance = ps.distance;
        existingOffer.transaction = ps._id;
      }
    }
  });

  const offers = Array.from(offersMap.values());
  newBest.offers = offers.sort((a, b) => {
  // Spot sempre primeiro
  if (a.deliveryDeadline === 'spot' && b.deliveryDeadline !== 'spot') return -1;
  if (b.deliveryDeadline === 'spot' && a.deliveryDeadline !== 'spot') return 1;

  // Ordena por data crescente
  return new Date(a.deliveryDeadline) - new Date(b.deliveryDeadline);
});

  return newBest;
};
