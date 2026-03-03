document.addEventListener("DOMContentLoaded", () => {

  /* =====================
     IDENTITATE HOTEL
     ===================== */
  const hotelId = document.body.dataset.hotel;

  /* =====================
     CONFIG PER HOTEL
     ===================== */
  const HOTEL_CONFIG = {
    monopoly: {
      prices: { 1:200, 2:250, 3:250, 4:300 },
      micDejunPretAdult: 50,
      micDejunPretCopil: 5,
      hasBreakfast: true,
      hasOnlinePayment: true,
      hasCashPayment: true,
      blockedRanges: [
        { from: "2026-03-10", to: "2026-03-16" }
      ]
    },

    brasov: {
      prices: { 1:220, 2:280, 3:280, 4:350 },
      micDejunPretAdult: 60,
      micDejunPretCopil: 30,
      hasBreakfast: false,
       hasOnlinePayment: false,
       hasCashPayment: true,
      blockedRanges: [
        { from: "2026-02-05", to: "2026-02-12" }
      ]
    }
  };
  
  


  const config = HOTEL_CONFIG[hotelId];
  if (!config) return;


const paymentSelect = document.getElementById("payment_method");

if (config && paymentSelect) {

  // Elimină online dacă e dezactivat
  if (!config.hasOnlinePayment) {
    paymentSelect.querySelector('option[value="online"]')?.remove();
  }

  // Elimină cash dacă e dezactivat
  if (!config.hasCashPayment) {
    paymentSelect.querySelector('option[value="cash"]')?.remove();
  }

}





  /* =====================
     ELEMENTE
     ===================== */
  const rangeInput = document.getElementById("date_range");
  const camera     = document.getElementById("tip_camera");
  const adulti     = document.getElementById("adulti");
  const copii      = document.getElementById("copii");
  const mic        = document.getElementById("mic_dejun");
  const totalSpan  = document.getElementById("total_pret");
  const totalInput = document.getElementById("total_plata");

  const oraSosire  = document.getElementById("ora_sosire");
  const oraPlecare = document.getElementById("ora_plecare");

  let startDate = null;
  let endDate   = null;

  /* =====================
     MIC DEJUN – DISPONIBILITATE
     ===================== */
 

  /* =====================
     HELPERS
     ===================== */
  function clearTotal() {
    totalSpan.textContent = "0";
    totalInput.value = "";
  }

  function isBlocked(date) {
    return config.blockedRanges.some(r => {
      const s = new Date(r.from + "T00:00:00");
      const e = new Date(r.to   + "T23:59:59");
      return date >= s && date <= e;
    });
  }

  /* =====================
     CAMERE vs ADULȚI
     ===================== */
  function updateCameraOptions() {
    const nrAdulti = parseInt(adulti.value, 10);

    Array.from(camera.options).forEach(o => o.disabled = true);
    camera.options[0].disabled = false;

    if (nrAdulti === 1) enableRooms([1,2]);
    else if (nrAdulti === 2) enableRooms([2,3]);
    else if (nrAdulti >= 3) enableRooms([4]);

    if (camera.value && camera.querySelector(`option[value="${camera.value}"]`)?.disabled) {
      camera.value = "";
      clearTotal();
    } else {
      calc();
    }
  }

  function enableRooms(ids) {
    ids.forEach(id => {
      const opt = camera.querySelector(`option[value="${id}"]`);
      if (opt) opt.disabled = false;
    });
  }

  /* =====================
     PERIOADĂ (FLATPICKR)
     ===================== */
   if (rangeInput) {
  flatpickr(rangeInput, {
    mode: "range",
    dateFormat: "d.m.Y",
    minDate: "today",
    disableMobile: true,
    locale: { rangeSeparator: " - " },
    disable: [date => isBlocked(date)],

  onDayCreate: function(dObj, dStr, fp, dayElem) {

  const date = dayElem.dateObj;

  // 1️⃣ Marchează doar datele din blockedRanges
  if (isBlocked(date)) {
    dayElem.classList.add("blocked-custom");
  }

  // 2️⃣ Permite click pe zilele blocate și afișează mesaj
  if (dayElem.classList.contains("flatpickr-disabled") && isBlocked(date)) {

    dayElem.style.position = "relative";

    dayElem.addEventListener("click", function() {

      const old = dayElem.querySelector(".fp-msg");
      if (old) old.remove();

      const msg = document.createElement("div");
      msg.className = "fp-msg";
      msg.textContent = "Locație plină";

      dayElem.appendChild(msg);

      setTimeout(() => msg.remove(), 2000);

    });

  }

},

    onChange(dates, _, instance) {

      if (dates.length !== 2) {
        startDate = null;
        endDate = null;
        clearTotal();
        return;
      }

      if (dates.some(d => isBlocked(d))) {
        instance.clear();
        startDate = null;
        endDate = null;
        clearTotal();
        return;
      }

      startDate = dates[0];
      endDate   = dates[1];
      calc();
    }
  });
}


  /* =====================
     EVENIMENTE
     ===================== */
  adulti.addEventListener("change", updateCameraOptions);
  camera.addEventListener("change", calc);
  copii.addEventListener("change", calc);
  mic.addEventListener("change", calc);

  /* =====================
     CALCUL TOTAL
     ===================== */
  function calc() {
    if (!startDate || !endDate) return clearTotal();

    const cameraKey = parseInt(camera.value, 10);
    const nrAdulti  = parseInt(adulti.value, 10);
    const nrCopii   = parseInt(copii.value, 10) || 0;

    if (!cameraKey || !nrAdulti) return clearTotal();

    const nights = Math.round((endDate - startDate) / 86400000);
    if (nights < 1) return clearTotal();

    let total = config.prices[cameraKey] * nights;

    if (mic.checked) {
      total += nrAdulti * config.micDejunPretAdult * nights;
      total += nrCopii  * config.micDejunPretCopil * nights;
    }

    totalSpan.textContent = total;
    totalInput.value = total;
  }

  /* =====================
     POPUP
     ===================== */
  window.openBookingPopup = function () {
    if (!startDate || !endDate) {
      alert("Selectează perioada.");
      return;
    }
    document.getElementById("modal").style.display = "flex";
  };

  /* =====================
     SUBMIT FINAL (CRITIC)
     ===================== */
  window.beforeSubmitBooking = function () {

    if (!startDate || !endDate) {
      alert("Perioada sejurului nu este selectată.");
      return false;
    }

    const formatDate = d => {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    };

    document.getElementById("perioada_sejur").value =
      `${formatDate(startDate)} - ${formatDate(endDate)}`;

    document.getElementById("mic_dejun_text").value =
      mic.checked ? "Da" : "Nu";

    document.getElementById("total_plata").value =
      totalSpan.textContent.trim();

    document.getElementById("hotel_field").value =
      document.body.dataset.hotel || "";

    return true;
  };
  
 /* mutat de mine */
 
 
const breakfastWrapper = document.getElementById("breakfast-wrapper");

if (!config.hasBreakfast && breakfastWrapper) {
  breakfastWrapper.remove();
}



});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.info-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const details = btn.closest('.room-body').querySelector('.room-details');

      btn.classList.toggle('active');
      details.classList.toggle('open');
    });
  });
});

const HOTEL_ID = document.body.dataset.hotel; 
// ex: monopoly

fetch(`https://valentin571-wq.github.io/smart-feed/${HOTEL_ID}.json`)
  .then(r => r.json())
  .then(data => {
    document.querySelectorAll('[data-room]').forEach(el => {
      const roomId = el.dataset.room;
      const room = data.rooms[roomId];

      if (room) {
        el.textContent = `${room.price} ${data.currency} / noapte`;
      }
    });
  })
  .catch(err => {
    console.error("Nu s-au putut încărca prețurile", err);
  });


(() => {
  const slider = document.querySelector('#gallery');
  if (!slider) return;

  const track = slider.querySelector('.gallery-track');
  const slides = track.children;
  const prevBtn = slider.querySelector('.gallery-arrow.left');
  const nextBtn = slider.querySelector('.gallery-arrow.right');

  let index = 0;

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  nextBtn.addEventListener('click', () => {
    index = (index + 1) % slides.length;
    update();
  });

  prevBtn.addEventListener('click', () => {
    index = (index - 1 + slides.length) % slides.length;
    update();
  });

  /* ===== SWIPE MOBIL ===== */
  let startX = 0;

  track.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  });

  track.addEventListener('touchend', e => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (Math.abs(diff) > 50) {
      diff > 0 ? nextBtn.click() : prevBtn.click();
    }
  });
})();



(async () => {

  // 🔹 Luăm hotelul direct din body
  const hotel = document.body.dataset.hotel;

  console.log("Locatie detectata:", hotel);

  if (!hotel) {
    document.documentElement.innerHTML = "Hotel invalid";
    return;
  }

  try {

    const res = await fetch(
      ""https://www.smart-feedback.ro/kill/bootstrap.php?hotel=" + hotel,
      { cache: "no-store" }
    );

    const data = await res.json();

   if (!data.active) {
  document.documentElement.innerHTML = `
    <style>
      body{
        margin:0;
        height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#0f172a;
        font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;
        color:#fff;
      }
      .suspend-box{
        text-align:center;
      }
      .suspend-box h1{
        font-size:28px;
        margin:0 0 10px;
      }
      .suspend-box p{
        opacity:.7;
        margin:0;
        font-size:14px;
      }
    </style>
    <div class="suspend-box">
      <h1>Serviciul nu mai este activ</h1>
      <p>Vă rugăm contactați administratorul.</p>
    </div>
  `;
  return;
}

    // 🔹 Încarcă CSS doar dacă activ
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://valentin571-wq.github.io/smart-feed/style.css";
    document.head.appendChild(link);

    link.onload = () => {
      document.documentElement.style.opacity = "1";
      console.log("CSS incarcat");
    };

  } catch (err) {

    console.error("Eroare bootstrap:", err);

    document.documentElement.innerHTML = `
      <style>
      body{
        margin:0;
        height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#0f172a;
        font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;
        color:#fff;
      }
      .suspend-box{
        text-align:center;
      }
      .suspend-box h1{
        font-size:28px;
        margin:0 0 10px;
      }
      .suspend-box p{
        opacity:.7;
        margin:0;
        font-size:14px;
      }
    </style>
    <div class="suspend-box">
      <h1>Pagina nu exista !</h1>
      <p></p>
    </div>
  `;

  }

})();


document.addEventListener("DOMContentLoaded", function(){

  const menuBtn = document.getElementById("menuBtn");
  const closeBtn = document.getElementById("closeBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  menuBtn.addEventListener("click", function(){
    mobileMenu.classList.add("active");
  });

  closeBtn.addEventListener("click", function(){
    mobileMenu.classList.remove("active");
  });

  document.querySelectorAll(".mobile-menu a").forEach(function(link){
    link.addEventListener("click", function(){
      mobileMenu.classList.remove("active");
    });
  });

});






