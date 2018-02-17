const mongoose = require('mongoose');
const bluebird = require('bluebird');
const timestamps = require('mongoose-timestamp');

const { WithdrawalStatus } = require('./constants');

const Schema = mongoose.Schema;

const LocationSchema = new Schema({
  type: String,
  coordinates: [Number],
});

const MakerSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  online: Boolean,
  minAmount: Number,
  maxAmount: Number,
  range: Number,
});

const UserSchema = new Schema({
  email: { type: String, index: { unique: true } },
  password: String,
  location: LocationSchema,
  maker: MakerSchema,
});

const TokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  name: String,
});

const WithdrawalSchema = new Schema({
  amount: Number,
  maker: { type: Schema.Types.ObjectId, ref: 'User' },
  taker: { type: Schema.Types.ObjectId, ref: 'User' },
  makerLocation: LocationSchema,
  takerLocation: LocationSchema,
  status: {
    type: String,
    enum: Object.values(WithdrawalStatus),
  },
});

UserSchema.plugin(timestamps);
TokenSchema.plugin(timestamps);
WithdrawalSchema.plugin(timestamps);

const User = mongoose.model('User', UserSchema);
const Token = mongoose.model('Token', TokenSchema);
const Withdrawal = mongoose.model('Withdrawal', WithdrawalSchema);

module.exports = bluebird.promisifyAll({
  User,
  Token,
  Withdrawal,
});
