
var map;
var infowindow;
let fromDate;
let endDate;
$(document).ready(function(){
    var timeframe = $('#selTimeframe').val();
    //getData(timeframe);
    getFilterData(timeframe)
    
    $('#btnSearch').on('click',function(){
        var customerArr = $('#selCustomerId').val();
        var serviceArr = $('#selServices').val();
        if(customerArr.length == 0){
            $('#selCustomerIdError').text('Please select customer id"s');
            setTimeout(function(){
                $('#selCustomerIdError').text('');
            },3000)
        }
        if(serviceArr.length == 0){
            $('#selServicesError').text('Please select services');
            setTimeout(function(){
                $('#selServicesError').text('');
            },3000)
        }

        fromDate = moment(fromDate).format('YYYY-MM-DD HH:MM:SS');
        endDate = moment(endDate).format('YYYY-MM-DD HH:MM:SS');
        let postData = {
            fromDate : fromDate,
            endDate : endDate,
            customerArr : customerArr,
            serviceArr : serviceArr,
            operation : 'getLatLong'
        }
        getMapData(postData);
    })

    var start = moment().subtract(29, 'days');
    var end = moment();

    function cb(start, end) {
        fromDate = start['_d'];
        endDate = end['_d']
        $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
    }

    $('#reportrange').daterangepicker({
        startDate: start,
        endDate: end,
        opens: 'right',
        ranges: {
           'Today': [moment(), moment()],
           'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
           'Last 7 Days': [moment().subtract(6, 'days'), moment()],
           'Last 30 Days': [moment().subtract(29, 'days'), moment()],
           'This Month': [moment().startOf('month'), moment().endOf('month')],
           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, cb);

    cb(start, end);

    $('#reportrange').on('apply.daterangepicker', function(ev, picker) {
        fromDate = picker.startDate['_d'];
        endDate = picker.endDate['_d'];
        $(this).val(picker.startDate.format('MMMM D, YYYY') + ' - ' + picker.endDate.format('MMMM D, YYYY'));
    });

    $('#reportrange').on('cancel.daterangepicker', function(ev, picker) {
        fromDate = picker.startDate['_d'];
        endDate = picker.endDate['_d'];
        $(this).val(picker.startDate.format('MMMM D, YYYY') + ' - ' + picker.endDate.format('MMMM D, YYYY'));
    });
    
})

function getFilterData(){
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
            let filteredCustomer = removeDuplicateCustomer(parseData);
            let filteredServices = removeDuplicateServices(parseData);
            bindCustomerId(filteredCustomer);
            bindServices(filteredServices);
        }
    });    
}

function removeDuplicateCustomer(data){
    var arr = [];
    $.each(data,function(i,v){
        if(i == 0){
            arr.push(v);
        }
        var filterdata = arr.filter(function(val,ind){
            if(val.customer_id == v.customer_id){
                return true;
            }
        })
        if(filterdata.length == 0){
            arr.push(v);
        }
    })
    return arr;
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

function bindCustomerId(parseData){
    let html = '';
    $.each(parseData,function(i,v){
        html += '<option value="'+v.customer_id+'">'+v.customer_id+'</option>';
    })
    $('#selCustomerId').html(html);
    $('#selCustomerId').multiselect('destroy');
    $('#selCustomerId').multiselect({
        enableClickableOptGroups: true,     
        includeSelectAllOption: true,  
        onChange: function (option, checked) {
            $('#selCustomerIdError').text('');
        }
    });
}

function bindServices(parseData){
    let html = '';
    $.each(parseData,function(i,v){
        html += '<option value="'+v.service_id+'">'+v.service_name+'</option>';
    })
    $('#selServices').html(html);
    $('#selServices').multiselect('destroy');
    $('#selServices').multiselect({
        enableClickableOptGroups: true,     
        includeSelectAllOption: true,  
        onChange: function (option, checked) {
            $('#selServicesError').text('');
        }
    });
}

function getMapData(postData){    
    $.ajax({
        type: "POST",
        url: "server/main.php",
        data: postData,
        cache: false,
        success: function(data){
            var parseData = JSON.parse(data);
            if(parseData.length > 0){
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
            else{
                let html = '<div class="alert alert-danger">'+
                                '<strong>Sorry!</strong> No Data Available for map.!!!'+
                            '</div>';
                $('#map_div').html(html); 
            }
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

