import Mongoose from 'mongoose';

const models = [
  'Grain',
  'Offer',
  'Order',
  'User',
  'OrderV2',
  'Demand',
  'Board',
  'List',
  'Card',
  'LOG',
  'TicketV2',
];

const ActivitySchema = new Mongoose.Schema(
  {
    device: { type: String },
    login: { type: Mongoose.Schema.Types.ObjectId, ref: 'Login' },
    user: { type: Mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    collectionModel: { type: String, enum: models },
    collectionName: String,
    collectionObjectId: {
      type: Mongoose.Schema.Types.ObjectId,
      refPath: 'collectionModel',
    },
    oldData: Object,
    read: Boolean,
    logData: Object,
    method: String,
    description: String,
    routeAcessed: [
      {
        routeAcessedName: { type: String },
        routeAcessedStartTime: { type: Date },
        routeAcessedEndTime: { type: Date },
        clicks: [
          {
            component: { type: String },
            componentText: { type: String},
            timestamp: { type: Date, required: true },
          }
        ],
      }
    ],
    lastActivity: { type: Date },
  },
  {
    timestamps: true,
  }
);

export default Mongoose.model('Activity', ActivitySchema);
