const makeBtn = document.getElementById('make-btn');
const input = document.getElementById('text-input');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('close-modal');
const qrcodeContainer = document.getElementById('qrcode');
const qrText = document.getElementById('qr-text');
const downloadBtn = document.getElementById('download-btn');
const copyBtn = document.getElementById('copy-btn');
const toast = document.getElementById('toast');

let qrCanvas = null;


function gtag_report_conversion(url) {
    var callback = function () {
      if (typeof(url) != 'undefined') {
        window.location = url;
      }
    };
    gtag('event', 'conversion', {
        'send_to': 'AW-17558991000/sw9JCOiAypsbEJjh47RB',
        'event_callback': callback
    });

    return false;
  }

function showToast(msg, timeout = 1800){
  toast.textContent = msg;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    toast.classList.remove('show');
    toast._t2 = setTimeout(()=> toast.classList.add('hidden'), 250);
  }, timeout);
}

function createQR(text){
  qrcodeContainer.innerHTML = '';
  qrCanvas = document.createElement('canvas');
  qrcodeContainer.appendChild(qrCanvas);

  QRCode.toCanvas(qrCanvas, text, {
    width: 240,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff"
    }
  }, function (error) {
    if (error) {
      console.error(error);
      showToast('Error generating QR', 1600);
    }
  });
  qrText.textContent = text;

}

function openModal(){
  modal.classList.remove('hidden');
  modal.style.opacity = '1';
  modal.setAttribute('aria-hidden', 'false');
}

function closeModalFn(){
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

makeBtn.addEventListener('click', () => {
  const text = input.value.trim();
  if (!text) {
    showToast('Enter text first', 1500);
    return;
  }
  createQR(text);
  setTimeout(openModal, 80);
});

closeModal.addEventListener('click', closeModalFn);
modal.addEventListener('click', (e) => {
  if(e.target === modal) closeModalFn();
});

downloadBtn.addEventListener('click', async () => {
  if(!qrCanvas){
    showToast('No QR generated', 1600);
    return;
  }
  try{
    const dataUrl = qrCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'qrcode.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('Download started');
  }catch(err){
    console.error(err);
    showToast('Error while downloading', 1600);
  }
});

copyBtn.addEventListener('click', async () => {
  if(!qrCanvas){
    showToast('No QR generated', 1600);
    return;
  }
  try{
    if(navigator.clipboard && window.ClipboardItem){
      qrCanvas.toBlob(async (blob)=>{
        if(!blob){ showToast('Failed to get image', 1600); return; }
        try{
          await navigator.clipboard.write([new ClipboardItem({'image/png': blob})]);
          showToast('QR copied');
        }catch(err){
          console.error(err);
          showToast('Copying not supported',1600);
        }
      });
      return;
    }
    await navigator.clipboard.writeText(qrText.textContent||'');
    showToast('Content copied to clipboard as text');
  }catch(err){
    console.error(err);
    showToast('Could not copy', 1600);
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => console.log('Service Worker registered'))
      .catch((error) => console.error('Service Worker registration failed:', error));
  });
}


let deferredPrompt;
const installBtn = document.getElementById('installBtn');


// Перевіряємо, чи сайт запущено як додаток
const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
                           || window.navigator.standalone === true;

if (!isInStandaloneMode) {
  // Обробка події beforeinstallprompt тільки якщо не PWA
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';

    installBtn.addEventListener('click', () => {
      gtag_report_conversion();
      installBtn.style.display = 'none';
      deferredPrompt.prompt();

      deferredPrompt.userChoice.then((choiceResult) => {
        console.log('User choice:', choiceResult.outcome);
        deferredPrompt = null;
      });
    });
  });
} else {
  // Якщо сайт запущено як додаток, ховаємо кнопку
  installBtn.style.display = 'none';
}




