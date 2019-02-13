Vue.component('aqiComponent', {
  template: '#aqiComponent',
  props: {
    propsData: {},
    isstar: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    addStar: function () {
      this.$emit('on-add-star')
    },
    removeStar: function () {
      this.$emit('on-remove-star')
    }
  },
  computed: {
    status: function () {
      if (this.propsData.AQI <= 50) {
        return 'status-aqi1'
      } else if (this.propsData.AQI <= 100) {
        return 'status-aqi2'
      } else if (this.propsData.AQI <= 150) {
        return 'status-aqi3'
      } else if (this.propsData.AQI <= 200) {
        return 'status-aqi4'
      } else if (this.propsData.AQI <= 300) {
        return 'status-aqi5'
      } else {
        return 'status-aqi6'
      }
    }
  },
})
new Vue({
  el: '#app',
  data: {
    aqiData: [],
    cityData: [],
    filter: ''
  },
  methods: {
    getData: function () {
      const _url = 'http://opendata.epa.gov.tw/webapi/Data/REWIQA/?$orderby=SiteName&$skip=0&$top=1000&format=json'
      const corsUrl = 'https://cors-anywhere.herokuapp.com/'
      window.fetch(corsUrl + _url, { method: 'get' })
        .then(response => {
          return response.json()
        })
        .then(item => {
          this.aqiData = item
          this.filterData(item)
        })
        .catch(error => {
          console.log(error)
        })
    },
    filterData: function (b) {
      const vm = this
      let city = []
      b.forEach(item => {
        city.push(item.County)
      })
      console.log(city)
      city.forEach(item => {
        if (vm.cityData.indexOf(item) === -1) {
          vm.cityData.push(item)
        }
      })
    },
    addStarLocal: function (item) {
      console.log(item)
    },
    removeStarLocal: function (item) {

    }
  },
  created() {
    this.getData()
  }
})

window.onload = function () {
  $('#loading').fadeOut(1500)
}