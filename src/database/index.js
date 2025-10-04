import mongoose from "mongoose";

class Database {
  constructor() {
    this.mongo();
  }

  /**
   * Estabelece a conexão com o MongoDB.
   */
  async mongo() {
    const url = process.env.MONGODB_URI;
    console.log("version 5 -", new Date());

    try {
      this.mongoConnection = await mongoose.connect(url);
      console.log("Conectado ao MongoDB com sucesso!");
    } catch (error) {
      console.error("Erro ao conectar ao MongoDB:", error);
    }
  }
}

export default new Database();
