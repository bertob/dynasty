// CONFIG

var emperor_file = "data/jul_emp.csv";
var dynasty_file = "data/jul_dyn.csv";

var TITLE = "The Julio-Claudian Dynasty";
var SOURCE = "Data source: http://en.wikipedia.org/wiki/List_of_roman_emperors";
var CREDIT = "Author: Tobias Bernard (tobiasbernard.com)";

var SHOW_INFO = true;
var SHOW_DYNASTIES = true;

// VARIABLES

var width, height;
var min, max;

var year_0_offset;

var emperors = [];
var dynasties = [];

// CONSTANTS

var VERT_MARGIN = 20;
var HORIZ_MARGIN = VERT_MARGIN;

var SCALE_HEIGHT = 0;
var BOTTOM_MARGIN = 0;

if (SHOW_DYNASTIES && SHOW_INFO) {
  SCALE_HEIGHT = 180;
  BOTTOM_MARGIN = 50;
}
else if (SHOW_INFO) {
  SCALE_HEIGHT = 70;
  BOTTOM_MARGIN = 50;
}
else if (SHOW_DYNASTIES) {
  SCALE_HEIGHT = 70;
}

var YEAR = 4;

var BAR_HEIGHT = 6;
var BAR_VERT_MARGIN = 10;
var BAR_ROW_H = BAR_HEIGHT + BAR_VERT_MARGIN;
var BAR_LABEL_MARGIN = 7;
var BAR_LABEL_SIZE = 12;

var DYN_HEIGHT = 40;
var DYN_BAR_HEIGHT = 3;

// STYLES

var COLOR_LIFE = "#39b1d5";
var COLOR_AUG = "#8d065e";
var COLOR_CAE = "#de49a8";
var COLORS = [COLOR_LIFE, COLOR_AUG, COLOR_CAE];

var GRID_1 = "#666";
var GRID_2 = "#aaa";
var GRID_3 = "#ccc";
var GRID_4 = "#eee";

var FONT = "'Fira Sans', Helvetica, sans-serif";

var gradients = [];

// INIT

var svg = d3.select("svg");

d3.csv(emperor_file, type, function(error, data) {
  setGradients();
  readEmperors(data);
  d3.csv(dynasty_file, type, function(error, data) {
    dynasties = data;
    init();
    enableDownload();
  });
});

function init() {

  // find min and max date
  min = 100000;
  max = -100000;

  emperors.forEach(function(el, i){
    if(el.birth[0] < min) min = el.birth[0];
    if(el.death.length === 1) {
      if(el.death[0] > max) max = el.death[0];
    } else {
      if(el.death[1] > max) max = el.death[1];
    }
  });

  // find year 0
  //year_0_offset = (min > 0 ? getCentury(min) : getCentury(-min)) * 100;
  year_0_offset = (startCentury(-min) + 1) * 100;

  // format SVG document
  width = Math.abs(endCentury(max) - startCentury(min)) * 100 * YEAR + 2 * HORIZ_MARGIN;
  height = SCALE_HEIGHT + BOTTOM_MARGIN + BAR_VERT_MARGIN + emperors.length * (BAR_HEIGHT + BAR_VERT_MARGIN) + 2 * VERT_MARGIN;

  // set document size
  svg.attr("width", width)
    .attr("height", height);

  // set white background
  svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "white");

  // draw data
  if (SHOW_INFO) drawInfo();
  drawGrid(emperors, startCentury(min) * 100, endCentury(max) * 100);
  if (SHOW_DYNASTIES) drawDynasties(dynasties, emperors);
  drawEmperors(emperors);
}

function setGradients() {

  // define gradients globally
  var defs = svg.append("svg:defs");

  // life
  gradients[0] = defs.append("svg:linearGradient")
    .attr("id", "l_gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%")
    .attr("spreadMethod", "pad");

  // augustus
  gradients[1] = defs.append("svg:linearGradient")
    .attr("id", "a_gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%")
    .attr("spreadMethod", "pad");

  // caesar
  gradients[2] = defs.append("svg:linearGradient")
    .attr("id", "c_gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%")
    .attr("spreadMethod", "pad");

  // add stops to the gradients
  gradients.forEach(function(grad, i) {
    grad.append("svg:stop")
      .attr("offset", "0%")
      .attr("stop-color", COLORS[i])
      .attr("stop-opacity", 0);

    grad.append("svg:stop")
      .attr("offset", "100%")
      .attr("stop-color", COLORS[i])
      .attr("stop-opacity", 1);
  });
}

// DRAWING FUNCTIONS

function drawInfo() {

  // draw title
  svg.append("text")
    .text(TITLE)
    .attr("x", HORIZ_MARGIN)
    .attr("y", VERT_MARGIN + SCALE_HEIGHT - 140)
    .attr("text-anchor", "start")
    .attr("font-family", FONT)
    .attr("font-weight", 500)
    .attr("font-size", 40)
    .attr("fill", "black");

  // draw years
  svg.append("text")
    .text(getYearRange(min, max))
    .attr("x", HORIZ_MARGIN)
    .attr("y", VERT_MARGIN + SCALE_HEIGHT - 100)
    .attr("text-anchor", "start")
    .attr("font-family", FONT)
    .attr("font-weight", 500)
    .attr("font-size", 30)
    .attr("fill", "black");

    // draw source & credit
    svg.append("text")
      .text(SOURCE)
      .attr("x", HORIZ_MARGIN)
      .attr("y", height - BOTTOM_MARGIN - VERT_MARGIN + 30)
      .attr("text-anchor", "start")
      .attr("font-family", FONT)
      .attr("font-weight", 500)
      .attr("font-size", BAR_LABEL_SIZE)
      .attr("fill", "black");
    svg.append("text")
      .text(CREDIT)
      .attr("x", HORIZ_MARGIN)
      .attr("y", height - BOTTOM_MARGIN - VERT_MARGIN + 50)
      .attr("text-anchor", "start")
      .attr("font-family", FONT)
      .attr("font-weight", 500)
      .attr("font-size", BAR_LABEL_SIZE)
      .attr("fill", "black");


}

function drawGrid(data, start, end) {
  // -200, 700
  // Grid 200BC - 700AD
  // Data 167BC - 612AD

  for(var i = start; i <= end; i += 10) {
    drawLineAtYear(i, GRID_4);
    if(i % 50 !== 0) drawGridLabel(i, GRID_2);
  }
  for(i = start; i <= end; i += 50) {
    drawLineAtYear(i, GRID_3);
    drawGridLabel(i, GRID_1);
  }
}

function drawEmperors(data) {
  data.forEach(function(el, i) {
    log("drawing " + el.name);
    drawName(el, i);
    handleRanges("l", el, i, el.birth, el.death, COLOR_LIFE);
    if ((el.ascension && el.abdictation) !== false) handleRanges("a", el, i, el.ascension, el.abdication, COLOR_AUG);
    if ((el.c_ascension && el.c_abdictation) !== false) handleRanges("c", el, i, el.c_ascension, el.c_abdication, COLOR_CAE);
  });
}

function handleRanges(type, el, i, start, end, color) {
  var VERT_OFFSET = VERT_MARGIN + SCALE_HEIGHT + BAR_VERT_MARGIN;
  var y = VERT_OFFSET + i * BAR_ROW_H;
  var x, w;

  // only actual bar (default values in case there are no ranges)
  var bar_start = start[0];
  var bar_end = end[0];

  // range bar at the beginning of the bar
  if(start.length !== 1) {
    drawRangeBar(start, y, false, "url(#" + type + "_gradient)", 1);
    bar_start = start[1];
  }

  // range bar at the end of the bar
  if (end.length !== 1) {
    drawRangeBar(end, y, true, "url(#" + type + "_gradient)", 1);
    bar_end = end[0];
  }

  // draw actual bar
  x = HORIZ_MARGIN + (year_0_offset + bar_start) * YEAR;
  w = (bar_end - bar_start) * YEAR;
  drawBar(x, y, w, false, color);
}

function drawRangeBar(range, y, mirror, color) {
  x = HORIZ_MARGIN + (year_0_offset + range[0]) * YEAR;
  w = (range[1] - range[0]) * YEAR;
  drawBar(x, y, w, mirror, color);
}

function drawBar(x, y, w, mirror, color) {
  svg.append("rect")
    .attr("x", x)
    .attr("y", y)
    .attr("width", w)
    .attr("height", BAR_HEIGHT)
    .style("fill", color)
    .attr("transform", mirror? "translate(" + (2 * x + w) + ", 0) scale(-1,1)" : "");
}

function drawName(emp, i) {
  svg.append("text")
    .text(emp.name)
    .attr("x", HORIZ_MARGIN + (year_0_offset + emp.birth[0]) * YEAR - BAR_LABEL_MARGIN)
    .attr("y", VERT_MARGIN + SCALE_HEIGHT + BAR_VERT_MARGIN + i * BAR_ROW_H + BAR_HEIGHT)
    .attr("text-anchor", "end")
    .attr("font-family", FONT)
    .attr("font-weight", 500)
    .attr("font-size", BAR_LABEL_SIZE)
    .attr("fill", "black");
}

function drawDynasties(dynasties, emperors) {
  dynasties.forEach(function(dyn, i) {
    log("drawing the " + dyn.name);
    var d_start, d_end;
    emperors.forEach(function(emp, j) {
      if (dyn.start === emp.name) {
        d_start = emp.ascension[0];
      }
      if (dyn.end === emp.name) {
        d_end = emp.abdication.length === 1 ? emp.abdication[0] : emp.abdication[1];
      }
    });

    var w = (d_end - d_start) * YEAR;
    var x = HORIZ_MARGIN + (year_0_offset + d_start) * YEAR;
    var y = VERT_MARGIN + SCALE_HEIGHT - DYN_HEIGHT;
    var y_label = y - 5;

    if (dyn.name.length * 3 > (d_end - d_start)) {
      y_label = y_label - 22;
    }

    // Bar
    svg.append("rect")
      .attr("x", x)
      .attr("y", y)
      .attr("width", w)
      .attr("height", DYN_BAR_HEIGHT)
      .attr("fill", dyn.color);

    // Background bar
    svg.append("rect")
      .attr("x", x)
      .attr("y", y)
      .attr("width", w)
      .attr("height", height - BOTTOM_MARGIN - 2 * VERT_MARGIN - SCALE_HEIGHT + 40)
      .attr("opacity", 0.06)
      .attr("fill", dyn.color);

    // Label
    svg.append("text")
      .text(dyn.name)
      .attr("x", x)
      .attr("y", y_label)
      .attr("text-anchor", "start")
      .attr("font-family", FONT)
      .attr("font-weight", 500)
      .attr("font-size", "18px")
      .attr("fill", dyn.color);

  });
}

function drawLineAtYear(year, color) {
  var x = HORIZ_MARGIN + year_0_offset * YEAR + year * YEAR;
  var lineData = [{"x": x, "y": HORIZ_MARGIN + SCALE_HEIGHT}, {"x": x, "y": height - BOTTOM_MARGIN - VERT_MARGIN}];
  var lineFunction = d3.svg.line()
  .x(function(d) { return d.x; })
  .y(function(d) { return d.y; })
  .interpolate("linear");

  svg.append("path")
  .attr("d", lineFunction(lineData))
  .attr("stroke", color)
  .attr("stroke-width", 2)
  .attr("fill", "none");
}

function drawGridLabel(year, color) {
  var x = HORIZ_MARGIN + year_0_offset * YEAR + year * YEAR;
  var y = VERT_MARGIN + SCALE_HEIGHT - 10;
  svg.append("text")
    .text(year)
    .attr("x", x)
    .attr("y", y)
    .attr("text-anchor", "middle")
    .attr("font-family", FONT)
    .attr("font-weight", 600)
    .attr("font-size", 12)
    .attr("fill", color);
}

// UTILITIES

function readEmperors(data) {
  data.forEach(function(el, i){
    log("reading " + el.name);

    var b = getYearPosition(el.birth);
    var d = getYearPosition(el.death);
    var asc = (function(){
        switch (el.ascension) {
          case 'n': return false;
          default: return getYearPosition(el.ascension);
      }
    })();
    var abd = (function(){
      switch (el.abdication) {
        case 'n': return false;
        case 'd': return getYearPosition(el.death);
        default: return getYearPosition(el.abdication);
      }
    })();
    var c_asc = ((el.c_ascension === 'n')? false : getYearPosition(el.c_ascension));
    var c_abd = (function(){
        switch (el.c_abdication) {
          case 'n': return false;
          case 'a': return asc;
          default: return getYearPosition(el.c_abdication);
        }
      })();

    emperors.push({
      name: el.name,
      birth: b,
      death: d,
      ascension: asc,
      abdication: abd,
      c_ascension: c_asc,
      c_abdication: c_abd
    });

    log(emperors[emperors.length - 1]);
  });
}

function enableDownload() {
  console.log("Downloading SVG!");
  var downloadButton = document.getElementById("download-button");
  var xml = (new XMLSerializer()).serializeToString(document.getElementById("svg"));
  downloadButton.href = 'data:application/octet-stream;base64,' + btoa(unescape(encodeURIComponent(xml)));
  downloadButton.style.display = "block";
}

function getYearPosition(date) {

  // array with start and end date, or only one date
  var dates = [];

  // array with start and end position, or only one
  var positions = [];

  // Single Date             d/m/y             date
  // Year only:              #y                jan1 -> dec31
  // Range of dates:         #d/m/y_d/m/y      date -> date
  // Range of years only:    #y_y              jan1 y1 -> dec31 y2
  // Mixed                   #y_d/m/y          jan1 y1 -> date

  if(date[0] === '#') {
    if(date.indexOf('_') !== -1) {
      var parts = date.substring(1,date.length).split('_');
      for (var i = 0; i < 2; i++){
        if (parts[i].indexOf('/') !== -1) dates.push(handleSingleYear(parts[i])[i]);
        else dates.push(handleSingleYear(parts[i])[i]);
      }
    } else dates = handleSingleYear(date);
  } else dates = [date];

  dates.forEach(function(el, i){
    el = el.split('/');
    var year = parseInt(el[2]);
    var month = parseInt(el[1]);
    var day = parseInt(el[0]);

    // HACK! Account for different month lengths
    var year_percentage = (month / 12) * (11/12) + (day / 30) * (1/12);
    positions.push(year + year_percentage);
  });
  log(positions);
  return positions;
}

function handleSingleYear(date) {
  if (date.indexOf('/') === -1) {
    var year = date;
    if (year[0] === "#") year = year.substring(1,date.length);
    return ["1/1/" + year, "31/12/" + year];
  } else return [date];
}

function startCentury(year) {
  return Math.floor(year / 100);
}

function endCentury(year) {
  return Math.floor(year / 100) + 1;
}

function getYearRange(start, end) {
  if (start < 0 || end < 0) {
    return getYearString(startCentury(min) * 100) + " – " + getYearString(endCentury(max) * 100);
  }
  else {
    return startCentury(min) * 100 + " – " + endCentury(max) * 100;
  }
}

function getYearString(year) {
  if (year < 0) return Math.abs(year) + " BC";
  else return year + " AD";
}

function type(d) {
  d.value = +d.value;
  return d;
}

function log(a) {
  console.log(a);
}
