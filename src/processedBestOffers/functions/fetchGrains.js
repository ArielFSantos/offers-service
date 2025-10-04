//Função que busca todas informações de graos do banco de dados
import Grain from '../../models/Grain.js';

export const fetchGrains = async () => {
  try {
    return await Grain.find().lean();
  } catch (error) {
    throw new Error('Erro na busca de graos');
  }
};
