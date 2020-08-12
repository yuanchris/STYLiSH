/* eslint-disable camelcase */

fetch('/order/dashboard', {
  method: 'GET',
}).then((res) => (res.json()))
  .then((data) => {
    // total revenue
    const total_revenue = document.querySelector('#total_revenue');
    let data_revenue = 0;
    for (let i = 0; i < data.length; i++) {
      data_revenue += data[i].total;
    }
    total_revenue.innerHTML = `Total Revenue: ${data_revenue}`;
    // color pie chart
    // console.log(data);
    const values = [];
    const labels = [];
    let colorMap;
    colorMap = data.map((obj) => {
      const result = obj.list.map((o) => {
        const oo = {};
        oo.code = o.color.code;
        oo.name = o.color.name;
        oo.qty = o.qty;
        return oo;
      });
      return result;
    });

    colorMap = colorMap.reduce(
      (a, b) => a.concat(b),
      [],
    );
    let colorMapName;
    colorMapName = _.groupBy(colorMap, 'name');
    for (let i = 0; i < Object.keys(colorMapName).length; i++) {
      labels[i] = Object.keys(colorMapName)[i];
    }
    let sum;
    for (let i = 0; i < Object.keys(colorMapName).length; i++) {
      sum = 0;
      for (let j = 0; j < colorMapName[labels[i]].length; j++) {
        sum += colorMapName[labels[i]][j].qty;
      }
      values[i] = sum;
    }
    const colorMapCode = _.groupBy(colorMap, 'code');
    // console.log(colorMapCode);
    const ultimateColors = [];
    for (let i = 0; i < Object.keys(colorMapCode).length; i++) {
      ultimateColors[i] = Object.keys(colorMapCode)[i];
    }
    // console.log(ultimateColors);
    var plotdata = [{
      values,
      labels,
      type: 'pie',
      // name: 'Product sold percentage in different colors',
      marker: {
        colors: ultimateColors,
      },
    }];

    const layout = {
      height: 400,
      width: 500,
    };

    Plotly.newPlot('percentage', plotdata, layout);

    //  Historgram
    let histogram;  
    histogram = data.map((obj) => {
      const result = obj.list.map((o) => {
        const oo = {};
        oo.price = o.price;
        oo.qty = o.qty;
        return oo;
      });
      return result;
    });

    histogram = histogram.reduce(
      (a, b) => a.concat(b),
      [],
    );
    histogram.sort(function(a,b) {
      return a.price - b.price;
  });
    console.log(histogram);

    let x = [];
    let y = [];
    for (let i = 0; i < histogram.length; i ++) {
      x[i] = histogram[i].price;
      y[i] = histogram[i].qty;
    }

    var trace = {
        x: x,
        y: y,
        type: 'histogram',
      };
    var hisdata = [trace];
    Plotly.newPlot('histogram', hisdata);
    
  });
