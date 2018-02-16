const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const WithdrawalSchema = new Schema({
  amount: Number,
});

module.exports = mongoose.model('withdrawal', WithdrawalSchema);
exports.Schema = WithdrawalSchema;
