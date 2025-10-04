import moment from 'moment';

export const roundNumber = (value, decimalDigits = 2) =>
  value && !Number.isNaN(value)
    ? Math.round((Number(value) + Number.EPSILON) * 10 ** decimalDigits) /
      10 ** decimalDigits
    : 0;

    
export default function processPrice(
  distance,
  offer,
  taxParams,
  parameters,
  freights,
  freightPercentage
) {
  try {
    const { to, from, fromUser, toUser, inKm } = distance;



    const isFox = false;
    let isCrossUF = false;

    if (!to.isToExport && !from?.isToExport && to?.city.uf !== from?.city.uf) {
      isCrossUF = true;
    }

    const isIntra = to?.city.uf === from?.city.uf;
    const isSameCity = to?.city.name === from?.city.name;
    const fromIsLegal = fromUser && fromUser.isLegalPerson ? fromUser.isLegalPerson : false;

    let bagPrice = 0;
    let bagPriceBroker = 0;
    let taxPrice = 0;

    const { icms, icmsSorgo, pisCofins, finance, icmsFrete } = taxParams;

    const {
      dirtRoadKmPrice,
      standardizedCornFoxFee,
      standardizedSoybeanFoxFee,
      standardizedSorghumFoxFee,
      unstandardizedCornFoxFee,
      unstandardizedSoybeanFoxFee,
      unstandardizedSorghumFoxFee,
      minFreightPrice,
      interestRatePerMonth,
    } = parameters;

    const foxFees = [
      standardizedCornFoxFee,
      standardizedSoybeanFoxFee,
      standardizedSorghumFoxFee,
      unstandardizedCornFoxFee,
      unstandardizedSoybeanFoxFee,
      unstandardizedSorghumFoxFee,
    ];

    let icmsTax = isIntra
      ? 0
      : from.city.uf === 'GO'
        ? icms.originGO
        : icms.default;

    let icmsValue = 0;
    // let icmsFreteTax = isIntra ? icmsFrete.in : icmsFrete.out;
    let icmsFreteTax = 0;
    let icmsFreteValue = 0;
    let icmsFreteBrokerValue = 0;

   // let pisConfinsTax = pisCofins;
    let pisConfinsTax = 0;
    let pisConfinsValue = 0;

    let financeTax = offer.financeTax || finance;

    if (to.isExportPoint || offer.b3Indexed) {

      icmsFreteTax = 0;
      icmsTax = 0;
      pisConfinsTax = 0;
      pisConfinsValue = 0;
    }

    if (offer.paymentDeadLine) {
      financeTax = (( 3.02 / 30 ) * offer.paymentDeadLine) / 100;
    }

    let financeValue = 0;

    let creditaPis = fromIsLegal;

    const { grain, bagPrice: offerBagPrice } = offer;

    let { pricePerKm } =
      freights.find(f => f.kmMin <= distance.inKm && distance.inKm <= f.kmMax) ||
      freights[freights.length - 1];

    // Antes do cálculo
    to.dirtRoadKm = Number.isNaN(to.dirtRoadKm) ? 0 : to.dirtRoadKm;
    from.dirtRoadKm = Number.isNaN(from.dirtRoadKm) ? 0 : from.dirtRoadKm;

    // Atualizar o cálculo para prevenir NaN
    let dirtRoadKm =
      (Number(to.dirtRoadKm) || 0) +
      (Number(from.dirtRoadKm) || 0);

    // get the date
    const offerDate =
      offer.deliveryDeadline === 'spot'
        ? new Date(offer.createdAt)
        : new Date(offer.deliveryDeadline);

    // get the applicable freight percentage
    const applicableFreightPercentage = freightPercentage.find(
      fp => offerDate >= new Date(fp.start) && offerDate <= new Date(fp.end)
    );

    // if (applicableFreightPercentage) {
    //   pricePerKm =
    //     pricePerKm + pricePerKm * (applicableFreightPercentage.percentage / 100);
    // }

    let dirtRoadFreightPrice = 0;

    if (dirtRoadKm > 20) {
      dirtRoadFreightPrice = roundNumber(20 * pricePerKm);
      dirtRoadFreightPrice =
        dirtRoadFreightPrice + roundNumber((dirtRoadKm - 20) * dirtRoadKmPrice);
    } else {
      dirtRoadFreightPrice = roundNumber(dirtRoadKm * pricePerKm);
    }

    // Calculates the freight price on asphalt.
    let freightPrice = roundNumber(inKm * pricePerKm);

    // Calculates the final freight price per bag.
    let fullFreightPrice = roundNumber(
      minFreightPrice + freightPrice + dirtRoadFreightPrice
    );

    // If the offer is a fox offer, the fox fee is added to the freight price.
    let increasedFreightPrice = 0;
    if (applicableFreightPercentage) {
      increasedFreightPrice = fullFreightPrice * (applicableFreightPercentage.percentage / 100);
      fullFreightPrice =
        fullFreightPrice + (fullFreightPrice * (applicableFreightPercentage.percentage / 100));
    }

    const { isFob, isFobCity, address, isFobWarehouse } = offer;
    let foxFee = 2;

    if (isFob || isFobCity || isFobWarehouse) {
      freightPrice = 0;
      fullFreightPrice = 0;
    }

    // Acrescimo de 8% para carregamento não padronizado.
    // if (grain > 3) {
    //   fullFreightPrice = fullFreightPrice * 1.08;
    // }

    // if (foxFeeManually || foxFeeManually === 0) {
    //   foxFee = foxFeeManually;
    // }

    // if (freightPriceManually || freightPriceManually === 0) {
    //   const freightManually = freightPriceManually;
    //   freightPrice = freightManually;
    //   fullFreightPrice = roundNumber(freightManually);
    // }

    if (address.isBuyAddress) {
      financeValue = financeTax * offerBagPrice;
      icmsFreteValue = to.isExportPoint ? 0 :
        (fullFreightPrice + foxFee + financeValue) / (1 - icmsFreteTax) -
        (fullFreightPrice + foxFee + financeValue);
      const preValue = offerBagPrice / (1 - pisConfinsTax);
      pisConfinsValue = offer.b3Indexed || to.isExportPoint ? 0 : pisConfinsTax * preValue;
      icmsValue = offer.b3Indexed || to.isExportPoint ? 0 : preValue * icmsTax;
      bagPrice =
        (offerBagPrice -
          fullFreightPrice -
          foxFee -
          financeValue -
          icmsFreteValue -
          icmsValue) /
        (1 + icmsTax);
      bagPriceBroker =
        (offerBagPrice * (1 - icmsFreteTax) -
          fullFreightPrice -
          foxFee -
          pisConfinsValue -
          icmsValue -
          financeValue) /
        (1 - icmsFreteTax);
    } else {
      pisConfinsValue = pisConfinsTax * offerBagPrice;
      icmsValue = icmsTax * offerBagPrice;
      const op =
        offerBagPrice -
        (offerBagPrice * icmsFreteTax +
          fullFreightPrice +
          foxFee +
          icmsValue);
      bagPrice = op / ((1 - icmsFreteTax - financeTax) > 1 ? (1 - icmsFreteTax - financeTax) : 1);
      const preValue = (offerBagPrice * (1 - icmsFreteTax) + fullFreightPrice + foxFee) / (1 - icmsFreteTax - pisConfinsTax - icmsTax - financeTax);
      bagPriceBroker = preValue;
      icmsFreteValue = (bagPrice - offerBagPrice) * icmsFreteTax;
      icmsFreteBrokerValue = (bagPriceBroker - offerBagPrice) * icmsFreteTax;
      financeValue = financeTax * preValue;
      bagPrice = bagPrice < 0 ? 0 : bagPrice - financeValue;
    }

    const paymentCreditInDays = distance.toUser && distance.toUser.paymentCreditInDays ? distance.toUser.paymentCreditInDays : 0;

    if (isNaN(dirtRoadKm)) {
      dirtRoadKm = 0;
    }

    return {
      increasedFreightPrice,
      amount: offer.amount,
      isGanhaGanha: offer.isGanhaGanha,
      commissionValue: offer.commissionValue,
      distance,
      freightPricePerKm: pricePerKm,
      freightKm: distance.inKm,
      payableUntil:
        offer.deliveryDeadline === 'spot'
          ? moment().toDate()
          : moment(offer.deliveryDeadline).add(paymentCreditInDays || 0, 'days'),
      deliveryDeadline: offer.deliveryDeadline,
      offerBagPrice,
      fromUser,
      toUser,
      grain,
      bagPrice: offer.b3Indexed ? offerBagPrice : bagPrice < 0 ? 0 : bagPrice,
      bagPriceBroker,
      dirtRoadFreightPrice,
      dirtRoadKmPrice,
      dirtRoadKm,
      foxFee,
      pricePerKm,
      freightPrice,
      fullFreightPrice,
      minFreightPrice,
      buyerType: distance.to.type,
      paymentCreditInDays,
      isBuying: offer.address.isBuyAddress,
      isFobCity: isFobCity || false,
      isFobWarehouse: isFobWarehouse,
      isFob: isFob || false,
      taxes: {
        icmsFreteTax,
        icmsValue,
        icmsTax,
        icmsFreteValue,
        icmsFreteBrokerValue,
        pisConfinsTax,
        pisConfinsValue,
        financeTax,
        financeValue,
        creditaPis,
      },
    };
  } catch (err) {
    throw Error(err)
  }

};
