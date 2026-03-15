const hotelId = document.body.dataset.hotel;

const HOTEL_CONFIG = {
  monopoly: {
    prices: { 1:220, 2:250, 3:250, 4:300 },
    micDejunPretAdult: 50,
    micDejunPretCopil: 5,
    hasBreakfast: false,
    hasOnlinePayment: true,
    hasCashPayment: false,
    blockedRanges: [
      { from: "2026-03-15", to: "2026-03-20" }
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
