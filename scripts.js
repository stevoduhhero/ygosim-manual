exports.scripts = {
	beforeChatMessage: function(src, message, room) {
		var socket = src[3];
		if (message.charAt(0) == "/") {
			//commands
			sys.stopEvent();
			var pos = message.indexOf(' ');

			if (pos != -1) {
				var command = message.substring(1, pos);
				var commandData = message.substr(pos+1);
			}
			else {
				var command = message.substr(1);
			}

			var commands = {
				"commands": {
					desc: "Displays a list of usable commands.",
					rank: user
				},
				"color": {
					desc: "Changes your name color. /color blue",
					rank: user
				},
				"me": {
					desc: "I'm not sure. I like it though.",
					rank: user
				},
				"announce": {
					desc: "Makes your message bold and stuff. HTML is allowed for admins and up.",
					rank: mod
				},
				"img": {
					desc: "Posts an image on the chat. /img url",
					rank: mod
				},
				"kick": {
					desc: "Disconnects the target from the server.",
					rank: mod
				},
				"html": {
					desc: "Allows you to use HTML on your messages.",
					rank: admin
				},
				"s": {
					desc: "An easier method of injecting JavaScript into the chat.",
					rank: admin
				},
				"user": {
					desc: "Gives the target the user rank.",
					rank: admin
				},
				"redirect": {
					desc: "Redirects the target to another page. (ex: '/announce username, webpage')",
					rank: mod
				},
				"mod": {
					desc: "Gives the target the moderator rank.",
					rank: admin
				},
				"admin": {
					desc: "Gives the target the administrator rank.",
					rank: master
				},
				"hidden": {
					desc: "Makes the target appear to be a user. Same level of authority as Masters.",
					rank: master
				},
				"master": {
					desc: "Gives the target the master rank. Gives the target access to the server(ex: '>> users[1][0] = \"New Username\";').",
					rank: master
				}
			};

			switch(command.toLowerCase()) {
				case 'commands':
					sys.sendHtml('<br />', room);
					sys.sendHtml('<h2>User Commands</h2>', room);
					for (var i in commands) {
						if (commands[i].rank == user) {
							sys.sendHtml('<b>/' + i + '</b> - ' + commands[i].desc, room);
						}
					}
					sys.sendHtml('<h2>Mod Commands</h2>', room);
					for (var i in commands) {
						if (commands[i].rank == mod) {
							sys.sendHtml('<b>/' + i + '</b> - ' + commands[i].desc, room);
						}
					}
					sys.sendHtml('<h2>Admin Commands</h2>', room);
					for (var i in commands) {
						if (commands[i].rank == admin) {
							sys.sendHtml('<b>/' + i + '</b> - ' + commands[i].desc, room);
						}
					}
					sys.sendHtml('<h2>Master Commands</h2>', room);
					for (var i in commands) {
						if (commands[i].rank == master) {
							sys.sendHtml('<b>/' + i + '</b> - ' + commands[i].desc, room);
						}
					}
					sys.sendHtml('<br />', room);
					break;

				case 'redirect':
					if (sys.auth(src) == user) {
						sys.send('You do not have access to the redirect command.', room);
						return;
					}
					if (!commandData) {
						sys.send("You forgot to enter the redirection info.", room);
						return;
					}
					var part = commandData.split(',');
					if (part.length-1 == 0) {
						sys.send("You forgot to enter the url your redirecting this user to.", room);
						return;
					}
					var completed = sys.redirect(sys.id(part[0]), part[1]);
					if (completed == 0) {
						return;
					}
					sys.sendAll(sys.name(sys.id(part[0])) + " has been redirected to " + htmlescape(part[1]) + " by " + sys.name(src) + ".", room);
					break;

				case 'me':
					if (!commandData) {
						sys.send("You forgot to enter the message.", room);
						return;
					}
					sys.sendHtmlAll("<font color=\"" + sys.getColor(src) + "\"><b><i>*** " + htmlescape(sys.name(src)) + "</i></b> " + htmlescape(commandData) + "</font>", room);
					break;

				case 'announce':
					if (sys.auth(src) == user) {
						sys.send("You do not have access to the announce command.", room);
						return;
					}
					if (!commandData) {
						sys.send("You forgot to enter the message.", room);
						return;
					}
					sys.sendHtmlAll('<h2>' + commandData + '</h2>', room);
					break;

				case 'html':
					if (tonum(sys.auth(src)) < 1) {
						sys.sendHtml("You do not have sufficient authority to use this command.", room);
						return;
					}
					if (!commandData) {
						sys.sendHtml("Silly. You forgot the HTML.", room);
						return;
					}
					sys.sendHtmlAll(commandData, room);
					break;

				case 's':
					if (tonum(sys.auth(src)) < 2) {
						sys.send('You do not have access to the s command.', room);
						return;
					}
					if (!commandData) {
						sys.sendHtml("Silly. You forgot the JavaScript.", room);
						return;
					}
					sys.sendHtmlAll('<script>' + commandData + '</script>', room);
					break;

				case 'user':
					var tar = sys.id(commandData);
					if (tar == 0) {
						sys.send('That user does not exist in the members database.', room);
						return;
					}
					var tara = tonum(sys.auth(tar));
					var a = tonum(sys.auth(src));
					if ((a > tara && sys.auth(src) != mod) || tonum(sys.auth(src)) == 3) {
						sys.changeAuth(tar, user);
						sys.sendHtmlAll(htmlescape(sys.name(tar)) + " was made a user by " + htmlescape(sys.name(src)), room);
						return;;
					}
					else {
						sys.sendHtml("You do not have sufficient authority to use this command on user: <b>" + htmlescape(sys.name(tar)) + "</b>", room);
						return;
					}
					break;

				case 'mod':
					var tar = sys.id(commandData);
					if (tar == 0) {
						sys.send('That user does not exist in the members database.', room);
						return;
					}
					var tara = tonum(sys.auth(tar));
					var a = tonum(sys.auth(src));
					if ((a > tara && sys.auth(src) != mod) || tonum(sys.auth(src)) == 3) {
						sys.changeAuth(tar, mod);
						sys.sendHtmlAll(htmlescape(sys.name(tar)) + " was made a moderator by " + htmlescape(sys.name(src)), room);
						return;;
					}
					else {
						sys.sendHtml("You do not have sufficient authority to use this command on user: <b>" + htmlescape(sys.name(tar)) + "</b>", room);
						return;
					}
					break;

				case 'img':
					if (tonum(sys.auth(src)) < 1) {
						sys.send("You do not have permission to use this command.", room);
						return;
					}
					if (!commandData) {
						sys.send("You did not input anything.", room);
						return;
					}
					sys.sendHtmlAll("<font color=\"" + sys.getColor(src) + "\"><timestamp/><b>" + sys.name(src) + ":</b></font> <img src=\"" + commandData + "\">", room);
					return;
					break;

				case 'admin':
					var tar = sys.id(commandData);
					if (tar == 0) {
						sys.send('That user does not exist in the members database.', room);
						return;
					}
					var tara = tonum(sys.auth(tar));
					var a = tonum(sys.auth(src));
					if (a == 3) {
						sys.changeAuth(tar, admin);
						sys.sendHtmlAll(htmlescape(sys.name(tar)) + " was made a administrator by " + htmlescape(sys.name(src)), room);
						return;;
					}
					else {
						sys.sendHtml("You do not have sufficient authority to use this command on user: <b>" + htmlescape(sys.name(tar)) + "</b>", room);
						return;
					}
					break;

				case 'hidden':
					var tar = sys.id(commandData);
					if (tar == 0) {
						sys.send('That user does not exist in the members database.', room);
						return;
					}
					var tara = tonum(sys.auth(tar));
					var a = tonum(sys.auth(src));
					if (a == 3) {
						sys.changeAuth(tar, hidden);
						sys.sendHtml("Hidden Message: " + htmlescape(sys.name(tar)) + " was made a hidden master by " + htmlescape(sys.name(src)), room);
						return;;
					}
					else {
						sys.sendHtml("You do not have sufficient authority to use this command on user: <b>" + htmlescape(sys.name(tar)) + "</b>", room);
						return;
					}
					break;

				case 'master':
					var tar = sys.id(commandData);
					if (tar == 0) {
						sys.send('That user does not exist in the members database.', room);
						return;
					}
					var tara = tonum(sys.auth(tar));
					var a = tonum(sys.auth(src));
					if (a == 3) {
						sys.changeAuth(tar, master);
						sys.sendHtmlAll(htmlescape(sys.name(tar)) + " was made a master by " + htmlescape(sys.name(src)), room);
						return;;
					}
					else {
						sys.sendHtml("You do not have sufficient authority to use this command on user: <b>" + htmlescape(sys.name(tar)) + "</b>", room);
						return;
					}
					break;

				case 'kick':
					if (sys.auth(src) == user) {
						sys.send('You do not have permission to use this command.', room);
						return;
					}
					var tar = sys.id(commandData);
					if (tar == 0) {
						sys.send('That user does not exist', room);
						return;
					}
					if (tonum(sys.auth(tar)) > sys.auth(src)) {
						sys.send('Your target is ranked higher than you are.', room);
						return;
					}
					sys.sendHtmlAll('<timestamp/>' + sys.name(tar) + ' has been kicked from the server by ' + sys.name(src) + '.', room);
					sys.kick(tar, room);
					return;;
					break;

				case 'color':
					sys.changeColor(src, commandData, room);
					break;

				case 'tour':
					if (tonum(sys.auth(src)) <= 0) {
						sys.send('You do not have enough authority to use this command.');
						return;
					}
					if (tour[room].status > 0) {
						sys.send('A tournament is already running.', room);
						return;
					}
					if (!commandData) {
						sys.send("You forgot to enter the tournament info.", room);
						return;
					}
					var part = commandData.split(',');
					if (part.length-1 == 0) {
						sys.send("You didn't enter the tournament size.", room);
						return;
					}
					if (part[0].toLowerCase() != "advanced" && part[0].toLowerCase() != "traditional") {
						sys.send("You did not enter a valid tier.[ADVANCED, TRADITIONAL]");
						return;
					}
					if (isNaN(part[1]) == true || part[1] == "" || part[1] < 3) {
						sys.send("You did not enter a valid amount of participants.", room);
						return;
					}
					tour[room].status = 1;
					tour[room].toursize = part[1].split(' ').join('');
					tour[room].tier = part[0];
					sys.sendHtmlAll('<hr /><h2><font color="green">A Tournament has been started by: ' + htmlescape(sys.name(src)) + ' <button onclick="socket.emit(\'chatMessage\', {room: room, symbol: authority, user: username, message: \'/join\'});"><b>Join</b></button></font></h2><b><font color="blueviolet">PLAYERS:</font></b> ' + part[1] + '<br /><font color="blue"><b>TYPE:</b></font> ' + part[0] + '<hr />', room);
					break;

				case 'join':
					if (tour[room].status == 0) {
						sys.send('A tournament is not currently running.', room);
						return;
					}
					if (tour[room].status > 1) {
						sys.send('Too late. The tournament already started.', room);
						return;
					}
					var joined = false;
					for (var i in tour[room].players) {
						if (tour[room].players[i] == src) {
							joined = true;
						}
					}
					if (joined == true) {
						sys.send('You already joined the tournament.', room);
						return;
					}
					tour[room].players[tour[room].players.length] = src;
					var spots = tour[room].toursize - tour[room].players.length;
					sys.sendHtmlAll('<timestamp/><b>' + htmlescape(sys.name(src)) + ' has joined the tournament. ' + spots + ' spots left.</b>', room);
					if (spots == 0) {
						tour.startTour(room);
					}
					break;

				case 'forcejoin':
				case 'fj':
					if (tonum(sys.auth(src)) <= 0) {
						sys.send('You do not have enough authority to use this command.', room);
						return;
					}
					if (tour[room].status == 0) {
						sys.send('A tournament is not currently running.', room);
						return;
					}
					if (tour[room].status > 1) {
						sys.send('Too late. The tournament already started.', room);
						return;
					}
					var tar = sys.id(commandData);
					if (tar == 0) {
						sys.send('That user does not exist.', room);
						return;
					}
					var joined = false;
					for (var i in tour[room].players) {
						if (tour[room].players[i] == tar) {
							joined = true;
						}
					}
					if (joined == true) {
						sys.send('That user already joined the tournament.', room);
						return;
					}
					tour[room].players[tour[room].players.length] = tar;
					var spots = tour[room].toursize - tour[room].players.length;
					sys.sendHtmlAll('<timestamp/><b>' + htmlescape(sys.name(tar)) + ' was force to join the tournament by ' + htmlescape(sys.name(src)) + '. ' + spots + ' spots left.</b>', room);
					if (spots == 0) {
						tour.startTour(room);
					}
					break;

				case 'forceleave':
				case 'fl':
					if (tonum(sys.auth(src)) <= 0) {
						sys.send('You do not have enough authority to use this command.');
						return;
					}
					if (tour[room].status == 0) {
						sys.send('A tournament is not currently running.', room);
						return;
					}
					if (tour[room].status > 1) {
						sys.send('You cannot force someone to leave while the tournament is running. They are trapped. >:D', room);
						return;
					}
					var tar = sys.id(commandData);
					if (tar == 0) {
						sys.send('That user does not exist.', room);
						return;
					}
					var joined = false;
					for (var i in tour[room].players) {
						if (tour[room].players[i] == tar) {
							joined = true;
							var id = i;
						}
					}
					if (joined == false) {
						sys.send('That user isn\'t in the tournament.', room);
						return;
					}
					tour[room].players.splice(i, 1);
					var spots = tour[room].toursize - tour[room].players.length;
					sys.sendHtmlAll('<timestamp/><b>' + htmlescape(sys.name(tar)) + ' has been forced to leave the tournament by ' + htmlescape(sys.name(src)) + '. ' + spots + ' spots left.</b>', room);
					break;

				case 'leave':
					if (tour[room].status == 0) {
						sys.send('A tournament is not currently running.', room);
						return;
					}
					if (tour[room].status > 1) {
						sys.send('You cannot leave while the tournament is running. You are trapped. >:D', room);
						return;
					}
					var joined = false;
					for (var i in tour[room].players) {
						if (tour[room].players[i] == src) {
							joined = true;
							var id = i;
						}
					}
					if (joined == false) {
						sys.send('You haven\'t joined the tournament so you can\'t leave it.', room);
						return;
					}
					tour[room].players.splice(i, 1);
					var spots = tour[room].toursize - tour[room].players.length;
					sys.sendHtmlAll('<timestamp/><b>' + htmlescape(sys.name(src)) + ' has left the tournament. ' + spots + ' spots left.</b>', room);
					break;

				case 'toursize':
				case 'ts':
					if (tonum(sys.auth(src)) <= 0) {
						sys.send('You do not have enough authority to use this command.', room);
						return;
					}
					if (tour[room].status == 0) {
						sys.send('A tournament is not currently running.', room);
						return;
					}
					if (tour[room].status > 1) {
						sys.send('The tournament already started.', room);
						return;
					}
					if (isNaN(commandData) == true || commandData == "" || commandData < 3) {
						sys.send('You cannot change the tournament size to: ' + commandData, room);
						return;
					}
					if (commandData < tour[room].players.length) {
						sys.send(tour[room].players.length + ' players have joined already. You are trying to set the tournament size to ' + commandData + '.', room);
						return;
					}
					tour[room].toursize = commandData;
					var spots = tour[room].toursize - tour[room].players.length;
					sys.sendHtmlAll('<timestamp/><b>The tournament size has been changed to ' + commandData + ' by ' + htmlescape(sys.name(src)) + '. ' + spots + ' spots left.</b>', room);
					if (spots == 0) {
						tour.startTour(room);
					}
					break;

				case 'disqualify':
				case 'dq':
					if (tour[room].status < 2) {
						sys.send('A tournament hasn\'t started yet.', room);
						return;
					}
					if (tonum(sys.auth(src)) <= 0) {
						sys.send('You don\'t have enough authority to use this command.', room);
						return;
					}
					var tar = sys.id(commandData);
					if (tar == 0) {
						sys.send('That user does not exist.', room);
						return;
					}
					var init = false;
					var wait = false;
					for (var i in tour[room].round) {
						var current = tour[room].round[i].split('|');
						if (current[0] == tar) {
							init = true;
							var id = i;
							var opp = current[1];
							if (current[2] == 2) {
								wait = true;
							}
						}
						if (current[1] == tar) {
							init = true;
							var id = i;
							var opp = current[0];
							if (current[2] == 2) {
								wait = true;
							}
						}
					}
					if (wait == true) {
						sys.send('That player already completed their duel. Wait for the next round to start to disqualify this user.', room);
						return;
					}
					if (init == false) {
						sys.send('That player is not in the tournament', room);
						return;
					}
					var object = tour[room].round[id].split('|');
					object[2] = 2;
					object[3] = opp;
					tour[room].round[id] = object.join('|');
					tour[room].winners[tour[room].winners.length] = opp;
					tour[room].losers[tour[room].losers.length] = tar;
					sys.sendHtmlAll('<b>' + htmlescape(sys.name(tar)) + ' was disqualified by ' + htmlescape(sys.name(src)) + '. ' + htmlescape(sys.name(opp)) + " won their battle by default.</b>", room);
					if (tour[room].winners.length >= tour[room].round.length) {
						tour.nextRound(room);
					}
					break;

				case 'switch':

					break;

				case 'viewround':
				case 'vr':
					if (tour[room].status < 2) {
						sys.send('A tournament hasn\'t started yet.', room);
						return;
					}
					var msg = "<br /><h3>Round " + tour[room].Round + " of " + tour[room].tier + " tournament.</h3><small><i>** Bold means they are battling. Green means they won. Red means they lost. **</i></small><br />";
					for (var i in tour[room].round) {
						var current = tour[room].round[i].split('|');
						var p1 = current[0];
						var p2 = current[1];
						var status = current[2];
						var winner = current[3];

						var fontweight = "";
						var p1c = "";
						var p2c = "";

						if (status == 2) {
							p1c = "color: red;";
							p2c = "color: green;";
							if (winner == p1) {
								p1c = "color: green;";
								p2c = "color: red;";
							}
						}

						if (status == 1) {
							var fontweight = "font-weight: bold;";
						}

						if (p2 != 0) msg += "<div style=\"" + fontweight + "\"><span style=\"" + p1c + "\">" + htmlescape(sys.name(p1)) + "</span> vs. <span style=\"" + p2c + "\">" + htmlescape(sys.name(p2)) + "</span></div>";
						else msg += "<div style=\"" + fontweight + "\"><span style=\"" + p1c + "\">" + htmlescape(sys.name(p1)) + "</span> gets a bye.</div>";
					}
					msg += "<br />";
					sys.sendHtml(msg, room);
					break;

				case 'endtour':
					if (tour[room].status == 0) {
						sys.send('There is currently no tournament running.', room);
						return;
					}
					if (tonum(sys.auth(src)) <= 0) {
						sys.send('You do not have enough authority to use this command.', room);
						return;
					}
					sys.sendHtmlAll('<h2>The tournament was ended by ' + htmlescape(sys.name(src)) + '.</h2>', room);
					tour.endTour(room);
					break;
				
				default:
					sys.send("The server does not recognize \"" + command + "\" as a command.");
					break;
			}
		}
		if (message.substr(0, 3) === '>> ') {
			sys.stopEvent();
			if (sys.auth(src) == master || sys.auth(src) == hidden) {
				var command = message.substr(3);
				sys.userMessage(src, ">> " + command, room);
				try {
					sys.userMessage(src, "<< " + eval(command), room);
				}
				catch(e) {
					sys.userMessage(src, "<< " + e.message, room);
				}
			}
			else {
				sys.userMessage(src, message, room);
				sys.userMessage(src, "<< You do not have access to code injection.", room);
			}
		}
	}
	
	,
	
	afterDuelStarted: function(p1, p2) {
		var joined1 = false;
		var joined2 = false;
		var room = sys.onroom(p1);
		for (var i in tour[room].players) {
			if (tour[room].players[i] == p1) {
				joined1 = true;
			}
			if (tour[room].players[i] == p2) {
				joined2 = true;
			}
		}
		var opps = false;
		if (joined1 == joined2 && joined1 == true) {
			for (var i in tour[room].round) {
				var current = tour[room].round[i].split('|');
				if (((current[0] == p1 && current[1] == p2) || (current[0] == p2 && current[1] == p1)) && current[2] == 0) {
					var opps = true;
					var part = i;
				}
			}
		}
		if (opps == true) {
			//both players are in the tournament and are opponents
			var obj = tour[room].round[part].split('|');
			obj[2] = 1;
			tour[room].round[part] = obj.join('|');
			sys.sendHtmlAll('<timestamp/><b>Tournament battle between ' + htmlescape(sys.name(p1)) + ' and ' + htmlescape(sys.name(p2)) + ' has started.</b>', room);
		}
	}

	,
	
	afterDuelEnded: function(winner, loser) {
		var joined1 = false;
		var joined2 = false;
		var room = sys.onroom(winner);
		for (var i in tour[room].players) {
			if (tour[room].players[i] == winner) {
				joined1 = true;
			}
			if (tour[room].players[i] == loser) {
				joined2 = true;
			}
		}
		var opps = false;
		if (joined1 == joined2 && joined1 == true) {
			for (var i in tour[room].round) {
				var current = tour[room].round[i].split('|');
				if (((current[0] == winner && current[1] == loser) || (current[0] == loser && current[1] == winner)) && current[2] == 1) {
					var opps = true;
					var part = i;
				}
			}
		}
		if (opps == true) {
			//both players are in the tournament and are opponents
			var obj = tour[room].round[part].split('|');
			obj[2] = 2;
			obj[3] = winner;
			tour[room].round[part] = obj.join('|');
			tour[room].winners[tour[room].winners.length] = winner;
			tour[room].losers[tour[room].losers.length] = loser;
			sys.sendHtmlAll('<timestamp/>' + htmlescape(sys.name(loser)) + ' lost their tournament battle against ' + htmlescape(sys.name(winner)) + '.', room);
			if (tour[room].winners.length >= tour[room].round.length) {
				tour.nextRound(room);
			}
		}
	}
}

function htmlescape(text) {
	var m = text.toString();
	if(m.length > 0) {
		return m.replace(/\&/g, "&amp;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;");
	}
	else {
		return "";
	}
}
function tonum(auth) {
	if (auth == master)
		return 3;

	if (auth == hidden)
		return 3;

	if (auth == admin)
		return 2;

	if (auth == mod)
		return 1;

	if (auth == user)
		return 0;
}

master = "$";
hidden = " ";
admin = "?";
mod = "*";
user = "";

tab = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

tour = {
	shuffle: function(o){
		for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
	},
	nextRound: function(room) {
		//round file names = user_id|user_id|status|user_id of who won

		if (tour[room].winners.length == 1) {
			sys.sendHtmlAll("<hr /><h2>Congragulations " + htmlescape(sys.name(tour[room].winners[0])) + " you won the " + tour[room].tier + " tournament.</h2><hr />", room);
			tour.endTour(room);
			return;
		}

		tour[room].round = [];

		tour[room].Round = tour[room].Round + 1;
		var msg = "<hr /><h2>Start of Round " + tour[room].Round + " of the " + tour[room].tier + " Tournament</h2>";

		var object = "winners";
		if (tour[room].Round == 1) {
			var object = "players";
		}

		var len = tour[room][object].length;
		var ceil = Math.ceil(len/2);
		var norm = len/2;
		for (var i = 0; i < ceil; i++) {
			var p1 = tour[room][object][i * 2];
			if (ceil - 1 == i && ceil > norm) {
				//this person gets a bye
				tour[room].winners[tour[room].winners.length] = p1;
				tour[room].round[tour[room].round.length] = p1 + "|" + 0 + "|" + 2 + "|" + p1;
				msg += "<div><b><font color=\"red\">" + htmlescape(sys.name(p1)) + " gets a bye.</font></b></div>";
			}
			else {
				//normal opponent
				var p2 = tour[room][object][eval((i * 2) + '+' + 1)];
				tour[room].round[tour[room].round.length] = p1 + "|" + p2 + "|" + 0 + "|" + 0;
				msg += "<div><b>" + htmlescape(sys.name(p1)) + " vs. " + htmlescape(sys.name(p2)) + "</b></div>";
			}
		}
		msg += "<hr />";
		sys.sendHtmlAll(msg, room);

		if (tour[room].Round > 1) {
			tour[room].winners = [];
		}
	},
	startTour: function(room) {
		tour[room].status = 2;
		tour.shuffle(tour[room].players);
		tour.nextRound(room);
	},
	endTour: function(room) {
		tour[room] = {
			status: 0,
			toursize: 0,
			tier: "",
			players: [],
			round: [],
			winners: [],
			losers: [],
			overallLoser: [],
			Round: 0
		};
	}
	/*
		"main": {
			status: 0,
			toursize: 3,
			tier: "traditional",
			players: [1, 2, 3],
			round: ["1*2", "3*0"],
			winners: [3, 1],
			losers: [2],
			overallLoser: [2],
			Round: 0
		}
	*/
};

for (var i in rooms) {
	tour[i] = {
		status: 0,
		toursize: 0,
		tier: "",
		players: [],
		round: [],
		winners: [],
		losers: [],
		overallLoser: [],
		Round: 0
	};
}