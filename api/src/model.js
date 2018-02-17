const mongoose = require('mongoose');
const bluebird = require('bluebird');
const timestamps = require('mongoose-timestamp');

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

const UserSchema = new Schema({
  email: { type: String, index: { unique: true } },
  password: String,
});

const TokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
});

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

UserSchema.plugin(timestamps);
TokenSchema.plugin(timestamps);
MakerSchema.plugin(timestamps);
TakerSchema.plugin(timestamps);
WithdrawalSchema.plugin(timestamps);

const User = mongoose.model('User', UserSchema);
const Token = mongoose.model('Token', TokenSchema);
const Maker = mongoose.model('Maker', MakerSchema);
const Taker = mongoose.model('Taker', TakerSchema);
const Withdrawal = mongoose.model('Withdrawal', WithdrawalSchema);

module.exports = bluebird.promisifyAll({
  User,
  Token,
  Maker,
  Taker,
  Withdrawal,
});
