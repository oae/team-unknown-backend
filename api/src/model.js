const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const LocationSchema = new Schema({
  type: String,
  coordinates: [Number],
});

const userDescription = {
  deviceId: String,
  online: Boolean,
  location: LocationSchema,
};

const MakerSchema = new Schema({
  ...userDescription,
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
});

const Maker = mongoose.model('Maker', MakerSchema);
const Taker = mongoose.model('Taker', TakerSchema);
const Withdrawal = mongoose.model('Withdrawal', WithdrawalSchema);

module.exports = {
  Maker,
  Taker,
  Withdrawal,
};
