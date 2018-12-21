<?php

$songList = array();
$i = 0;

$dir = "beatmaps/*";
foreach(glob($dir) as $videoIDFolder) {
	if (is_dir($videoIDFolder)) {
		foreach(glob($videoIDFolder . "/*") as $beatmapFile) {
			if (!is_dir($beatmapFile)) {
				$song = '';
				$lines = new SplFileObject($beatmapFile);
				foreach ($lines as $line_num => $line) {
				    if ($line_num == 0) {
				    	$line = strstr($line, "\n", true);
						$line = substr($line, 0, -1);
				    	$song = $line;
				    }
				    else if ($line_num == 1) {
				    	$line = strstr($line, "\n", true);
						$line = substr($line, 0, -1);
				    	$song = $song . '-' . $line;
				    	$songList[$i] = $song;
				    	$i++;
				    }
				    else {
				    	break;
				    }
				}
			}
		}
	}
}

echo json_encode($songList);

?>