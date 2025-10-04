import Parameter from "../../models/Parameter.js";
import Freight from "../../models/Freight.js";
import Taxes from "../../models/Taxes.js";
import FreightPercentage from "../../models/FreightPercentage.js";

export default async function getParameters() {
  let freights;
  let parameters;
  let taxParams
  let grains;
  let freightPercentage

  try {
    [parameters] = await Parameter.find()
      .sort('-createdAt')
      .limit(1);

    freights = await Freight.find().sort('kmMin');

    taxParams = await Taxes.findOne();


    freightPercentage = await FreightPercentage.find();

  } catch (error) {
    throw new HttpError(
      'Falha ao buscar parâmetros para processamento de ofertas. Por favor, tente mais tarde.',
      500
    );
  }

  if (!freights || !parameters) {
    throw new HttpError(
      'Parâmetros para processamento de ofertas não encontrados. Por favor, tente mais tarde.',
      500
    );
  }

  return { freights, parameters, taxParams, freightPercentage };
}
