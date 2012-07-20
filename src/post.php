<?php
	function clean($string) {
		return mysql_real_escape_string($string);
	}
	function sqlsingle($sql) {
		$query = mysql_query($sql);
		$array = mysql_fetch_array($query);
		return $array[0];
	}
	function sqlcount($sql) {
		$query = mysql_query($sql);
		return mysql_num_rows($query);
	} 
	mysql_connect("localhost", "root", "");
	mysql_select_db("ygo");
	
	if (isset($_POST['d'])) {
		$do = clean($_POST['d']);
	}
	else {
		$do = "";
	}
	switch($do) {
		case 'register':
			$username = clean($_POST['u']);
			$password = clean($_POST['p']);
			$passwordm = md5($password);
			$count = sqlcount("SELECT * FROM users WHERE username='$username'");
			if ($count > 0) {
				echo 1;
			}
			else {
				$sql = "INSERT INTO users (id, username, password) VALUES ('', '$username', '$passwordm')";
				mysql_query($sql) or die(mysql_error());
				echo 0;
			}
			break;
		case 'check-registered':
			$username = clean($_POST['u']);
			$count = sqlcount("SELECT * FROM users WHERE username='$username'");
			$password = clean($_POST['p']);
			if ($count == 0) {
				echo 0;
			}
			else {
				$dbpass = sqlsingle("SELECT password FROM users WHERE username='$username'");
				if ($dbpass == $password) {
					echo 2;
				}
				else {
					echo 1;
				}
			}
			break;
		case 'login':
			$username = clean($_POST['u']);
			$password = clean($_POST['p']);
			$passwordm = md5($password);
			$count = sqlcount("SELECT * FROM users WHERE username='$username'");
			if ($count > 0) {
				$dbpass = sqlsingle("SELECT password FROM users WHERE username='$username'");
				if ($dbpass == $passwordm) {
					echo 0, "*", $dbpass;
				}
				else {
					echo 1;
				}
			}
			else {
				echo 1;
			}
			break;
			case 'save':
				$username = clean($_POST['u']);
				$user_id = sqlsingle("SELECT id FROM users WHERE username='$username'");
				$deck = clean($_POST['deck']);
				$name = clean($_POST['n']);
				$count = sqlsingle("SELECT * FROM decks WHERE deckname='$name' AND user_id='$user_id'");
				if ($count > 0) {
					$sql = "UPDATE decks SET deck='$deck' WHERE deckname='$name' AND user_id='$user_id'";
					echo 1;
				}
				else {
					$sql = "INSERT INTO decks (id, user_id, deckname, deck) VALUES ('', '$user_id', '$name', '$deck')";
					echo 0;		
				}
				mysql_query($sql) or die(mysql_error());
				break;
			case 'delete':
				$username = clean($_POST['u']);
				$name = clean($_POST['n']);
				$user_id = sqlsingle("SELECT id FROM users WHERE username='$username'");
				$count = sqlsingle("SELECT * FROM decks WHERE deckname='$name' AND user_id='$user_id'");
				if ($count == 0) {
					echo 0;
				}
				else {
					$sql = "DELETE FROM decks WHERE deckname='$name' AND user_id='$user_id'";
					mysql_query($sql) or die(mysql_error());
					echo 1;
				}
				break;
			case 'teams':
				$username = clean($_POST['u']);
				$user_id = sqlsingle("SELECT id FROM users WHERE username='$username'");
				$sql = "SELECT * FROM decks WHERE user_id='$user_id' ORDER BY id DESC";
				$query = mysql_query($sql) or die(mysql_error());
				while($array = mysql_fetch_array($query)) {
					$deckname = $array['deckname'];
					$deck = $array['deck'];
					echo $deckname, "^", $deck, "|";
				}
				break;
	}
?>