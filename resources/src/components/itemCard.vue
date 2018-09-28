<template>
<div class="col s4 m3 l2 xl2">
    <div class="card z-depth-5">
        <div class="card-image">
            <img :src="this.config.picture">
            <span class="card-title">{{this.config.name}}</span>
        </div>
        <div class="card-content">
            <p v-for="(content) in this.config.quantities">{{content.quantity + ": " + content.price + "€"}}</p>
        </div>
        <div class="card-action">
            <a v-for="(quantity) in this.config.quantities" :class="'waves-effect waves-light btn'" @click="addToOrder(quantity.quantity)">{{quantity.quantity}}</a>
        </div>
    </div>
</div>


</template>

<script>
import { EventBus } from "../services/event-bus.js"
export default {
  name: 'card',
  props:['config'],
  methods: {
      addToOrder: function(quantity) {
          EventBus.$emit("addToOrder", this.config.name, quantity);
      }
  },
  computed: {
      btnCol: function() {
          var amountBtn = this.config.quantities.length;
          var num = Math.ceil(12 / amountBtn);
          num = num<3 ? 3: num;
          return "col s"+num+" m"+num+" l"+num+" xl"+num;
      }
  }
  
}
</script>

<style scoped>


</style>