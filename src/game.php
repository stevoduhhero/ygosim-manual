<?php
	$host = "ygosim.dyndns.org";
	$port = 8000;
?>
<!DOCTYPE html>
<html>
<head>
<title>YGOSiM - Not Even Beta</title>
<link rel="stylesheet" type="text/css" href="./sim.css" />
<!--[if IE]>
	<script>window.location.href = "./ie.html";</script>
<![endif]-->
</head>
<body>
<h2 class="header" id="header">
	<img src="./imgs/logo.png" />
	<a href="http://ygosim.forumotion.com/" target="_BLANK"><img src="./imgs/buttons/forum1.png" onmouseover="this.src = './imgs/buttons/forum2.png';" onmouseout=" this.src = './imgs/buttons/forum1.png';" /></a>
</h2>
<div class="big unselectable" id="deck-manager">
	<div class="center-it">
		<div class="relativity">
			<div class="exit" onclick="$('#deck-manager').hide();"></div>
			<div class="save-it" id="save-it"></div>
			<div class="open-it" id="open-it"></div>
			<div class="delete-it" id="delete-it"></div>
			<a href="./build/" target="_BLANK"><div class="o-db"></div></a>
			<div id="it-content" class="it-content"></div>
			<input type="text" id="name-it" class="name-it" />
			<textarea id="decklist-it" class="decklist-it" onclick="this.select();">Paste your deck here.</textarea>
		</div>
	</div>
</div>
<div id="notice" class="abs hide" style="z-index: 3;display: block;">
	<div class="relative">
		<div class="opaque abs"></div>
		<div class="abs user-form-container" style="z-index: 1;">
			<div class="user-form">
				<label>Notice:<span id="notice-close" class="x right">X</span></label>
				<div id="notice-content">Loading...<div style="background: white;border: 1px solid black;height: 25px;width: 80%;margin: auto;"><div id="loading" style="background: green;height: 100%;width: 0%;"></div></div></div>
			</div>
		</div>
	</div>
</div>
<div id="user-form" class="abs hide" style="z-index: 2;">
	<div class="relative">
		<div class="opaque abs"></div>
		<div class="abs user-form-container" style="z-index: 1;">
			<div class="user-form">
				<label>Set Your Username:</label>
				<input type="text" id="user-form-input" value="Username..." />
			</div>
		</div>
	</div>
</div>
<div id="register-form" class="abs hide" style="z-index: 2;">
	<div class="relative">
		<div class="opaque abs"></div>
		<div class="abs user-form-container" style="z-index: 1;">
			<div class="user-form">
				<label id="register-form-label">Register:</label>
				<input type="text" id="register-form-input" value="Username..." /><br />
				<input type="password" id="register-form-input2" value="Password..." /><br />
			</div>
		</div>
	</div>
</div>
<div id="everything-main" class="abs">
	<div class="relative">
		<div class="users">
			<div class="relative">
				<div class="opaque abs"></div>
				<div class="usersList upper unselectable" id="usersList"></div>
			</div>
		</div>
		<div class="chat">
			<div class="relative">
				<div class="opaque abs"></div>
				<div class="upper">
					<div class="logs" id="logs"></div>
					<div class="input">
						<textarea id="chat-message" class="user-message"></textarea>
					</div>
				</div>
			</div>
		</div>
		<div class="buttons">
			<div id="o-choose-deck" class="o-choose-deck"><b class="link" onclick="$('#o-choose-deck').hide();">Choose Deck to Use:</b><br /><select id="o-choose-deck-val"></select><input id="o-choose-deck-click" type="button" value="Find Duel" /></div>
			<button id="o_fd">Find Duel</button>
			<button id="o_db">Deck Manager</button>
			<button id="o_s">Send</button>
			<button id="o_r">Register</button>
		</div>
	</div>
	<div id="chal-o-choose-deck" class="chal-o-choose-deck"><b class="link" onclick="$('#chal-o-choose-deck').hide();">Challenging <span id="o-choose-deck-target"></span>:</b><br /><select id="chal-o-choose-deck-val"></select><input id="chal-o-choose-deck-click" type="button" value="Challenge" /></div>
	<div id="challenges" class="challenges"></div>
</div>
<div id="duel" class="duel">
		<table cellpadding="0" cellspacing="0">
		<tr valign="top">
		<td>
			<table class="unselectable" cellpadding="10" cellspacing="0" style="border: 1px solid grey;">
			<tr valign="top">
			<td width="50%" style="background: teal;color: white;" id="duel-you-info">
			<center>
			<div style="font-weight: bold;font-size: 15px;" id="duel-you-name">NAME</div>
			<div style="position: relative;"><img src="" height="50" width="50" id="youimg" /><div id="youstatus" class="status"></div></div>
			<div style="display: inline-block;position: relative;background: red;width: 80%;height: 15px;border: 1px solid black;"><div style="background: lightgreen; width: 100%;height: 100%;float: left;" id="duel-you-lp"></div><span style="position: absolute;left: 5px; top: 0;z-index: 1;font-size: 15px;color: black;" id="duel-you-lpnum">8000</span></div> <img src="./plus.png" id="pluslp" style="cursor: pointer;" /> <img src="minus.png" id="minuslp" style="cursor: pointer;" />
			</center>
			</td>
			<td width="50%" style="background: teal;color: white;" id="duel-opp-info">
			<center>
			<div style="font-weight: bold;font-size: 15px;" id="duel-opp-name">NAME</div>
			<div style="position: relative;"><img src="" height="50" width="50" id="oppimg" /><div id="oppstatus" class="status"></div></div>
			<div style="display: inline-block;position: relative;background: red;width: 80%;height: 15px;border: 1px solid black;"><div style="background: lightgreen; width: 100%;height: 100%;float: left;" id="duel-opp-lp"></div><span style="position: absolute;left: 5px; top: 0;z-index: 1;font-size: 15px;color: black;" id="duel-opp-lpnum">8000</span></div>
			</center>
			</td>
			</tr>
			</table>
		</td>
		<td width="325px">
			<div class="info">
			<div class="infoimg unselectable" id="infoimg"></div>
			<div class="infoinfo" id="infoinfo"></div>
			</div>
		</td>
		</tr>
		</table>
			<table id="phase" class="phase unselectable" cellpadding="0" cellspacing="0" style="cursor: pointer;border: 1px solid grey; background: white;border-top: none;">
			<tr>
			<th width="14%" id="dp" class="selected-phase">DP</th>
			<th width="14%" id="sp">SP</th>
			<th width="14%" id="m1">M1</th>
			<th width="14%" id="bp">BP</th>
			<th width="14%" id="m2">M2</th>
			<th width="14%" id="ep">EP</th>
			<th width="14%" id="et">End Turn</th>
			</tr>
			</table>
	<img src="./sword.png" id="sword" class="sword" />
	<img src="./sword.png" id="attack" class="sword" />
	<img src="./sword.png" id="oppattack" class="v h sword" />
	<div id="card-list" class="view-list unselectable"><div class="relative"><div class="opaque abs"></div><div class="abs" style="z-index: 4;"><div id="card-list-header" class="card-list-header"></div><span class="card-list-exit" id="card-list-exit">X</span><div id="card-list-content" class="card-list-content"></div></div></div></div>
	<div id="shuffleabs" class="shuffleabs"><div class="shuffle unselectable" id="shuffle"></div></div>
	<img src="./dice.gif" id="dice" class="dice unselectable hide" />
	<div id="opphand" class="hand unselectable" style="overflow: hidden;height: 33px;"></div>
	<div id="oppdivision" class="field h v unselectable"><div id="oppbanished" class="oppbanished"></div><div class="division"><div id="opp1" class="slot"></div><div id="opp2" class="slot"></div><div id="opp3" class="slot"></div><div id="opp4" class="slot"></div><div id="opp5" class="slot"></div><div id="opp6" class="slot"></div><div id="opp7" class="slot"></div></div><div class="division"><div id="opp8" class="slot"><img src="./deck.png" /></div><div id="opp9" class="slot"></div><div id="opp10" class="slot"></div><div id="opp11" class="slot"></div><div id="opp12" class="slot"></div><div id="opp13" class="slot"></div><div id="opp14" class="slot"><img src="./deck.png" /></div></div></div><div class="field unselectable"><div id="youbanished" class="youbanished"></div><div id="youdivision" class="division"><div id="you1" class="slot"></div><div id="you2" class="slot"></div><div id="you3" class="slot"></div><div id="you4" class="slot"></div><div id="you5" class="slot"></div><div id="you6" class="slot"></div><div id="you7" class="slot"></div></div><div class="division"><div id="you8" class="slot"><img src="./deck.png" /></div><div id="you9" class="slot"></div><div id="you10" class="slot"></div><div id="you11" class="slot"></div><div id="you12" class="slot"></div><div id="you13" class="slot"></div><div id="you14" class="slot"><img src="./deck.png" /></div></div></div>
	<div id="youhand" class="hand unselectable"></div>
	<div id="duel-chat" class="duel-chat">
		<div class="duel-chat-header" id="duel-chat-header">Duel Logs</div>
		<div id="duel-chat-logs" class="duel-chat-logs"></div>
		<input type="text" id="duel-chat-message" class="duel-chat-message" />
	</div>
	<div id="rps" style="width: 623px; background: white; opacity: 0.95;border-radius: 28px 28px 28px 28px;">
		<center>
			<img src="./imgs/rock.png" height="100px" id="rock" style="cursor: pointer;max-width: 33%;" />
			<img src="./imgs/paper.png" height="100px" id="paper" style="cursor: pointer;max-width: 33%;" />
			<img src="./imgs/scissors.png" height="100px" id="scissors" style="cursor: pointer;max-width: 33%;" />
			<div id="playit"></div>
			<div id="rpsops" style="display: none;"><button id="gofirst" disabled>Go First</button><button id="gosecond" disabled>Go Second</button></div>
		</center>
	</div>
	<div id="hand-context" class="context unselectable"></div>
	<div id="field-context" class="context unselectable" style="font-size: 9px;"></div>
	<div id="list-context" class="context unselectable"></div>
	
	<div id="floaty-menu" class="floaty-menu unselectable">
		<div class="floaty-contain" id="floaty-contain">
			<div id="floaty-content" class="floaty-content">
				<ul id="duel-ops" class="duel-ops">
					<li>
						Duel
						<ul>
							<li><div>Admit Defeat</div></li>
							<li><div>Leave</div></li>
							<li><div>Soft Reset</div></li>
							<li><div>Reset</div></li>
							<li><div>Inactive Player Kick</div></li>
							<li><div>Call Admin</div></li>
						</ul>
					</li>
					<li>
						Tokens
						<ul>
							<li><div>Sheep</div></li>
							<li><div>Ojama</div></li>
						</ul>
					</li>
					<li><div>Coin Toss</div></li>
					<li><div>Roll Dice</div></li>
					<li><div>Flip Deck Upside Down</div></li>
					<li>
						Movement
						<ul>
							<li>
								Hand
								<ul>
									<li><div>Hand to Deck</div></li>
									<li><div>Hand to Graveyard</div></li>
									<li><div>Hand to RFG</div></li>
								</ul>
							</li>
							<li>
								Deck
								<ul>
									<li><div>Deck to Hand</div></li>
									<li><div>Deck to Graveyard</div></li>
									<li><div>Deck to RFG</div></li>
								</ul>
							</li>
							<li>
								Graveyard
								<ul>
									<li><div>Grave to Hand</div></li>
									<li><div>Grave to Deck</div></li>
									<li><div>Grave to RFG</div></li>
								</ul>
							</li>
							<li>
								RFG
								<ul>
									<li><div>RFG to Hand</div></li>
									<li><div>RFG to Deck</div></li>
									<li><div>RFG to Grave</div></li>
								</ul>
							</li>
						</ul>
					</li>
				</ul>
			</div>
		</div>
	</div>
</div>
<div id="dragee" class="dragee"></div>
<div id="allContext" style="border: 1px solid blue; display: none; position: absolute;z-index: 50;"><ul id="cmenu" class="cmenu"></ul></div>
<script>
<?php
	echo 'var host = "', $host, '";var port = ', $port, ';';
	if (isset($_GET['r'])) {
		echo 'room = "', $_GET['r'] ,'";window.history.pushState({}, "", "./");';
	}
	else {
		echo 'window.location.href = "./rooms.php";';
	}
?>
</script>
<script src="http://<?php echo $host, ":", $port; ?>/socket.io/socket.io.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
<script src="./standard.js"></script>
<script>document.getElementById('loading').style.width = '70%';</script>
<script src="./sim.js"></script>
<script>document.getElementById('loading').style.width = '84%';</script>
<script src="./socks.js"></script>
<script>document.getElementById('loading').style.width = '98%';</script>
<script>document.getElementById('loading').style.width = '100%';$("#notice").fadeOut(1000);</script>
</body>
</html>