<?php
    ini_set('display_errors', 'On');
	include 'config.php';
	
	if($_POST['operation'] == "getCustomerId"){
		$timeframe = $_POST['timeframe'];
        $query = "SELECT dynamic_field_value.value_text AS location,ticket.title,ticket.customer_id
        FROM ticket INNER JOIN dynamic_field_value on ticket.id=dynamic_field_value.object_id
            where (dynamic_field_value.field_id =35) AND 
            timediff(now(), ticket.change_time) < '".$timeframe."'";
        $sql = mysqli_query($conn, $query);
        while($r = mysqli_fetch_assoc($sql)) {
            $rows[] = $r;
        }
        print json_encode($rows);
    }
    
    if($_POST['operation'] == "getLatLong"){
		$timeframe = $_POST['timeframe'];
		$customerArr = $_POST['customerArr'];
        $query = "SELECT dynamic_field_value.value_text AS location,ticket.title,ticket.customer_id
        FROM ticket INNER JOIN dynamic_field_value on ticket.id=dynamic_field_value.object_id
            where (dynamic_field_value.field_id =35) AND 
            timediff(now(), ticket.change_time) < '".$timeframe."' ";
            
            $query .= "AND ticket.customer_id IN (";  
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
        while($r = mysqli_fetch_assoc($sql)) {
            $rows[] = $r;
        }
        print json_encode($rows);
	}
	
?>