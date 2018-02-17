const OneSignal = require('onesignal-node');
const debug = require('debug')('pb:notifications');

const client = new OneSignal.Client({
  app: {
    appId: '1c61b926-c2ed-4e9b-86b5-8ef1801a64ec',
    appAuthKey: 'MmEwYTVjNzctNzNhOC00NzY4LTk1MDgtZGE5Y2Y1ZTVmYTU1',
  },
});

async function sendNotification({ contents, data }) {
  const notification = new OneSignal.Notification({
    contents,
  });

  notification.setIncludedSegments(['All']);
  notification.setParameter('data', data);

  const response = await client.sendNotification(notification);
  debug(
    'Sent notification. Got the response with %s code.',
    response.httpResponse.statusCode
  );

  return response;
}

module.exports = {
  sendNotification,
};
