const slider = document.getElementById("yearSlider");
const sliderValue = document.getElementById("sliderValue");
const decrementButton = document.getElementById("decrementButton");
const incrementButton = document.getElementById("incrementButton");
let titleValue = document.getElementById("title");
let periodValue = document.getElementById("period");


const ticks = document.querySelectorAll(".slider-tick");

// Aggiorna il valore del Range Slider quando si spostano i bottoni + e -
function updateSliderValue() {
  titleValue.textContent = "Rome Road Insights " + slider.value
  if (slider.value === "2022")
    periodValue.textContent = " (Jan - Aug)";
  else
    periodValue.textContent = " (Jan - Dic)";

}

// Aggiorna il valore del Range Slider quando si cambia il valore del Range Slider manualmente
slider.addEventListener("input", () => {
  updateSliderValue();
  updatePlotsBasingOnSelectedYear()
});


// Gestisce il clic sul pulsante +
incrementButton.addEventListener("click", () => {
  const currentValue = parseInt(slider.value);
  if (currentValue < 2022) {
    slider.value = (currentValue + 1).toString();
    updateSliderValue();
    updatePlotsBasingOnSelectedYear()

  }
});

decrementButton.addEventListener("click", () => {
  const currentValue = parseInt(slider.value);
  if (currentValue > 2019) {
    slider.value = (currentValue - 1).toString();
    updateSliderValue();
    updatePlotsBasingOnSelectedYear()
  }
});


function updatePlotsBasingOnSelectedYear(){

  let selectedYear = document.getElementById("yearSlider").value;


  console.log(selectedYear)
  console.log(buttonWeatherValue)


  let csvFileNameVerticalBarChart = "dataset/processed/verticalBarChart/";
  let csvFileNameChoroplethMap = "dataset/processed/choroplethMap/";
  let csvFileNameTimeSeries = "dataset/processed/timeSeries/";

  if (buttonWeatherValue === undefined || buttonWeatherValue === "None" || buttonWeatherValue === "First") {
    switch (selectedYear) {
      case '2022':
        csvFileNameVerticalBarChart = csvFileNameVerticalBarChart.concat("verticalBarChartData2022.csv")
        csvFileNameChoroplethMap = csvFileNameChoroplethMap.concat("choroplethMap2022.csv")
        csvFileNameTimeSeries = csvFileNameTimeSeries.concat("timeSeriesData2022.csv")
        break;
      case '2021':
        csvFileNameVerticalBarChart = csvFileNameVerticalBarChart.concat("verticalBarChartData2021.csv")
        csvFileNameChoroplethMap = csvFileNameChoroplethMap.concat("choroplethMap2021.csv")
        csvFileNameTimeSeries = csvFileNameTimeSeries.concat("timeSeriesData2021.csv")
        break;
      case '2020':
        csvFileNameVerticalBarChart = csvFileNameVerticalBarChart.concat("verticalBarChartData2020.csv")
        csvFileNameChoroplethMap = csvFileNameChoroplethMap.concat("choroplethMap2020.csv")
        csvFileNameTimeSeries = csvFileNameTimeSeries.concat("timeSeriesData2020.csv")
        break;
      case '2019':
        csvFileNameVerticalBarChart = csvFileNameVerticalBarChart.concat("verticalBarChartData2019.csv")
        csvFileNameChoroplethMap = csvFileNameChoroplethMap.concat("choroplethMap2019.csv")
        csvFileNameTimeSeries = csvFileNameTimeSeries.concat("timeSeriesData2019.csv")
        break;
      default:
        csvFileNameVerticalBarChart = csvFileNameVerticalBarChart.concat("verticalBarChartData2022.csv")
        csvFileNameChoroplethMap = csvFileNameChoroplethMap.concat(" choroplethMap2022.csv")
        csvFileNameTimeSeries = csvFileNameTimeSeries.concat("timeSeriesData2022.csv")
    }
  } else {
    csvFileNameVerticalBarChart = "dataset/processed/weather/" + selectedYear + "/general-accidents/generalAccidents" + buttonWeatherValue + selectedYear + ".csv";
    csvFileNameChoroplethMap = "dataset/processed/weather/" + selectedYear + "/deaths/deathsAccidents" + buttonWeatherValue + selectedYear + ".csv";
  }

  barChartSvg.selectAll("*").remove();
  drawVerticalBarChart(csvFileNameVerticalBarChart);

 // let removeAllButtons = document.querySelectorAll(".circular-button");
 // removeAllButtons.forEach(function(button) {button.remove();});
  //createHTMLButtons();

  choroplethMapSvg.selectAll("*").remove();
  drawChoroplethMap(csvFileNameChoroplethMap);

  timeSeriesSvg.selectAll("*").remove();
  drawTimeSeriesChart(csvFileNameTimeSeries);


}