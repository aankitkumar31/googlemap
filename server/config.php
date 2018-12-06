<?php
	// Mysql connection
	
	// $mysql_server = "139.59.86.83"; 
	// $mysql_user = "root"; 
	// $mysql_pass = "tinsink";

	$mysql_server = "localhost"; 
	$mysql_user = "root"; 
	$mysql_pass = "root";

	$mysql_db = "otrs"; 
	
	$conn = mysqli_connect($mysql_server,$mysql_user,$mysql_pass,$mysql_db);
	
	//This is added to increase the memory size to handle big size data
	//ini_set('memory_limit', '-1');
	
	
	
	
?>
