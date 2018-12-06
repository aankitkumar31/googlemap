var coordinateName;
var breakpointArr;
var map;
$(document).ready(function(){
    getServices()    
    $('.noData').hide();
    $('#btnSubmit').on('click',function(){
        debugger;
        let postData = {
            operation : 'getKmlFile',
            service_id : $('#selServices').val(),
        }
        $.ajax({
            type: "POST",
            url: "server/main.php",
            data: postData,
            cache: false,
            success: function(data){
                debugger;
                var data = JSON.parse(data);
                if(data.length > 0){
                    $('.noData').show();
                    let filename = data[0]['file_name'];
                    let path = 'doc/'+filename;
                    $('#btnDownloadKml').attr('href',path);
                    $.ajax('doc/'+filename).done(function(xml) {   
                        let data = toGeoJSON.kml(xml);
                        bindKmlMap(data)
                    });
                }    
                else{
                    message('error-div');
                }            
            }
        });
    })

    
})

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

function bindKmlMap(data){
    data = data.features;
    var mapOptions;
    var myCenter;
    var infowindow = new google.maps.InfoWindow();
    var avgLat = data[1].geometry.coordinates[1];
        var avgLong = data[1].geometry.coordinates[0];
        myCenter = new google.maps.LatLng(avgLat, avgLong);
        mapOptions = {
            center: myCenter,
            zoom: 10, scrollwheel: true, draggable: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
        };
        map = new google.maps.Map(document.getElementById("map_div"), mapOptions);
    if(data[1].geometry.type == "Point"){
        var avgLat = 11;
        var avgLong =76;
        myCenter = new google.maps.LatLng(avgLat, avgLong);
        mapOptions = {
            center: myCenter,
            zoom: 10, scrollwheel: true, draggable: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
        };
        map = new google.maps.Map(document.getElementById("map_div"), mapOptions);
    }      
        
    
    
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

function message(div){
    $('.'+div).fadeIn('slow');
    setTimeout(()=>{
        $('.'+div).fadeOut('slow');
    },5000)
}