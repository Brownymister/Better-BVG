const favoritelocations = Vue.defineComponent({
    name: 'Favoritelocations',
    props: {
        start: {},
        end: {},
    },
    updated() {
        this.$nextTick(function() {})
    },
    async created() {
        if (!window.localStorage.getItem("favoriteLocations")) {
            window.localStorage.setItem("favoriteLocations", JSON.stringify([]))
        }
        this.favoriteLocations = JSON.parse(localStorage.getItem("favoriteLocations"));

        this.$nextTick(function() {
            console.log(this.favoriteLocations);
        })
    },
    data() {
        return {
            favoriteLocations: [],
        }
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

        removeFormLocalstorage(location) {
            this.favoriteLocations = JSON.parse(window.localStorage.getItem("favoriteLocations"));
            const indexOfObject = this.favoriteLocations.findIndex(object => {
                return object.id === location.id;
            });
            this.favoriteLocations.splice(indexOfObject, 1);
            console.log(this.favoriteLocations);
            localStorage.setItem("favoriteLocations", JSON.stringify(this.favoriteLocations));
            this.$q.notify({
                message: 'Die Station ' + location.name + ' wurde aus deinen Favorieten entfernt!',
                icon: 'delete',
                color: "green",
            })
        },
    },
    template: `
    <div v-if="favoriteLocations != []">
        <h4>Favoriten:</h4>
        <q-separator style="margin-bottom: 1%;"></q-separator>
        <q-card v-for="element in favoriteLocations" style="margin-top: 2%;" :key="element.id" class="my-card">
            <q-card-section>
                <div class="row">
                    <div class="text-h6">{{element.name}}</div>
                    <q-btn flat="" round="" @click="removeFormLocalstorage(element)" color="red" icon="delete"></q-btn>
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