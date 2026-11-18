(function () {
  "use strict";

  // Hardcoded exchange rates (1 USD = 278.50 PKR, 1 GBP = 355.00 PKR)
  const EXCHANGE_RATES = Object.freeze({
    PKR: 1,
    USD: 278.50,
    GBP: 355.00
  });

  const STORAGE_KEYS = Object.freeze({
    BILLING: "pkhosting_vps_billing",
    CURRENCY: "pkhosting_vps_currency"
  });

  const VALID_BILLING = ["monthly", "annually"];
  const VALID_CURRENCIES = ["PKR", "USD", "GBP"];

  const state = {
    billing: "monthly",
    currency: "PKR"
  };

  const billingButtons = document.querySelectorAll("[data-billing]");
  const currencySelect = document.getElementById("currency-select");
  const planCards = document.querySelectorAll(".plan-card[data-monthly-pkr]");
  const liveRegion = document.getElementById("pricing-live-region");

  function readStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (_err) {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (_err) {
      // Ignore storage errors in restricted contexts
    }
  }

  function loadPersistedState() {
    const savedBilling = readStorage(STORAGE_KEYS.BILLING);
    const savedCurrency = readStorage(STORAGE_KEYS.CURRENCY);

    if (VALID_BILLING.includes(savedBilling)) {
      state.billing = savedBilling;
    }
    if (VALID_CURRENCIES.includes(savedCurrency)) {
      state.currency = savedCurrency;
    }
  }

  function formatMoney(amountInPkr, currency) {
    const rate = EXCHANGE_RATES[currency];
    const converted = amountInPkr / rate;

    if (currency === "PKR") {
      return "Rs " + Math.round(converted).toLocaleString("en-US");
    }
    if (currency === "USD") {
      return "$" + converted.toFixed(2);
    }
    return "£" + converted.toFixed(2);
  }

  function renderPricing(announceChange) {
    // Sync toggle button states
    billingButtons.forEach(function (btn) {
      const isSelected = btn.getAttribute("data-billing") === state.billing;
      btn.classList.toggle("is-active", isSelected);
      btn.setAttribute("aria-pressed", String(isSelected));
    });

    // Sync currency dropdown
    if (currencySelect && currencySelect.value !== state.currency) {
      currencySelect.value = state.currency;
    }

    // Compute and render each plan card
    planCards.forEach(function (card) {
      const monthlyPkr = Number(card.getAttribute("data-monthly-pkr"));
      const amountEl = card.querySelector(".price-amount");
      const annualMetaEl = card.querySelector(".annual-meta");
      const annualTotalEl = card.querySelector(".annual-total");
      const savingsBadgeEl = card.querySelector(".savings-badge");

      if (!amountEl || !annualMetaEl || !annualTotalEl || !savingsBadgeEl) {
        return;
      }

      if (state.billing === "monthly") {
        amountEl.textContent = formatMoney(monthlyPkr, state.currency);
        annualMetaEl.hidden = true;
        annualTotalEl.textContent = "";
        savingsBadgeEl.textContent = "";
      } else {
        // Annual billing charges 10 months for 12
        const annualPerMonthPkr = (monthlyPkr * 10) / 12;
        const annualTotalPkr = monthlyPkr * 10;
        const annualSavingsPkr = (monthlyPkr * 12) - annualTotalPkr;

        amountEl.textContent = formatMoney(annualPerMonthPkr, state.currency);
        annualTotalEl.textContent = "Billed " + formatMoney(annualTotalPkr, state.currency) + "/yr";
        savingsBadgeEl.textContent = "Save " + formatMoney(annualSavingsPkr, state.currency);
        annualMetaEl.hidden = false;
      }
    });

    if (announceChange && liveRegion) {
      const periodLabel = state.billing === "annually" ? "annual billing" : "monthly billing";
      liveRegion.textContent = "VPS prices updated to " + periodLabel + " in " + state.currency + ".";
    }
  }

  function init() {
    loadPersistedState();
    renderPricing(false);

    billingButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const chosen = btn.getAttribute("data-billing");
        if (!VALID_BILLING.includes(chosen) || chosen === state.billing) {
          return;
        }
        state.billing = chosen;
        writeStorage(STORAGE_KEYS.BILLING, state.billing);
        renderPricing(true);
      });
    });

    if (currencySelect) {
      currencySelect.addEventListener("change", function (event) {
        const chosen = event.target.value;
        if (!VALID_CURRENCIES.includes(chosen) || chosen === state.currency) {
          return;
        }
        state.currency = chosen;
        writeStorage(STORAGE_KEYS.CURRENCY, state.currency);
        renderPricing(true);
      });
    }
  }

  init();
})();