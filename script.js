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
        'send_to': 'AW-17558991000/fMHOCJKS4qUbEJjh47RB',
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

makeBtn.addEventListener('click', (e) => {
  const text = input.value.trim();
  if (!text) {
    showToast('Enter text first', 1500);
    return;
  }

  createQR(text);

  // координати кнопки
  const rect = makeBtn.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // створюємо кілька хвиль
  for (let i = 0; i < 3; i++) {
    const wave = document.createElement('div');
    wave.className = 'wave';
    wave.style.left = `${centerX}px`;
    wave.style.top = `${centerY}px`;
    wave.style.animationDelay = `${i * 0.2}s`; // відставання між хвилями
    document.body.appendChild(wave);
    setTimeout(() => wave.remove(), 1600 + i * 200);
  }

  // створюємо світні частинки
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;

    // випадковий колір (синій-бірюзовий-білий)
    const colors = [
      "rgba(79,172,254,1)", 
      "rgba(0,242,254,1)", 
      "rgba(255,255,255,0.9)"
    ];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];

    // випадковий розліт
    const angle = Math.random() * 2 * Math.PI;
    const distance = 120 + Math.random() * 140; // сильніший вибух
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    particle.style.setProperty('--dx', `${dx}px`);
    particle.style.setProperty('--dy', `${dy}px`);

    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1400);
  }

  // показуємо модалку через 1с
  setTimeout(openModal, 1000);
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



const installBtn = document.getElementById('installBtn');
const installBtnDiv = document.getElementById('installPrompt');
let deferredPrompt = null;

// слухаємо подію і зберігаємо
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log("beforeinstallprompt зловили ✅");
});

// перевірка режиму
function updateInstallButton() {
  const isInStandaloneMode =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  if (!isInStandaloneMode) {
    // показуємо кнопку навіть якщо deferredPrompt ще немає
    installBtnDiv.style.display = 'block';

    installBtn.onclick = () => {
      if (deferredPrompt) {
        gtag_report_conversion();
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          console.log('User choice:', choiceResult.outcome);
          deferredPrompt = null;
          installBtnDiv.style.display = 'none';
        });
      } else {
        alert("Install prompt недоступний. Сайт ще не готовий до встановлення 🚀");
      }
    };
  } else {
    // у PWA кнопку ховаємо
    installBtnDiv.style.display = 'none';
  }
}

// перевірка щосекунди
setInterval(updateInstallButton, 1000);
