const searchresult = Vue.defineComponent({
    name: 'Searchresult',
    props: {
        locations: [],
        start: {},
        end: {},
        loadingScreen: false,
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
            vm.detailDialog = true;
            var stopInfo = await axios.get(
                "https://v5.bvg.transport.rest/stops/" + encodeURI(id) + "?linesOfStops=true"
            );
            vm.stopInfo = stopInfo.data;
            vm.mapsUrl = "https://maps.google.com/maps?width=400%&height=400&hl=de&q=" +
                vm.stopInfo.location.latitude + "," + vm.stopInfo.location.longitude + "&t=&z=14&ie=UTF8&iwloc=B&output=embed";
            let keys = Object.keys(vm.stopInfo.products).filter(k => vm.stopInfo.products[k] == true);
            var offers = keys.toString().replace("subway", "U Bahn").replace("suburban", "S Bahn");
            await this.getDepartures(id);
        },

        async getDepartures(id) {
            var getDepartures = await axios.get(
                "https://v5.bvg.transport.rest/stops/" + id + "/departures?duration=10"
            );
            vm.departures = getDepartures.data;
            vm.departures.forEach(element => {
                element.plannedWhen = new Date(element.when).toLocaleTimeString('de-de');
                if (element.delay > -1) {
                    element.delay = "+ " + (element.delay / 60).toString();
                } else {
                    element.delay = (element.delay / 60).toString();
                }
            });
        },

        saveInLocalstorage(location) {
            vm.favoriteLocations = JSON.parse(window.localStorage.getItem("favoriteLocations"));
            vm.favoriteLocations.push(location);
            localStorage.setItem("favoriteLocations", JSON.stringify(vm.favoriteLocations));
            this.$q.notify({
                message: 'Die Station ' + location.name + ' wurde zu deinen Favoriten hinzugefügt',
                icon: 'favorite',
                color: "positive",
            })
        },

        setAsStart(station) {
            if (this.end != station) {
                this.start = station;
                this.$emit('updatestart', this.start)
            }
        },

        setAsEnd(station) {
            if (this.start != station) {
                this.end = station;
                this.$emit('updateend', this.end)
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