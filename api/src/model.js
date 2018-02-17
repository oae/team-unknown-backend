const mongoose = require('mongoose');
const { WithdrawalStatus } = require('./constants');

const Schema = mongoose.Schema;

const LocationSchema = new Schema({
  type: String,
  coordinates: [Number],
});

const userDescription = {
  deviceId: String,
  location: LocationSchema,
};

const MakerSchema = new Schema({
  ...userDescription,
  online: Boolean,
  minAmount: Number,
  maxAmount: Number,
  range: Number,
});

const TakerSchema = new Schema({
  ...userDescription,
});

const WithdrawalSchema = new Schema({
  amount: Number,
  maker: MakerSchema,
  taker: TakerSchema,
  status: {
    type: String,
    enum: Object.values(WithdrawalStatus),
  },
});

const Maker = mongoose.model('Maker', MakerSchema);
const Taker = mongoose.model('Taker', TakerSchema);
const Withdrawal = mongoose.model('Withdrawal', WithdrawalSchema);

module.exports = {
  Maker,
  Taker,
  Withdrawal,
};
