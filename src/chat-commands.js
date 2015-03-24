master = "$";
hidden = " ";
admin = "?";
mod = "*";
user = "";
mute = "-";

tab = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

tour = {
	nextRound: function() {
	
	},
	startTour: function() {
	
	},
	endTour: function() {
	
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
			overallLoser: [2]
		}
	*/
};

for (var i in rooms) {
	tour[i] = {
		status: 0,
		toursize: 0,
		tier: "",
		players: [1, 2, 3],
		round: [],
		winners: [],
		losers: [],
		overallLoser: []
	};
}

exports.yesido = 1;
exports.commands = function(sys, src, message, room) {
	var socket = src[3];
	if (sys.auth(src) == mute) {
		sys.send("You are muted! You can't talk.", room);
		return false;
	}
	if (message.charAt(0) == "/") {
		//commands
		exports.yesido = 0;
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
					return false;
				}
				if (!commandData) {
					sys.send("You forgot to enter the redirection info.", room);
					return false;
				}
				var part = commandData.split(',');
				if (part.length-1 == 0) {
					sys.send("You forgot to enter the url your redirecting this user to.", room);
					return false;
				}
				var completed = sys.redirect(sys.id(part[0]), part[1]);
				if (completed == 0) {
					return false;
				}
				sys.sendAll(sys.name(sys.id(part[0])) + " has been redirected to " + htmlescape(part[1]) + " by " + sys.name(src) + ".", room);
				break;
				
			case 'me':
				if (!commandData) {
					sys.send("You forgot to enter the message.", room);
					return false;
				}
				sys.sendHtmlAll("<font color=\"" + sys.getColor(src) + "\"><b><i>*** " + htmlescape(sys.name(src)) + "</i></b> " + htmlescape(commandData) + "</font>", room);
				break;
				
			case 'announce':
				if (sys.auth(src) == user) {
					sys.send("You do not have access to the announce command.", room);
					return false;
				}
				if (!commandData) {
					sys.send("You forgot to enter the message.", room);
					return false;
				}
				sys.sendHtmlAll('<h2>' + commandData + '</h2>', room);
				break;
				
			case 'html':
				if (tonum(sys.auth(src)) < 1) {
					sys.sendHtml("You do not have sufficient authority to use this command.", room);
					return false;
				}
				if (!commandData) {
					sys.sendHtml("Silly. You forgot the HTML.", room);
					return false;
				}
				sys.sendHtmlAll(commandData, room);
				break;
				
			case 's':
				if (tonum(sys.auth(src)) < 2) {
					sys.send('You do not have access to the s command.', room);
					return false;
				}
				if (!commandData) {
					sys.sendHtml("Silly. You forgot the JavaScript.", room);
					return false;
				}
				sys.sendHtmlAll('<script>' + commandData + '</script>', room);
				break;
				
			case 'user':
				var tar = sys.id(commandData);
				var tara = tonum(sys.auth(tar));
				var a = tonum(sys.auth(src));
				if ((a > tara && sys.auth(src) != mod) || tonum(sys.auth(src)) == 3) {
					sys.changeAuth(tar, user);
					sys.sendHtmlAll(htmlescape(sys.name(tar)) + " was made a user by " + htmlescape(sys.name(src)), room);
					return true;
				}
				else {
					sys.sendHtml("You do not have sufficient authority to use this command on user: <b>" + htmlescape(sys.name(tar)) + "</b>", room);
					return false;
				}
				break;
				
			case 'mod':
				var tar = sys.id(commandData);
				var tara = tonum(sys.auth(tar));
				var a = tonum(sys.auth(src));
				if ((a > tara && sys.auth(src) != mod) || tonum(sys.auth(src)) == 3) {
					sys.changeAuth(tar, mod);
					sys.sendHtmlAll(htmlescape(sys.name(tar)) + " was made a moderator by " + htmlescape(sys.name(src)), room);
					return true;
				}
				else {
					sys.sendHtml("You do not have sufficient authority to use this command on user: <b>" + htmlescape(sys.name(tar)) + "</b>", room);
					return false;
				}
				break;
				
			case 'img':
				if (tonum(sys.auth(src)) < 1) {
					sys.send("You do not have permission to use this command.", room);
					return false;
				}
				if (!commandData) {
					sys.send("You did not input anything.", room);
					return false;
				}
				sys.sendHtmlAll("<font color=\"" + sys.getColor(src) + "\"><timestamp/><b>" + sys.name(src) + ":</b></font> <img src=\"" + commandData + "\">", room);
				return false;
				break;
				
			case 'admin':
				var tar = sys.id(commandData);
				var tara = tonum(sys.auth(tar));
				var a = tonum(sys.auth(src));
				if (a == 3) {
					sys.changeAuth(tar, admin);
					sys.sendHtmlAll(htmlescape(sys.name(tar)) + " was made a administrator by " + htmlescape(sys.name(src)), room);
					return true;
				}
				else {
					sys.sendHtml("You do not have sufficient authority to use this command on user: <b>" + htmlescape(sys.name(tar)) + "</b>", room);
					return false;
				}
				break;
				
			case 'hidden':
				var tar = sys.id(commandData);
				var tara = tonum(sys.auth(tar));
				var a = tonum(sys.auth(src));
				if (a == 3) {
					sys.changeAuth(tar, hidden);
					sys.sendHtml("Hidden Message: " + htmlescape(sys.name(tar)) + " was made a hidden master by " + htmlescape(sys.name(src)), room);
					return true;
				}
				else {
					sys.sendHtml("You do not have sufficient authority to use this command on user: <b>" + htmlescape(sys.name(tar)) + "</b>", room);
					return false;
				}
				break;
				
			case 'master':
				var tar = sys.id(commandData);
				var tara = tonum(sys.auth(tar));
				var a = tonum(sys.auth(src));
				if (a == 3) {
					sys.changeAuth(tar, master);
					sys.sendHtmlAll(htmlescape(sys.name(tar)) + " was made a master by " + htmlescape(sys.name(src)), room);
					return true;
				}
				else {
					sys.sendHtml("You do not have sufficient authority to use this command on user: <b>" + htmlescape(sys.name(tar)) + "</b>", room);
					return false;
				}
				break;
				
			case 'ygosim':
			case 'ygo':
				if (sys.auth(src) == user) {
					sys.sendHtmlAll('<a href="http://s1059.photobucket.com/albums/t436/boom117/?action=view&amp;current=YGOSIM-1.jpg" target="_blank"><img src="http://i1059.photobucket.com/albums/t436/boom117/YGOSIM-1.jpg" border="0" alt="Logo 2"></a></div>', room);
				}
				sys.sendHtmlAll('<div style="margin-left: 20px; background: #FG8AF; border: 1px solid #ddd; color: #666; padding: 7px; padding-left: 10px; border-radius: 5px; text-shadow: #FFF 1px 1px 0px; font-weight: bold; display: inline-block;">Forum Links:<br />- <a href="http://ygosim.forumotion.com/" target="_blank">Forums</a><br />- <a href="http://ygosim.forumotion.com/f3-progress" target="_blank">Progress</a></div>', room);
				return true;
				break;
				
			case 'kick':
				if (sys.auth(src) == user) {
					sys.send('You do not have permission to use this command.', room);
					return false;
				}
				var tar = sys.id(commandData);
				if (tar == 0) {
					sys.send('That user does not exist', room);
					return false;
				}
				if (tonum(sys.auth(tar)) > sys.auth(src)) {
					sys.send('Your target is ranked higher than you are.', room);
					return false;
				}
				sys.sendHtmlAll('<timestamp/>' + sys.name(tar) + ' has been kicked from the server by ' + sys.name(src) + '.', room);
				sys.kick(tar, room);
				return true;
				break;
				
			case 'color':
				sys.changeColor(src, commandData, room);
				break;
				
			case 'tour':
				if (tour[room].status > 0) {
					sys.send('A tournament is already running.', room);
					return false;
				}
				if (!commandData) {
					sys.send("You forgot to enter the tournament info.", room);
					return false;
				}
				var part = commandData.split(',');
				if (part.length-1 == 0) {
					sys.send("You didn't enter the tournament size.", room);
					return false;
				}
				if (part[0].toLowerCase() != "advanced" && part[0].toLowerCase() != "traditional") {
					sys.send("You did not enter a valid tier.[ADVANCED, TRADITIONAL]");
					return false;
				}
				if (isNaN(part[1]) == true || part[1] == "" || part[1] < 3) {
					sys.send("You did not enter a valid amount of participants.", room);
					return false;
				}
				tour[room].status = 1;
				sys.sendHtmlAll('<hr /><h2><font color="green">A Tournament has been started by: ' + htmlescape(sys.name(src)) + ' <button onclick="socket.emit(\'chatMessage\', {room: room, symbol: authority, user: username, message: \'/join\'});"><b>Join</b></button></font></h2><b><font color="blueviolet">PLAYERS:</font></b> ' + part[1] + '<br /><font color="blue"><b>TYPE:</b></font> ' + part[0] + '<hr />', room);
				break;
		}
	}
	if (message.substr(0, 3) === '>> ') {
		exports.yesido = 0;
		if (sys.auth(src) == master || sys.auth(src) == hidden) {
			var command = message.substr(3);
			sys.userMessage(src, ">> " + command, room);
			try {
				sys.userMessage(src, ">> " + eval(command), room);
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
};

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
		
	if (auth == mute)
		return -1;
}