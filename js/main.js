
var map;
var infowindow;
$(document).ready(function(){
    var timeframe = $('#selTimeframe').val();
    //getData(timeframe);
    bindcustomerid(timeframe)
    $('#selTimeframe').on('change',function(){
        var timeframe = $('#selTimeframe option:selected').val();
        bindcustomerid(timeframe);
    })

    $('#btnSearch').on('click',function(){
        var customerArr = $('#selMultiSelect').val();
        //customerArr = customerArr.join();
        var timeframe = $('#selTimeframe option:selected').val();
        getMapData(timeframe,customerArr)
    })
    
})

function bindcustomerid(timeframe){
    let postData = {
        timeframe : timeframe,
        operation : 'getCustomerId'
    }
    $.ajax({
        type: "POST",
        url: "server/main.php",
        data: postData,
        cache: false,
        success: function(data){
            var parseData = JSON.parse(data);
            let html = '';
            $.each(parseData,function(i,v){
                html += '<option value="'+v.customer_id+'">'+v.customer_id+'</option>';
            })
            $('#selMultiSelect').html(html);
            $('#selMultiSelect').multiselect('destroy');
            $('#selMultiSelect').multiselect({
                enableClickableOptGroups: true,     
                includeSelectAllOption: true,  
            });
        }
    });    
}

function getMapData(timeframe,customerArr){
    let postData = {
        timeframe : timeframe,
        customerArr : customerArr,
        operation : 'getLatLong'
    }
    $.ajax({
        type: "POST",
        url: "server/main.php",
        data: postData,
        cache: false,
        success: function(data){
            var parseData = JSON.parse(data);
            let mapData = [];
            $.each(parseData,function(i,v){
                let latlong = v.location.split(',');
                let lat = latlong[0];
                let lon = latlong[1];
                let count = i+1
                let obj = {
                    "lat": Number(lat),
                    "lon": Number(lon),
                    "title": v.title
                }
                mapData.push(obj);
            })
            bindmap(mapData);
        }
    });      
}

function bindmap(mapData){
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
            zoom: 10, scrollwheel: true, draggable: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
        };
        var map = new google.maps.Map(document.getElementById("map_div"), mapOptions);
        
        var icon = {
            scaledSize: new google.maps.Size(7, 7), // scaled size
            origin: new google.maps.Point(0, 0), // origin
            anchor: new google.maps.Point(0, 0), // anchor
            labelOrigin: new google.maps.Point(0, 15)
        };       
        
        infowindow = new google.maps.InfoWindow();
        for (var i = 0; i < mapData.length; i++) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(mapData[i]['lat'], mapData[i]['lon']),
                icon: icon,
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