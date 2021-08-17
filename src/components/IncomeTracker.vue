<template>
  <div class="hello">
    <div class="bg-black w-full bg-opacity-70">
      <h3 class="text-4xl text-white">
      Income Tracker
      </h3>
    </div>
    <div class="bg-black w-full bg-opacity-90 h-full px-10">
      <div class="grid md:grid-cols-12 grid-cols-6 pt-20">
        <div class="col-span-2 border-gray-600 border-r-2">
          <div class="flex flex-col float-right p-8 selectbtns">
            <button @click="changeQuarter" data-quarter="Q1" :class="{ active: quarter === 'Q1' }" class="quarterbutton w-16 bg-gray-700 hover:bg-gray-200 text-red-300 font-bold py-2 px-4">Q1</button>
            <button @click="changeQuarter" data-quarter="Q2" :class="{ active: quarter === 'Q2' }" class="quarterbutton w-16 bg-gray-700 hover:bg-gray-200 text-red-300 font-bold py-2 px-4 mt-4">Q2</button>
            <button @click="changeQuarter" data-quarter="Q3" :class="{ active: quarter === 'Q3' }" class="quarterbutton w-16 bg-gray-700 hover:bg-gray-200 text-red-300 font-bold py-2 px-4 mt-4">Q3</button>
            <button @click="changeQuarter" data-quarter="Q4" :class="{ active: quarter === 'Q4' }" class="quarterbutton w-16 bg-gray-700 hover:bg-gray-200 text-red-300 font-bold py-2 px-4 mt-4">Q4</button>
          </div>
        </div>
        <div class="col-span-4">
          <!-- form -->
          <div class="w-full max-w-sm px-10">
            <div class="flex items-center border-b border-teal-500 py-2 mt-6">
              <input v-model="source" class="appearance-none bg-transparent border-none w-full text-white mr-3 py-1 px-2 leading-tight focus:outline-none focus:border-blue-500" type="text" placeholder="Source">
            </div>
            <div class="flex items-center border-b border-teal-500 py-2 mt-2">
              <input v-model="amount" class="appearance-none bg-transparent border-none w-full text-white mr-3 py-1 px-2 leading-tight focus:outline-none" type="text" placeholder="Amount">
            </div>
              <button @click="sendForm" class="mt-6 w-full h-8 bg-red-400 text-white hover:bg-red-300">Add</button>
              <p class="text-white text-left mt-4">Total: NT$ <span>{{ total }}</span></p>
              <p class="text-red-300 text-left mt-0">{{ error }}</p>
          </div>
        </div>
        <div class="col-span-6">
          <Graph :quarter="quarter" @calculateSum="calculateSum"/>
        </div>
      </div>
      <hr class="border-gray-500">
      <div class="mt-6 grid justify-items-center">
        <p class="text-gray-400 mb-6">Set goals. Stay focused. Make momey.</p>
        <Total @calculateAnnualSum="calculateAnnualSum"/>
        <p class="text-gray-400 mt-4 mb-10">Annual Income: NT$ <span>{{ annual }}</span></p>
      </div>
    </div>
  </div>
</template>


<!-- 使用D3 -->
<script src="https://d3js.org/d3.v5.min.js"></script>

<script>
import Graph from './Graph.vue';
import Total from './Total.vue'
import db from "../Firebase";
import {increment} from "../Firebase";

export default {
  name: 'IncomeTracker',
  props: {
    msg: String
  },
  components: {
    Graph,
    Total
  },
  data() {
    return {
      //btns: this.$refs.fourquarters,
      quarter: "Q1",
      source: "",
      amount: "",
      index: "",
      total: 0,
      error: "",
      annual: 0,
    }
  },
  methods: {
    changeQuarter(e) {
      this.quarter = e.target.dataset.quarter;
      this.source = "";
      this.amount = "";
      this.error = "";
    },
    sendForm() {
      let checktype = isNaN(this.amount);
      if(checktype) {
        this.error = "Amount should be a number!"
        console.log("hererere!")
      } else if (!this.amount || !this.source) {
        this.error = "Please fill in the form!"
      } else {

        db.collection("incometracker")
          .where("quarter", "==", this.quarter)
          .where("source", "==", this.source)
          .get()
          .then((querySnapshot) => {
            if (querySnapshot.empty) {
              // This name is not in the database
              const item = {
                quarter: this.quarter,
                source: this.source,
                amount: parseInt(this.amount)
              };
              return db.collection("incometracker").add(item);
            } else if (querySnapshot.size === 1) {
              // This name is already in the database
              querySnapshot.forEach((doc) => {
                // Update
                db.collection("incometracker")
                  .doc(doc.id)
                  .update({
                    amount: increment.increment(this.amount),
                  });
              });
            } else {
              // Each name should only appear once, and this branch should never be reached
              error.textContent = "Something is wrong with the database";
            }
          })
          .then((res) => {
            this.error = ""
            this.source = "";
            this.amount = "";
          });
      }
    },
    calculateSum(totalmoney) {
      let formatmoney = new Intl.NumberFormat().format(totalmoney);
      this.total = formatmoney;
    },
    calculateAnnualSum(totalmoney) {
      let formatmoney = new Intl.NumberFormat().format(totalmoney);
      this.annual = formatmoney;
    },
  }
}
</script>

<style scoped>
h3 {
  padding: 20px 0;
}
.underline {
  width: 200px;
}
button.active {
  background: white !important;
}
</style>
