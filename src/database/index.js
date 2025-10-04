import mongoose from 'mongoose';

class Database {
  constructor() {
    this.mongo();
  }

  /**
   * Establishes the connection with MongoDB.
   */
  async mongo() {
    const url = process.env.MONGODB_URI;
    console.log('version 4', new Date());
    this.mongoConnection = await mongoose.connect(url, {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: false,
    });
  }
}
export default new Database();
