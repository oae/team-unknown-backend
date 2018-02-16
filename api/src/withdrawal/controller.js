module.exports = {
  hello,
};

function hello(req, res) {
  res.send({ hello: 'world' });
}
