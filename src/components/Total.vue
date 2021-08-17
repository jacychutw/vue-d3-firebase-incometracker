<template>
  <div class="canvastotal">
    <svg width="400" height="300"></svg>
  </div>
</template>

<!-- 使用D3 -->
<script src="https://d3js.org/d3.v5.min.js"></script>

<script>
import db from "../Firebase";

export default {
  name: 'Total',
  data() {
    return {
      annual: 0,
    }
  },
  watch: {
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
    var data = [];
      db.collection('incometracker').onSnapshot(res => {
        res.docChanges().forEach(change => {
          const doc = {...change.doc.data(), id: change.doc.id};
          switch (change.type) {
            case 'added':
              data.push(doc);
              break;
            case 'modified':
              const index = data.findIndex(item => item.id == doc.id);
              data[index] = doc;
              break;
            case 'removed':
              data = data.filter(item => item.id !== doc.id);
              break;
            default:
              break;
          }
        });

        //get four quarters data
        //重新整理一下數據
        let collectarr = [];
        let sum = 0;
        this.annual = 0;
        let annualsum = 0;

        let dataQ1 = data.filter(item => item.quarter == "Q1")
        sum = 0;
        for(let i = 0; i < dataQ1.length; i++) {
          sum += parseInt(dataQ1[i].amount);
          annualsum +=sum;
        }
        collectarr.push({ "quarter": "Q1", "amount": sum})

        let dataQ2 = data.filter(item => item.quarter == "Q2")
        sum = 0;
        for(let i = 0; i < dataQ2.length; i++) {
          sum += parseInt(dataQ2[i].amount);
          annualsum +=sum;
        }
        collectarr.push({ "quarter": "Q2", "amount": sum})

        let dataQ3 = data.filter(item => item.quarter == "Q3")
        sum = 0;
        for(let i = 0; i < dataQ3.length; i++) {
          sum += parseInt(dataQ3[i].amount);
          annualsum +=sum;
        }
        collectarr.push({ "quarter": "Q3", "amount": sum})

        let dataQ4 = data.filter(item => item.quarter == "Q4")
        sum = 0;
        for(let i = 0; i < dataQ4.length; i++) {
          sum += parseInt(dataQ4[i].amount);
          annualsum +=sum;
        }
        this.annual = annualsum;
        this.$emit("calculateAnnualSum", this.annual);

        collectarr.push({ "quarter": "Q4", "amount": sum})

        console.log("collectarr")
        console.log(collectarr)

        this.updateData(collectarr);
      })
    },
    updateData(data) {
      console.log("printdata");
      console.log(data);
      d3.selectAll(".canvastotal svg > *").remove();
      const margin = 40;


    var svg = d3.select(".canvastotal svg"),
          width = svg.attr("width") - margin,
          height = svg.attr("height") - margin;

    var xScale = d3.scaleBand().range([0, width]).padding(0.6),
        yScale = d3.scaleLinear().range([height, 0]);

    var g = svg.append("g")
                .attr("transform", "translate(" + 70 + "," + 10 + ")");

    xScale.domain(data.map(function(d) { return d.quarter; }));
    yScale.domain([0, d3.max(data, function(d) { return d.amount; })]);

    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale))
      .style("font-size","16px")

    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(function(d){
          return Math.floor(d/1000) + "k";
      }).ticks(4).tickSize(-width))
      .style("font-size","16px")

    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return xScale(d.quarter); })
      .attr("y", function(d) { return yScale(d.amount); })
      .attr("width", xScale.bandwidth())
      .attr("height", function(d) { return height - yScale(d.amount); })
      .attr("fill", "#374151");

    }
  }
}
</script>