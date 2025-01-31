//const barChartSvg = d3.select("#barChartSvg");

// append the svg object to the body of the page
var barChartSvg = d3.select("#verticalBarChart")
    .append("div")
    .classed("svg-container", true)
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 750 370")
    .classed("svg-content-responsive", true)
    //.attr("width", width + margin.left + margin.right)
    //.attr("height", height + margin.top + margin.bottom)
    .append("g").attr("transform", "translate(-20, 0)");

let width = 500;
let height = 300;
let clickedBars = [];
let clickedNature = "";
let barClicked = false;


let xScale, yScale, g, dataAboutYearSorted, tooltip;

function drawColorsLegend(){
  //let keys = ["> 0 and \u2264 500", "> 500 and \u2264 1500", "> 1500 and \u2264 4000", "> 4000 and \u2264 9000",  "> 9000 and \u2264 15000", "> 15000"];
  let keys = ["> 0 and \u2264 100", "> 100 and \u2264 300", "> 300 and \u2264 500","> 500 and \u2264 800" , "> 800 and \u2264 1500",  "> 1500 and \u2264 3500",  "> 3500 and \u2264 7500", "> 7500 and \u2264 15000" ,"> 15000"];
  let size = 11;

  barChartSvg.selectAll("mydots")
    .data(keys)
    .enter()
    .append("rect")
    .attr("x", 500)
    .attr("y", function(d,i){ return 30 + i*(size+5)}) // 30 is where the first dot appears. 25 is the distance between dots
    .attr("width", size)
    .attr("height", size)
    .style("fill", function(d){ return setBarColor(d)})
    .style("stroke", "#524a32")
    .style("stroke-width", 0.1);


  barChartSvg.selectAll("mylabels")
    .data(keys)
    .enter()
    .append("text")
    .attr("x", 500 + size*1.2)
    .attr("y", function(d,i){ return 30 + i*(size+5) + (size/2)}) // 30 is where the first dot appears. 25 is the distance between dots
    .text(function(d){ return d})
    .style("fill", "#524a32")
    .style("font-family", "Lora")
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle");

  let groups = ["[C1] Pedestrian hit",
                        "[C2] Vehicles collision (moving)",
                        "[C3] Vehicles collision with a stationary vehicle",
                        "[C4] Rear-end collision",
                        "[C5] Collision with obstacle",
                        "[C6] Sudden braking and vehicle fall",
                        "[C7] Overturning and run-off-road",
                        "[C8] Side/head-on collision",
                        ];

  barChartSvg.selectAll("mylabels")
    .data(groups)
    .enter()
    .append("text")
    .attr("x", 480 + size*1.2)
    .attr("y", function(d,i){ return 200 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
    .text(function(d){ return d})
    .html(function(d) {
        let parts = d.split(" "); // Dividi la stringa in parti
        return "<tspan font-weight='bold' >" + parts[0] + ' '+"</tspan>" + "<tspan id='" + parts[0].slice(1, -1)+"'>"+parts.slice(1).join(" ")+"</tspan>";
    })
    .attr("text-anchor", "left")
    .style("font-family", "Lora")
    .style("fill", "#524a32")
    .style("alignment-baseline", "middle")
}

function drawAxesAndBars(csvFileName){

  // definition of axes  height and width
  xScale = d3.scaleBand().range([0, 600 - 230]).padding(0.160);
  yScale = d3.scaleLog().range([height, 0]); // Utilizza scaleLog per l'asse y

  // function to get and filter csv data
  d3.csv(csvFileName, function (data) {
    let dataAboutYear = data.filter(function (row) {
      return row['NaturaIncidente'];
    });

    // get data group by year
    dataAboutYearSorted = dataAboutYear.sort(function (a, b) {
      return d3.descending(parseFloat(a['NumeroIncidenti']), parseFloat(b['NumeroIncidenti']));
    });

    // Domain delle scale per gli assi x e y
    xScale.domain(dataAboutYearSorted.map(function(d) {return d.NaturaIncidente;}));

    yScale.domain([0.5, 30000]); // Assicurati che il dominio dell'asse y inizi da 1 per evitare problemi con la scala logaritmica

    // Creazione delle barre
    g = barChartSvg.append("g").attr("transform", "translate(" + 90 + "," + 20 + ")");
    g.selectAll(".bar")
      .data(dataAboutYearSorted)
      .enter().append("rect")
      .attr("x", function (d) { return xScale(d.NaturaIncidente); })
      .attr("y", function (d) { return yScale(d.NumeroIncidenti); })
      .attr("width", xScale.bandwidth())
      .attr("height", function (d) { return height - yScale(d.NumeroIncidenti) })
      .style("fill", function (d) { return setBarColor(d.NumeroIncidenti) })
      .style("stroke", "black") // Aggiungi un bordo nero
      .style("stroke-width", 0.3) // Imposta la larghezza del bordo
      .style("cursor", function (d) {
        //Applica il pointer solo se buttonWeatherValue è "First"
        console.log("BOH: "+(switchWeatherInput.value === "OFF" && switchBrushInput.value === "OFF"))
        if (((buttonWeatherValue === "First" && switchBrushInput.value === "OFF") || (switchWeatherInput.value === "OFF" && switchBrushInput.value === "OFF") || buttonWeatherValue === "None" /*|| switchBrushInput.value === "OFF"*/)) return "pointer"
        else return "default"
        })
        .on("click", function(d) {
          if (
            (buttonWeatherValue === "First" && switchBrushInput.value === "OFF") ||
            (switchWeatherInput.value === "OFF" && switchBrushInput.value === "OFF") ||
            buttonWeatherValue === "None"
          ) {
            onclickBar(d);
          }
        })
      .on("mouseover", handleMouseOver)
      .on("mouseout", function(d) {handleMouseOut(d)})
      .on("mousemove", handleMouseOver)
      .attr("class", "bar")
      .style("transition", "0.3s");

    g.selectAll(".bar-value")
      .data(dataAboutYearSorted)
      .enter()
      .append("text")
      .attr("class", "bar-value")
      .attr("x", function(d) { return xScale(d.NaturaIncidente) + xScale.bandwidth() / 2; }) // Posiziona il testo al centro della barra
      .attr("y", function(d) { return yScale(d.NumeroIncidenti) - 5; }) // Posiziona il testo sopra la barra, con un offset di 5px
      //.attr("y", function(d) { return yScale(d.NumeroIncidenti) + 15; })
      //.attr("y", 290)
      .attr("text-anchor", "middle") // Ancoraggio al centro del testo
      .text(function(d) { return setAccidentsNumberAndNatureAndYear(d); }) // Imposta il testo con il numero di incidenti
      .style("font-size", "9px") // Imposta la dimensione del carattere del testo
      .style("font-family", "Lora")
      .style("fill", "#524a32"); // Imposta il colore del testo


    // Descrizione dell'asse x
    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale))
      .style("font-family", "Lora")
      .append("text")
      .attr("y", 37)
      .attr("x", width - 315)
      .attr("fill", "black")
      .text("Accidents' nature");

// Descrizione dell'asse y
    g.append("g")
      .call(d3.axisLeft(yScale)
        .tickFormat(function(d, i, ticks) {
          if(i==0)
            return ("0.5")
         if (i == 6 || i == 5 || i == 14 || i == 15 || i == 23 || i == 24 || i == 33 || i == 32 || i == 42 || i == 41 || i == 43)
            return Math.round(d);
          else return "";

        }))
      .style("font-family", "Lora")
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -10)
      .attr("x", -107)
      .attr("dy", "-5.1em")
      .attr("fill", "black")
      .text("Accidents' number");

    g.append("g")
      .style("font-family", "Lora")
      .style("font-size", 8)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -10)
      .attr("x", -187)
      .attr("dy", "-5.1em")
      .attr("fill", "black")
      .text("(logarithmic scale)");
  });
}


function drawAxesAndBarsFromChoroplethMap(data, choropleth){

  // definition of axes  height and width
  xScale = d3.scaleBand().range([0, 600 - 230]).padding(0.160);
  yScale = d3.scaleLog().range([height, 0]);

    // get data group by year
    dataAboutYearSorted = data.sort(function (a, b) {
      return d3.descending(parseFloat(a['NumeroIncidenti']), parseFloat(b['NumeroIncidenti']));
    });

    // definition of axes domain
  // Domain delle scale per gli assi x e y
  xScale.domain(dataAboutYearSorted.map(function(d) {return d.NaturaIncidente;}));

  yScale.domain([0.5, 30000]); // Assicurati che il dominio dell'asse y inizi da 1 per evitare problemi con la scala logaritmica

    // bars creation
    g = barChartSvg.append("g").attr("transform", "translate(" + 90 + "," + 20 + ")");
    g.selectAll(".bar")
      .data(dataAboutYearSorted)
      .enter().append("rect")
      .attr("x", function (d) { return xScale(d.NaturaIncidente); })
      .attr("y", function (d) { return yScale(d.NumeroIncidenti); })
      .style("font-family", "Lora")
      .attr("width", xScale.bandwidth())
      .attr("height", function (d) { return height - yScale(d.NumeroIncidenti) })
      .style("fill", function (d) { return setBarColor(d.NumeroIncidenti) })
      .style("stroke", "black") // Aggiungi un bordo nero
      .style("stroke-width", 0.3) // Imposta la larghezza del bordo
      .on("click", function (d) {if(!choropleth)onclickBar(d)})
      .on("mouseover", handleMouseOver)
      .on("mouseout", function (d) {handleMouseOut(d)})
      .on("mousemove", handleMouseOver)
      .attr("class", "bar")
      .style("transition", "0.3s");

    g.selectAll(".bar-value")
      .data(dataAboutYearSorted)
      .enter()
      .append("text")
      .attr("class", "bar-value")
      .attr("x", function(d) { return xScale(d.NaturaIncidente) + xScale.bandwidth() / 2; }) // Posiziona il testo al centro della barra
      .attr("y", function(d) { return yScale(d.NumeroIncidenti) - 5; }) // Posiziona il testo sopra la barra, con un offset di 5px
      //.attr("y", function(d) { return yScale(d.NumeroIncidenti) + 15; })
      //.attr("y", 290)
      .attr("text-anchor", "middle") // Ancoraggio al centro del testo
      .text(function(d) { return setAccidentsNumberAndNatureAndYear(d); }) // Imposta il testo con il numero di incidenti
      .style("font-size", "9px") // Imposta la dimensione del carattere del testo
      .style("font-family", "Lora")
      .style("fill", "#524a32"); // Imposta il colore del testo


    // axis x description
    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale))
      .style("font-family", "Lora")
      .append("text")
      .attr("y", 37)
      .attr("x", width - 278)
      .attr("text-anchor", "end")
      .attr("fill", "black")
      .text("Accidents' nature");

// Descrizione dell'asse y
  g.append("g")
    .call(d3.axisLeft(yScale)
      .tickFormat(function (d, i, ticks) {
        if(i==0)
          return ("0.5")
        if (i==6 || i == 5 || i == 14 || i == 15 || i == 23 || i == 24 || i == 33 || i == 32 || i == 42 || i == 41 || i == 43)
          return Math.round(d);
        else return "";
      }))
    .style("font-family", "Lora")
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -10)
    .attr("x", -107)
    .attr("dy", "-5.1em")
    .attr("text-anchor", "end")
    .attr("fill", "black")
    .text("Accidents' number");

  g.append("g")
    .style("font-family", "Lora")
    .style("font-size", 8)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -10)
    .attr("x", -187)
    .attr("dy", "-5.1em")
    .attr("fill", "black")
    .text("(logarithmic scale)");

}


function drawVerticalBarChartFromTimeSeries(formattedStartDate, formattedEndDate){

  // definition of axes  height and width
  xScale = d3.scaleBand().range([0, 600 - 230]).padding(0.160);
  yScale = d3.scaleLog().range([height, 0]); // Utilizza scaleLog per l'asse y

// Definire un oggetto mappa per memorizzare la somma degli incidenti per ogni natura
  var incidentiPerNatura = new Map();

// Funzione per leggere i dati da un file CSV
  function leggiDati(fileName) {
    return new Promise((resolve, reject) => {
      d3.csv(fileName, function(data) {
        var sommaNumeroIncidenti = 0; // Inizializzare la somma per ogni natura
        data.forEach(function(row) {
          // Estrarre la data e il numero di incidenti dalla riga corrente
          var dataOraIncidente = row['DataOraIncidente'];
          var numeroIncidenti = parseInt(row['NumeroIncidenti']);

          // Verificare se la data è nel range specificato (formattedStartDate, formattedEndDate)
          if (dataOraIncidente >= formattedStartDate && dataOraIncidente <= formattedEndDate) {
            sommaNumeroIncidenti += numeroIncidenti;
          }
        });

        resolve(sommaNumeroIncidenti); // Risolvere la promessa con la somma degli incidenti
      });
    });
  }

// Promessa per eseguire tutte le chiamate d3.csv
  var promises = [];
  for (var i = 1; i <= 8; i++) {
    var fileName = 'dataset/processed/timeSeries/' + selectedYear + '/timeSeriesNatureC' + i + '.csv';
    promises.push(leggiDati(fileName));
  }

// Attendere il completamento di tutte le chiamate d3.csv
  Promise.all(promises)
    .then(results => {
      // Risultati contiene un array con le somme degli incidenti per ogni natura
      for (var i = 0; i < results.length; i++) {
        var naturaIncidente = 'C' + (i + 1);
        incidentiPerNatura.set(naturaIncidente, results[i]);
      }

      // Convertire la mappa incidentiPerNatura in un array di oggetti
      const resultArray = Array.from(incidentiPerNatura, ([natura, conteggio]) => ({
        NaturaIncidente: natura,
        NumeroIncidenti: conteggio,
      }));

      console.log(resultArray);
      // get data group by year
      dataAboutYearSorted = resultArray.sort(function (a, b) {
        return d3.descending(parseFloat(a['NumeroIncidenti']), parseFloat(b['NumeroIncidenti']));
      });

      // definition of axes domain
      xScale.domain(dataAboutYearSorted.map(function (d) { return d.NaturaIncidente; }));
      let MinMax = dataAboutYearSorted.map(function (d) { return d.NumeroIncidenti; })
      const maxScaleValue = Math.max.apply(null, MinMax);
      var axisStep;
      if (maxScaleValue <= 1000) axisStep = 100;  // Imposta il passo dell'asse come desiderato
      else if (maxScaleValue <= 2000) axisStep = 200;  // Imposta il passo dell'asse come desiderato
      else axisStep = 2000;
      // Arrotonda il massimo valore della scala al prossimo multiplo del passo dell'asse
      const roundedMax = Math.ceil(maxScaleValue / axisStep) * axisStep;
      yScale.domain([0.5, 30000]);

      // bars creation
      g = barChartSvg.append("g").attr("transform", "translate(" + 90 + "," + 20 + ")");
      g.selectAll(".bar")
        .data(dataAboutYearSorted)
        .enter().append("rect")
        .attr("x", function (d) { return xScale(d.NaturaIncidente); })
        .attr("y", function (d) { return yScale(d.NumeroIncidenti); })
        .style("font-family", "Lora")
        .attr("width", xScale.bandwidth())
        .attr("height", function (d) { return height - yScale(d.NumeroIncidenti) })
        .style("fill", function (d) { return setBarColor(d.NumeroIncidenti) })
        .style("stroke", "black") // Aggiungi un bordo nero
        .style("stroke-width", 0.3) // Imposta la larghezza del bordo
        .on("click", function (d) {if(!choropleth)onclickBar(d)})
        .on("mouseover", handleMouseOver)
        .on("mouseout", function (d) {handleMouseOut(d)})
        .on("mousemove", handleMouseOver)
        .attr("class", "bar")
        .style("transition", "0.3s");

        g.selectAll(".bar-value")
          .data(dataAboutYearSorted)
          .enter()
          .append("text")
          .attr("class", "bar-value")
          .attr("x", function(d) { return xScale(d.NaturaIncidente) + xScale.bandwidth() / 2; }) // Posiziona il testo al centro della barra
          .attr("y", function(d) { return yScale(d.NumeroIncidenti) - 5; }) // Posiziona il testo sopra la barra, con un offset di 5px
          //.attr("y", function(d) { return yScale(d.NumeroIncidenti) + 15; })
          //.attr("y", 290)
          .attr("text-anchor", "middle") // Ancoraggio al centro del testo
          .text(function(d) { return setAccidentsNumberAndNatureAndYear(d); }) // Imposta il testo con il numero di incidenti
          .style("font-size", "9px") // Imposta la dimensione del carattere del testo
          .style("font-family", "Lora")
          .style("fill", "#524a32"); // Imposta il colore del testo

      // axis x description
      g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale))
        .style("font-family", "Lora")
        .append("text")
        .attr("y", 37)
        .attr("x", width - 278)
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .text("Accidents' nature");

// Descrizione dell'asse y
    g.append("g")
      .call(d3.axisLeft(yScale)
        .tickFormat(function(d, i, ticks) {
          if(i==0)
            return ("0.5")
         if (i == 6 || i == 5 || i == 14 || i == 15 || i == 23 || i == 24 || i == 33 || i == 32 || i == 42 || i == 41 || i == 43)
            return Math.round(d);
          else return "";

        }))
      .style("font-family", "Lora")
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -10)
      .attr("x", -107)
      .attr("dy", "-5.1em")
      .attr("fill", "black")
      .text("Accidents' number");
    })
    .catch(error => {
      console.error("Errore durante il recupero dei dati:", error);
    });

}

function drawVerticalBarChart(csvFileName) {

  drawAxesAndBars(csvFileName);
  drawColorsLegend();

}

function setBarColor(accidentNumber) {
    if (accidentNumber > 0 && accidentNumber <= 100)
        return "#1a9850"
      else if (accidentNumber > 100 && accidentNumber <= 300)
        return "#66bd63";
      else if (accidentNumber > 300 && accidentNumber <= 500)
        return "#a6d96a";
      else if (accidentNumber > 500 && accidentNumber <= 800)
        return "#d9ef8b";
      else if (accidentNumber > 800 && accidentNumber <= 1500)
        return "#ffffbf";
      else if (accidentNumber > 1500 && accidentNumber <= 3500)
        return "#fee08b";
      else if (accidentNumber > 3500 && accidentNumber <= 7500)
        return "#fdae61";
      else if (accidentNumber > 7500 && accidentNumber <= 15000)
        return "#f46d43";
      else if (accidentNumber > 15000)
        return "#d73027";
      else if (accidentNumber.toString() === "> 0 and \u2264 100")
        return "#1a9850"
      else if (accidentNumber.toString() === "> 100 and \u2264 300")
        return "#66bd63"
      else if (accidentNumber.toString() === "> 300 and \u2264 500")
        return "#a6d96a"
      else if (accidentNumber.toString() === "> 500 and \u2264 800")
        return "#d9ef8b"
      else if (accidentNumber.toString() === "> 800 and \u2264 1500")
        return "#ffffbf"
      else if (accidentNumber.toString() === "> 1500 and \u2264 3500")
        return "#fee08b"
      else if (accidentNumber.toString() === "> 3500 and \u2264 7500")
        return "#fdae61"
      else if (accidentNumber.toString() === "> 7500 and \u2264 15000")
        return "#f46d43"
      else if (accidentNumber.toString() === "> 15000")
        return "#d73027"


  /*if (accidentNumber > 0 && accidentNumber <= 500)
    return "#1a9850"
  else if (accidentNumber > 500 && accidentNumber <= 1500)
    return "#91cf60";
  else if (accidentNumber > 1500 && accidentNumber <= 4000)
    return "#d9ef8b";
  else if (accidentNumber > 4000 && accidentNumber <= 9000)
    return "#fee08b";
  else if (accidentNumber > 9000 && accidentNumber <= 15000)
    return "#fc8d59";
  else if (accidentNumber > 15000)
    return "#d73027";
  else if (accidentNumber.toString() === "> 0 and \u2264 500")
    return "#1a9850"
  else if (accidentNumber.toString() === "> 500 and \u2264 1500")
    return "#91cf60"
  else if (accidentNumber.toString() === "> 1500 and \u2264 4000")
    return "#d9ef8b"
  else if (accidentNumber.toString() === "> 4000 and \u2264 9000")
    return "#fee08b"
  else if (accidentNumber.toString() === "> 9000 and \u2264 15000")
    return "#fc8d59"
  else if (accidentNumber.toString() === "> 15000")
    return "#d73027"*/
}
function handleMouseOver(d) {
    //d3.select(this).style("fill", "grey");

    barChartSvg.selectAll(".bar")
        .filter(function (datum) {
            return datum !== d;
        })
        .style("opacity", 0.3);

    barChartSvg.selectAll("#"+ d.NaturaIncidente).style("text-decoration", "underline")
    /*barChartSvg.append("text")
      .attr("class", "bar-label")
      .attr("x", 120)
      .attr("y", 30)
      .text(setAccidentsNumberAndNatureAndYear(d))
      .style("font-size", "12px");*/

    tooltip = d3.select("#popup");


  tooltip.html(setAccidentsNumberAndNatureAndYear(d))
        .style("opacity", 0.8)
        .style("color", "#524a32")
        .style("font-family", "Lora")
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .style("left", (d3.event.pageX + 9 + "px"))
        .style("top", (d3.event.pageY - 9 + "px"));
  }

function handleMouseOut(d) {
    //d3.select(this)
      //.style("fill", function(d) { return setBarColor(d.NumeroIncidenti)});
    // Nascondi il pop-up
    barChartSvg.selectAll("#"+ d.NaturaIncidente).style("text-decoration", "none")
    tooltip.style("opacity", 0);
    barChartSvg.selectAll("rect")
        .style("opacity", 1);
    barChartSvg.select(".bar-label").remove();

  }

let timer; // Variabile per il timer
let isActive = false; // Variabile per tracciare lo stato del timer
function onclickBar(d) {
    console.log(d)
    barClicked = true;
    //const size=14;
  // Aggiungi il loader al DOM

  if (buttonWeatherValue==="First" || switchBrushInput.value === "OFF") {
    /*let nnaturee = document.getElementById("nnaturee");
    nnaturee.style.display = 'block';
    nnaturee.textContent = "Nature: [" + d.NaturaIncidente.toString() + "]"*/

    let loader = document.getElementById("loaderC");
    loader.style.display = "block"; // Assicurati che il loader sia inizialmente visibile
    let loaderS = document.getElementById("loaderS");
    loaderS.style.display = "block"; // Assicurati che il loader sia inizialmente visibile
    choroplethMapSvg.style("opacity", 0.3);
    timeSeriesSvg.style("opacity", 0.3);
    let loaderP = document.getElementById("loaderP");
    loaderP.style.display = "block"; // Assicurati che il loader sia inizialmente visibile
    scatterPlotpSvg.style("opacity", 0.3);
        // Rimuovi le linee correlate alle barre cliccate in precedenza
        clickedBars.forEach(function (bar) {
            d3.select("#line_" + bar.NaturaIncidente).remove();
        });
        if (clickedNature!=="") d3.selectAll("." + clickedNature).remove();
        // Aggiungi l'ID della barra corrente all'array delle barre cliccate
        clickedBars.push(d);
        clickedNature = d.NaturaIncidente.toString();
      if (!isActive) { // Se il timer non è attivo
        isActive = true;
       // timer = setTimeout(function () {
          isActive = false; // Resetta lo stato del timer
          resetTownHall();
       // }, 3000);
      } else if (timer){ // Se il timer è già attivo
        clearTimeout(timer); // Interrompi il timer corrente
       // timer = setTimeout(function () {
          isActive = false; // Resetta lo stato del timer
          resetTownHall();
        //}, 3000);
       // isActive = false; // Resetta lo stato del timer
      }
      resetTownHall();

      let result;
      switch (d.NaturaIncidente.toString()) {
        case 'C1':
          result = "Pedestrian hit";
          break;
        case 'C2':
          result = "Vehicles collision (moving)";
          break;
        case 'C3':
          result = "Vehicles collision (stationary vehicle)";
          break;
        case 'C4':
          result = "Rear-end collision";
          break;
        case 'C5':
          result = "Collision with obstacle";
          break;
        case 'C6':
          result = "Sudden braking and vehicle fall";
          break;
        case 'C7':
          result = "Overturning and run-off-road";
          break;
        default:
          result = "Side/head-on collision";
      }

      let weatherResult = [];
      switch (buttonWeatherValue) {
        case 'Cloudy':
          weatherResult.push("Nuvoloso");
          break;
        case 'Sunny':
          weatherResult.push("Sereno", "Sole radente");
          break;
        case 'Rainy':
          weatherResult.push("Pioggia in atto");
          break;
        case 'Severe':
          weatherResult.push("Grandine in atto", "Nebbia", "Nevicata in atto", "Vento forte");
          break;
        case 'None':
          weatherResult.push("Nuvoloso", "Sereno", "Sole radente","Pioggia in atto", "Grandine in atto", "Nebbia", "Nevicata in atto", "Vento forte");
          break;
        default:
          weatherResult.push("Nuvoloso", "Sereno", "Sole radente","Pioggia in atto", "Grandine in atto", "Nebbia", "Nevicata in atto", "Vento forte");
      }
    selectedRadioButton = document.querySelector('#radiobuttons input[type="radio"]:checked');

    if (selectedRadioButton.id === "General")
      csvFileNameChoroplethMapNature = "dataset/processed/choroplethMap/choroplethMapNatureGeneral" + selectedYear + ".csv";
    else
      csvFileNameChoroplethMapNature = "dataset/processed/choroplethMap/choroplethMapNature" + selectedYear + ".csv";

      d3.csv(csvFileNameChoroplethMapNature, function (data) {

        let dataAboutWeather = [];
        weatherResult.forEach(item => {
         data.filter(function (row) {
            if(row['CondizioneAtmosferica'] === item)
              dataAboutWeather.push(row)
          });
        });

        let dataAboutNature = []
        dataAboutWeather.forEach(item => {
          if (item['NaturaIncidente'] === d.NaturaIncidente.toString() )
            dataAboutNature.push(item)
        });

        let groupedByTownHall = new Map();
        dataAboutNature.forEach(item => {
          let municipio = item.Municipio;
          if (!groupedByTownHall.has(municipio)) {
            groupedByTownHall.set(municipio, []);
          }
          groupedByTownHall.get(municipio).push(item);
        });

        let incidentCounts = new Map();
        groupedByTownHall.forEach((data, municipio) => {
          if (municipio !== "") {
            const count = data.length;
            incidentCounts.set(municipio, count);
          }
        });
        setTimeout(function () {
          loader.style.display = "none";
          console.log(incidentCounts)
          for (const [key, value] of incidentCounts) {
            showNumberOfAccidents(key, value);
          }
          fillOtherTownHalls(incidentCounts);
          choroplethMapSvg.style("opacity", 1);
          let nnaturee = document.getElementById("nnaturee");
          nnaturee.style.display = 'block';
          nnaturee.textContent = "Selected nature: [" + d.NaturaIncidente.toString() + "]"
        }, 1500); // Assicurati che questo timeout sia sincronizzato con l'animazione o il caricamento effettivo del grafico

      });

      let natureAccidents = "dataset/processed/timeSeries/" + selectedYear + "/" + "timeSeriesNature" + d.NaturaIncidente.toString() + ".csv";
        // Disegna la nuova linea per la barra corrente
       //if (setBarColor(d.NumeroIncidenti) === "#d73027" || setBarColor(d.NumeroIncidenti) === "#fc8d59") {
      let natureTimeSeries;
      let value  = 21;

            d3.csv(natureAccidents, function (data) {

              switch(d.NaturaIncidente.toString()) {
                case 'C1':
                   natureTimeSeries = "Pedestrian hit";
                   value = 15.5;
                   break;
                case 'C2':
                   natureTimeSeries = "Vehicles collision\n(moving)";
                   break;
                case 'C3':
                   natureTimeSeries ="Vehicles collision\nwith a stationary\nvehicle";
                   value = 27;
                   break;
                case 'C4':
                   natureTimeSeries = "Rear-end collision";
                   value = 15.5;
                   break;
                case 'C5':
                   natureTimeSeries = "Collision\nwith obstacle";
                   break;
                case 'C6':
                   natureTimeSeries = "Sudden braking\nand vehicle fall";
                   break;
                case 'C7':
                   natureTimeSeries = "Overturning and\nrun-off-road";
                   break;
                default:
                   natureTimeSeries = "Side/head-on\ncollision"
              }

              incidentiPerIntervalloTwo = [];
              if (switchInput.value === "OFF" && switchBrushInput.value === "OFF"){
                convertData(data);
                function calcolaSommaIncidentiTwo(data, inizio, fine) {

                  var sommaIncidenti = data.reduce(function (acc, row) {
                    // Estrai la data dall'oggetto row
                    var dataIncidente = new Date(row['DataOraIncidente']);

                    // Verifica se la data rientra nell'intervallo specificato
                    if (dataIncidente >= inizio && dataIncidente <= fine)
                      // Se sì, aggiungi il numero di incidenti alla somma
                      return acc + parseInt(row['NumeroIncidenti']); else return acc;
                  }, 0);
                  console.log('Somma incidenti per intervallo:', sommaIncidenti);
                  return sommaIncidenti;
                }

                // Per ciascun intervallo di date, calcola la somma degli incidenti e aggiungi il risultato all'array incidentiPerIntervallo
                incidentiPerIntervalloTwo.push(calcolaSommaIncidentiTwo(data, new Date(selectedYear + '-01-01'), new Date(selectedYear + '-01-31')));
                incidentiPerIntervalloTwo.push(calcolaSommaIncidentiTwo(data, new Date(selectedYear + '-02-01'), new Date(selectedYear + '-03-02')));
                incidentiPerIntervalloTwo.push(calcolaSommaIncidentiTwo(data, new Date(selectedYear + '-03-03'), new Date(selectedYear + '-04-01')));
                incidentiPerIntervalloTwo.push(calcolaSommaIncidentiTwo(data, new Date(selectedYear + '-04-02'), new Date(selectedYear + '-05-01')));
                incidentiPerIntervalloTwo.push(calcolaSommaIncidentiTwo(data, new Date(selectedYear + '-05-02'), new Date(selectedYear + '-05-31')));
                incidentiPerIntervalloTwo.push(calcolaSommaIncidentiTwo(data, new Date(selectedYear + '-06-01'), new Date(selectedYear + '-06-30')));
                incidentiPerIntervalloTwo.push(calcolaSommaIncidentiTwo(data, new Date(selectedYear + '-07-01'), new Date(selectedYear + '-07-30')));
                incidentiPerIntervalloTwo.push(calcolaSommaIncidentiTwo(data, new Date(selectedYear + '-07-31'), new Date(selectedYear + '-08-29')));
                incidentiPerIntervalloTwo.push(calcolaSommaIncidentiTwo(data, new Date(selectedYear + '-08-30'), new Date(selectedYear + '-09-28')));
                incidentiPerIntervalloTwo.push(calcolaSommaIncidentiTwo(data, new Date(selectedYear + '-09-29'), new Date(selectedYear + '-10-28')));
                incidentiPerIntervalloTwo.push(calcolaSommaIncidentiTwo(data, new Date(selectedYear + '-10-29'), new Date(selectedYear + '-11-27')));
                incidentiPerIntervalloTwo.push(calcolaSommaIncidentiTwo(data, new Date(selectedYear + '-11-28'), new Date(selectedYear + '-12-27')));

                // timeSeriesSvg.selectAll(".info-box").remove();
                setTimeout(function () {
                  loaderS.style.display = "none";
                  drawLineWithValue(data, setBarColor(d.NumeroIncidenti), d.NaturaIncidente);
                  console.log(focusArray);
                  addPoints(d.NaturaIncidente.toString());
                  drawPoints(data, setBarColor(d.NumeroIncidenti));
                  infoBoxNatureArray.push(infoBox);
                  vBarChart = true;
                  timeSeriesSvg.selectAll(".mydotss").remove();
                  legend.selectAll(".txt").remove();
                  keysLegends = []
                  keysLegends.push("")
                  drawLegend(natureTimeSeries, setBarColor(d.NumeroIncidenti), value)
                  timeSeriesSvg.style("opacity", 1);
                }, 1500); // Assicurati che questo timeout sia sincronizzato con l'animazione o il caricamento effettivo del grafico
              }
            });

        /*}
        else {
          timeSeriesSvg.selectAll("*").remove();
          drawTimeSeriesChart(csvFileNameTimeSeries);
        }*/
/*
    const url = `http://localhost:5000/calculate_pca?nature=${clickedNature}&year=${selectedYear}`;

    console.log("URL" + url)
    fetch(url)
      .then(response => {
        console.log('Data received:', response); // Log per verificare i dati ricevuti
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        scatterPlotpSvg.selectAll("*").remove();
        drawScatterPlot("dataset/processed/scatterPlot/PCA-real-time.csv");
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });


 */

    const url = `http://localhost:5000/calculate_pca?nature=${clickedNature}&year=${selectedYear}`;

    axios.get(url)
      .then(response => {
        console.log('Data received:', response.data);
        scatterPlotpSvg.selectAll("*").remove();
        drawScatterPlot("dataset/processed/scatterPlot/PCA-real-time.csv");
      })
      .catch(error => {
        console.error('There was a problem with the request:', error);
      });
  }
}

function setAccidentsNumberAndNatureAndYear(d) {
  let result = d.NumeroIncidenti
  return result
  /*switch(d.NaturaIncidente.toString()) {
    case 'C1':
      return result.concat("Pedestrian hit")
    case 'C2':
      return result.concat("Vehicles collision (moving)")
    case 'C3':
      return result.concat("Vehicles collision (stationary vehicle)")
    case 'C4':
      return result.concat("Rear-end collision")
    case 'C5':
      return result.concat("Collision with obstacle")
    case 'C6':
      return result.concat("Sudden braking and vehicle fall")
    case 'C7':
      return result.concat("Overturning and run-off-road")
    default:
      return result.concat("Side/head-on collision")
  }*/

}






