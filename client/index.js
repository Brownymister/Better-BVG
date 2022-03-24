const app = Vue.createApp({
    data() {
        return {
            input: "",
            locations: [],
            start: {},
            end: {},
            detailDialog: false,
            stopInfo: {},
            mapsUrl: "",
            departures: [],
        }
    },
    methods: {
        async getLocations() {
            var location = await axios.get(
                "https://v5.bvg.transport.rest/locations?poi=false&addresses=false&query=" + encodeURI(this.input) + "&linesOfStops=true"
            );
            this.locations = location.data;
            console.log(this.locations);
        },

        async showDetail(id) {
            this.detailDialog = true;
            var stopInfo = await axios.get(
                "https://v5.bvg.transport.rest/stops/" + encodeURI(id) + "?linesOfStops=true"
            );
            this.stopInfo = stopInfo.data;
            this.mapsUrl = "https://maps.google.com/maps?width=400%&height=400&hl=de&q=" +
                this.stopInfo.location.latitude + "," + this.stopInfo.location.longitude + "&t=&z=14&ie=UTF8&iwloc=B&output=embed";
            let keys = Object.keys(this.stopInfo.products).filter(k => this.stopInfo.products[k] == true);
            var offers = keys.toString().replace("subway", "U Bahn").replace("suburban", "S Bahn");
            await this.getDepartures(id)
            console.log(this.stopInfo);
        },

        async getDepartures(id) {
            var getDepartures = await axios.get(
                "https://v5.bvg.transport.rest/stops/" + id + "/departures?duration=10"
            );
            this.departures = getDepartures.data;
            this.departures.forEach(element => {
                element.when = new Date(element.when).toLocaleDateString('de-de') + " " + new Date(element.when).toLocaleTimeString('de-de');
            });
            console.log(this.departures);
        },

        async getJourney(id) {

        },

        setAsStart(station) {
            if (this.end != station) {
                this.start = station;
            }
        },

        setAsEnd(station) {
            if (this.start != station) {
                this.end = station;
            }
        },
    }
})
app.use(Quasar);
Quasar.lang.set(Quasar.lang.de);
const vm = app.mount('#q-app')