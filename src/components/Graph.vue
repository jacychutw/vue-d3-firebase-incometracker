<template>
  <div class="canvas">
    <svg width="300" height="300"></svg>
  </div>
</template>

<!-- 使用D3 -->
<script src="https://d3js.org/d3.v5.min.js"></script>
<!-- 使用D3外掛套件legend, tip -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3-legend/2.25.6/d3-legend.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3-tip/0.9.1/d3-tip.js"></script>

<script>
import db from "../Firebase";

export default {
  name: 'Graph',
  props: {
    quarter: {
        type: String
    }
  },
  data() {
    return {
      totalmoney: 0,
    }
  },
  watch: {
    quarter: {
      immediate: true,
      deep: true,
      handler(newValue, oldValue) {
        if(newValue !== oldValue) {
          this.init();
        }
      }
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
    var data = [];
      db.collection('incometracker').orderBy('amount').onSnapshot(res => {
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
        this.updateData(data);
      })
    },
    updateData(data) {
      //d3.selectAll("*").remove();
      d3.selectAll(".canvas svg > *").remove();

      const dims = {height: 300, width: 300, radius: 100 };
      const cent = {x: (dims.width/2+5), y: (dims.height/2 +5)};

      // 定義右方的畫布
      const svg = d3.select('.canvas svg')
        .attr('width', dims.width + 150)
        .attr('height', dims.height + 10)

      // 將圖表先組合成一個group
      const graph = svg.append('g')
        .attr('transform', `translate(${cent.x},${cent.y})`);

      const pie = d3.pie()
        .sort(null) //排除掉預先sort的作用
        .value(d => d.amount) //將amount的值拿來繪圖

      const arcPath = d3.arc()
        .outerRadius(dims.radius)
        .innerRadius(dims.radius/2);

      const arcTweenEnter = (d) => {
        var i = d3.interpolate(d.endAngle-0.1, d.startAngle);

        return function(t) {
          d.startAngle = i(t);
          return arcPath(d);
        };
      };

      const arcTweenExit = (d) => {
        var i = d3.interpolate(d.startAngle, d.endAngle);

        return function(t) {
          d.startAngle = i(t);
          return arcPath(d);
        };
      };

      const arcTweenUpdate = function(d) {
        var i = d3.interpolate(this._current, d);
        this._current = i(1);

        return function(t) {
          //回歸到之前設定的值
          // i(t) returns a value of d (data object) which we pass to arcPath
          return arcPath(i(t));
        };
      };

      // 使用d3內建的schemeSet3色盤，也可以自己調配想要的顏色
      const colour = d3.scaleOrdinal(['#cbb48c','#ded3c3','#819582','#d08a55','#c2c9c9','#828684','#d6b7b5']);

      // 圖表右方標示圖
      const legendGroup = svg.append('g')
        .attr('transform', `translate(${dims.width + 10}, 10)`)

      // 將標示圖繪製顏色
      const legend = d3.legendColor()
        .shape('path', d3.symbol().type(d3.symbolCircle)())
        .shapePadding(10)
        .scale(colour);

      // tooltip設定
      const tip = d3.tip()
        .attr('class', 'tip card')
        .html(d => {
          let content = `<div style="background-color: #374151; padding: 10px;"><div style="color: white;">Source: ${d.data.source}</div>`;
          content += `<div style="color: white;">Amount: ${d.data.amount}</div>`;
          content += `<div style="color: #fca5a5;">Click slice to delete</div></div>`
          return content;
        });

      // 圖表使用tip 利用call來呼叫
      graph.call(tip);

      // event handlers
      const handleMouseOver = (d,i,n) => {
        //tip.show(d, n[i]);
        d3.select(n[i])
          .transition('changeSliceFill').duration(500)
            .attr('fill', 'gray');
      };

      const handleMouseOut = (d,i,n) => {
        //tip.hide();
        d3.select(n[i])
          .transition('changeSliceFill').duration(100)
            .attr('fill', colour(d.data.source));
      };

      const handleClick = (d) => {
        const id = d.data.id;
        db.collection('incometracker').doc(id).delete();
      };

      const update = (data) => {
        data = data.filter(item => item.quarter == this.quarter)
        this.totalmoney = 0;
        let sum = 0;
        for(let i = 0; i < data.length; i++) {
          sum += parseInt(data[i].amount);
        }
        this.totalmoney = sum;
        console.log(this.totalmoney);
        this.$emit("calculateSum", this.totalmoney);

        colour.domain(data.map(d => d.source));

        // 更新右方標示圖
        legendGroup.call(legend);
        legendGroup.selectAll('text').attr('fill', 'white');

        // 結合更新過的 pie data 到 path 元件
        const paths = graph.selectAll('path')
          .data(pie(data));

        // 處理要移除的資料
        paths.exit()
          .style("pointer-events", "none")
          .transition().duration(750)
          // 建立補間動畫 attrTween
          .attrTween("d", arcTweenExit)
          .remove();

        // 處理目前更新的資料(DOM)
        paths.transition().duration(750)
          .attrTween("d", arcTweenUpdate);

        // 將要加入的資料加到dom上面
        paths.enter()
          .append('path')
            .attr('class', 'arc')
            .attr('stroke', '#fff')
            .attr('stroke-width', 3)
            .attr('d', arcPath)
            .attr('fill', d => colour(d.data.source))
            .each(function(d){ this._current = d })
            .transition().duration(750).attrTween("d", arcTweenEnter);

        //補上觸發事件
        graph.selectAll('path')
          .on('mouseover', (d,i,n) => {
            setTimeout(() => {
                tip.show(d, n[i]);
            }, 200);
            handleMouseOver(d, i, n);
          })
          .on('mouseout', (d,i,n) => {
            tip.hide();
            handleMouseOut(d, i, n);
          })
          .on('click', (d) => {
            tip.hide();
            handleClick(d);
          })
      };
      update(data);
    }
  }
}
</script>
