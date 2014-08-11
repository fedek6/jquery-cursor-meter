<?php 
error_reporting(-1);
ini_set('display_errors', 'On');

header('Content-Type: application/json');

// db init
$db = new SQLite3('./data.db');

if(empty($_POST['action'])) {
	die(json_encode(array('status'=>'parameter error')));
}

// action flow
if($_POST['action'] == 'put') { /* update server data */
	$total_distance = !empty($_POST['total']) ? floatval($_POST['total']) : 0;
	$x_distance = !empty($_POST['x']) ? floatval($_POST['x']) : 0;
	$y_distance = !empty($_POST['y']) ? floatval($_POST['y']) : 0;
	$ratio = !empty($_POST['ratio']) ? intval($_POST['ratio']) : 0;
	$date = date('Y-m-d H:i:s');
	
	if($db->exec("INSERT INTO odometer_stats (total_distance, x_distance, y_distance, ratio, date) VALUES ($total_distance, $x_distance, $y_distance, $ratio, \"$date\")")) {
		die(json_encode(array('status'=>'ok')));
	}
	else {
		die(json_encode(array('status'=>'database error')));
	}
	
}
else {
	$value = $db->querySingle('SELECT SUM(total_distance) AS summarized_distance FROM odometer_stats ORDER BY total_distance');
	echo json_encode(array('globalDistance'=>floatval($value)));
}
?>