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
}, ]

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
            drawer: false,
            menuList,
            journey: {},
            journeyDialog: false,
            activeTab: "Fahrplan",
            stopsNearMe: '',
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
            await this.getDepartures(id);
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
            var getJourney = await axios.get(
                "https://v5.bvg.transport.rest/journeys?from=" + this.start.id + "&to=" + this.end.id + "&results=4&stopovers=true"
            );
            this.journey = getJourney.data;
            console.log(this.journey);
            this.journeyDialog = true;
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

        convertSring(str) {
            var text = str;
            var chars = ["©", "Û", "®", "ž", "Ü", "Ÿ", "Ý", "$", "Þ", "%", "¡", "ß", "¢", "à", "£", "á", "À", "¤", "â", "Á", "¥", "ã", "Â", "¦", "ä", "Ã", "§", "å", "Ä", "¨", "æ", "Å", "©", "ç", "Æ", "ª", "è", "Ç", "«", "é", "È", "¬", "ê", "É", "­", "ë", "Ê", "®", "ì", "Ë", "¯", "í", "Ì", "°", "î", "Í", "±", "ï", "Î", "²", "ð", "Ï", "³", "ñ", "Ð", "´", "ò", "Ñ", "µ", "ó", "Õ", "¶", "ô", "Ö", "·", "õ", "Ø", "¸", "ö", "Ù", "¹", "÷", "Ú", "º", "ø", "Û", "»", "ù", "Ü", "@", "¼", "ú", "Ý", "½", "û", "Þ", "€", "¾", "ü", "ß", "¿", "ý", "à", "‚", "À", "þ", "á", "ƒ", "Á", "ÿ", "å", "„", "Â", "æ", "…", "Ã", "ç", "†", "Ä", "è", "‡", "Å", "é", "ˆ", "Æ", "ê", "‰", "Ç", "ë", "Š", "È", "ì", "‹", "É", "í", "Œ", "Ê", "î", "Ë", "ï", "Ž", "Ì", "ð", "Í", "ñ", "Î", "ò", "‘", "Ï", "ó", "’", "Ð", "ô", "“", "Ñ", "õ", "”", "Ò", "ö", "•", "Ó", "ø", "–", "Ô", "ù", "—", "Õ", "ú", "˜", "Ö", "û", "™", "×", "ý", "š", "Ø", "þ", "›", "Ù", "ÿ", "œ", "Ú"];
            var codes = ["&copy;", "&#219;", "&reg;", "&#158;", "&#220;", "&#159;", "&#221;", "&#36;", "&#222;", "&#37;", "&#161;", "&#223;", "&#162;", "&#224;", "&#163;", "&#225;", "&Agrave;", "&#164;", "&#226;", "&Aacute;", "&#165;", "&#227;", "&Acirc;", "&#166;", "&#228;", "&Atilde;", "&#167;", "&#229;", "&Auml;", "&#168;", "&#230;", "&Aring;", "&#169;", "&#231;", "&AElig;", "&#170;", "&#232;", "&Ccedil;", "&#171;", "&#233;", "&Egrave;", "&#172;", "&#234;", "&Eacute;", "&#173;", "&#235;", "&Ecirc;", "&#174;", "&#236;", "&Euml;", "&#175;", "&#237;", "&Igrave;", "&#176;", "&#238;", "&Iacute;", "&#177;", "&#239;", "&Icirc;", "&#178;", "&#240;", "&Iuml;", "&#179;", "&#241;", "&ETH;", "&#180;", "&#242;", "&Ntilde;", "&#181;", "&#243;", "&Otilde;", "&#182;", "&#244;", "&Ouml;", "&#183;", "&#245;", "&Oslash;", "&#184;", "&#246;", "&Ugrave;", "&#185;", "&#247;", "&Uacute;", "&#186;", "&#248;", "&Ucirc;", "&#187;", "&#249;", "&Uuml;", "&#64;", "&#188;", "&#250;", "&Yacute;", "&#189;", "&#251;", "&THORN;", "&#128;", "&#190;", "&#252", "&szlig;", "&#191;", "&#253;", "&agrave;", "&#130;", "&#192;", "&#254;", "&aacute;", "&#131;", "&#193;", "&#255;", "&aring;", "&#132;", "&#194;", "&aelig;", "&#133;", "&#195;", "&ccedil;", "&#134;", "&#196;", "&egrave;", "&#135;", "&#197;", "&eacute;", "&#136;", "&#198;", "&ecirc;", "&#137;", "&#199;", "&euml;", "&#138;", "&#200;", "&igrave;", "&#139;", "&#201;", "&iacute;", "&#140;", "&#202;", "&icirc;", "&#203;", "&iuml;", "&#142;", "&#204;", "&eth;", "&#205;", "&ntilde;", "&#206;", "&ograve;", "&#145;", "&#207;", "&oacute;", "&#146;", "&#208;", "&ocirc;", "&#147;", "&#209;", "&otilde;", "&#148;", "&#210;", "&ouml;", "&#149;", "&#211;", "&oslash;", "&#150;", "&#212;", "&ugrave;", "&#151;", "&#213;", "&uacute;", "&#152;", "&#214;", "&ucirc;", "&#153;", "&#215;", "&yacute;", "&#154;", "&#216;", "&thorn;", "&#155;", "&#217;", "&yuml;", "&#156;", "&#218;"];

            for (x = 0; x < chars.length; x++) {
                text = text.replaceAll(chars[x], codes[x]);
            }

            return text;
        },

        changeTab(item) {
            this.activeTab = item;
            if (item == "Radar") {
                this.openNearByMe();
            }
        },

        async openNearByMe() {
            var cords = await this.getLocation()
        },

        async getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(this.getNearByMe, this.onGeoError);
            } else {
                alert("Please check your permissions");
            }
        },

        async getNearByMe(position) {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            var getNearByMe = await axios.get("https://v5.bvg.transport.rest/stops/nearby?latitude=" + latitude + "&longitude=" + longitude + "&linesOfStops=true")
            this.stopsNearMe = getNearByMe.data;
            console.log(this.stopsNearMe);
        },

        onGeoError(position) {
            console.error("Error code " + position.code + ". " + position.message);
        },
    }
})
app.use(Quasar);
Quasar.lang.set(Quasar.lang.de);
const vm = app.mount('#q-app')