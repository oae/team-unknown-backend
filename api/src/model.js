const mongoose = require('mongoose');
const timestamps = require('mongoose-timestamp');

const { WithdrawalStatus } = require('./constants');

const Schema = mongoose.Schema;

const locationDefinition = {
  type: [Number],
  index: '2d',
};

const MakerSchema = new Schema({
  online: Boolean,
  minAmount: Number,
  maxAmount: Number,
  range: Number,
});

const UserSchema = new Schema({
  email: { type: String, index: { unique: true } },
  password: String,
  location: locationDefinition,
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
  makerLocation: locationDefinition,
  takerLocation: locationDefinition,
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

module.exports = {
  User,
  Token,
  Withdrawal,
};
