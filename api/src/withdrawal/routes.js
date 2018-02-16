const Router = require('express').Router();
const controller = require('./controller');

Router.route('/hello').get(controller.hello);

module.exports = Router;
