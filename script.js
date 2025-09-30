const makeBtn = document.getElementById('make-btn');
const input = document.getElementById('text-input');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('close-modal');
const qrcodeContainer = document.getElementById('qrcode');
const qrText = document.getElementById('qr-text');
const downloadBtn = document.getElementById('download-btn');
const copyBtn = document.getElementById('copy-btn');
const toast = document.getElementById('toast');

let qrInstance = null;

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
  qrInstance = new QRCode(qrcodeContainer, {
    text: text,
    width: 240,
    height: 240,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
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
  const text = input.value;
  createQR(text);
  setTimeout(openModal, 80);
});

closeModal.addEventListener('click', closeModalFn);
modal.addEventListener('click', (e) => {
  if(e.target === modal) closeModalFn();
});

downloadBtn.addEventListener('click', async () => {
  const img = qrcodeContainer.querySelector('img');
  const canvas = qrcodeContainer.querySelector('canvas');

  try{
    if(img && img.src){
      const a = document.createElement('a');
      a.href = img.src;
      a.download = 'qrcode.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Завантаження почалося');
      return;
    }
    if(canvas){
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'qrcode.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Завантаження почалося');
      return;
    }
    showToast('Немає згенерованого зображення', 1600);
  }catch(err){
    showToast('Помилка при завантаженні', 1600);
    console.error(err);
  }
});

copyBtn.addEventListener('click', async () => {
  const img = qrcodeContainer.querySelector('img');
  const canvas = qrcodeContainer.querySelector('canvas');

  try{
    if(canvas && navigator.clipboard && window.ClipboardItem){
      canvas.toBlob(async (blob)=>{
        if(!blob){ showToast('Не вдалося отримати зображення', 1600); return; }
        try{
          await navigator.clipboard.write([new ClipboardItem({'image/png': blob})]);
          showToast('QR скопійовано у буфер');
        }catch(err){
          console.error(err);
          showToast('Копіювання не підтримується',1600);
        }
      });
      return;
    }
    if(img && img.src && navigator.clipboard && window.ClipboardItem){
      const response = await fetch(img.src);
      const blob = await response.blob();
      try{
        await navigator.clipboard.write([new ClipboardItem({[blob.type]: blob})]);
        showToast('QR скопійовано у буфер');
      }catch(err){
        console.error(err);
        showToast('Копіювання не підтримується',1600);
      }
      return;
    }
    await navigator.clipboard.writeText(qrText.textContent||'');
    showToast('Вміст скопійовано у буфер як текст');
  }catch(err){
    console.error(err);
    showToast('Не вдалося скопіювати', 1600);
  }
});
