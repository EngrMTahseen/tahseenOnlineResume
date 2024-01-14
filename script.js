// Navbar Toggle
document.addEventListener("DOMContentLoaded", function () {
  const menuIcon = document.getElementById("menu-icon");
  const navList = document.querySelector("nav ul");

  menuIcon.addEventListener("click", function () {
    navList.classList.toggle("show");
  });
});

var currentUrl = window.location.href;

// Find all links in the menu
var links = document.querySelectorAll("#menu li a");

// Loop through each link
links.forEach(function (link) {
  // Check if the link's href matches the current URL
  if (link.href === currentUrl) {
    // Add the 'active' class to the matching link
    link.classList.add("active");
  }
});

// Contact Me Page
document.addEventListener("DOMContentLoaded", function () {
  const messageInput = document.getElementById("message");
  const charCount = document.getElementById("charCount");
  const robotProofInput = document.getElementById("robotProof");
  const robotChallenge = document.getElementById("robotChallenge");

  messageInput.addEventListener("input", function () {
    const currentLength = messageInput.value.length;
    charCount.textContent = 500 - currentLength;

    // Optional: Change color based on the character count
    if (currentLength > 400) {
      charCount.style.color = "red";
    } else {
      charCount.style.color = "var(--accent-color)";
    }
  });

  // Validate the robot proof on form submission
  document.querySelector("form").addEventListener("submit", function (event) {
    const userAnswer = robotProofInput.value.toLowerCase();
    const correctAnswer = "bad";

    if (userAnswer !== correctAnswer) {
      alert("Incorrect answer. Are you sure you're not a robot?");
      event.preventDefault(); // Prevent form submission
    }
  });
});

// MySkills
function openTaskPage(taskPage) {
  window.location.href = taskPage;
}

// Currency Converter

document.addEventListener("DOMContentLoaded", function () {
  const sourceCurrencySelect = document.getElementById("sourceCurrency");
  const destinationCurrencySelect = document.getElementById(
    "destinationCurrency"
  );
  const exchangeRateSpan = document.getElementById("exchangeRate");
  const calculationTimestampSpan = document.getElementById(
    "calculationTimestamp"
  );
  const sourceAmountInput = document.getElementById("sourceAmount");
  const resultParagraph = document.getElementById("result");
  const maxSourceValue = 100000; // Set your desired upper limit

  // const currenciesAPI = 'https://www.floatrates.com/daily/usd.json';
  const currenciesAPI = "https://www.floatrates.com/daily/gbp.json";

  let currenciesData;

  async function fetchCurrenciesData() {
    try {
      const response = await fetch(currenciesAPI);
      currenciesData = await response.json();
      populateCurrencyOptions();
      setDefaultCurrencies();
    } catch (error) {
      console.error("Error fetching currency data:", error);
    }
  }

  function populateCurrencyOptions() {
    for (const currency in currenciesData) {
      const option = document.createElement("option");
      option.value = currency;
      option.text = currenciesData[currency].name;
      sourceCurrencySelect.appendChild(option.cloneNode(true));
      destinationCurrencySelect.appendChild(option);
    }
  }

  function setDefaultCurrencies() {
    sourceCurrencySelect.value = "usd";
    destinationCurrencySelect.value = "eur";
    updateExchangeRate();
    updateTimestamp();
    sourceAmountInput.value = 1;
    convertCurrency();
  }

  function updateExchangeRate() {
    const sourceCurrency = sourceCurrencySelect.value;
    const destinationCurrency = destinationCurrencySelect.value;
    exchangeRateSpan.textContent =
      currenciesData[destinationCurrency].rate.toFixed(4);
  }

  function updateTimestamp() {
    const timestamp = new Date().toGMTString();
    calculationTimestampSpan.textContent = timestamp;
  }

  function convertCurrency() {
    const sourceCurrency = sourceCurrencySelect.value;
    const destinationCurrency = destinationCurrencySelect.value;
    const sourceAmount = parseFloat(sourceAmountInput.value);

    if (isNaN(sourceAmount) || sourceAmount < 0) {
      showError("Please enter a valid, non-negative amount.");
      return;
    }

    if (sourceAmount > maxSourceValue) {
      showError(`Source amount cannot exceed ${maxSourceValue}.`);
      return;
    }

    const exchangeRate = currenciesData[destinationCurrency].rate;
    const result = (sourceAmount * exchangeRate).toFixed(4);

    resultParagraph.textContent = `${sourceAmount} ${sourceCurrency} is equal to ${result} ${destinationCurrency}`;
  }

  function showError(message) {
    resultParagraph.textContent = message;
    resultParagraph.style.color = "red";
  }

  sourceCurrencySelect.addEventListener("change", updateExchangeRate);
  destinationCurrencySelect.addEventListener("change", updateExchangeRate);
  sourceAmountInput.addEventListener("input", convertCurrency);

  fetchCurrenciesData();
});

// Foercaster

let lastDate;
let next12MonthsChart;

async function getCurrDataA() {
  try {
    const responseA = await fetch("forcaster.json");
    const dataA = await responseA.json();
    return dataA;
  } catch (error) {
    console.error("There is Error in Data Fetching:", error);
  }
}

function calculateLinearRegression(x, y) {
  const n = x.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

async function initializeAppA() {
  const forcasterjsonData = await getCurrDataA();
  const keys = Object.keys(forcasterjsonData[0]).filter(
    (key) => key !== "year" && key !== "Month"
  );

  const resultA = keys.map((key) => {
    const historicalData = forcasterjsonData.map((item) => [
      new Date(
        item["year"],
        new Date(Date.parse(item["Month"] + " 1, 2021")).getMonth(),
        1
      ).getTime(),
      item[key],
    ]);

    const { slope, intercept } = calculateLinearRegression(
      historicalData.map((dataPoint) => dataPoint[0]),
      historicalData.map((dataPoint) => dataPoint[1])
    );

    lastDate = historicalData[historicalData.length - 1][0];
    const forecastedData = Array.from({ length: 12 }, (_, index) => [
      lastDate + (index + 1) * 30 * 24 * 3600 * 1000,
      intercept + slope * (lastDate + (index + 1) * 30 * 24 * 3600 * 1000),
    ]);

    return {
      name: key.trim(),
      data: historicalData.concat(forecastedData),
    };
  });

  const chart = Highcharts.chart("chartContainer", {
    title: {
      text: "Forcaster",
      align: "center",
    },
    yAxis: {
      title: {
        text: "Current Price Indices",
      },
    },
    xAxis: {
      type: "datetime",
      accessibility: {
        text: "date",
        rangeDescription: "Range: JAN. 1996 to AUG. 2023",
      },
      title: {
        text: "Date",
      },
      dateTimeLabelFormats: {
        month: "%b %Y",
        year: "%Y",
      },
      min: Date.UTC(1996, 0, 1), // 01 Jan, 1996
      max: Date.UTC(1996, 11, 1), //  01 Aug , 2022
      tickInterval: 30 * 24 * 3600 * 1000, // Now Assume one point per month
    },
    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "middle",
    },
    plotOptions: {
      series: {
        label: {
          connectorAllowed: false,
        },
      },
    },
    series: resultA,
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            legend: {
              layout: "horizontal",
              align: "center",
              verticalAlign: "bottom",
            },
          },
        },
      ],
    },
  });

  updateButtonsState();

  // This is Function to change the year when the buttons are clicked
  window.changeYear = function (delta) {
    var xAxis = chart.xAxis[0];
    xAxis.setExtremes(
      xAxis.min + delta * 365 * 24 * 3600 * 1000,
      xAxis.max + delta * 365 * 24 * 3600 * 1000
    );
    updateButtonsState();
  };

  // This is Function to update button states based on the current year (Mandatory)
  function updateButtonsState() {
    var xAxis = chart.xAxis[0];
    var prevBtn = document.getElementById("prevBtn");
    var nextBtn = document.getElementById("nextBtn");

    prevBtn.disabled = xAxis.min <= Date.UTC(1996, 0, 1);
    nextBtn.disabled = xAxis.max >= Date.UTC(2022, 7, 1);
  }

  // Create a button below the chart
  const forcastButton = document.getElementById("next12displayButton");
  forcastButton.innerHTML = "Forecaster (12 Months)";
  forcastButton.style.marginTop = "10px";
  forcastButton.addEventListener("click", () => {
    if (next12MonthsChart) {
      next12MonthsChart.destroy();
      next12MonthsChart = null;
    } else {
      const next12MonthsData = resultA.map((series) => {
        const forecastedData = Array.from({ length: 12 }, (_, index) => [
          lastDate + (index + 1) * 30 * 24 * 3600 * 1000,
          series.data[series.data.length - 1][1],
        ]);

        return {
          name: series.name,
          data: forecastedData,
        };
      });

      next12MonthsChart = Highcharts.chart("next12MonthsContainer", {
        title: {
          text: "Forecaster (Next 12 Months)",
          align: "center",
        },
        yAxis: {
          title: {
            text: "Current price indices",
          },
        },
        xAxis: {
          type: "datetime",
          accessibility: {
            text: "date",
            rangeDescription: "Range: Next 12 Months",
          },
          title: {
            text: "Date",
          },
          dateTimeLabelFormats: {
            month: "%b %Y",
            year: "%Y",
          },
          min: lastDate,
          tickInterval: 30 * 24 * 3600 * 1000,
        },
        legend: {
          layout: "vertical",
          align: "right",
          verticalAlign: "middle",
        },
        plotOptions: {
          series: {
            label: {
              connectorAllowed: false,
            },
          },
        },
        series: next12MonthsData,
        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 500,
              },
              chartOptions: {
                legend: {
                  layout: "horizontal",
                  align: "center",
                  verticalAlign: "bottom",
                },
              },
            },
          ],
        },
      });
    }
  });
}

initializeAppA();
