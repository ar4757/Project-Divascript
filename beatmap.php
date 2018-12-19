<?php
if(!empty($_POST['data'])){
$data = $_POST['data'];
$fname = "beatmap" . ".txt";//generates random name
$videoID = strstr($data, "\n", true);
$videoID = substr($videoID, 0, -1);
if (!file_exists("beatmaps/" . $videoID)) {
    mkdir("beatmaps/" . $videoID, 0777, true);
}
$file = fopen("beatmaps/" . $videoID . "/" . $fname, 'w');//creates new file
fwrite($file, $data);
fclose($file);
}
?>