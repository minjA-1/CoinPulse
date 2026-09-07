"use strict";

const searchInput = document.getElementById("search-input");
const btnAdd = document.getElementById("btn-add");
const coinsGrid = document.getElementById("coins-grid");
const statusEl = document.getElementById("status");
const emptyState = document.getElementById("empty-state");
const btnRefresh = document.getElementById("btn-refresh");
const lastUpdated = document.getElementById("last-updated");

const trackedCoins = [];

const fetchCoinData = async function (coinId) {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&sparkline=true`,
  );

  if (!res.ok) {
    throw new Error(`Coin ${coinId} not found!`);
  }

  const data = await res.json();
  return data;
};

const fetchMarketOverview = async function () {
  const res = await fetch("https://api.coingecko.com/api/v3/global");

  if (!res.ok) {
    throw new Error("Failed to fetch market overview!");
  }

  const data = await res.json();
  return data.data;
};

const formatPrice = function (price) {
  if (price >= 1) return "$" + price.toFixed(2);
  if (price >= 0.01) return "$" + price.toFixed(4);

  return "$" + price.toFixed(8);
};

const formatLargeNumber = function (num) {
  if (num >= 1_000_000_000_000) {
    return "$" + (num / 1_000_000_000_000).toFixed(2) + "T";
  }

  if (num >= 1_000_000_000) {
    return "$" + (num / 1_000_000_000).toFixed(2) + "B";
  }

  if (num >= 1_000_000) {
    return "$" + (num / 1_000_000).toFixed(2) + "M";
  }

  return formatPrice(num);
};

const drawSparkline = function (prices, isPositive) {
  if (!prices || prices.length < 2) return "";

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  const color = isPositive ? "#10b981" : "#ef4444";

  const points = prices
    .map((price, i) => {
      const x = (i / (prices.length - 1)) * 100;

      const y = max === min ? 50 : 100 - ((price - min) / (max - min)) * 100;

      return `${x},${y}`;
    })
    .join(" ");

  return `
    <svg
      class="sparkline"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <polyline
        points="${points}"
        fill="none"
        stroke="${color}"
        stroke-width="2"
        stroke-linejoin="round"
      />
    </svg>
  `;
};

const renderCoin = function (data) {
  const { id, name, symbol, image, market_data, sparkline_in_7d } = data;

  const price = market_data.current_price.usd;
  const change24h = market_data.price_change_percentage_24h ?? 0;
  const marketCap = market_data.market_cap.usd;
  const volume = market_data.total_volume.usd;
  const high24h = market_data.high_24h.usd;
  const low24h = market_data.low_24h.usd;

  const sparkPrices = sparkline_in_7d?.price ?? [];

  const isPositive = change24h >= 0;

  emptyState.classList.add("hidden");

  const html = `
    <div class="coin-card" data-id="${id}">
      <div class="card-top">
        <div class="coin-identity">
          <img
            class="coin-logo"
            src="${image.small}"
            alt="${name}"
          />

          <div>
            <p class="coin-name">${name}</p>
            <p class="coin-symbol">${symbol.toUpperCase()}</p>
          </div>
        </div>

        <div class="card-actions">
          <button
            class="btn-remove"
            data-id="${id}"
            type="button"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="price-row">
        <span class="coin-price">
          ${formatPrice(price)}
        </span>

        <span class="price-change ${isPositive ? "positive" : "negative"}">
          ${isPositive ? "▲" : "▼"}
          ${Math.abs(change24h).toFixed(2)}%
        </span>
      </div>

      <div class="coin-stats">
        <div class="stat-box">
          <p class="stat-label">Market Cap</p>
          <p class="stat-value">
            ${formatLargeNumber(marketCap)}
          </p>
        </div>

        <div class="stat-box">
          <p class="stat-label">Volume 24h</p>
          <p class="stat-value">
            ${formatLargeNumber(volume)}
          </p>
        </div>

        <div class="stat-box">
          <p class="stat-label">24h High</p>
          <p class="stat-value">
            ${formatPrice(high24h)}
          </p>
        </div>

        <div class="stat-box">
          <p class="stat-label">24h Low</p>
          <p class="stat-value">
            ${formatPrice(low24h)}
          </p>
        </div>
      </div>

      <div class="chart-wrap">
        <p class="chart-label">7-day trend</p>

        ${drawSparkline(sparkPrices, isPositive)}
      </div>
    </div>
  `;

  coinsGrid.insertAdjacentHTML("beforeend", html);
};

const updateMarketOverview = async function () {
  try {
    const data = await fetchMarketOverview();

    document.getElementById("btc-dominance").textContent =
      `${data.market_cap_percentage.btc.toFixed(1)}%`;

    document.getElementById("total-mcap").textContent = formatLargeNumber(
      data.total_market_cap.usd,
    );

    document.getElementById("total-volume").textContent = formatLargeNumber(
      data.total_volume.usd,
    );

    document.getElementById("active-cryptos").textContent =
      data.active_cryptocurrencies.toLocaleString();
  } catch (err) {
    console.error(err);
  }
};

const showStatus = function (msg, type) {
  statusEl.textContent = msg;
  statusEl.className = `status ${type}`;
  statusEl.classList.remove("hidden");
};

const hideStatus = function () {
  statusEl.classList.add("hidden");
};

const refreshAll = async function () {
  if (trackedCoins.length === 0) return;

  try {
    btnRefresh.classList.add("spinning");
    btnRefresh.disabled = true;

    const allData = await Promise.all(
      trackedCoins.map((id) => fetchCoinData(id)),
    );

    coinsGrid.innerHTML = "";

    allData.forEach((data) => {
      renderCoin(data);
    });

    await updateMarketOverview();

    lastUpdated.textContent = `Updated: ${new Date().toLocaleTimeString()}`;
  } catch (err) {
    console.error(err);
    showStatus("Failed to refresh coin data.", "error");
  } finally {
    btnRefresh.classList.remove("spinning");
    btnRefresh.disabled = false;
  }
};

btnAdd.addEventListener("click", async function () {
  const input = searchInput.value.trim().toLowerCase();

  if (input === "") return;

  if (trackedCoins.includes(input)) {
    showStatus("Already tracking", "error");
    return;
  }

  btnAdd.disabled = true;
  showStatus("Searching...", "loading");

  try {
    const data = await fetchCoinData(input);

    if (trackedCoins.includes(data.id)) {
      showStatus("Already tracking", "error");
      return;
    }

    renderCoin(data);

    trackedCoins.push(data.id);

    searchInput.value = "";
    hideStatus();
  } catch (err) {
    showStatus(err.message, "error");
  } finally {
    btnAdd.disabled = false;
  }
});

searchInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    btnAdd.click();
  }
});

coinsGrid.addEventListener("click", function (e) {
  const removeBtn = e.target.closest(".btn-remove");

  if (!removeBtn) return;

  const card = removeBtn.closest(".coin-card");

  if (!card) return;

  const id = card.dataset.id;

  card.remove();

  const index = trackedCoins.findIndex((coin) => coin === id);

  if (index !== -1) {
    trackedCoins.splice(index, 1);
  }

  if (trackedCoins.length === 0) {
    emptyState.classList.remove("hidden");
  }
});

btnRefresh.addEventListener("click", function () {
  refreshAll();
});

document.querySelector(".quick-btns")?.addEventListener("click", function (e) {
  const quickBtn = e.target.closest(".btn-quick");

  if (!quickBtn) return;

  const coinId = quickBtn.dataset.coin;

  searchInput.value = coinId;

  btnAdd.click();
});

setInterval(() => {
  if (trackedCoins.length > 0) {
    refreshAll();
  }
}, 60_000);

updateMarketOverview();
