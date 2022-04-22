const menuList = [{
    icon: 'alt_route',
    label: 'Fahrplan',
    separator: true
}, {
    icon: 'map',
    label: 'Karten',
    separator: true
}, {
    icon: 'radar',
    label: 'Radar',
    separator: true
}, {
    icon: 'info',
    label: 'info',
    separator: true
}, ]

const app = Vue.createApp({
    data() {
        return {
            page: "",
            input: "",
            locations: [],
            start: {},
            end: {},
            detailDialog: false,
            stopInfo: {},
            mapsUrl: "",
            departures: [],
            drawer: false,
            menuList,
            journey: {},
            journeyDialog: false,
            activeTab: "Fahrplan",
            stopsNearMe: '',
            loadingScreen: false,
            simple: [],
            expanded: [],
            journeyDetails: false,
            favoritelocations: [],
        }
    },
    created() {
        this.$nextTick(function() {});
    },
    methods: {
        async getLocations() {
            if (this.input != "") {
                this.loadingScreen = true;
                var location = await axios.get(
                    "https://v5.bvg.transport.rest/locations?poi=false&addresses=false&query=" + encodeURI(this.input) + "&linesOfStops=true"
                );
                this.locations = location.data;
                this.loadingScreen = false;
                this.page = "searchResult";
            }
        },

        deleteStartEnd() {
            this.start = false;
            this.end = false;
            this.locations = []
        },

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

        async getJourney() {
            try {
                if (this.start && this.end) {
                    var getJourney = await axios.get(
                        "https://v5.bvg.transport.rest/journeys?from=" + this.start.id + "&to=" + this.end.id + "&results=4&stopovers=true"
                    );
                    this.journey = getJourney.data;
                    this.journey.journeys.forEach(journey => {
                        journey.departure = false;
                        journey.arrival = "";
                        journey.id = URL.createObjectURL(new Blob([])).substr(-36);
                        journey.legs.forEach(element => {
                            if (!journey.departure) {
                                journey.departure = new Date(element.departure);
                            }
                            journey.arrival = new Date(element.arrival);

                            element.arrivalDate = new Date(element.arrival);
                            element.departureDate = new Date(element.departure);
                            element.arrival = new Date(element.arrival).toLocaleTimeString('de-de');
                            element.departure = new Date(element.departure).toLocaleTimeString('de-de');
                            element.arrivalDelay = element.arrivalDelay / 60;
                            element.arrivalDelay = element.arrivalDelay / 60;
                            if (!element.line) {
                                element.line = {
                                    adminCode: "GEHEN",
                                    express: false,
                                    fahrtNr: "gehen",
                                    id: "gehen",
                                    metro: false,
                                    product: "Beine",
                                    name: "gehen",
                                    night: false,
                                    nr: 1,
                                }
                            }

                        });
                        var lastLeg = false;
                        journey.duration = (journey.arrival - journey.departure) / 1000 / 60;
                        journey.legs.forEach(element => {
                            if (!lastLeg) {
                                element.duration = (element.arrivalDate - element.departureDate) / 1000 / 60;
                            } else {
                                element.duration = (element.arrivalDate - lastLeg.arrivalDate) / 1000 / 60;
                            }
                            element.percent = "width: " + (element.duration * 100 / journey.duration).toString() + "%;";
                            lastLeg = element;
                        });
                    });
                    this.journeyDialog = true;
                } else {
                    triggerInvalidRequestAlert();
                }
            } catch (err) {
                this.triggerInvalidRequestAlert();
            }
        },

        triggerInvalidRequestAlert() {
            this.$q.notify({
                message: 'Die Anfrage ist ungüldtig.',
                icon: 'error',
                color: "negative",
            })
        },

        showjourneyDetails(journey) {
            this.journeyDetails = true;
            var children = []

            journey.legs.forEach(element => {
                var stops = []
                if (element.stopovers) {
                    element.stopovers.forEach(stop => {
                        const stopIsFirstStopInLeg = element.origin.name != stop.stop.name
                        if (stopIsFirstStopInLeg) {
                            stops.push(this.generateStopLabel(stop, stop.arrival));
                        } else {
                            stops.push(this.generateStopLabel(stop, stop.departure));
                        }
                    });
                } else {
                    stops.push({ label: "gehen Beine" })
                }
                children.push({
                    label: element.origin.name + " bis " + element.destination.name + "" +
                        " || " + element.line.name + " " + element.line.productName + " in Richtung " + element.direction +
                        " || " + element.departure + " - " + element.duration.toString() + "min - " + element.arrival + "",
                    icon: 'departure_board',
                    children: stops,
                });
            });

            this.simple = [{
                label: this.start.name + " bis " + this.end.name,
                children: children,
            }]

            this.expanded.push(this.simple[0].label, this.simple[0].children[0].label)
        },

        generateStopLabel(stop, departureOrArrivalDate) {
            return { label: stop.stop.name + "|| Ankunft um " + new Date(departureOrArrivalDate).toLocaleTimeString() + "" };
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

        reverStartEnd() {
            start = this.start;
            end = this.end;
            this.start = end;
            this.end = start;
        },

        changeTab(item) {
            this.activeTab = item;
            this.drawer = false;
            if (item == "Radar") {
                this.openNearByMe();
                this.loadingScreen = true;
            }
        },

        async openNearByMe() {
            var cords = await this.getLocation()
        },

        async getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(this.getNearByMe, this.onGeoError);
            } else {
                console.error("Please check your permissions");
            }
        },

        async getNearByMe(position) {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            var url = "https://v5.bvg.transport.rest/stops/nearby?latitude=" + latitude + "&longitude=" + longitude + "&linesOfStops=true"
            var getNearByMe = await axios.get(url);
            this.stopsNearMe = getNearByMe.data;
            this.loadingScreen = false;
        },

        onGeoError(position) {
            console.error("Error code " + position.code + ". " + position.message);
        },

        updateStart(variable) { this.start = variable },
        updateEnd(variable) { this.end = variable },
        updateFavoritelocations(variable) { this.Favoritelocations = variable },
    }
});
app.use(Quasar);
Quasar.lang.set(Quasar.lang.de);
app.component('Searchresult', searchresult);
app.component('Favoritelocations', favoritelocations)
const vm = app.mount('#q-app')