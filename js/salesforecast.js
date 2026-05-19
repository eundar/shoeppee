const salesData = {
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],

  actualSales: [12000, 18000, 15000, 25000, 30000, 35000, 42000],

  forecastSales: [15000, 22000, 21000, 29000, 36000, 43000, 50000]
};

function initSalesChart() {

  const salesCtx = document.getElementById("salesChart");

  if (!salesCtx) {
    console.log("Canvas not found");
    return;
  }

  new Chart(salesCtx, {

    type: "line",

    data: {
      labels: salesData.months,

      datasets: [

        {
          label: "Actual Sales",
          data: salesData.actualSales,
          borderColor: "#ff5722",
          backgroundColor: "rgba(255,87,34,0.15)",
          fill: true,
          tension: 0.4
        },

        {
          label: "Forecast Sales",
          data: salesData.forecastSales,
          borderColor: "#2196f3",
          borderDash: [6,6],
          fill: false,
          tension: 0.4
        }
      ]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}