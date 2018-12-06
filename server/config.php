<?php
	// Mysql connection
	
	$mysql_server = "localhost"; // mysql server
	$mysql_user = "root"; // mysql user
	$mysql_pass = "root"; //mysql password for user
	$mysql_db = "otrs"; // mysql database to use
	
	$conn = mysqli_connect($mysql_server,$mysql_user,$mysql_pass,$mysql_db);
	
	//This is added to increase the memory size to handle big size data
	//ini_set('memory_limit', '-1');
	
	
	
	
?>
