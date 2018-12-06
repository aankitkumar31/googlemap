var coordinateName;
var breakpointArr;
var map;
$(document).ready(function(){
    //getKmlData()
    getServices()    
    
    document.getElementById('fileUpload').addEventListener('change', handleFileSelect, false);

    $('#btnSubmit').on('click',function(){
        var formData = new FormData();
        formData.append('kml', $('#fileUpload')[0].files[0]);
        xhr('server/upload-kml.php', formData, function (response) {
            if(response != "error"){
                let postData = {
                    file_name : response,
                    service_id : $('#selServices').val(),
                    operation : 'saveKmlData'
                }
                $.ajax({
                    type: "POST",
                    url: "server/main.php",
                    data: postData,
                    cache: false,
                    success: function(data){
                        if(data == "saved"){
                            message('success-div');
                        }
                        else{
                            message('error-div');
                        }
                    }
                });
            }
        });
    })

    // $.ajax('doc/doc.kml').done(function(xml) {
        
    //     //console.log(toGeoJSON.kml(xml));
    //     let data = toGeoJSON.kml(xml);
    //     bindKmlMap(data)
    //     debugger;
    // });
})

function handleFileSelect(e) {
    debugger;
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.kml)$/;
        if (regex.test($("#fileUpload").val().toLowerCase())) {
            if (typeof (FileReader) != "undefined") {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var xmlDoc = $.parseXML(e.target.result);
                    var kmlData = toGeoJSON.kml(xmlDoc);
                    bindKmlMap(kmlData);
                    // var name = $(xmlDoc).find("Placemark name");
                    // name = name[0].textContent;

                    // var coordinates = $(xmlDoc).find("coordinates");
                    // coordinates = coordinates[0].textContent;
                    // coordinates = coordinates.split(',0 ');
                    // let newArr = [];
                    // $.each(coordinates,function(i,v){
                    //     if(v.trim() != ""){
                    //         newArr.push(v.trim());
                    //     }
                    // })

                    // let mapData = [];
                    // $.each(newArr,function(i,v){
                    //     let latlong = v.split(',');
                    //     let lat = latlong[0];
                    //     let lon = latlong[1];
                    //     let count = i+1
                    //     let obj = {
                    //         "lat": Number(lat),
                    //         "lon": Number(lon),
                    //         "title": name
                    //     }
                    //     mapData.push(obj);
                    // })
                    // bindMapCoordinates(mapData);
                    // debugger;
                    // //saveCoordinates(name,coordinates)
                    // coordinateName = name;
                    // breakpointArr = newArr;
                    //showTable(name,newArr)
                }
                reader.readAsText($("#fileUpload")[0].files[0]);
            } else {
                alert("This browser does not support HTML5.");
            }
        } else {
            alert("Please upload a valid XML file.");
        }
}

function getServices(){
    let postData = {
        operation : 'getCustomerId'
    }
    $.ajax({
        type: "POST",
        url: "server/main.php",
        data: postData,
        cache: false,
        success: function(data){
            var parseData = JSON.parse(data);
            let filteredServices = removeDuplicateServices(parseData);
            bindServices(filteredServices);
        }
    });    
}

function removeDuplicateServices(data){
    var arr = [];
    $.each(data,function(i,v){
        if(i == 0){
            if(v.service_id != null){
                arr.push(v);
            }            
        }
        var filterdata = arr.filter(function(val,ind){
            if(val.service_id == v.service_id){
                return true;
            }
        })
        if(filterdata.length == 0){
            if(v.service_id != null){
                arr.push(v);
            }            
        }
    })
    return arr;
}

function bindServices(parseData){
    let html = '';
    $.each(parseData,function(i,v){
        html += '<option value="'+v.service_id+'">'+v.service_name+' ('+v.service_id+')</option>';
    })
    $('#selServices').html(html);
    // $('#selServices').multiselect('destroy');
    // $('#selServices').multiselect({
    //     enableClickableOptGroups: true,     
    //     includeSelectAllOption: true,  
    //     onChange: function (option, checked) {
    //         $('#selServicesError').text('');
    //     }
    // });
}

function saveCoordinates(name,coordinates){
    let postData = {
        operation : 'saveCoordinates',
        name : name,
        breakpointArr : coordinates,
    }
    $.ajax({
        type: "POST",
        url: "server/main.php",
        data: postData,
        cache: false,
        success: function(data){
            debugger;
        }
    });
}

function showTable(name,newArr){
    var html = '';
    $.each(newArr,function(i,v){
        let count = i+1;
        html += '<tr>'+
                    '<td>'+count+'</td>'+
                    '<td>'+name+'</td>'+
                    '<td>'+v+'</td>'+
                '</tr>';
    })
    $('#myTable tbody').html(html)
}

function bindMapCoordinates1(mapData){    
    if (mapData.length > 0) {
        var len = mapData.length;
        var midlen = parseInt(len / 2);
        var avgLat = mapData[midlen]['lat'];
        var avgLong = mapData[midlen]['lon'];
        len = parseInt(len / 2);
        if (len > 0) {
            var zoomLat = avgLat;
            var zoomLong = avgLong;
        }
        else {
            var zoomLat = 0;
            var zoomLong = 0;
        }


        myCenter = new google.maps.LatLng(avgLat, avgLong);
        var mapOptions = {
            center: myCenter,
            zoom: 14, scrollwheel: true, draggable: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
        };
        var map = new google.maps.Map(document.getElementById("map_div"), mapOptions);
        
        var icon = {
            scaledSize: new google.maps.Size(7, 7), // scaled size
            origin: new google.maps.Point(0, 0), // origin
            anchor: new google.maps.Point(0, 0), // anchor
            labelOrigin: new google.maps.Point(0, 15)
        };  

        var routeicon = {
            url: "img/route.gif", // url
            scaledSize: new google.maps.Size(5, 5), // scaled size
            origin: new google.maps.Point(0, 0), // origin
            anchor: new google.maps.Point(0, 0) // anchor
        };     
        
        infowindow = new google.maps.InfoWindow();
        for (var i = 0; i < mapData.length; i++) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(mapData[i]['lat'], mapData[i]['lon']),
                icon: routeicon,
                map: map,
                content: mapData[i]['title'],
            });     
            google.maps.event.addListener(marker, 'mouseover', (function (marker) {
                return function (title) {
                    var content = '<b>'+marker.content+'</b>';
                    infowindow.setContent(content);
                    infowindow.open(map, marker);
                }
            })(marker));      
        }
    }
}

function bindMapCoordinates(mapData){
    window.map = new google.maps.Map(document.getElementById('map_div'), {
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel: false
    });

    var infowindow = new google.maps.InfoWindow();
    var flightPlanCoordinates = [];
    var bounds = new google.maps.LatLngBounds();

    var routeicon = {
        url: "img/route.gif", // url
        scaledSize: new google.maps.Size(0, 0), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
    };  

    for (i = 0; i < mapData.length; i++) {
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(mapData[i].lat, mapData[i].lon),
            map: map,
            icon: routeicon,
        });
        flightPlanCoordinates.push(marker.getPosition());
        bounds.extend(marker.position);

        google.maps.event.addListener(marker, 'click', (function (marker, i) {
            return function () {
                infowindow.setContent(mapData[i]['title']);
                infowindow.open(map, marker);
            }
        })(marker, i));
    }

    map.fitBounds(bounds);

    var flightPath = new google.maps.Polyline({
        map: map,
        path: flightPlanCoordinates,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
}

function bindKmlMap(data){
    data = data.features;
    var mapOptions;
    var myCenter;
    var infowindow = new google.maps.InfoWindow();
    //var avgLat = data[1].geometry.coordinates[1];
        // var avgLong = data[1].geometry.coordinates[0];
        // myCenter = new google.maps.LatLng(avgLat, avgLong);
        mapOptions = {
            
            zoom: 10, scrollwheel: true, draggable: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
        };
        map = new google.maps.Map(document.getElementById("map_div"), mapOptions);
    // if(data[1].geometry.type == "Point"){
    //     var avgLat = 11;
    //     var avgLong =76;
    //     myCenter = new google.maps.LatLng(avgLat, avgLong);
    //     mapOptions = {
    //         center: myCenter,
    //         zoom: 10, scrollwheel: true, draggable: true,
    //         mapTypeId: google.maps.MapTypeId.ROADMAP,
    //     };
    //     map = new google.maps.Map(document.getElementById("map_div"), mapOptions);
    // }      
        
    
    
    $.each(data,function(i,v){
        let feature = v;
        if(v.geometry.type == "Point"){
            var icon = {
                url : v.properties.icon,
                scaledSize: new google.maps.Size(7, 7), // scaled size
                origin: new google.maps.Point(0, 0), // origin
                anchor: new google.maps.Point(0, 0), // anchor
                labelOrigin: new google.maps.Point(0, 15)
            };

            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(v.geometry.coordinates[1], v.geometry.coordinates[0]),
                // icon: icon,
                map: map,
                content: v.properties.name,
            });     
            google.maps.event.addListener(marker, 'mouseover', (function (marker) {
                return function (title) {
                    var content = '<b>'+marker.content+'</b>';
                    infowindow.setContent(content);
                    infowindow.open(map, marker);
                }
            })(marker));   
        }
        else{
            var flightPlanCoordinates = [];
            var bounds = new google.maps.LatLngBounds();

            var routeicon = {
                url: "img/route.gif", // url
                scaledSize: new google.maps.Size(0, 0), // scaled size
                origin: new google.maps.Point(0, 0), // origin
                anchor: new google.maps.Point(0, 0) // anchor
            };  

            for (i = 0; i < v.geometry.coordinates.length; i++) {
                var latlon = v.geometry.coordinates[i];
                var lat = latlon[1];
                var lon = latlon[0];
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(lat,lon),
                    map: map,
                    icon: routeicon,
                });
                flightPlanCoordinates.push(marker.getPosition());
                bounds.extend(marker.position);

                google.maps.event.addListener(marker, 'click', (function (marker, i) {
                    return function () {
                        infowindow.setContent(v.properties.name);
                        infowindow.open(map, marker);
                    }
                })(marker, i));
            }

            map.fitBounds(bounds);

            var flightPath = new google.maps.Polyline({
                map: map,
                path: flightPlanCoordinates,
                strokeColor: "#FF0000",
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
        }

    })
}

function xhr(url, data, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            callback(request.responseText);
        }
    };
    request.open('POST', url);
    request.send(data);
}

function message(div){
    $('.'+div).fadeIn('slow');
    setTimeout(()=>{
        $('.'+div).fadeOut('slow');
    },5000)
}