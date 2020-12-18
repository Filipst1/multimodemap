/*global rawData */
let Mapinator = function(parentDom) {

      let data;

      var lg_units;
      var Alllg_units = [];

      let map = document.createElement('div');
      map.id = 'Map';
      let infoRow = document.createElement('div');
      infoRow.className = 'row';
      let cols = [document.createElement('div'), document.createElement('div'), document.createElement('div')];
      for (let i in cols) {
            cols[i].className = 'column';
            cols[i].style.backgroundColor = 'rgb(' + (180 + 20 * i) + ', ' + (180 + 20 * i) + ', ' + (180 + 20 * i) + ')';
            infoRow.appendChild(cols[i]);
      }
      let technologies = ['GPS', 'Lora', 'WiFi'];
      for (let i in technologies) {
            let input = document.createElement('input');
            input.id = 'technologie_' + i;
            input.type = 'checkbox';
            input.onclick = decideWhatToPlot;
            let label = document.createElement('label');
            label.innerHTML = technologies[i];

            label.setAttribute('for', 'technologie_' + i);
            cols[0].appendChild(input);
            cols[0].appendChild(label);
            cols[0].appendChild(document.createElement('br'));
      }
      parentDom.appendChild(map);
      parentDom.appendChild(infoRow);

      // Init Map
      const mymap = L.map('Map').setView([47, 8], 8);
      const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
      const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      const tiles = L.tileLayer(tileUrl, { attribution });
      tiles.addTo(mymap);


      this.update = function(inputData) {
            // Lora, GPS, WiFi
            data = jsonToDataObjects(inputData);
            // console.log(data);
            createDeviceList();
      };
      //this.update();


      function stringCsvToObject(str, delimiter = ",") {
            const titles = str.slice(0, str.indexOf("\n")).split(delimiter);
            const rows = str.slice(str.indexOf("\n") + 1).split("\n");
            return rows.map((row) => {
                  const values = row.split(delimiter);
                  return titles.reduce(
                        (object, curr, i) => ((object[curr] = values[i]), object), {});
            });
      }


      let createDeviceList = function() {
            function createDeviceIdCheckboxes(tempDeviceId) {
                  let checkbox = document.createElement('input');
                  checkbox.type = 'checkbox';
                  checkbox.id = tempDeviceId;
                  let label = document.createElement('label');
                  label.htmlFor = tempDeviceId;
                  label.appendChild(document.createTextNode(tempDeviceId));
                  let br = document.createElement('br');
                  cols[1].appendChild(checkbox);
                  cols[1].appendChild(label);
                  cols[1].appendChild(br);
            }
            cols[1].innerHTML = '';
            //um die einzelnen devices herauszukriegen
            let counts = {};
            console.log(data);
            for (let i = 0; i < data[0].length; i++) {
                  counts[data[0][i].DeviceId] = 1 + (counts[data[0][i].DeviceId] || 0);
            }
            for (let i = 0; i < Object.keys(counts).length; i++) {
                  // muss man noch value mitgeben
                  createDeviceIdCheckboxes(Object.keys(counts)[i]);
            }
      };
      //   createDeviceList();

      function plotData(dataGeneric, colorCircle, TechIndex) {
            console.log(dataGeneric);

            //um die einzelnen devices herauszukriegen
            var counts = {};
            for (var i = 0; i < dataGeneric.length; i++) {
                  counts[dataGeneric[i].DeviceId] =
                        1 + (counts[dataGeneric[i].DeviceId] || 0);
            }
            console.log(counts);
            console.log(Object.keys(counts));
            console.log(Object.keys(counts).length);
            console.log(counts[Object.keys(counts)[0]]);

            var NrOfDevices = Object.keys(counts).length;
            var JustGpsArrayByDevice = new Array(NrOfDevices);
            for (var j = 0; j < NrOfDevices; j++) {
                  var JustGps = new Array(counts[Object.keys(counts)[j]]);
                  var counter = 0;
                  for (var i = 0; i < dataGeneric.length; i++) {
                        if (dataGeneric[i].DeviceId == Object.keys(counts)[j]) {
                              let temp = new Array(2);
                              temp[0] = dataGeneric[i].Lat;
                              temp[1] = dataGeneric[i].Long;
                              JustGps[counter] = temp;
                              counter = counter + 1;
                        }
                  }
                  JustGpsArrayByDevice[j] = JustGps;
            }

            console.log(JustGpsArrayByDevice);
            console.log(JustGpsArrayByDevice[0]);

            // var polyline = L.polyline(JustGpsArrayByDevice[2], {
            //   color: "blue",
            // }).addTo(mymap);

            // var polyline = L.polyline(JustGpsArrayByDevice[1], {
            //   color: "blue",
            // }).addTo(mymap);

            var polyline = L.polyline(JustGpsArrayByDevice[0], {
                  color: "blue",
            }).addTo(mymap);
            var markers = new Array();
            var circles = new Array();

            // for (var i= 0;i<5;i++){
            //   markers[i] = L.marker([0, 0]).addTo(mymap);
            // mymap.setView([42, 5], mymap.getZoom());
            // markers[i].setLatLng([dataGeneric[i].Lat, dataGeneric[i].Long]);
            // }

            //mymap.setView([47, 8], mymap.getZoom());
            //circles array momentan noch nicht in gebrauch

            for (var i = 0; i < dataGeneric.length; i++) {
                  circles[i] = L.circle([dataGeneric[i].Lat, dataGeneric[i].Long], {
                        color: colorCircle,
                        fillColor: colorCircle,
                        fillOpacity: 0.005,
                        radius: dataGeneric[i].Radius,
                  });
                  lg_units = L.layerGroup(circles);
                  Alllg_units[TechIndex] = lg_units;
                  Alllg_units[TechIndex].addTo(mymap);
            }
            //console.log(circles);
      }

      function decideWhatToPlot() {
            try {
                  mymap.removeLayer(Alllg_units[1]);
            }
            catch (err) {
                  console.log("failGps");
            }
            finally {
                  try {
                        mymap.removeLayer(Alllg_units[2]);
                  }
                  catch (err) {
                        console.log("failLora");
                  }
                  finally {
                        try {
                              mymap.removeLayer(Alllg_units[3]);
                        }
                        catch (err) {
                              console.log("failWifi");
                        }
                        finally {
                              if (document.getElementById("technologie_0").checked == true) {
                                    plotData(data[1], "purple", 1);
                              }
                              if (document.getElementById("technologie_1").checked == true) {
                                    plotData(data[0], "red", 2);
                              }
                              if (document.getElementById("technologie_2").checked == true) {
                                    plotData(data[2], "yellow", 3);

                              }
                              // nicht plot Data aufrufen sondern filter data by deviceId und dann in
                              // in dieser Funktion dann plot data aufrufen
                        }


                  }
            }


      }


      function jsonToDataObjects(JsonResponse) {
            var StringText = "Lat,Long,time,Radius,DeviceId";
            // var dataJson = JSON.parse(JsonResponse);
            var dataJson = JsonResponse;

            //Da die Postion wo Lat Long im Json sind etc nicht statisch ist, muss sie dynamisch bestimmt werden
            function getPositionOfDatapoint(nameDatapoint) {
                  var position;
                  for (
                        var i = 0; i < dataJson.results[0].series[0].columns.length; i++
                  ) {
                        if (dataJson.results[0].series[0].columns[i] == nameDatapoint) {
                              position = i;
                        }
                  }
                  return position;
            }

            for (var i = 0; i < dataJson.results[0].series[0].values.length; i++) {
                  if (
                        null !=
                        dataJson.results[0].series[0].values[i][
                              getPositionOfDatapoint(
                                    "value.data.normalizedPayload.lorawanLatitude"
                              )
                        ]
                  ) {
                        StringText =
                              StringText +
                              "\n" +
                              dataJson.results[0].series[0].values[i][
                                    getPositionOfDatapoint(
                                          "value.data.normalizedPayload.lorawanLatitude"
                                    )
                              ] +
                              ",";
                        StringText =
                              StringText +
                              dataJson.results[0].series[0].values[i][
                                    getPositionOfDatapoint(
                                          "value.data.normalizedPayload.lorawanLongitude"
                                    )
                              ] +
                              ",";
                        StringText =
                              StringText +
                              dataJson.results[0].series[0].values[i][
                                    getPositionOfDatapoint("time")
                              ] +
                              ",";
                        StringText =
                              StringText +
                              dataJson.results[0].series[0].values[i][
                                    getPositionOfDatapoint(
                                          "value.data.normalizedPayload.lorawanHorizontalTolerance"
                                    )
                              ] +
                              ",";
                        StringText =
                              StringText +
                              dataJson.results[0].series[0].values[i][
                                    getPositionOfDatapoint("value.device.deviceId")
                              ];
                  }
            }

            var StringTextGps = "Lat,Long,time,Radius,DeviceId";

            for (var i = 0; i < dataJson.results[0].series[0].values.length; i++) {
                  if (
                        null !=
                        dataJson.results[0].series[0].values[i][
                              getPositionOfDatapoint("value.data.normalizedPayload.gpsLatitude")
                        ]
                  ) {
                        StringTextGps =
                              StringTextGps +
                              "\n" +
                              dataJson.results[0].series[0].values[i][
                                    getPositionOfDatapoint(
                                          "value.data.normalizedPayload.gpsLatitude"
                                    )
                              ] +
                              ",";
                        StringTextGps =
                              StringTextGps +
                              dataJson.results[0].series[0].values[i][
                                    getPositionOfDatapoint(
                                          "value.data.normalizedPayload.gpsLongitude"
                                    )
                              ] +
                              ",";
                        StringTextGps =
                              StringTextGps +
                              dataJson.results[0].series[0].values[i][
                                    getPositionOfDatapoint("time")
                              ] +
                              ",";
                        StringTextGps =
                              StringTextGps +
                              dataJson.results[0].series[0].values[i][
                                    getPositionOfDatapoint(
                                          "value.data.normalizedPayload.gpsExpectedHorizontalPositionError"
                                    )
                              ] +
                              ",";
                        StringTextGps =
                              StringTextGps +
                              dataJson.results[0].series[0].values[i][
                                    getPositionOfDatapoint("value.device.deviceId")
                              ];
                  }
            }

            var StringTextWifi = "Lat,Long,time,Radius,DeviceId";

            for (var i = 0; i < dataJson.results[0].series[0].values.length; i++) {
                  if (null !=
                        dataJson.results[0].series[0].values[i][getPositionOfDatapoint("value.data.normalizedPayload.wifiLatitude")]) {
                        StringTextWifi = StringTextWifi + "\n" + dataJson.results[0].series[0].values[i][
                              getPositionOfDatapoint("value.data.normalizedPayload.wifiLatitude")
                        ] + ",";
                        StringTextWifi =
                              StringTextWifi +
                              dataJson.results[0].series[0].values[i][
                                    getPositionOfDatapoint(
                                          "value.data.normalizedPayload.wifiLongitude"
                                    )
                              ] +
                              ",";
                        StringTextWifi =
                              StringTextWifi +
                              dataJson.results[0].series[0].values[i][
                                    getPositionOfDatapoint("time")
                              ] +
                              ",";
                        StringTextWifi =
                              StringTextWifi +
                              dataJson.results[0].series[0].values[i][
                                    getPositionOfDatapoint(
                                          "value.data.normalizedPayload.wifiGeolocationAccuracy"
                                    )
                              ] +
                              ",";
                        StringTextWifi =
                              StringTextWifi +
                              dataJson.results[0].series[0].values[i][
                                    getPositionOfDatapoint("value.device.deviceId")
                              ];
                  }
            }
            //stringText ist von Lora
            // console.log(StringText);
            // console.log(StringTextGps);
            // console.log(StringTextWifi);

            return [stringCsvToObject(StringText, ","), stringCsvToObject(StringTextGps, ","), stringCsvToObject(StringTextWifi, ",")];


      }


};

let m = new Mapinator(document.getElementById('container'));
m.update((rawData));
