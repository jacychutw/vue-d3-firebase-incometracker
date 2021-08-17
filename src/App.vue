<template>
  <div id="app">
    <IncomeTracker msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import IncomeTracker from './components/IncomeTracker.vue'

export default {
  name: 'App',
  components: {
    IncomeTracker
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #3f4e5c;
}
</style>
