# Better-BVG

A BVG(Berliner Verkehrsbetriebe) app which uses capacitor. It shows information about Bus-, S- and U-Bahn stops. The app also shows routes with a given start and end point.

API-Doku: [https://v5.bvg.transport.rest/api.html#get-stopsid](https://v5.bvg.transport.rest/api.html#get-stopsid)

# install
1. Initiate capacitor project
```
npm install @capacitor/cli @capacitor/core
npx cap init
```
2. Add ios
```
npm install @capacitor/ios
npx cap add ios
```
3. Open the Project in X-Code
```
npx cap open ios
```