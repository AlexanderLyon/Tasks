require('./App.js');
require('./tempScript.js');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
