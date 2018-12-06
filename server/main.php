<?php
    ini_set('display_errors', 'On');
	include 'config.php';
	
	if($_POST['operation'] == "getCustomerId"){
        $query = "SELECT ticket.customer_id,s.name service_name,ticket.service_id 
        FROM ticket 
		  LEFT JOIN dynamic_field_value on ticket.id=dynamic_field_value.object_id
		  LEFT JOIN service s ON s.id = ticket.service_id
            where (dynamic_field_value.field_id =35)";
        $sql = mysqli_query($conn, $query);
        while($r = mysqli_fetch_assoc($sql)) {
            $rows[] = $r;
        }
        print json_encode($rows);
    }

    if($_POST['operation'] == "getTimeFrameCustomers"){
        $fromDate = $_POST['fromDate'];
		$endDate = $_POST['endDate'];
        $query = "SELECT ticket.customer_id FROM ticket 
                LEFT JOIN dynamic_field_value on ticket.id=dynamic_field_value.object_id
                LEFT JOIN service s ON s.id = ticket.service_id
                    where (dynamic_field_value.field_id =35) AND ticket.change_time >= '".$fromDate."' AND ticket.change_time <= '".$endDate."'";
        $sql = mysqli_query($conn, $query);
        $rows =  array();
        while($r = mysqli_fetch_assoc($sql)) {
            $rows[] = $r;
        }
        print json_encode($rows);
    }

    if($_POST['operation'] == "getTimeFrameCustomerServices"){
        $fromDate = $_POST['fromDate'];
		$endDate = $_POST['endDate'];
        $customerArr = $_POST['customerArr'];
        
        $query = "SELECT ticket.service_id,s.name service_name FROM ticket 
                    LEFT JOIN dynamic_field_value on ticket.id=dynamic_field_value.object_id
                    LEFT JOIN service s ON s.id = ticket.service_id
                        where (dynamic_field_value.field_id =35) AND ticket.change_time >= '".$fromDate."' AND 
                    ticket.change_time <= '".$endDate."'";

        $query .= " AND ticket.customer_id IN (";  
        $count = 0;
        foreach ($customerArr as $key => $value) {
            if($count != 0){
                $query .= ",";
            }                
            $query .= "'".$value."'";
            $count++;
        }
        $query .= ")";                
        //echo $query;
        $sql = mysqli_query($conn, $query);
        $rows =  array();
        while($r = mysqli_fetch_assoc($sql)) {
            $rows[] = $r;
        }
        print json_encode($rows);
    }
    
    if($_POST['operation'] == "getLatLong"){
		$fromDate = $_POST['fromDate'];
		$endDate = $_POST['endDate'];
		$customerArr = $_POST['customerArr'];
		$serviceArr = $_POST['serviceArr'];
        $query = "SELECT dynamic_field_value.value_text AS location,ticket.title
        FROM ticket INNER JOIN dynamic_field_value on ticket.id=dynamic_field_value.object_id
            where (dynamic_field_value.field_id =35) AND 
            ticket.change_time >= '".$fromDate."' AND ticket.change_time <= '".$endDate."'";
            
            $query .= " AND ticket.customer_id IN (";  
            $count = 0;
            foreach ($customerArr as $key => $value) {
                if($count != 0){
                    $query .= ",";
                }                
                $query .= "'".$value."'";
                $count++;
            }
            $query .= ")";

            $query .= " AND ticket.service_id IN (";  
            $count = 0;
            foreach ($serviceArr as $key => $value) {
                if($count != 0){
                    $query .= ",";
                }                
                $query .= "".$value."";
                $count++;
            }
            $query .= ")";
        //echo $query;
        //exit();        
        $sql = mysqli_query($conn, $query);
        $rows = array();
        while($r = mysqli_fetch_assoc($sql)) {
            $rows[] = $r;
        }
        print json_encode($rows);
	}
    
    if($_POST['operation'] == "getKmlFile"){
        $service_id = $_POST['service_id'];
        $query = "select * from kml_data where service_id='".$service_id."'";
        $sql = mysqli_query($conn, $query);
        $rows = array();
        while($r = mysqli_fetch_assoc($sql)) {
            $rows[] = $r;
        }
        print json_encode($rows);
    }

    if($_POST['operation'] == "saveKmlData"){
        $file_name = $_POST['file_name'];
        $service_id = $_POST['service_id'];

        $delQuery = "DELETE FROM kml_data WHERE service_id = '".$service_id."'";
        $delsql = mysqli_query($conn, $delQuery);

        $query = "INSERT INTO kml_data(file_name,service_id) VALUES ('".$file_name."','".$service_id."')";
        $sql = mysqli_query($conn, $query);
        if($sql){
            echo "saved";
        }
        else{
            echo "error";
        }
    }

    if($_POST['operation'] == "saveCoordinates"){
        $name = $_POST['name'];
        $breakpointArr = $_POST['breakpointArr'];
        $query = "INSERT INTO breakpoints(name,breakpoint) VALUES ";
        $count = 0;
        foreach ($breakpointArr as $key => $value ) {
            if($count != 0){
                $query .= ",";
            }                
            $query .= "('".$name."', '".$value."')";
            $count++;
        }
        $sql = mysqli_query($conn, $query);
        if($sql){
            echo "saved";
        }
        else{
            
        }
    }

?>