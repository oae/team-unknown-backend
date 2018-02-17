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

function confirmWithdrawalNotificationContent(
  { distance, amount },
  { language = 'en' }
) {
  const humanReadableDistance = humanFormat(distance, { unit: 'm' });
  switch (language) {
    case 'en':
      return `A maker ${humanReadableDistance} away has confirmed your 
      withdrawal request of ${amount} TL and they're on their way. Click here 
      to see real-time location updates from the maker.`;
    case 'tr':
      return `${amount} TL tutarinda isleminizi ${humanReadableDistance} uzaklikta 
      bir kullanici onayladi ve yola cikti. Gercek zamanli takip icin tiklayin.`;
  }
}

module.exports = {
  withdrawalNotificationContent,
  confirmWithdrawalNotificationContent,
};
