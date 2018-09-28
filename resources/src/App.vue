<!--~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * @file App.vue
 * This file is the highest parent of our vue-application - the first component that gets loaded
 * in the 'app'- hook.
 *
 * @author Alexander Seiler
 * @date 12.09.2018
 * 
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~-->
<template>
<div>
  <header>
    <ul id="slide-out" class="sidenav sidenav-fixed">
      <li v-for="(item, key) in this.currentOrder">
        <ul v-if="key != 'sum'" class="collapsible">
          <li>
            <div class="collapsible-header" @click="init()">
              <ul class="collection">
                <li class="collection-item avatar">
                  <img :src="item.picture" alt="" class="circle">
                  <span class="title">{{key}}</span>
                  <a class="secondary-content"><p>{{item.sum}}</p></a>
                </li>
              </ul>
            </div>
            <div class="collapsible-body">
              <ul>
                <li v-for="(quantity) in item.quantities">
                  <p>{{quantity.amount + ' ' + quantity.name + ': ' + quantity.sum + '€'}}</p>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </li>
    </ul>
  </header>
  <main>
    <div :class="this.standalone">
      <nav class="transparent">
        <div class="nav-wrapper">
          <div class="brand-logo center">
            <img id="company-logo" :src="this.currentConfig.configPicture" />
          </div>
        </div>
      </nav>
      <h2 v-if="this.currentConfig.viewTitle != undefined">{{this.currentConfig.viewTitle}}</h2>
      <div v-if="this.configsFetched === true">
        <div class="container">
          <div class="row">
            <template v-for="(component) in this.currentConfig.food">
              <itemCard :config="component"></itemCard>
            </template>
          </div>
        </div>
        <div class="container">
          <div class="row">
            <template v-for="(component) in this.currentConfig.drinks">
              <itemCard :config="component"></itemCard>
            </template>
          </div>
        </div>
      </div>
      <div v-else>
        <p>Configs not fetched yet</p>
      </div>
    </div>
  </main>
</div>
</template>

<script>
 
document.addEventListener('DOMContentLoaded', function() {
  alert(window.screen.availHeight + " " + 
window.screen.availWidth)
    var elems = document.querySelectorAll('.collapsible');
    var options = {};
    var instances = M.Collapsible.init(elems, options);
    var _elems = document.querySelectorAll('.sidenav');
    var _instances = M.Sidenav.init(_elems, options);
});

import logservice from "./services/logservice.js";
import getDataHelper from "./utility/getDataHelper.js";
import itemCard from "./components/itemCard.vue";
import { EventBus } from "./services/event-bus.js";

require("babel-polyfill");
var Vue = require("vue");
Vue.use(require("vue-resource"));

var logger = logservice.create("App"); //initialize the logger with the name of the component

export default {
  name: "app",
  data() {
    return {
      currentOrder: {},
      currentConfig: {},
      configsFetched: false
    };
  },
  methods: {

    
    /**
     * fetchConfig
     * @author Alexander Seiler
     * @date 12.09.2018
     * This function is basically a copy of the routine that @created, but since at that point in the lifecycle
     * there are no methods set up yet (@created-hook methods first get set up), we need to have a pseudo duplicate that
     * can be called during runtime.
     */
    fetchConfig: function() {
      logger.info("fetchConfig()");
      //Getting Promise of HTTP get from getDataHelper.js
      var configPath = "./config";
      getDataHelper.getData(configPath).then(function(data) { //promise resolve function
            logger.debug("fetchConfig(" + configPath + ") successful");
            let fetchedConfig = data.body; //gets the data
            Vue.set(this, "currentConfig", fetchedConfig); //save all the configs got from server

            Vue.set(this, "configsFetched", true); //sets flag
          
          }.bind(this)
          ).catch(function(err) {
          logger.error("fetchConfig(" + configPath + ") " + err);
        });
    },

    addToOrder: function(item, quantity) {
      var price = this.getPriceOfItem(item, quantity);
      if(this.currentOrder[item] == undefined)
      {
        Vue.set(this.currentOrder, item, {});
      }
      var currentItem = this.currentOrder[item];
      Vue.set(currentItem, "picture", this.getPicturePath(item));
      if(currentItem.sum == undefined)
      {
        Vue.set(currentItem, "sum", 0);
      }
      if(currentItem.quantities == undefined)
      {
        Vue.set(currentItem, "quantities", []);
        var currentQuant = {
          name: quantity,
          sum: price,
          amount: 1
        }
        currentItem.quantities.push(currentQuant);
        currentItem.sum += price;
        this.currentOrder.sum += price;
        return;
      }
      for(var element of currentItem.quantities)
      {
        if(element.name == quantity) 
        {
          element.sum += price;
          element.amount++;
          currentItem.sum += price;
          this.currentOrder.sum += price;
          return;
        }
      }
      var currentQuant = {
        name: quantity,
        sum: price,
        amount: 1
      }
      currentItem.quantities.push(currentQuant);
      currentItem.sum += price;
      this.currentOrder.sum += price;
      return;
    },

    cleanOrder: function() {
      Vue.set(this, "currentOrder", {});
      Vue.set(this.currentOrder, "sum", 0);
    },

    getPriceOfItem: function(item, quantity) {
      var price = 0;

      for(var food of this.currentConfig.food)
      {
        if(food.name == item)
        {
          for(var quant of food.quantities)
          {
            if(quant.quantity == quantity)
            {
              return quant.price;
            }
          }
        }
      }

      for(var drinks of this.currentConfig.drinks)
      {
        if(drinks.name == item)
        {
          for(var quant of drinks.quantities)
          {
            if(quant.quantity == quantity)
            {
              return quant.price;
            }
          }
        }
      }

      return 0;
    },

    init: function() {
      var elems = document.querySelectorAll('.collapsible');
      var options = {};
      var instances = M.Collapsible.init(elems, options);
    },

    getPicturePath: function(item) {
      for(var food of this.currentConfig.food)
      {
        if(item == food.name)
        {
          return food.picture;
        }
      }
      for(var drinks of this.currentConfig.drinks)
      {
        if(item == drinks.name)
        {
          return drinks.picture;
        }
      }
      return "./img/default.png";
    }

  },
  /**
   * created
   * @author Alexander Seiler
   * This is the vue.js created hook, used to initialize the serverConfigData and call fetchData() for the first time,
   * as well as adding a call for fetchData to 'this'.
   * It gets called before Vue initializes methods/computed/... For more information look up the vue.js-lifecycle
   */
  created: function() {
    logger.info("created()");
    
    this.fetchConfig();

    this.cleanOrder();

    EventBus.$on("addToOrder", this.addToOrder);
  },


  
  components: {
    itemCard
  }
};
</script>

<style scoped>
nav {
  height: 80px;
  line-height: 80px;
}

#menu-button {
  margin-right: 50px;
  margin-left: 0px;
}

#headline {
  padding-left: 50px;
  font-family: 'siemens';
  font-size: 32px;
}
</style>
