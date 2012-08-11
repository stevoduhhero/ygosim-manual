<?php
	$host = "elloworld.dyndns.org";
	$port = 8000;
?>
<!DOCTYPE html>
<html lang="en" dir="ltr" >
<head>
<!--[if IE]>
	<script>window.location.href = "./ie.html";</script>
<![endif]-->
<title>YGOSiM - Not Even Beta</title>
<style type="text/css">
body, html {
	padding: 0;
	margin: 0;
	background-color: black;
	background: url(./bg.png);
}
h1 {
	text-align: center;
	color: white;
	text-shadow: 0.08em 0.08em black;
}
.room-list {
	margin-top: 20px;
	background: white;
	border: 1px solid black;
}
.room-list tr {
	color: grey;
	background: #e6e6e6;
}
.room-list tr:hover {
	cursor: pointer;
	color: black;
}
.room-list th, td {
	padding: 10px;
}
.room-list td {
	border-top: 1px solid black;
}
.room-list th {
	background: grey;
	color: white;
	text-shadow: 0.1em 0.1em black;
}
.c1 {
	min-width: 200px;
}
.c2 {
	text-align: center;
}
.c3 {
	min-width: 350px;
	max-width: 500px;
}
</style>
</head>
<body>
<h1>YUGiOH SIMULATOR - Room Select</h1>
<table align="center" class="room-list" id="room-list" cellpadding="0" cellspacing="0">
<tr valign="top">
<th>Room Name</th>
<th>Online</th>
<th>Description</th>
</tr>
</table>
<script src="http://<?php echo $host, ":", $port; ?>/socket.io/socket.io.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
<script src="./standard.js"></script>
<script>
var socket = io.connect('http://<?php echo $host, ":", $port; ?>');

$(function() {
	newurl("./rooms/");
	socket.emit('roomList');
})
socket.on('roomList', function(data) {
	for (var i in data) {
		$("#room-list").append('<tr valign="top" onclick="window.location.href = \'../game.php?r=' + i + '\';"><td class="c1">' + i + '</td><td class="c2">' + eval(data[i].users.length-1) + '</td><td class="c3">' + data[i].desc + '</td></tr>');
	}
});
</script>
</body>
</html>