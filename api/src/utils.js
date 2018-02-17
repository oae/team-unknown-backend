function latLngToPoint(lat, lng) {
  return {
    type: 'Point',
    coordinates: [lng, lat],
  };
}

module.exports = {
  latLngToPoint,
};
