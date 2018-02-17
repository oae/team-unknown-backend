const humanFormat = require('human-format');

function withdrawalNotificationContent(
  { distance, amount },
  { language = 'en' }
) {
  const humanReadableDistance = humanFormat(distance, { unit: 'm' });
  switch (language) {
    case 'en':
      return `A taker within ${humanReadableDistance} wants to withdraw ${amount} TL.`;
    case 'tr':
      return `${humanReadableDistance} uzaklikta, ${amount} TL tutarinda islem icin onayiniz bekleniyor.`;
  }
}

module.exports = {
  withdrawalNotificationContent,
};
