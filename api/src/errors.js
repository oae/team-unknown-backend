const BaseError = class BaseError extends Error {};

exports.UnknownError = class UnknownError extends BaseError {};
exports.MakerNotFoundError = class MakerNotFoundError extends BaseError {};
exports.ValidationError = class ValidationError extends BaseError {};
exports.UserNotFoundError = class UserNotFoundError extends BaseError {};
exports.AuthenticationError = class AuthenticationError extends BaseError {};
exports.UserAlreadyExistsError = class UserAlreadyExistsError extends BaseError {};
exports.ChannelNotExistsError = class ChannelNotExistsError extends BaseError {};
exports.MethodNotFoundError = class MethodNotFoundError extends BaseError {};
exports.JSONParseError = class JSONParseError extends BaseError {};
