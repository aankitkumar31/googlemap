<?php
	include 'config.php';
    if (!file_exists('../doc')) {
        mkdir('../doc', 0777, true);
    }
    if(isset($_FILES["kml"])){
        $fileName = generateRandomString();
    
        $uploadDirectory = '../doc/'. $fileName.'.kml';
        if (move_uploaded_file($_FILES["kml"]["tmp_name"], $uploadDirectory)) {
            echo $fileName.'.kml';
        }
        else{
            echo("error");
        }
    }else{
        echo "error";
    }
    
    function generateRandomString($length = 5) {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }
?>