var socket = io.connect('http://' + host + ":" + port);

$(document).ready(function() {
	mainChatMessagesScrollCache = "";
	mainChatMessages = [];
	mainChatMessagesScroll = 0;
	challenges = {};
	contexthelper = 0;
	pms = {};
	draggingpm = false;
	attacking = 0;
	attackerslot = 0;
	onslot = 0;
	onslotid = "";
	shufflinshufflinshufflin = 0;
	//add shuffle elems
	for (var i = 1; i < 21; i++) {
		$("#shuffle").append('<img src="./card.png" id="sc' + i + '" style="left: ' + i*1 + 'px;top: ' + i*0.25 + 'px" />');
		rotate('sc' + i, -55);
	}
	dmouse = ""; //card your mousing over during a duel
	users = {};
	duel = {
		status: 0,
		phase: "dp",
		turn: "",
		winner: "",
		spectators: [],
		you: {
			borrowed: ["slot"],
			status: "",
			id: 0,
			name: "",
			points: 8000,
			hand: [""],
			grave: [""],
			deck: [""],
			decklen: 0,
			extra: [""],
			rfg: [""],
			side: [""],
			field: [""],
			overlayed: {
				"2": [],
				"3": [],
				"4": [],
				"5": [],
				"6": []
			},
			selected: ""
		},
		opp: {
			borrowed: ["slot"],
			status: "",
			id: 0,
			name: "",
			points: 8000,
			hand: [""],
			grave: [""],
			deck: [""],
			decklen: 0,
			extra: [""],
			rfg: [""],
			side: [""],
			field: [""],
			overlayed: {
				"2": [],
				"3": [],
				"4": [],
				"5": [],
				"6": []
			},
			selected: "",
			reset: function(num) {
				for (var i = num; i < duel.opp.hand.length+1; i++) {
					$("#opphand ." + eval(i + '+' + 1)).attr("class", i);
				}
			}
		}
	};
	decks = {};
	$("#notice-close").mousedown(function() {
		$("#notice").fadeOut("slow");
	});
	loginner = 0;
	ygo = {
		finding: 0,
		userJoin: function(data) {
			users[data.userid] = data.userinfo;
			ygo.chatMessage('<td>' + ygo.timestamp() + htmlesc(data.username) + " joined.</td>");
			ygo.usersChanged();
			if (typeof pms[data.userid] != "undefined") {
				$("#pmlogs" + data.userid).append("<div><font color=\"grey\">" + htmlesc(data.username) + " came back.</font></div>");
			}
		},
		getUsers: function(data) {
			for (var i = 1; i < data.length; i++) {
				var current = data[i];
				users[current[0]] = data[i];
			}
			ygo.usersChanged();
		},
		usersChanged: function() {
			$("#usersList").html("");
			var sorted = [""];
			x = 1;
			for (var i in users) {
				sorted[x] = users[i][1].toLowerCase() + "|" + i;
				x++;
			}
			var sorted = sorted.sort();
			for (var i = 1; i < sorted.length; i++) {
				var current = sorted[i];
				var lio = current.lastIndexOf("|");
				var uid = current.substr(lio+1);
				var uname = users[uid][1];
				var ucolor = users[uid][2];
				$("#usersList").append('<div id="user' + uid + '"><font color="' + htmlescape(ucolor) + '">' + htmlescape(uname) + '</font></div>');
			}
		},
		userLeave: function(data) {
			if (data.userid == user_id) {
				room = "";
				username = "";
				user_id = 0;
			}
			delete users[data.userid];
			$("#user" + data.userid).remove();
			ygo.chatMessage('<td>' + ygo.timestamp() + htmlesc(data.username) + " left.</td>");
			if (typeof pms[data.userid] != "undefined") {
				$("#pmlogs" + data.userid).append("<div><font color=\"grey\">" + htmlesc(data.username) + " has logged off.</font></div>");
			}
		},
		chatMessage: function(data) {
			var ost = $("#logs").scrollTop();
			var osh = $("#logs").prop("scrollHeight") - $("#logs").height();
			$("#logs").append('<table><tr valign="top">' + data + '</tr></table>');
			if (ost == osh) {
				$("#logs").scrollTop($("#logs").prop("scrollHeight") - $("#logs").height());
			}
		},
		formatSendChat: function(data) {
			var message = '<td width="1px"><font color="' + users[data.uid][2] + '">' + ygo.timestamp() + '<i>' + data.symbol + "</i><strong>" + messageSanitize(data.user).replace(/ /g, '&nbsp;') + ":&nbsp;</strong></font></td><td>" + messageSanitize(data.message) + "</td>";
			ygo.chatMessage(message);
		},
		timestamp: function() {
			var d = new Date();
			var h = String(d.getHours());
			var m = String(d.getMinutes());
			var s = String(d.getSeconds());
			if (h.length < 2) {
				h = "0" + h;
			}
			if (m.length < 2) {
				m = "0" + m;
			}
			if (s.length < 2) {
				s = "0" + s;
			}
			return "(" + h + ":" + m + ":" + s + ")&nbsp;&nbsp;";
		},
		timestamp2: function() {
			var d = new Date();
			var h = String(d.getHours());
			var m = String(d.getMinutes());
			if (h.length < 2) {
				h = "0" + h;
			}
			if (m.length < 2) {
				m = "0" + m;
			}
			return "(" + h + ":" + m + ")";
		},
		pmuser: function(data) {
			var ost = $("#pmlogs" + data.uid).scrollTop();
			var osh = $("#pmlogs" + data.uid).prop("scrollHeight") - $("#logs" + data.uid).height();
			var ost2 = $("#pmlogs" + data.target).scrollTop();
			var osh2 = $("#pmlogs" + data.target).prop("scrollHeight") - $("#logs" + data.target).height();
			var color = "grey";
			if (data.uid == user_id) {
				var color = "darkblue";
			}
			if ($("#pmlogs" + data.uid).length > 0) $("#pmlogs" + data.uid).append('<div><font color="' + color + '">' + ygo.timestamp2() + ' <b>' + htmlesc(users[data.uid][1]) + '</b></font> ' + htmlesc(data.message) + '</div>');
			else $("#pmlogs" + data.target).append('<div><font color="' + color + '">' + ygo.timestamp2() + ' <b>' + htmlesc(users[data.uid][1]) + '</b></font> ' + htmlesc(data.message) + '</div>');
			if (ost == osh - 270) {
				$("#pmlogs" + data.uid).scrollTop($("#pmlogs" + data.uid).prop("scrollHeight") - $("#pmlogs" + data.uid).height());
			}
			if (ost2 == osh2 - 270) {
				$("#pmlogs" + data.target).scrollTop($("#pmlogs" + data.target).prop("scrollHeight") - $("#pmlogs" + data.target).height());
			}
		},
		//duel
		dfc: function(card) {
			var card = db[card];
			var set = card.set;
			var set0 = set.split('-')[0].toLowerCase();
			return '<img id="' + htmlescape(card.name) + '" src="http://ygosim.dyndns.org/ygo/cards/' + set0 + '/' + set + '.jpg" width="55" height="79" />';
		},
		imgsrc: function(card) {
			var card = db[card];
			var set = card.set;
			var set0 = set.split('-')[0].toLowerCase();
			return 'http://ygosim.dyndns.org/ygo/cards/' + set0 + '/' + set + '.jpg';
		},
		dfcdefense: function(card) {
			var card = db[card];
			var set = card.set;
			var set0 = set.split('-')[0].toLowerCase();
			return '<img id="' + htmlescape(card.name) + '" class="defense" src="http://ygosim.dyndns.org/ygo/cards/' + set0 + '/' + set + '.jpg" width="55" height="79" />';
		},
		facedowndfc: function(card) {
			var card = db[card];
			var set = card.set;
			var set0 = set.split('-')[0].toLowerCase();
			return '<img id="' + htmlescape(card.name) + '" src="./card.png" width="55" height="79" />';
		},
		facedowndefensedfc: function(card) {
			var card = db[card];
			var set = card.set;
			var set0 = set.split('-')[0].toLowerCase();
			return '<img id="' + htmlescape(card.name) + '" class="defense" src="./card.png" width="55" height="79" />';
		},
		format: {
			you: {
				hand: function(card) {
					var card = db[card];
					var set = card.set;
					var set0 = set.split('-')[0].toLowerCase();
					return '<img id="' + htmlescape(card.name) + '" src="http://ygosim.dyndns.org/ygo/cards/' + set0 + '/' + set + '.jpg" width="55" height="79" />';
				}
			},
			opp: {
				hand: function(card) {
					var card = db[card];
					var set = card.set;
					var set0 = set.split('-')[0].toLowerCase();
					return '<img id="' + htmlescape(card.name) + '" src="./card.png" width="55" height="79" />';
				}
			}
		},
		you: {
			tohand: function(data) {
				$("#youhand").append(ygo.format.you.hand(data).replace("/>", "class=\"youh" + duel["you"].hand.length + "\" />"));
				duel["you"].hand[duel["you"].hand.length] = data;
			},
			rhand: function(data) {
				$(".youh" + data).remove();
				duel["you"].hand.splice(data, 1);
			}
		},
		opp: {
			tohand: function(data) {
				$("#opphand").append(ygo.format.opp.hand(data).replace("/>", "class=\"opph" + duel["opp"].hand.length + "\" />"));
				duel["opp"].hand[duel["opp"].hand.length] = data;
			},
			rhand: function(data) {
				$(".opph" + data).remove();
				duel["opp"].hand.splice(data, 1);
			}
		},
		searchSlot: function(field, type) {
			//|1|, |2|, |3|, |4|, |5|, |6|, |7|, |8|, |9|, |10|, |11|
			// 4    3    5    2    6   11   10   12    9    13    1 
			if (type == "field") {
				return 1;
			}
			if (type == "monster") {
				if (typeof field[4] == "undefined") {return 4;}
				if (typeof field[3] == "undefined") {return 3;}
				if (typeof field[5] == "undefined") {return 5;}
				if (typeof field[2] == "undefined") {return 2;}
				if (typeof field[6] == "undefined") {return 6;}
			}
			if (typeof field[11] == "undefined") {return 11;}
			if (typeof field[10] == "undefined") {return 10;}
			if (typeof field[12] == "undefined") {return 12;}
			if (typeof field[9] == "undefined") {return 9;}
			if (typeof field[13] == "undefined") {return 13;}
			return 0;
		},
		searchUpperSlot: function(field) {
			if (typeof field[4] == "undefined") {return 4;}
			if (typeof field[3] == "undefined") {return 3;}
			if (typeof field[5] == "undefined") {return 5;}
			if (typeof field[2] == "undefined") {return 2;}
			if (typeof field[6] == "undefined") {return 6;}
			return 0;
		},
		searchLowerSlot: function(field) {
			if (typeof field[11] == "undefined") {return 11;}
			if (typeof field[10] == "undefined") {return 10;}
			if (typeof field[12] == "undefined") {return 12;}
			if (typeof field[9] == "undefined") {return 9;}
			if (typeof field[13] == "undefined") {return 13;}
			return 0;
		},
		serverDuelChatMessage: function(data) {
			var ost = $("#duel-chat-logs").scrollTop();
			var osh = $("#duel-chat-logs").prop("scrollHeight") - $("#duel-chat-logs").height() - 4;
			$("#duel-chat-logs").append('<div>' + data.message + '</div>');
			if (ost == osh) {
				$("#duel-chat-logs").scrollTop($("#duel-chat-logs").prop("scrollHeight") - $("#duel-chat-logs").height());
			}
		},
		duelChatMessage: function(data) {
			var ost = $("#duel-chat-logs").scrollTop();
			var osh = $("#duel-chat-logs").prop("scrollHeight") - $("#duel-chat-logs").height() - 4;
			var color = "red";
			if (data.userid == user_id) {
				var color = "blue";
			}
			$("#duel-chat-logs").append('<div><font color="' + color + '"><b>' + data.username + ':</b></font> ' + data.message + '</div>');
			if (ost == osh) {
				$("#duel-chat-logs").scrollTop($("#duel-chat-logs").prop("scrollHeight") - $("#duel-chat-logs").height());
			}
		},
		resethand: function(slotnum) {
			$("#youhand").html("");
			for (var i = 1; i < duel.you.hand.length; i++) {
				$("#youhand").append(ygo.format.you.hand(duel.you.hand[i]).replace('/>', 'class="' + i + '" />'));
			}
		}
	};
	authority = "";
	if (!cookie("username")) {
		username = "";
		user_id = 0;
		$("#user-form").fadeIn("slow", function() {
			$("#user-form-input").focus();
		});
	}
	else {
		username = cookie("username");
		var pass = cookie("password");
		$.ajax({
			type: "post",
			url: "post.php",
			data: "d=check-registered&u=" + username + "&p=" + pass,
			success: function(data) {
				if (data == 0 || data == 2) {
					socket.emit('join', {
						room: room,
						username: username,
						color: cookie("color"),
					});
				}
				else {
					username2 = username;
					username = "";
					loginner = 1;
					$("#o_r").click();
				}
				if (data == 2) {
					loginner = 1;
				}
			}
		});
	}
	$("#usersList div").live("contextmenu", function(e) {
		$(".selectedUser").attr("class", "");
		this.className = "selectedUser";
		selected_user = this.id.replace('user', '');
		$("#cmenu").html('<li><a href="#">Challenge</a></li><li><a href="#">View Ranking</a></li><li><a href="#">Private Message</a></li>');
		$("#allContext").css({
			left: e.pageX + "px",
			top: e.pageY + "px"
		}).fadeIn();
		return false;
	});
	$("#allContext a").live('click', function(e) {
		$("#allContext").hide();
		switch(this.innerHTML.toLowerCase()) {
			case 'private message':
				if (selected_user == user_id) return false;
				if ($("#pm" + selected_user).length > 0) {
					$("#pm" + selected_user).show();
				}
				else {
					$("body").append('<div class="pm" id="pm' + selected_user + '"><div class="pmheader unselectable" id="' + selected_user + '"><b>PM: </b> ' + htmlesc(users[selected_user][1]) + '<span class="pmexit" onclick="$(\'#pm' + selected_user + '\').fadeOut();">X</span></div><div class="pmlogs" id="pmlogs' + selected_user + '"></div><input type="text" class="pminput" id="' + selected_user + '" /></div>');
					pms[selected_user] = users[selected_user];
				}
				break;
			
			case 'challenge':
				if (selected_user == user_id) return false;
				if (typeof challenges[selected_user] != "undefined") return false;
				$("#chal-o-choose-deck-val").html("");
				$("#o-choose-deck-target").html(htmlesc(users[selected_user][1]));
				for (var i in decks) {
					$("#chal-o-choose-deck-val").append("<option>" + i + "</option>");
				}
				$("#chal-o-choose-deck").css({
					left: e.pageX + "px",
					top: e.pageY + "px"
				}).show();
				break;
		}
		return false;
	});
	$("#chal-o-choose-deck-click").click(function() {
		$("#chal-o-choose-deck").hide();
		var deck = $("#chal-o-choose-deck-val").val();
		if (typeof decks[deck] == "undefined") {
			notice("That deck does not exist.");
			return false;
		}
		if (typeof db == "undefined") return false;
		var data = {
			challenger: user_id,
			target: selected_user,
			deck: decks[deck]
		};
		challenges[selected_user] = data;
		socket.emit('challenge', data);
	});
	$(".pminput").live('keypress', function(e) {
		if (e.keyCode == 13) {
			if (this.value.replace(/ /g, '') == '') return false;
			if (this.id == user_id) return false;
			var target = users[this.id];
			if (typeof target == "undefined") return false;
			var data = {
				uid: user_id,
				target: target[0],
				message: this.value
			};
			ygo.pmuser(data);
			socket.emit('pmuser', data);
			this.value = "";
			return;
		}
	});
	$(".pmheader").live('mousedown', function() {
		draggingpm = $("#pm" + this.id);
		$("body").attr("class", "unselectable");
	});
	$("body").mousemove(function(e) {
		if (draggingpm != false) {
			$(draggingpm).css({
				left: e.pageX - 10 + "px",
				top: e.pageY - 10 + "px"
			});
		}
	}).mouseup(function() {
		draggingpm = false;
		$("body").attr("class", "");
	});
	$("#user-form-input").focus(function() {
		if (this.value == "Username...") {
			this.value = "";
		}
	}).blur(function() {
		if (this.value == "") {
			this.value = "Username...";
		}
	}).keypress(function(e) {
		if (e.keyCode == 13 && username == "" && this.value != "Username..." && this.value.replace(/ /g, '') != "") {
			$("#user-form").fadeOut("slow");
			bake("username", this.value, 30);
			var pass = cookie("password");
			username = this.value;
			$.ajax({
				type: "post",
				url: "post.php",
				data: "d=check-registered&u=" + username + "&p=" + pass,
				success: function(data) {
					if (data == 0) {
						socket.emit('join', {
							room: room,
							username: username,
							color: cookie("color"),
						});
					}
					else {
						username2 = username;
						username = "";
						eatcookie("username");
						loginner = 1;
						$("#o_r").click();
					}
				}
			});
		}
	});
	$("#chat-message").keypress(function(e) {
		if (e.keyCode == 13) {
			$("#o_s").click();
			return false;
		}
	}).keydown(function(e) {
		if (e.keyCode == 38) {
			//up
			if (mainChatMessagesScroll == 0) {
				mainChatMessagesScrollCache = this.value;
			}
			mainChatMessagesScroll++;
			if (mainChatMessagesScroll > mainChatMessages.length) {
				mainChatMessagesScroll--;
				return false;
			}
			this.value = mainChatMessages[mainChatMessages.length - mainChatMessagesScroll];
			return false;
		}
		if (e.keyCode == 40) {
			//down
			mainChatMessagesScroll--;
			if (mainChatMessagesScroll == -1) {
				mainChatMessagesScroll++;
				return false;
			}
			if (mainChatMessagesScroll == 0) {
				this.value = mainChatMessagesScrollCache;
				return false;
			}
			this.value = mainChatMessages[mainChatMessages.length - mainChatMessagesScroll];
			return false;
		}
	});
	$("#o_db").click(function() {
		$("#it-content").html("");
		for (var deckname in decks) {
			$("#it-content").append('<div class="file">' + deckname + '</div>');
		}
		$("#deck-manager").show();
		$("#decklist-it").val("Paste your deck here.").select();
	});
	$("#o_r").click(function() {
		if (username != "" && loginner == 1) {
			return false;
		}
		$("#register-form").fadeIn("slow", function() {
			$("#register-form-input").focus().val(username2);
		});
		if (loginner == 1) {
			$("#register-form-label").html("Login");
		}
		else {
			$("#register-form-label").html("Register");
		}
	});
	$("#o_fd").click(function() {
		if (ygo.finding == 0) {
			$("#o-choose-deck").show();
			$("#o-choose-deck-val").html("");
			for (var i in decks) {
				$("#o-choose-deck-val").append("<option>" + i + "</option>");
			}
			return false;
		}
		else {
			ygo.finding = 0;
			this.innerHTML = "Find Duel";
			socket.emit('cancelfind', user_id);
		}
	});
	$("#o-choose-deck-click").click(function() {
		if (ygo.finding == 0) {
			var deck = $("#o-choose-deck-val").val();
			if (typeof decks[deck] == "undefined") {
				notice("That deck does not exist.");
				return false;
			}
			if (typeof db == "undefined") return false;
			ygo.finding = 1;
			$("#o_fd").html("Cancel Find Duel");
			socket.emit('find', {
				user_id: user_id,
				deck: decks[deck]
			});
		}
		$("#o-choose-deck").hide();
	});
	$("#o_s").click(function() {
		if (user_id == 0 || !username || room == "") {
			ygo.chatMessage('<td>' + ygo.timestamp() + 'You are not connected to the server.</td>');
			$("#chat-message").val("");
			return false;
		}
		if ($("#chat-message").val().replace(/ /g, '') == "") {
			return false;
		}
		var message = $("#chat-message").val();
		mainChatMessages[mainChatMessages.length] = message;
		chatMessagesScroll = mainChatMessages.length;
		if (message.charAt(0) == "/") {
			$("#chat-message").val("").focus();
			//commands
			var pos = message.indexOf(' ');

			if (pos != -1) {
				var command = message.substring(1, pos);
				var commandData = message.substr(pos+1);
			}
			else {
				var command = message.substr(1);
				var commandData = "";
			}
			switch(command.toLowerCase()) {
				case 'nick':
					if (commandData.replace(/ /g, '') != "") {
						username = commandData;
						var pass = "";
						$.ajax({
							type: "post",
							url: "post.php",
							data: "d=check-registered&u=" + username + "&p=" + pass,
							success: function(data) {
								if (data == 0) {
									eatcookie("username");
									eatcookie("password");
									bake("username", username, 365);
									socket.emit('leave', {userid: user_id, room: room});
									socket.emit('join', {username: username, room: room, color: cookie("color")});
									loginner = 0;
								}
								else {
									username2 = username;
									username = "";
									eatcookie("username");
									loginner = 1;
									$("#o_r").click();
								}
							}
						});
						return false;
					}
					break;
					
				case 'ls':
					message = ">> for (var i in require.cache) delete require.cache[i];cc = require('./chat-commands.js');''";
					break;
				
				case 'clear':
					$("#logs").html("");
					break;
			}
		}
		socket.emit('chatMessage', {
			user: username,
			message: message,
			symbol: authority,
			room: room
		});
		$("#chat-message").val("").focus();
	});
	$("#register-form-input").focus(function() {
		if (this.value == "Username...") {
			this.value = "";
		}
	});
	$("#register-form-input").blur(function() {
		if (this.value == "") {
			this.value = "Username...";
		}
	});
	$("#register-form-input").keypress(function(e) {
		if (e.keyCode == 13) {
			$("#register-form-input2").focus();
		}
	});
	$("#register-form-input2").focus(function() {
		if (this.value == "Password...") {
			this.value = "";
		}
	}).blur(function() {
		if (this.value == "") {
			this.value = "Password...";
		}
	}).keypress(function(e) {
		if (e.keyCode == 13) {
			if ($("#register-form-input").val().replace(/ /g, '') == "" || $("#register-form-input").val() == "Username..." || this.value.replace(/ /g, '') == "" || this.value == "Password...") {
				return false;
			}
			if (loginner == 1) {
				var d = "login";
			}
			else {
				var d = "register";
			}
			if (username2 != "" && typeof username2 != "undefined" && typeof user_id != "undefined") {
				eatcookie("username");
				eatcookie("password");
				bake("username", username2, 365);
				socket.emit('leave', {userid: user_id, room: room});
				socket.emit('join', {username: username2, room: room, color: cookie("color")});
				loginner = 1;
				$("#register-form").hide();
				notice("Logged in successfully.");
				setTimeout(function() {
					$("#notice-close").mousedown();
					$("#chat-message").focus();
				}, 1000);
				return false;
			}
			var dataString = "d=" + d + "&u=" + $("#register-form-input").val() + "&p=" + this.value;
			$.ajax({
				type: "POST",
				url: "post.php",
				data: dataString,
				success: function(data) {
					if (loginner == 0) {
						if (data == 0) {
							username = $("#register-form-input").val();
							eatcookie("username");
							bake("username", $("#register-form-input").val(), 365);
							notice("Registered successfully.");
							$("#register-form-input2").val("");
							loginner = 1;
						}
						else {
							$("#register-form-input").focus().select();
							$("#notice-content").html("Name already registered.");
							$("#notice").fadeIn("slow", function() {
								$("#notice").fadeOut("fast", function() {
									$("#register-form").fadeIn("slow");
								});
							});
						}
					}
					else {
						if (data.split('*').length-1 > 0) {
							username = $("#register-form-input").val();
							eatcookie("username");
							bake("username", $("#register-form-input").val(), 365);
							bake("password", data.split('*')[1], 365);
							notice("Logged in successfully.");
							setTimeout(function() {
								$("#notice-close").mousedown();
								$("#chat-message").focus();
							}, 1000);
							rejoin();
							$("#register-form-input2").val("");
						}
						else {
							$("#register-form-input2").val("");
							$("#notice-content").html("The username or password is incorrect.");
							$("#notice").fadeIn("slow", function() {
								$("#notice").fadeOut("fast", function() {
									$("#register-form").fadeIn("slow");
								});
							});
						}
					}
				}
			});
			$("#register-form").hide();
		}
	});
	setInterval(function() {
		$("#logs").height($(".chat").height()-36);
	}, 2000);
		
	/*duel*/
	duelm = {
		drag: 0,
		OX: 0,
		OY: 0,
		SOX: 0,
		SOY: 0
	};
	$("#duel-chat-message").keypress(function(e) {
		if (e.keyCode == 13 && this.value.replace(/ /g, '') != "") {
			var data = {
				username: username,
				message: this.value,
				userid: user_id
			};
			socket.emit('duel-chat', data);
			ygo.duelChatMessage(data);
			this.value = "";
		}
	});
	choice = "";
	choice2 = "";
	$("#rock, #paper, #scissors").click(function() {
		if (choice2 != "" && choice != "") {
			return false;
		}
		$("#" + choice).css("outline", "none");
		choice = this.id;
		this.style.outline = "2px solid blue";
		if (choice2 != "") {
			playrps();
		}
		socket.emit("playrps", {
			userid: user_id,
			choice: this.id
		});
	});
	$("#gofirst").click(function() {
		$("#rps").fadeOut();
		socket.emit('rpschoose', {
			userid: user_id,
			choice: "FIRST"
		});
	});
	$("#gosecond").click(function() {
		$("#rps").fadeOut();
		socket.emit('rpschoose', {
			userid: user_id,
			choice: "SECOND"
		});
	});
	$("#youhand img").live('mouseover', function(e) {
		var offsetx = e.pageX - $(this).offset().left;
		var offsety = e.pageY - $(this).offset().top;
		var card = db[this.id];
		dmouse = this.id;
		dmouseid = this.className;
		switch(card.type) {
			case 'Effect Monster':
			case 'Normal Monster':
			case 'Ritual Monster':
				var ops = "<div>Reveal</div><div>B. of Deck</div><div>T. of Deck</div><div>Banish</div><div>To Grave</div><div>Spe. S. Def.</div><div>Spe. S. Atk.</div><div>Set</div><div>Summon</div>";
				break;
			case 'Spell':
			case 'Trap':
				var ops = "<div>Reveal</div><div>B. of Deck</div><div>T. of Deck</div><div>Banish</div><div>To Grave</div><div>Set</div><div>Activate</div>";
				break;
		}
		$("#hand-context").html(ops).css({
			left: e.pageX-offsetx + "px",
			top: $("#hand-context").css("top", $("#youhand").position().top-$("#hand-context").height()-2 + "px")
		}).show();
	}).live('mouseout', function() {
		$("#hand-context").hide();
	});
	$("#hand-context").mouseover(function() {
		this.style.display = "block";
	}).mouseout(function() {
		this.style.display = "none";
	});
	$("#hand-context div").live('click', function() {
		var doing = this.innerHTML.toLowerCase();
		var card = db[dmouse];
		var el = $("#youhand ." + dmouseid);
		switch(doing) {
			case 'reveal':
				
				break;
			case 'banish':
				duel.you.rfg[duel.you.rfg.length] = dmouse;
				duel.you.hand.splice(dmouseid, 1);
				el.remove();
				$("#youbanished").html(ygo.dfc(dmouse));
				socket.emit('HAND - banish', {
					num: dmouseid,
					userid: user_id
				});
				break;
			case 't. of deck':
				duel.you.hand.splice(dmouseid, 1);
				el.remove();
				socket.emit('HAND - t. of deck', {
					num: dmouseid,
					userid: user_id
				});
				break;
			case 'b. of deck':
				duel.you.hand.splice(dmouseid, 1);
				el.remove();
				socket.emit('HAND - b. of deck', {
					num: dmouseid,
					userid: user_id
				});
				break;
			case 'to grave':
				duel.you.grave[duel.you.grave.length] = dmouse;
				duel.you.hand.splice(dmouseid, 1);
				el.remove();
				$("#you7").html(ygo.dfc(dmouse));
				socket.emit('HAND - to grave', {
					num: dmouseid,
					userid: user_id
				});
				break;
			case 'spe. s. def.':
				var slot = ygo.searchSlot(duel.you.field, "monster");
				if (slot == 0) {return false;}
				duel.you.field[slot] = dmouse;
				$("#you" + slot).html(ygo.dfcdefense(dmouse));
				duel.you.hand.splice(dmouseid, 1);
				el.remove();
				socket.emit('HAND - spe. s. def', {
					num: dmouseid,
					userid: user_id
				});
				break;
			case 'spe. s. atk.':
				var slot = ygo.searchSlot(duel.you.field, "monster");
				if (slot == 0) {return false;}
				duel.you.field[slot] = dmouse;
				$("#you" + slot).html(ygo.dfc(dmouse));
				duel.you.hand.splice(dmouseid, 1);
				el.remove();
				socket.emit('HAND - spe. s. atk', {
					num: dmouseid,
					userid: user_id
				});
				break;
			case 'set':
				switch(card.type) {
					case 'Effect Monster':
					case 'Normal Monster':
					case 'Ritual Monster':
						var slot = ygo.searchSlot(duel.you.field, "monster");
						if (slot == 0) {return false;}
						duel.you.field[slot] = dmouse;
						$("#you" + slot).html(ygo.facedowndefensedfc(dmouse));
						duel.you.hand.splice(dmouseid, 1);
						el.remove();
						socket.emit('HAND - set', {
							num: dmouseid,
							userid: user_id,
							type: "monster"
						});
						break;
					case 'Spell':
					case 'Trap':
						var slot = ygo.searchSlot(duel.you.field, "s/t");
						if (slot == 0) {return false;}
						duel.you.field[slot] = dmouse;
						$("#you" + slot).html(ygo.facedowndfc(dmouse));
						duel.you.hand.splice(dmouseid, 1);
						el.remove();
						socket.emit('HAND - set', {
							num: dmouseid,
							userid: user_id,
							type: "s/t"
						});
						break;
				}
				break;
			case 'summon':
				var slot = ygo.searchSlot(duel.you.field, "monster");
				if (slot == 0) {return false;}
				duel.you.field[slot] = dmouse;
				$("#you" + slot).html(ygo.dfc(dmouse));
				duel.you.hand.splice(dmouseid, 1);
				el.remove();
				socket.emit('HAND - summon', {
					num: dmouseid,
					userid: user_id
				});
				break;
			case 'activate':
				var slot = ygo.searchSlot(duel.you.field, "s/t");
				if (slot == 0) {return false;}
				duel.you.field[slot] = dmouse;
				$("#you" + slot).html(ygo.dfc(dmouse));
				duel.you.hand.splice(dmouseid, 1);
				el.remove();
				socket.emit('HAND - activate', {
					num: dmouseid,
					userid: user_id
				});
				break;
		}
		ygo.resethand(dmouseid);
		$("#hand-context").hide();
	});
	$("#field-context div").live('click', function() {
		var choice = this.innerHTML.toLowerCase();
		if (onslot == 8) {
			//extra deck
			switch(choice) {
				case 'view':
					//display
					duel.you.status = "Viewing Extra Deck";
					youstatus(duel.you.status);
					$("#card-list-header").html(duel.you.status);

					socket.emit('extra - view', {
						userid: user_id
					});
					$("#card-list").fadeIn();
					$("#card-list-content").html("");
					for (var i = 1; i < duel.you.extra.length; i++) {
						$("#card-list-content").append(ygo.dfc(duel.you.extra[i]).replace('/>', 'class="' + i + '" />'));
					}
					break;
				case 'show':
					socket.emit('extra - show', {
						userid: user_id
					});
					break;
			}
		}
		else if (onslot == 14) {
			//main deck
			switch(choice) {
				case 'show':
					socket.emit('deck - show', {
						userid: user_id
					});
					break;
				case 'view':
					socket.emit('deck - view', {
						userid: user_id
					});
					break;
				case 'banish t.':
					socket.emit('banish t.', {
						userid: user_id
					});
					break;
				case 'mill':
					socket.emit('mill', {
						userid: user_id
					});
					break;
				case 'shuffle':
					socket.emit('shuffle', {
						userid: user_id
					});
					break;
				case 'draw':
					socket.emit('draw', {
						userid: user_id
					});
					break;
			}
		}
		else {
			var slot = onslot;
			var id = duel.you.field[slot];
			var type = cardtype(id);
			var el = $("#you" + slot);
			var img = $("#you" + slot + " img");
			if (onslot >= 2 && onslot < 7) {
				//upper
				if (type == "nest") {
					switch(choice) {
						case 'overlay':
							//need to do
							break;
						case 'to s/t':
							var stslot = ygo.searchLowerSlot(duel.you.field);
							if (stslot == 0) {
								return false;
							}
							$("#you" + stslot).html($("#you" + slot).html());
							$("#you" + stslot + " img").attr({"class": ""});
							duel.you.field[stslot] = duel.you.field[slot];
							duel.you.field[slot] = undefined;
							el.html("");
							socket.emit('nest - to s/t', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'to b. deck':
							duel.you.field[slot] = undefined;
							el.html("");
							socket.emit('nest - to b. deck', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'to t. deck':
							duel.you.field[slot] = undefined;
							el.html("");
							socket.emit('nest - to t. deck', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'to hand':
							duel.you.field[slot] = undefined;
							el.html("");
							$("#youhand").append(ygo.format.you.hand(id).replace('/>', 'class="' + duel.you.hand.length + '" />'));
							duel.you.hand[duel.you.hand.length] = id;
							socket.emit('nest - to hand', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'give control':
							var oppslot = ygo.searchUpperSlot(duel.opp.field);
							if (oppslot == 0) {
								return false;
							}
							$("#opp" + oppslot).html($("#you" + slot).html());
							duel.opp.field[oppslot] = duel.you.field[slot];
							duel.you.field[slot] = undefined;
							duel.opp.borrowed[duel.opp.borrowed.length] = oppslot;
							el.html("");
							socket.emit('nest - give control', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'banish':
							duel.you.rfg[duel.you.rfg.length] = id;
							duel.you.field[slot] = undefined;
							$("#youbanished").html(ygo.dfc(id));
							el.html("");
							socket.emit('nest - banish', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'set':
							img.attr({"class": "defense", "src": "./card.png"});
							socket.emit('nest - set', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'to def.':
							img.attr({"class": "defense"});
							socket.emit('nest - to def.', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'to grave':
							duel.you.grave[duel.you.grave.length] = id;
							duel.you.field[slot] = undefined;
							$("#you7").html(ygo.dfc(id));
							el.html("");
							socket.emit('nest - to grave', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'atk directly':
							attack(slot, 11);
							socket.emit('atk directly', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'attack':
							attacking = 1;
							attackerslot = slot;
							break;
						case 'to atk.':
							img.attr({"class": ""});
							socket.emit('nest - to atk.', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'flip':
							img.attr({"src": ygo.imgsrc(id)});
							socket.emit('nest - flip', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'flip summon':
							img.attr({"class": "", "src": ygo.imgsrc(id)});
							socket.emit('nest - flip summon', {
								userid: user_id,
								slot: slot
							});
							break;
					}
				}
				if (type == "extra") {
					switch(choice) {
						case 'overlay':
							//need to do
							break;
						case 'to s/t':
							var stslot = ygo.searchLowerSlot(duel.you.field);
							if (stslot == 0) {
								return false;
							}
							$("#you" + stslot).html($("#you" + slot).html());
							$("#you" + stslot + " img").attr({"class": ""});
							duel.you.field[stslot] = duel.you.field[slot];
							duel.you.field[slot] = undefined;
							el.html("");
							socket.emit('nest - to s/t', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'to extra':
							duel.you.extra[duel.you.extra.length] = id;
							duel.you.field[slot] = undefined;
							el.html("");
							socket.emit('extra deck monster - to extra', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'give control':
							var oppslot = ygo.searchUpperSlot(duel.opp.field);
							if (oppslot == 0) {
								return false;
							}
							$("#opp" + oppslot).html($("#you" + slot).html());
							duel.opp.field[oppslot] = duel.you.field[slot];
							duel.you.field[slot] = undefined;
							duel.opp.borrowed[duel.opp.borrowed.length] = oppslot;
							el.html("");
							socket.emit('nest - give control', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'banish':
							duel.you.rfg[duel.you.rfg.length] = id;
							duel.you.field[slot] = undefined;
							$("#youbanished").html(ygo.dfc(id));
							el.html("");
							socket.emit('nest - banish', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'set':
							img.attr({"class": "defense", "src": "./card.png"});
							socket.emit('nest - set', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'to def.':
							img.attr({"class": "defense"});
							socket.emit('nest - to def.', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'to atk.':
							img.attr({"class": ""});
							socket.emit('nest - to atk.', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'to grave':
							duel.you.grave[duel.you.grave.length] = id;
							duel.you.field[slot] = undefined;
							$("#you7").html(ygo.dfc(id));
							el.html("");
							socket.emit('nest - to grave', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'atk directly':
							attack(slot, 11);
							socket.emit('atk directly', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'attack':
							attacking = 1;
							attackerslot = slot;
							break;
						case 'flip':
							img.attr({"src": ygo.imgsrc(id)});
							socket.emit('nest - flip', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'flip summon':
							img.attr({"class": "", "src": ygo.imgsrc(id)});
							socket.emit('nest - flip summon', {
								userid: user_id,
								slot: slot
							});
							break;
					}
				}
				if (type == "overlayed") {
					switch(choice) {

					}
				}
				if (type == "attached") {
					switch(choice) {
						case 'detach':
							
							break;
						case 'banish':
							
							break;
					}
				}
			}
			if (onslot >= 9 && onslot < 14) {
				//lower
				if (type == "nest") {
					switch(choice) {
						case 'to mon. zone':
							var upslot = ygo.searchUpperSlot(duel.you.field);
							if (upslot == 0) {
								return false;
							}
							$("#you" + upslot).html($("#you" + slot).html());
							duel.you.field[upslot] = duel.you.field[slot];
							duel.you.field[slot] = undefined;
							el.html("");
							socket.emit('nest - to mon. zone', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'to b. deck':
							duel.you.field[slot] = undefined;
							el.html("");
							socket.emit('nest - to b. deck', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'to t. deck':
							duel.you.field[slot] = undefined;
							el.html("");
							socket.emit('nest - to t. deck', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'to hand':
							duel.you.field[slot] = undefined;
							el.html("");
							$("#youhand").append(ygo.format.you.hand(id).replace('/>', 'class="' + duel.you.hand.length + '" />'));
							duel.you.hand[duel.you.hand.length] = id;
							socket.emit('nest - to hand', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'set':
							img.attr({"src": "./card.png"});
							socket.emit('nest lower - set', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'banish':
							duel.you.field[slot] = undefined;
							duel.you.rfg[duel.you.rfg.length] = id;
							$("#youbanished").html(ygo.dfc(id));
							el.html("");
							socket.emit('nest - banish', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'to grave':
							duel.you.grave[duel.you.grave.length] = id;
							duel.you.field[slot] = undefined;
							$("#you7").html(ygo.dfc(id));
							el.html("");
							socket.emit('nest - to grave', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'activate':
							img.attr({"src": ygo.imgsrc(id)});
							socket.emit('nest - activate', {
								userid: user_id,
								slot: slot
							});
							break;
					}
				}
				if (type == "extra") {
					switch(choice) {
						case 'to extra':
							duel.you.extra[duel.you.extra.length] = id;
							duel.you.field[slot] = undefined;
							el.html("");
							socket.emit('extra deck monster - to extra', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'to mon. zone':
							var upslot = ygo.searchUpperSlot(duel.you.field);
							if (upslot == 0) {
								return false;
							}
							$("#you" + upslot).html($("#you" + slot).html());
							duel.you.field[upslot] = duel.you.field[slot];
							duel.you.field[slot] = undefined;
							el.html("");
							socket.emit('nest - to mon. zone', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'set':
							img.attr({"src": "./card.png"});
							socket.emit('nest lower - set', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'banish':
							duel.you.field[slot] = undefined;
							duel.you.rfg[duel.you.rfg.length] = id;
							$("#youbanished").html(ygo.dfc(id));
							el.html("");
							socket.emit('nest - banish', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'to grave':
							duel.you.grave[duel.you.grave.length] = id;
							duel.you.field[slot] = undefined;
							$("#you7").html(ygo.dfc(id));
							el.html("");
							socket.emit('nest - to grave', {
								userid: user_id,
								slot: slot
							});
							break;
						case 'activate':
							img.attr({"src": ygo.imgsrc(id)});
							socket.emit('nest - activate', {
								userid: user_id,
								slot: slot
							});
							break;
					}
				}
				if (type == "overlayed") {
					switch(choice) {
					
					}
				}
				if (type == "attached") {
					switch(choice) {
					
					}
				}
			}
		}
		$("#field-context").hide();
	});
	$("#list-context div").live('click', function() {
		var val = this.innerHTML.toLowerCase();
		var slot = onslot;
		var el = $("#card-list-content ." + slot);
		switch(duel.you.status.toLowerCase()) {
			case 'viewing extra deck':
				var id = duel.you.extra[slot];
				var deck = "extra";
				
				if (val == "reveal") {
				
				}
				if (val == "banish") {
					duel.you.rfg[duel.you.rfg.length] = id;
					duel.you.extra.splice(slot, 1);
					$("#youbanished").html(ygo.dfc(id));
					el.remove();
					clcreset(deck, slot);
					socket.emit('view extra deck - banish', {
						userid: user_id,
						slot: slot
					});
				}
				if (val == "to grave") {
					duel.you.grave[duel.you.grave.length] = id;
					duel.you.extra.splice(slot, 1);
					$("#you7").html(ygo.dfc(id));
					el.remove();
					clcreset(deck, slot);
					socket.emit('view extra deck - to grave', {
						userid: user_id,
						slot: slot
					});
				}
				if (val == "ss def") {
					var slot2 = ygo.searchSlot(duel.you.field, "monster");
					if (slot2 == 0) {return false;}
					duel.you.field[slot2] = id;
					$("#you" + slot2).html(ygo.dfcdefense(id));
					duel.you.extra.splice(slot, 1);
					el.remove();
					clcreset(deck, slot);
					socket.emit('view extra deck - spe. s. def', {
						userid: user_id,
						slot: slot
					});
				}
				if (val == "ss atk") {
					var slot2 = ygo.searchSlot(duel.you.field, "monster");
					if (slot2 == 0) {return false;}
					duel.you.field[slot2] = id;
					$("#you" + slot2).html(ygo.dfc(id));
					duel.you.extra.splice(slot, 1);
					el.remove();
					clcreset(deck, slot);
					socket.emit('view extra deck - spe. s. atk', {
						userid: user_id,
						slot: slot
					});
				}
				break;
			case 'viewing grave':
				var id = duel.you.grave[slot];
				var deck = "grave";
				
				if (val == "to s/t") {
					var stslot = ygo.searchLowerSlot(duel.you.field);
					if (stslot == 0) {
						return false;
					}
					$("#you" + stslot).html(ygo.dfc(id));
					duel.you.field[stslot] = id;
					duel.you.grave.splice(slot, 1);
					el.remove();
					clcreset(deck, slot);
					resetgravedisplay("you");
					socket.emit('view grave - to s/t', {
						userid: user_id,
						slot: slot
					});
				}
				if (val == "to b. deck") {
					duel.you.grave.splice(slot, 1);
					el.remove();
					clcreset(deck, slot);
					resetgravedisplay("you");
					socket.emit('view grave - to b. deck', {
						userid: user_id,
						slot: slot
					});
				}
				if (val == "to t. deck") {
					duel.you.grave.splice(slot, 1);
					el.remove();
					clcreset(deck, slot);
					resetgravedisplay("you");
					socket.emit('view grave - to t. deck', {
						userid: user_id,
						slot: slot
					});
				}
				if (val == "banish") {
					duel.you.rfg[duel.you.rfg.length] = id;
					duel.you.grave.splice(slot, 1);
					$("#youbanished").html(ygo.dfc(id));
					el.remove();
					clcreset(deck, slot);
					resetgravedisplay("you");
					socket.emit('view grave - banish', {
						userid: user_id,
						slot: slot
					});
				}
				if (val == "to hand") {
					$("#youhand").append(ygo.format.you.hand(id).replace('/>', 'class="' + duel.you.hand.length + '" />'));
					duel.you.hand[duel.you.hand.length] = id;
					duel.you.grave.splice(slot, 1);
					el.remove();
					clcreset(deck, slot);
					resetgravedisplay("you");
					socket.emit('view grave - to hand', {
						userid: user_id,
						slot: slot
					});
				}
				if (val == "ss def") {
					var slot2 = ygo.searchSlot(duel.you.field, "monster");
					if (slot2 == 0) {return false;}
					duel.you.field[slot2] = id;
					$("#you" + slot2).html(ygo.dfcdefense(id));
					duel.you.grave.splice(slot, 1);
					el.remove();
					clcreset(deck, slot);
					resetgravedisplay("you");
					socket.emit('view grave - ss def', {
						userid: user_id,
						slot: slot
					});
				}
				if (val == "ss atk") {
					var slot2 = ygo.searchSlot(duel.you.field, "monster");
					if (slot2 == 0) {return false;}
					duel.you.field[slot2] = id;
					$("#you" + slot2).html(ygo.dfc(id));
					duel.you.grave.splice(slot, 1);
					el.remove();
					clcreset(deck, slot);
					resetgravedisplay("you");
					socket.emit('view grave - ss atk', {
						userid: user_id,
						slot: slot
					});
				}
				if (val == "to extra") {
					duel.you.extra[duel.you.extra.length] = id;
					duel.you.grave.splice(slot, 1);
					el.remove();
					clcreset(deck, slot);
					resetgravedisplay("you");
					socket.emit('view grave - to extra', {
						userid: user_id,
						slot: slot
					});
				}
				break;
			case 'viewing rfg':
				var id = duel.you.rfg[slot];
				var deck = "rfg";
				
				if (val == "to t. deck") {
					duel.you.rfg.splice(slot, 1);
					el.remove();
					clcreset(deck, slot);
					resetrfgdisplay("you");
					socket.emit('view rfg - to t. deck', {
						userid: user_id,
						slot: slot
					});
				}
				if (val == "to grave") {
					duel.you.grave[duel.you.grave.length] = id;
					duel.you.rfg.splice(slot, 1);
					$("#you7").html(ygo.dfc(id));
					el.remove();
					clcreset(deck, slot);
					resetrfgdisplay("you");
					socket.emit('view rfg - to grave', {
						userid: user_id,
						slot: slot
					});
				}
				if (val == "to hand") {
					$("#youhand").append(ygo.format.you.hand(id).replace('/>', 'class="' + duel.you.hand.length + '" />'));
					duel.you.hand[duel.you.hand.length] = id;
					duel.you.rfg.splice(slot, 1);
					el.remove();
					clcreset(deck, slot);
					resetrfgdisplay("you");
					socket.emit('view rfg - to hand', {
						userid: user_id,
						slot: slot
					});
				}
				if (val == "ss def") {
					var slot2 = ygo.searchSlot(duel.you.field, "monster");
					if (slot2 == 0) {return false;}
					duel.you.field[slot2] = id;
					$("#you" + slot2).html(ygo.dfcdefense(id));
					duel.you.rfg.splice(slot, 1);
					el.remove();
					clcreset(deck, slot);
					resetrfgdisplay("you");
					socket.emit('view rfg - ss def', {
						userid: user_id,
						slot: slot
					});
				}
				if (val == "ss atk") {
					var slot2 = ygo.searchSlot(duel.you.field, "monster");
					if (slot2 == 0) {return false;}
					duel.you.field[slot2] = id;
					$("#you" + slot2).html(ygo.dfc(id));
					duel.you.rfg.splice(slot, 1);
					el.remove();
					clcreset(deck, slot);
					resetrfgdisplay("you");
					socket.emit('view rfg - ss atk', {
						userid: user_id,
						slot: slot
					});
				}
				if (val == "to extra") {
					duel.you.extra[duel.you.extra.length] = id;
					duel.you.rfg.splice(slot, 1);
					el.remove();
					clcreset(deck, slot);
					resetrfgdisplay("you");
					socket.emit('view rfg - to extra', {
						userid: user_id,
						slot: slot
					});
				}
				break;
			case 'viewing deck':
				var id = onslotid;
				var deck = "deck";
				
				if (val == "to s/t") {
					var stslot = ygo.searchLowerSlot(duel.you.field);
					if (stslot == 0) {
						return false;
					}
					$("#you" + stslot).html(ygo.dfc(id));
					duel.you.field[stslot] = id;
					el.remove();
					clcreset(deck, slot);
					socket.emit('view deck - to s/t', {
						userid: user_id,
						slot: slot
					});
				}
				if (val == "banish fd") {
					//need to do
				}
				if (val == "banish") {
					duel.you.rfg[duel.you.rfg.length] = id;
					$("#youbanished").html(ygo.dfc(id));
					el.remove();
					clcreset(deck, slot);
					socket.emit('view deck - banish', {
						userid: user_id,
						slot: slot
					});
				}
				if (val == "to grave") {
					duel.you.grave[duel.you.grave.length] = id;
					$("#you7").html(ygo.dfc(id));
					el.remove();
					clcreset(deck, slot);
					socket.emit('view deck - to grave', {
						userid: user_id,
						slot: slot
					});
				}
				if (val == "to hand") {
					$("#youhand").append(ygo.format.you.hand(id).replace('/>', 'class="' + duel.you.hand.length + '" />'));
					duel.you.hand[duel.you.hand.length] = id;
					el.remove();
					clcreset(deck, slot);
					socket.emit('view deck - to hand', {
						userid: user_id,
						slot: slot
					});
				}
				if (val == "ss def") {
					var slot2 = ygo.searchSlot(duel.you.field, "monster");
					if (slot2 == 0) {return false;}
					duel.you.field[slot2] = id;
					$("#you" + slot2).html(ygo.dfcdefense(id));
					el.remove();
					clcreset(deck, slot);
					socket.emit('view deck - ss def', {
						userid: user_id,
						slot: slot
					});
				}
				if (val == "ss atk") {
					var slot2 = ygo.searchSlot(duel.you.field, "monster");
					if (slot2 == 0) {return false;}
					duel.you.field[slot2] = id;
					$("#you" + slot2).html(ygo.dfc(id));
					el.remove();
					clcreset(deck, slot);
					socket.emit('view deck - ss atk', {
						userid: user_id,
						slot: slot
					});
				}
				break;
		}
		$("#list-context").hide();
	});
	$("#phase th").click(function() {
		$(".selected-phase").attr("class", "");
		$("#et").attr("class", "");
		this.className = "selected-phase";
		if (this.id == "et") {
			this.className = "blink";
		}
		socket.emit('phase', {
			phase: this.id,
			userid: user_id
		});
	});
	$("#pluslp").click(function() {
		notice('<h5 style="text-align: center;margin-bottom: 5px;">Add Life Points</h5><input type="text" class="textbox" id="addlp" />');
		$("#addlp").focus();
	});
	$("#minuslp").click(function() {
		notice('<h5 style="text-align: center;margin-bottom: 5px;">Subtract Life Points</h5><input type="text" class="textbox" id="sublp" />');
		$("#sublp").focus();
	});
	$("#addlp").live("keypress", function(e) {
		if (e.keyCode == 13 && this.value.replace(/[^\d]+/g, '').length == this.value.length) {
			socket.emit('addlp', {
				userid: user_id,
				amount: this.value
			});
			duel.you.points = eval(duel.you.points + '+' + this.value);
			var percent = (duel.you.points / 8000) * 100;
			if (percent > 100) percent = 100;
			if (percent < 0) percent = 0;
			$("#duel-you-lp").animate({"width": percent + "%"});
			$("#duel-you-lpnum").html(duel.you.points);
			this.value = "";
		}
	});
	$("#sublp").live("keypress", function(e) {
		if (e.keyCode == 13 && this.value.replace(/[^\d]+/g, '').length == this.value.length) {
			socket.emit('sublp', {
				userid: user_id,
				amount: this.value
			});
			duel.you.points = eval(duel.you.points - this.value);
			var percent = (duel.you.points / 8000) * 100;
			if (percent > 100) percent = 100;
			if (percent < 0) percent = 0;
			$("#duel-you-lp").animate({"width": percent + "%"});
			$("#duel-you-lpnum").html(duel.you.points);
			this.value = "";
		}
	});
	$("#duel img").live('mousedown', function() {
		return false;
	}).live('contextmenu', function() {
		return false;
	});
	$("#duel-chat-header").mousedown(function(e) {
		$("body").attr("class", "unselectable");
		duelm.drag = 1;
		duelm.OX = $("#duel-chat-header").offset().left;
		duelm.OY = $("#duel-chat-header").offset().top;
		duelm.SOX = e.pageX;
		duelm.SOY = e.pageY;
		return false;
	});
	$("body").mousemove(function(e) {
		if (duelm.drag == 1) {
			var dox = true
			var doy = true;
			if (e.pageX-(duelm.SOX-duelm.OX) <= 0 || e.pageX+$("#duel-chat").width()-(duelm.SOX-duelm.OX) >= $(document).width()) {
				var dox = false;
			}
			if (e.pageY-(duelm.SOY-duelm.OY) <= 0 || e.pageY+$("#duel-chat").height() >= $(document).height()) {
				var doy = false;
			}
			if (dox == true) {
				$("#duel-chat").css({left: e.pageX-(duelm.SOX-duelm.OX) + "px"});
			}
			if (doy == true) {
				$("#duel-chat").css({top: e.pageY-(duelm.SOY-duelm.OY) + "px"});
			}
		}
	}).mouseup(function(e) {
		duelm.drag = 0;
		duelm.OX = 0;
		duelm.OY = 0;
		duelm.SOX = 0;
		duelm.SOY = 0;
	});
	$("#youhand img").live('mouseover', function(e) {
		var level1 = db[this.id].level;
		var atkdef = "";
		var level = "";
		for (var i = 0; i < level1; i++) {
			var level = level + '<img src="./imgs/star.png" height="10" />';
		}
		var attribute = db[this.id].attribute;
		if (attribute != "") {
			var attribute = '<img src="./imgs/' + attribute + '.png" height="20" />';
			var atkdef = "ATK: " + db[this.id].atk + " / DEF: " + db[this.id].def + "<br />";
		}
		var info = "<center><b>" + db[this.id].name + "</b></center>" + db[this.id].subtype + " " + level + " " + attribute + "<br />" + atkdef + cardeffect(db[this.id].effect);
		$("#infoinfo").html(info);
		$("#infoimg").html(ygo.dfc(this.id));
	});
	$(".slot").click(function() {
		if (attacking == 1) {
			$("#sword").hide();
			attacking = 0;
			var slot = attackerslot;
			var selected_slot = this.id.replace('opp', '');
			if (this.id.split('you').length-1 > 0) {
				return false;
			}
			if (selected_slot == 1 || selected_slot == 7 || selected_slot == 8 || selected_slot == 14) {
				return false;
			}
			if (typeof duel.opp.field[selected_slot] == "undefined") {
				return false;
			}
			attack(slot, selected_slot);
			socket.emit('attack', {
				userid: user_id,
				slot: slot,
				selected: selected_slot
			});
		}
	}).mouseover(function() {
		if (this.id.split('you').length-1 > 0) {
			onslot = this.id.replace('you', '');
		}
	}).mouseover(function(e) {
		var offsetx = e.pageX - $(this).offset().left;
		var offsety = e.pageY - $(this).offset().top;
		if (this.id.split('you').length-1 > 0) {
			var slot = Math.floor(this.id.replace('you', ''));
			switch(slot) {
				case 8:
					//extra deck
					var ops = "<div>Show</div><div>View</div>";
					break;
				case 14:
					//main deck
					var ops = "<div>Show</div><div>View</div><div>Banish T.</div><div>Mill</div><div>Shuffle</div><div>Draw</div>";
					break;
			}
			if (!ops && duel.you.field[slot]) {
				var type = cardtype(duel.you.field[slot]);
				var position = "";
				if ($("#" + this.id + " img").attr("src").split('/card.png').length-1 > 0) {
					position += "facedown";
				}
				if ($("#" + this.id + " img").attr("class") == "defense") {
					position += "defense";
				}
				if (position == "") {
					var position = "faceup";
				}
				if (slot >= 2 && slot < 7) {
					//upper
					if (type == "nest") {
						if (position == "faceup") {
							var ops = "<div>Overlay</div><div>To S/T</div><div>To B. Deck</div><div>To T. Deck</div><div>To Hand</div><div>Give Control</div><div>Banish</div><div>Set</div><div>To Def.</div><div>To Grave</div><div>Atk Directly</div><div>Attack</div>";
						}
						if (position == "defense") {
							var ops = "<div>Overlay</div><div>To S/T</div><div>To B. Deck</div><div>To T. Deck</div><div>To Hand</div><div>Give Control</div><div>Banish</div><div>Set</div><div>To Atk.</div><div>To Grave</div>";
						}
						if (position == "facedowndefense") {
							var ops = "<div>To B. Deck</div><div>To T. Deck</div><div>To Hand</div><div>Give Control</div><div>Banish</div><div>Flip</div><div>Flip Summon</div><div>To Grave</div>";
						}
					}
					if (type == "extra") {
						if (position == "faceup") {
							var ops = "<div>Overlay</div><div>To S/T</div><div>To Extra</div><div>Give Control</div><div>Banish</div><div>Set</div><div>To Def.</div><div>To Grave</div><div>Atk Directly</div><div>Attack</div>";
						}
						if (position == "defense") {
							var ops = "<div>Overlay</div><div>To S/T</div><div>To Extra</div><div>Give Control</div><div>Banish</div><div>Set</div><div>To Atk.</div><div>To Grave</div>";
						}
						if (position == "facedowndefense") {
							var ops = "<div>To S/T</div><div>To Extra</div><div>Give Control</div><div>Banish</div><div>Flip</div><div>Flip Summon</div><div>To Grave</div>";
						}
					}
					if (type == "overlayed") {
						if (position == "faceup") {
							var ops = "<div>Overlay</div><div>To S/T</div><div>Give Control</div><div>Set</div><div>To Def.</div><div>Atk Directly</div><div>Attack</div>";
						}
						if (position == "defense") {
							var ops = "<div>Overlay</div><div>To S/T</div><div>Give Control</div><div>Set</div><div>To Atk.</div>";
						}
						if (position == "facedowndefense") {
							var ops = "<div>To S/T</div><div>Give Control</div><div>Flip</div><div>Flip Summon</div>";
						}
					}
					if (type == "attached") {
						if (position == "faceup") {
							var ops = "<div>Banish</div><div>Detach</div>";
						}
					}
				}
				if (slot >= 9 && slot < 14) {
					//lower
					if (type == "nest") {
						if (position == "faceup") {
							var ops = "<div>To Mon. Zone</div><div>To B. Deck</div><div>To T. Deck</div><div>To Hand</div><div>Set</div><div>Banish</div><div>To Grave</div>";
						}
						if (position == "facedown") {
							var ops = "<div>To B. Deck</div><div>To T. Deck</div><div>To Hand</div><div>Banish</div><div>To Grave</div><div>Activate</div>";
						}
					}
					if (type == "extra") {
						if (position == "faceup") {
							var ops = "<div>To Mon. Zone</div><div>To Extra</div><div>Set</div><div>Banish</div><div>To Grave</div>";
						}
						if (position == "facedown") {
							var ops = "<div>To Extra</div><div>Banish</div><div>To Grave</div><div>Activate</div>";
						}
					}
					if (type == "overlayed") {
						if (position == "faceup") {
							var ops = "<div>To Mon. Zone</div><div>Set</div>";
						}
						if (position == "facedown") {
							var ops = "<div>Activate</div>";
						}
					}
					if (type == "attached") {
						if (position == "faceup") {
							var ops = "<div>Banish</div><div>Detach</div>";
						}
					}
				}
			}
			if (ops) {
				$("#field-context").html(ops).css({
					left: $("#" + this.id + " img").offset().left + "px",
					top: eval($(this).offset().top - $("#field-context").height() + '+' + 2) + "px"
				}).show();
			}
		}
		if (this.id.split('opp').length-1 > 0) {
			var name = duel.opp.field[this.id.replace('opp', '')];
			if (this.id.replace('opp', '') == "7") {
				var name = $("#" + this.id + " img").attr("id");
			}
			if (!name) {
				return false;
			}
			if ($("#" + this.id + " img").attr("src").split('card.png').length-1 > 0) {
				return false;
			}
			var level1 = db[name].level;
			var atkdef = "";
			var level = "";
			for (var i = 0; i < level1; i++) {
				var level = level + '<img src="./imgs/star.png" height="10" />';
			}
			var attribute = db[name].attribute;
			if (attribute != "") {
				var attribute = '<img src="./imgs/' + attribute + '.png" height="20" />';
				var atkdef = "ATK: " + db[name].atk + " / DEF: " + db[name].def + "<br />";
			}
			var info = "<center><b>" + db[name].name + "</b></center>" + db[name].subtype + " " + level + " " + attribute + "<br />" + atkdef + cardeffect(db[name].effect);
			$("#infoinfo").html(info);
			$("#infoimg").html(ygo.dfc(name));
		}
		else {
			var name = duel.you.field[this.id.replace('you', '')];
			if (this.id.replace('you', '') == "7") {
				var name = $("#" + this.id + " img").attr("id");
			}
			if (!name) {
				return false;
			}
			var level1 = db[name].level;
			var atkdef = "";
			var level = "";
			for (var i = 0; i < level1; i++) {
				var level = level + '<img src="./imgs/star.png" height="10" />';
			}
			var attribute = db[name].attribute;
			if (attribute != "") {
				var attribute = '<img src="./imgs/' + attribute + '.png" height="20" />';
				var atkdef = "ATK: " + db[name].atk + " / DEF: " + db[name].def + "<br />";
			}
			var info = "<center><b>" + db[name].name + "</b></center>" + db[name].subtype + " " + level + " " + attribute + "<br />" + atkdef + cardeffect(db[name].effect);
			$("#infoinfo").html(info);
			$("#infoimg").html(ygo.dfc(name));
			
			var card = db[name];
			switch(Math.floor(this.id.replace('you', ''))) {
				case 7:
					//grave
					return false;
					break;
			}
			$("#field-context").html(ops).css({
				left: $("#" + this.id + " img").offset().left + "px",
				top: eval($(this).offset().top - $("#field-context").height() + '+' + 2) + "px"
			}).show();
		}
	}).mouseout(function() {
		$("#field-context").hide();
	});
	$("#field-context").mouseover(function() {
		this.style.display = "block";
	}).mouseout(function() {
		this.style.display = "none";
	});
	$("#youbanished img").live('mouseover', function() {
		var level1 = db[this.id].level;
		var atkdef = "";
		var level = "";
		for (var i = 0; i < level1; i++) {
			var level = level + '<img src="./imgs/star.png" height="10" />';
		}
		var attribute = db[this.id].attribute;
		if (attribute != "") {
			var attribute = '<img src="./imgs/' + attribute + '.png" height="20" />';
			var atkdef = "ATK: " + db[this.id].atk + " / DEF: " + db[this.id].def + "<br />";
		}
		var info = "<center><b>" + db[this.id].name + "</b></center>" + db[this.id].subtype + " " + level + " " + attribute + "<br />" + atkdef + cardeffect(db[this.id].effect);
		$("#infoinfo").html(info);
		$("#infoimg").html(ygo.dfc(this.id));
	});
	$("#oppbanished img").live('mouseover', function() {
		var level1 = db[this.id].level;
		var atkdef = "";
		var level = "";
		for (var i = 0; i < level1; i++) {
			var level = level + '<img src="./imgs/star.png" height="10" />';
		}
		var attribute = db[this.id].attribute;
		if (attribute != "") {
			var attribute = '<img src="./imgs/' + attribute + '.png" height="20" />';
			var atkdef = "ATK: " + db[this.id].atk + " / DEF: " + db[this.id].def + "<br />";
		}
		var info = "<center><b>" + db[this.id].name + "</b></center>" + db[this.id].subtype + " " + level + " " + attribute + "<br />" + atkdef + cardeffect(db[this.id].effect);
		$("#infoinfo").html(info);
		$("#infoimg").html(ygo.dfc(this.id));
	});
	$("#card-list-exit").click(function() {
		$("#card-list").fadeOut();
		duel.you.status = "";
		youclearstatus();
		socket.emit('clearstatus', {
			userid: user_id
		});
	});
	$("#you7").click(function() {
		//display
		$("#card-list").fadeIn();
		$("#card-list-content").html("");
		for (var i = 1; i < duel.you.grave.length; i++) {
			$("#card-list-content").append(ygo.dfc(duel.you.grave[i]).replace('/>', 'class="' + i + '" />'));
		}
		duel.you.status = "Viewing Grave";
		youstatus(duel.you.status);
		$("#card-list-header").html(duel.you.status);
		
		socket.emit('updateStatus', {
			userid: user_id,
			status: "Viewing Grave"
		});
	});
	$("#opp7").click(function() {
		//display
		$("#card-list").fadeIn();
		$("#card-list-content").html("");
		for (var i = 1; i < duel.opp.grave.length; i++) {
			$("#card-list-content").append(ygo.dfc(duel.opp.grave[i]).replace('/>', 'class="' + i + '" />'));
		}
		duel.you.status = "Viewing Opp Grave";
		youstatus(duel.you.status);
		$("#card-list-header").html(duel.you.status);

		socket.emit('updateStatus', {
			userid: user_id,
			status: "Viewing Opp Grave"
		});
	});
	$("#youbanished").click(function() {
		//display
		$("#card-list").fadeIn();
		$("#card-list-content").html("");
		for (var i = 1; i < duel.you.rfg.length; i++) {
			$("#card-list-content").append(ygo.dfc(duel.you.rfg[i]).replace('/>', 'class="' + i + '" />'));
		}
		duel.you.status = "Viewing RFG";
		youstatus(duel.you.status);
		$("#card-list-header").html(duel.you.status);
		
		socket.emit('updateStatus', {
			userid: user_id,
			status: "Viewing RFG"
		});
	});
	$("#oppbanished").click(function() {
		//display
		$("#card-list").fadeIn();
		$("#card-list-content").html("");
		for (var i = 1; i < duel.opp.rfg.length; i++) {
			$("#card-list-content").append(ygo.dfc(duel.opp.rfg[i]).replace('/>', 'class="' + i + '" />'));
		}
		duel.you.status = "Viewing Opp RFG";
		youstatus(duel.you.status);
		$("#card-list-header").html(duel.you.status);
		
		socket.emit('updateStatus', {
			userid: user_id,
			status: "Viewing Opp RFG"
		});
	});
	$("body").mousemove(function(e) {
		if (attacking == 1) {
			$("#sword").css({left: e.pageX + "px", top: e.pageY+50 + "px"}).show();
		}
	}).click(function() {
		if (attacking == 1) {
			$("#sword").hide();
			attacking = 0;
		}
	}).mouseup(function() {
		if (contexthelper == 1) {
			$("#allContext").hide();
			contexthelper = 0;
		}
		else {
			contexthelper++;
		}
	});
	$("#card-list-content img").live('mouseover', function(e) {
		var level1 = db[this.id].level;
		var atkdef = "";
		var level = "";
		for (var i = 0; i < level1; i++) {
			var level = level + '<img src="./imgs/star.png" height="10" />';
		}
		var attribute = db[this.id].attribute;
		if (attribute != "") {
			var attribute = '<img src="./imgs/' + attribute + '.png" height="20" />';
			var atkdef = "ATK: " + db[this.id].atk + " / DEF: " + db[this.id].def + "<br />";
		}
		var info = "<center><b>" + db[this.id].name + "</b></center>" + db[this.id].subtype + " " + level + " " + attribute + "<br />" + atkdef + cardeffect(db[this.id].effect);
		$("#infoinfo").html(info);
		$("#infoimg").html(ygo.dfc(this.id));
		
		onslot = this.className;
		
		var ops = "";
		var id = this.id;
		var card = db[id];
		var slot = this.className;
		var type = cardtype2(id);
		switch(duel.you.status.toLowerCase()) {
			case 'viewing extra deck':
				var ops = "<div>Reveal</div><div>Banish</div><div>To Grave</div><div>SS Def</div><div>SS Atk</div>";
				break;
			case 'viewing rfg':
				if (type == "s/t") {
					var ops = "<div>To T. Deck</div><div>To Grave</div><div>To Hand</div>";
				}
				if (type == "monster") {
					var ops = "<div>To T. Deck</div><div>To Grave</div><div>To Hand</div><div>SS Def</div><div>SS Atk</div>";
				}
				if (type == "extra") {
					var ops = "<div>To Extra</div><div>To Grave</div><div>SS Def</div><div>SS Atk</div>";
				}
				break;
			case 'viewing grave':
				if (type == "s/t") {
					var ops = "<div>To B. Deck</div><div>To T. Deck</div><div>Banish</div><div>To Hand</div>";
				}
				if (type == "monster") {
					var ops = "<div>To S/T</div><div>To B. Deck</div><div>To T. Deck</div><div>Banish</div><div>To Hand</div><div>SS Def</div><div>SS Atk</div>";
				}
				if (type == "extra") {
					var ops = "<div>To S/T</div><div>To Extra</div><div>Banish</div><div>SS Def</div><div>SS Atk</div>";
				}
				break;
			case 'viewing deck':
				onslotid = id;
				if (type == "s/t") {
					var ops = "<div>Banish FD</div><div>Banish</div><div>To Grave</div><div>To Hand</div>";
				}
				if (type == "monster") {
					var ops = "<div>To S/T</div><div>Banish FD</div><div>Banish</div><div>To Grave</div><div>To Hand</div><div>SS Def</div><div>SS Atk</div>";
				}
				break;
		}
		$("#list-context").html(ops).css({
			left: $(this).offset().left + "px",
			top: eval($(this).offset().top - $("#list-context").height() + '+' + 2) + "px"
		}).show();
	}).live('mouseout', function() {
		$("#list-context").hide();
	});
	$("#list-context").mouseover(function() {
		$(this).show();
	}).mouseout(function() {
		$(this).hide();
	});
	/*advanced duel options movement*/
	$("#floaty-contain").mousedown(function() {
		$("#floaty-contain").css({
			background: "none"
		});
		$("#floaty-content").css({"max-width": "500px"}).animate({
			"max-width": $("#floaty-content").width() + "px"
		}, 500).css({"max-width": "0px"});
	})
	$("#floaty-menu").mouseleave(function() {
		$("#floaty-contain").css({
			background: "url('./arrows.png') no-repeat center"
		});
		$("#floaty-content").animate({
			"max-width": "0px"
		});
	});
	$(".duel-ops li").mouseenter(function() {
		$(this).children('ul:first').show().css({
			left: -$(this).children('ul:first').width()+2 + "px",
			"margin-top": "-40px"
		});
	}).mouseleave(function() {
		$(this).children('ul:first').hide();
	});
	$("#duel-ops div").click(function() {
		var val = this.innerHTML.toLowerCase();
		var uid = user_id;
		switch(val) {
			case 'admit defeat':
				if (duel.winner != "") {
					return false;
				}
				socket.emit('duel - admit defeat', {
					userid: uid
				});
				duel.winner = duel.opp.name;
				ygo.duelChatMessage({message: "<b>The winner is " + htmlescape(duel.winner) + ".</b>"});
				break;
			case 'leave':
				if (duel.winner == "") {
					notice("You cannot leave the duel until someone wins.<br /><s>Also, if you lose you are to stay in the room for eternity.</s>");
					return false;
				}
				socket.emit('leave duel', {
					userid: user_id
				});
				socket.emit('leave - duel', user_id);
				$("#duel").hide();
				$("#dice").hide();
				$("#everything-main").show();
				break;
		}
	});
	$("#oppdivision img").live("click", function() {
		selection("field", this, "you");
	});
	$("#opphand img").live("click", function() {
		selection("hand", this, "you");
	});
	/*advanced duel options movement done*/
	function clcreset(deck, slot) {
		var slot = Math.floor(slot);
		var len = duel.you[deck].length+1;
		if (deck == "deck") {
			var len = duel.you.decklen+1;
		}
		for (var i = slot+1; i < len; i++) {
			$("#card-list-content ." + i).attr("class", i-1);
		}
	}
	/*duel*/
	
	/*deck-manager*/
	$("#it-content div").live('click', function() {
		$("#name-it").val(this.innerHTML).focus();
		var d = deckexport($("#name-it").val());
		$("#decklist-it").val(d);
	});
	$("#save-it").click(function() {
		var n = $("#name-it").val();
		var d = $("#decklist-it").val();
		var error = 0;
		
		if (loginner == 0) error = 3;
		if (d.replace(/ /g, '') == "") error = 2;
		if (n.replace(/ /g, '') == "") error = 1;
		
		if (error == 1) {
			notice("You forgot to name your deck.");
			return false;
		}
		if (error == 2) {
			notice("There was an error importing your deck.");
			return false;
		}
		if (error == 3) {
			notice("You must register in order to save your deck.");
			return false;
		}
		
		$.ajax({
			url: "post.php",
			type: "POST",
			data: "d=save&u=" + cookie("username") + "&n=" + n + "&deck=" + d,
			success: function(data) {
				decks[n] = importdeck(d);
				if (data == 0) {
					notice("Your deck has been saved successfully.");
					$("#it-content").html("");
					for (var deckname in decks) {
						$("#it-content").append('<div class="file">' + deckname + '</div>');
					}
				}
				if (data == 1) {
					notice("Your deck has been updated successfully.");
				}
			}
		});
	});
	$("#delete-it").click(function() {
		var n = $("#name-it").val();
		var error = 0;
		
		if (n.replace(/ /g, '') == "") error = 1;
		if (typeof decks[n] == "undefined") error = 2;
		
		if (error == 1) {
			notice("You did not enter a deck name to delete.");
			return false;
		}
		if (error == 2) {
			notice("That deck does not exist.");
			return false;
		}
		
		$.ajax({
			url: "post.php",
			type: "POST",
			data: "d=delete&u=" + cookie("username") + "&n=" + n,
			success: function(data) {
				delete decks[n];
				notice("Deck deleted successfully.");
				$("#it-content").html("");
				for (var deckname in decks) {
					$("#it-content").append('<div class="file">' + deckname + '</div>');
				}
			}
		});
	});
	$.getScript("http://ygosim.dyndns.org/ygo/db.js");
});
//functions
function rejoin() {
	socket.emit('join', {
		room: room,
		username: username,
		color: cookie("color")
	});
}
function notice(txt) {
	$("#notice-content").html(txt);
	$("#notice").fadeIn("slow");
}
function challengeaccepted(id) {
	if (typeof challenges[id] == "undefined") return false;
	var deck = $("#challengeselect" + id).val();
	if (typeof decks[deck] == "undefined") {
		notice("This deck does not exist.");
		return false;
	}
	socket.emit('challenge accepted', {
		challenger: id,
		target: user_id,
		deck: decks[deck]
	});
	delete challenges[id];
	$("#challenge" + id).fadeOut();
}
function challengedeclined(id) {
	if (typeof challenges[id] == "undefined") return false;
	socket.emit('challenge decline', {
		challenger: id,
		target: user_id
	});
	delete challenges[id];
	$("#challenge" + id).fadeOut();
}
function shuffleanim() {
	//2800 millis to do something after this
	if (shufflinshufflinshufflin == 3) {
		shufflinshufflinshufflin = 0;
		$("#shuffleabs").hide();
		return false;
	}
	$("#shuffleabs").css({
		top: $("#youdivision").offset().top - (79 / 2) + "px",
		left: eval($("#youdivision").offset().left + '+' + $("#youdivision").width() / 2) - $("#shuffle").width() / 2 + "px"
	}).show();
	for (var i = 1; i < 10; i++) {
		$("#sc" + i).animate({"left": eval(100+'+'+i*1) + "px"}, function() {
			$(this).css({"z-index": "1"}).animate({"left": (i+9)*1 + "px"});
		});
	}
	for (var i = 20; i > 10; i--) {
		$("#sc" + i).animate({"top": (i-15)*0.25 + "px"});
	}
	setTimeout(function() {
		for (var i = 1; i < 21; i++) {
			$("#sc" + i).css({"left": i*1 + "px", top: i*0.25 + "px", "z-index": 0});
		}
		shufflinshufflinshufflin++;
		shuffleanim();
	}, 900);
}
function youstatus(status) {
	$("#youstatus").html(status).css({left: $("#youimg").position().left - ($("#youstatus").width() / 4) + "px"});
}
function youclearstatus() {
	$("#youstatus").html("");
}
function oppstatus(status) {
	$("#oppstatus").html(status).css({left: $("#oppimg").position().left - ($("#oppstatus").width() / 4) + "px"});
}
function oppclearstatus() {
	$("#oppstatus").html("");
}
function cardtype(card) {
	var type = db[card].type;
	if (type == "Spell" || type == "Trap" || type == "Normal Monster" || type == "Effect Monster" || type == "Ritual Monster" || type == "Ritual/Effect Monster") {
		return "nest";
	}
	else {
		return "extra";
	}
}
function cardtype2(card) {
	var type = db[card].type;
	if (type == "Spell" || type == "Trap") {
		return "s/t";
	}
	if (type == "Normal Monster" || type == "Effect Monster" || type == "Ritual Monster" || type == "Ritual/Effect Monster") {
		return "monster";
	}
	return "extra";
}
function attack(slot, selected_slot) {
	var counter = 0;
	var difference = selected_slot - slot;
	$("#attack").show().css({
		left: $("#you" + slot).offset().left+($("#you" + slot).width()/2)-($("#attack").width()/2) + "px",
		top: $("#you" + slot).offset().top+($("#you" + slot).height()/2)-($("#attack").height()/2) + "px"
	}).animate({
		left: $("#opp" + selected_slot).offset().left+($("#opp" + selected_slot).width()/2)-($("#attack").width()/2) + "px",
		top: $("#opp" + selected_slot).offset().top+($("#opp" + selected_slot).height()/2)-($("#attack").height()/2) + "px"
	}, {
		duration: 250,
		step: function(now, fx) {
			if (counter == 30 || counter == -30) {
				return false;
			}
			if (difference < 0) {
				counter = counter-0.5;
			}
			if (difference > 0) {
				counter = counter+0.5;
			}
			if (difference == 0 || selected_slot == 11) {
				return false;
			}
			rotate("attack", counter*1);
		},
		complete: function() {
			$("#attack").animate({
				left: x + "px",
				top: y + "px"
			}, 250, function() {
				$("#attack").fadeOut(function() {
					rotate("attack", 0);
				});
			});
		}
	});
	var x = $("#attack").position().left;
	var y = $("#attack").position().top;
};
function oppattack(slot, selected_slot) {
	var counter = 0;
	var difference = selected_slot - slot;
	$("#oppattack").show().css({
		left: $("#opp" + slot).offset().left+($("#opp" + slot).width()/2)-($("#oppattack").width()/2) + "px",
		top: $("#opp" + slot).offset().top+($("#opp" + slot).height()/2)-($("#oppattack").height()/2) + "px"
	}).animate({
		left: $("#you" + selected_slot).offset().left+($("#you" + selected_slot).width()/2)-($("#oppattack").width()/2) + "px",
		top: $("#you" + selected_slot).offset().top+($("#you" + selected_slot).height()/2)-($("#oppattack").height()/2) + "px"
	}, {
		duration: 250,
		step: function(now, fx) {
			if (counter == 30 || counter == -30) {
				return false;
			}
			if (difference < 0) {
				counter = counter-0.5;
			}
			if (difference > 0) {
				counter = counter+0.5;
			}
			if (difference == 0 || selected_slot == 11) {
				return false;
			}
			rotate("oppattack", 180 - counter*1);
		},
		complete: function() {
			$("#oppattack").animate({
				left: x + "px",
				top: y + "px"
			}, 250, function() {
				$("#oppattack").fadeOut(function() {
					rotate("oppattack", 180);
				});
			});
		}
	});
	var x = $("#oppattack").position().left;
	var y = $("#oppattack").position().top;
}
function resetgravedisplay(who) {
	var el = $("#" + who + "7");
	el.html("");
	if (duel[who].grave.length-1 != 0) {
		el.html(ygo.dfc(duel[who].grave[duel[who].grave.length-1]));
	}
}
function resetrfgdisplay(who) {
	var el = $("#" + who + "banished");
	el.html("");
	if (duel[who].rfg.length-1 != 0) {
		el.html(ygo.dfc(duel[who].rfg[duel[who].rfg.length-1]));
	}
}
function selection(where, that, who) {
	var who2 = who;
	duel[who].selected = that;
	if (who == "opp") {
		var who = "you";
		if (where == "hand") {
			var that = $("#" + who + "hand ." + that);
		}
		else {
			var that = $("#" + that.replace("opp", "you") + " img");
		}
		duel[who].selected = that;
	}
	selectionAnim(who);
	if (where == "hand") {
		var that = that.className;
	}
	else {
		var that = $(that).parent().attr("id");
	}
	if (who2 == "opp") {
		return false;
	}
	socket.emit('selection', {
		userid: user_id,
		element: that,
		where: where
	});
}
function selectionAnim(who) {
	var styled = "red solid 2px";
	$(duel[who].selected).css("outline", styled);
	setTimeout(function() {
		$(duel[who].selected).css("outline", "");
	}, 250);
	setTimeout(function() {
		$(duel[who].selected).css("outline", styled);
	}, 500);
	setTimeout(function() {
		$(duel[who].selected).css("outline", "");
	}, 750);
}

//deck builder functions
function currentcopies(card) {
	var count = 0;
	for (var i = 1; i < deck.main.length; i++) {
		if (deck.main[i] == card) {
			count++;
		}
	}
	for (var i = 1; i < deck.extra.length; i++) {
		if (deck.extra[i] == card) {
			count++;
		}
	}
	for (var i = 1; i < deck.side.length; i++) {
		if (deck.side[i] == card) {
			count++;
		}
	}
	return count;
}
function maxcopies(card) {
	switch(card.toLowerCase()) {
		//forbidden
		case 'chaos emperor dragon - envoy of the end':
			return 0;
			break;
		case 'cyber jar':
			return 0;
			break;
		case 'cyber-stein':
			return 0;
			break;
		case 'dark magician of chaos':
			return 0;
			break;
		case 'destiny hero - disk commander':
			return 0;
			break;
		case 'fiber jar':
			return 0;
			break;
		case 'fishborg blaster':
			return 0;
			break;
		case 'glow-up bulb':
			return 0;
			break;
		case 'magical scientist':
			return 0;
			break;
		case 'magician of faith':
			return 0;
			break;
		case 'makyura the destructor':
			return 0;
			break;
		case 'mind master':
			return 0;
			break;
		case 'rescue cat':
			return 0;
			break;
		case 'sinister serpent':
			return 0;
			break;
		case 'spore':
			return 0;
			break;
		case 'substitoad':
			return 0;
			break;
		case 'tribe-infecting virus':
			return 0;
			break;
		case 'tsukuyomi':
			return 0;
			break;
		case 'victory dragon':
			return 0;
			break;
		case 'witch of the black forest':
			return 0;
			break;
		case 'yata-garasu':
			return 0;
			break;
		case 'thousand-eyes restrict':
			return 0;
			break;
		case 'dark strike fighter':
			return 0;
			break;
		case 'goyo guardian':
			return 0;
			break;
		case 'trishula, dragon of the ice barrier':
			return 0;
			break;
		case 'brain control':
			return 0;
			break;
		case 'butterfly dagger - elma':
			return 0;
			break;
		case 'card of safe return':
			return 0;
			break;
		case 'change of heart':
			return 0;
			break;
		case 'cold wave':
			return 0;
			break;
		case 'confiscation':
			return 0;
			break;
		case 'delinquent duo':
			return 0;
			break;
		case 'dimension fusion':
			return 0;
			break;
		case 'giant trunade':
			return 0;
			break;
		case 'graceful charity':
			return 0;
			break;
		case 'harpie\'s feather duster':
			return 0;
			break;
		case 'last will':
			return 0;
			break;
		case 'mass driver':
			return 0;
			break;
		case 'metamorphosis':
			return 0;
			break;
		case 'mirage of nightmare':
			return 0;
			break;
		case 'painful choice':
			return 0;
			break;
		case 'pot of greed':
			return 0;
			break;
		case 'premature burial':
			return 0;
			break;
		case 'raigeki':
			return 0;
			break;
		case 'snatch steal':
			return 0;
			break;
		case 'temple of the kings':
			return 0;
			break;
		case 'the forceful sentry':
			return 0;
			break;
		case 'crush card virus':
			return 0;
			break;
		case 'exchange of the spirit':
			return 0;
			break;
		case 'imperial order':
			return 0;
			break;
		case 'last turn':
			return 0;
			break;
		case 'ring of destruction':
			return 0;
			break;
		case 'royal oppression':
			return 0;
			break;
		case 'time seal':
			return 0;
			break;
		case 'trap dustshoot':
			return 0;
			break;
		//limited
		case 'left arm of the forbidden one':
			return 1;
			break;
		case 'left leg of the forbidden one':
			return 1;
			break;
		case 'right arm of the forbidden one':
			return 1;
			break;
		case 'right leg of the forbidden one':
			return 1;
			break;
		case 'black luster soldier - envoy of the beginning ':
			return 1;
			break;
		case 'blackwing ?gale the whirlwind':
			return 1;
			break;
		case 'blackwing ?kalut the moon shadow':
			return 1;
			break;
		case 'dandylion':
			return 1;
			break;
		case 'dark armed dragon':
			return 1;
			break;
		case 'debris dragon':
			return 1;
			break;
		case 'elemental hero stratos':
			return 1;
			break;
		case 'exodia the forbidden one':
			return 1;
			break;
		case 'gladiator beast bestiari':
			return 1;
			break;
		case 'gorz the emissary of darkness':
			return 1;
			break;
		case 'honest':
			return 1;
			break;
		case 'lonefire blossom':
			return 1;
			break;
		case 'mezuki':
			return 1;
			break;
		case 'morphing jar':
			return 1;
			break;
		case 'necroface':
			return 1;
			break;
		case 'neo-spacian grand mole':
			return 1;
			break;
		case 'night assailant':
			return 1;
			break;
		case 'plaguespreader zombie':
			return 1;
			break;
		case 'sangan':
			return 1;
			break;
		case 't.g. striker':
			return 1;
			break;
		case 'the agent of mystery - earth':
			return 1;
			break;
		case 'brionac, dragon of the ice barrier':
			return 1;
			break;
		case 'formula synchron':
			return 1;
			break;
		case 'legendary six samurai - shi en':
			return 1;
			break;
		case 't.g. hyper librarian':
			return 1;
			break;
		case 'advanced ritual art':
			return 1;
			break;
		case 'allure of darkness':
			return 1;
			break;
		case 'black whirlwind':
			return 1;
			break;
		case 'book of moon':
			return 1;
			break;
		case 'burial from a different dimension':
			return 1;
			break;
		case 'card destruction':
			return 1;
			break;
		case 'charge of the light brigade':
			return 1;
			break;
		case 'dark hole':
			return 1;
			break;
		case 'foolish burial':
			return 1;
			break;
		case 'future fusion':
			return 1;
			break;
		case 'gateway of the six':
			return 1;
			break;
		case 'heavy storm':
			return 1;
			break;
		case 'infernity launcher':
			return 1;
			break;
		case 'limiter removal':
			return 1;
			break;
		case 'mind control':
			return 1;
			break;
		case 'monster gate':
			return 1;
			break;
		case 'monster reborn':
			return 1;
			break;
		case 'one for one':
			return 1;
			break;
		case 'pot of avarice':
			return 1;
			break;
		case 'primal seed':
			return 1;
			break;
		case 'reasoning':
			return 1;
			break;
		case 'reinforcement of the army':
			return 1;
			break;
		case 'scapegoat':
			return 1;
			break;
		case 'ceasefire':
			return 1;
			break;
		case 'magical explosion':
			return 1;
			break;
		case 'mirror force':
			return 1;
			break;
		case 'return from the different dimension':
			return 1;
			break;
		case 'solemn judgment':
			return 1;
			break;
		case 'the transmigration prophecy':
			return 1;
			break;
		case 'wall of revealing light':
			return 1;
			break;
		//semi-limited
		case 'archlord kristya':
			return 2;
			break;
		case 'card trooper':
			return 2;
			break;
		case 'destiny hero - malicious':
			return 2;
			break;
		case 'lumina, lightsworn summoner':
			return 2;
			break;
		case 'marshmallon':
			return 2;
			break;
		case 'necro gardna':
			return 2;
			break;
		case 'reborn tengu':
			return 2;
			break;
		case 'summoner monk':
			return 2;
			break;
		case 'tragoedia':
			return 2;
			break;
		case 'dewloren, tiger king of the ice barrier':
			return 2;
			break;
		case 'chain strike':
			return 2;
			break;
		case 'destiny draw':
			return 2;
			break;
		case 'emergency teleport':
			return 2;
			break;
		case 'level limit - area b':
			return 2;
			break;
		case 'magical stone excavation':
			return 2;
			break;
		case 'royal tribute':
			return 2;
			break;
		case 'shien\'s smoke signal':
			return 2;
			break;
		case 'swords of revealing light':
			return 2;
			break;
		case 'bottomless trap hole':
			return 2;
			break;
		case 'magic cylinder':
			return 2;
			break;
		case 'mind crush':
			return 2;
			break;
		case 'ojama trio':
			return 2;
			break;
		case 'solemn warning':
			return 2;
			break;
		case 'torrential tribute':
			return 2;
			break;
	}
	return 3;
}
function cardeffect(eff) {
	var eff = eff.replace(/&break;/g, '<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>-</strong> ');
	var eff = eff.replace(/\?/g, '<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>-</strong> ');
	return eff;
}
function cardimage(card) {
	var set = card.set;
	var set0 = set.split('-')[0].toLowerCase();
	return '<img id="' + htmlescape(card.name) + '" src="http://ygosim.dyndns.org/ygo/cards/' + set0 + '/' + set + '.jpg" width="55" />';
}
function cardimagenew(card, i) {
	return cardimage(card).replace('width="55"', 'width="40" class="card_' + i + '"');
}
function cardimageSdeck(card) {
	var cardnum = (deck.extra.length-1)+(deck.side.length-1)+(deck.main.length-1);
	return cardimage(card).replace('width="55"', 'width="40" height="50" class="card_' + cardnum + '"');
}
function cardimageEdeck(card) {
	var cardnum = (deck.extra.length-1)+(deck.side.length-1)+(deck.main.length-1);
	return cardimage(card).replace('width="55"', 'width="40" height="50" class="card_' + cardnum + '"');
}
function cardimageMdeck(card) {
	var cardnum = (deck.extra.length-1)+(deck.side.length-1)+(deck.main.length-1);
	return cardimage(card).replace('width="55"', 'width="40" class="card_' + cardnum + '"');
}
function cardinfo(card) {
	var info = '<center><h3 style="text-decoration: underline;">' + card.name + '</h3>' + cardimage(card) + '</center>';
	if (card.subtype) {
		info += "<strong>Type:</strong> " + card.type + "/" + card.subtype + "<br />";
	}
	else {
		info += "<strong>Type:</strong> " + card.type + "<br />";
	}
	if (card.attribute) {
		info += "<strong>Attribute:</strong> " + card.attribute + "<br />";
	}
	if (card.atk) {
		info += "<br /><strong>Atk/Def:</strong> " + card.atk + "/" + card.def + "<br />";
	}
	if (card.level) {
		info += "<strong>Level:</strong> " + card.level + "<br />";
	}
	info += "<br />" + cardeffect(card.effect);
	return info;
}
function deckexport(deckname) {
	var deck = decks[deckname];
	var d = "";
	d += "MainDeck:\n";
	for (var i = 1; i < deck.main.length; i++) {
		d += deck.main[i] + "\n";
	}
	d += "\nExtraDeck:\n";
	for (var i = 1; i < deck.extra.length; i++) {
		d += deck.extra[i] + "\n";
	}
	d += "\nSideDeck:\n";
	for (var i = 1; i < deck.side.length; i++) {
		d += deck.side[i] + "\n";
	}
	return d;
}
function importdeck(d) {
	var main = d.split('MainDeck:\n')[1].split('\n\nExtraDeck:\n')[0];
	var main = main.split('\n');
	main.splice(0, 0, "");
	var extra = "\n" + d.split('\nExtraDeck:\n')[1].split('\nSideDeck:\n')[0];
	var extra = extra.split('\n');
	extra.splice(extra.length-1, 1);
	var side = "\n" + d.split('\nSideDeck:\n')[1];
	var side = side.split('\n');
	side.splice(side.length-1, 1);
	d = {
		main: main,
		extra: extra,
		side: side
	};
	return d;
}
function playrps() {
	$("#" + choice).css("outline", "none");
	var info = {
		rock: {
			win: "scissors",
			lose: "paper"
		},
		paper: {
			win: "rock",
			lose: "scissors"
		},
		scissors: {
			win: "paper",
			lose: "rock"
		}
	};
	$("#playit").html("").append('<img id="choice1" src="./imgs/' + choice + '.png" style="outline: 2px solid blue;" height="50px" /><img id="choice2" src="./imgs/' + choice2 + '.png" style="margin-left: 20px;outline: 2px solid red;" height="50px" />');
	if (choice == choice2) {
		//clear everything
		setTimeout(function() {
			$("#playit img").fadeOut(1000);
			choice = "";
			choice2 = "";
		}, 500);
		return false;
	}
	if (info[choice].win == choice2) {
		//you win
		$("#gofirst, #gosecond").removeAttr("disabled");
		$("#choice2").fadeOut(1000);
		$("#rpsops").fadeIn();
		return false;
	}
	//you lose
	$("#choice1").fadeOut(1000);
}