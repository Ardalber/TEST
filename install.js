// Rend la calculette installable sur le téléphone et utilisable sans internet.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

const installBtn = document.getElementById('install');
const help = document.getElementById('install-help');
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
let deferred = null;

if (!standalone) {
  installBtn.hidden = false;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferred = e;
  });
  installBtn.addEventListener('click', async () => {
    if (deferred) {
      deferred.prompt();
      const { outcome } = await deferred.userChoice;
      deferred = null;
      if (outcome === 'accepted') installBtn.hidden = true;
      return;
    }
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    help.innerHTML = ios
      ? 'Dans Safari : touche <b>Partager</b> ⬆️ puis <b>« Sur l’écran d’accueil »</b>.'
      : 'Dans Chrome : menu <b>⋮</b> en haut à droite puis <b>« Installer l’application »</b> ou <b>« Ajouter à l’écran d’accueil »</b>.';
    help.hidden = false;
  });
  window.addEventListener('appinstalled', () => { installBtn.hidden = true; help.hidden = true; });
}
