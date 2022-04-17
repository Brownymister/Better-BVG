const searchresult = Vue.defineComponent({
    name: 'Searchresult',
    props: {
        locations: [],
        start: {},
        end: {},
        loadingScreen: false,
        favoriteLocations: [],
    },
    updated() {
        this.$nextTick(function() {})
    },
    async created() {
        this.$nextTick(function() {})
    },
    data() {
        return {}
    },
    methods: {
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
            await this.getDepartures(id);
            console.log(this.stopInfo);
        },

        async getDepartures(id) {
            var getDepartures = await axios.get(
                "https://v5.bvg.transport.rest/stops/" + id + "/departures?duration=10"
            );
            this.departures = getDepartures.data;
            this.departures.forEach(element => {
                element.plannedWhen = new Date(element.when).toLocaleTimeString('de-de');
                if (element.delay > -1) {
                    element.delay = "+ " + (element.delay / 60).toString();
                } else {
                    element.delay = (element.delay / 60).toString();
                }
            });
            console.log(this.departures);
        },

        saveInLocalstorage(location) {
            var favoriteLocations = JSON.parse(window.localStorage.getItem("favoriteLocations"));
            this.favoriteLocations = favoriteLocations;
            favoriteLocations.push(location);
            localStorage.setItem("favoriteLocations", JSON.stringify(favoriteLocations));
            this.$q.notify({
                message: 'Die Station ' + location.name + ' wurde zu deinen Favoriten hinzugefügt',
                icon: 'favorite',
                color: "positive",
            })
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
    },
    template: `
    <div>
        <q-card v-if="locations != []" v-for="element in locations" style="margin-top: 2%;" :key="element.id" class="my-card">
            <q-card-section>
                <div class="row">
                    <div class="text-h6">{{element.name}}</div>
                    <q-btn flat="" round="" @click="saveInLocalstorage(element)" color="red" icon="bookmark"></q-btn>
                </div>
                <div class="row">
                    <div v-for="line in element.lines" class="text-subtitle1">{{line.name}} {{ line.product }} ||&nbsp;</div>
                </div>
            </q-card-section>

            <q-separator></q-separator>

            <q-card-actions vertical="">
                <q-btn outline="" color="primary" @click="showDetail(element.id)">Details</q-btn>
                <q-btn outline="" color="primary" @click="setAsStart(element)">Als Start setzten</q-btn>
                <q-btn outline="" color="primary" @click="setAsEnd(element)">Als Ende setzten</q-btn>
            </q-card-actions>
        </q-card>
    </div>
    `
});