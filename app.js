io = require('socket.io').listen(8000);
fs = require('fs');

duels = [{
	phase: "dp",
	turn: "p1",
	winner: "",
	spectators: [],
	status: "started/completed",
	p1: {
		borrowed: ["slot"],
		status: "",
		id: 0,
		points: 8000,
		hand: [""],
		grave: [""],
		deck: [""],
		extra: [""],
		rfg: [""],
		side: [""],
		field: [""]
	},
	p2: {
		//same as p1 but this is just an example so yh im not gonna waste space and paste the same crap here
	}
}];

finding = [""];

users = [["username", "online", "authority", "socket", "ip", "color", "room"]];
challenges = {};

rooms = {
	"main": {
		users: ["userid"],
		desc: "The main server. Yay?"
	},
/*	"espanol": {
		users: ["userid"],
		desc: "Spanish server."
	},
*/
};

cc = require('./chat-commands.js');

sys = {
	send: function(msg, room) {
		sys.room.selfEmit('serverMessage', {msg: "<timestamp/>" + htmlescape(msg), room: room, src: sys.ds});
	},
	sendMessage: function(src, msg, room) {
		sys.room.selfEmit('serverMessage', {msg: htmlescape(msg), room: room, src: src});
	},
	sendAll: function(msg, room) {
		sys.room.emit('serverMessage', {msg: "<timestamp/>" + htmlescape(msg), room: room});
	},
	sendHtml: function(msg, room) {
		sys.room.selfEmit('serverMessage', {msg: msg, room: room, src: sys.ds});
	},
	sendHtmlMessage: function(src, msg, room) {
		sys.room.selfEmit('serverMessage', {msg: msg, room: room, src: src});
	},
	sendHtmlAll: function(msg, room) {
		sys.room.emit('serverMessage', {msg: msg, room: room});
	},
	userMessage: function(src, msg, room) {
		sys.room.emit('chatMessage', {user: users[src][0], symbol: users[src][2], message: msg, room: room, uid: src});
	},
	ID: function(sockid) {
		var user_id = 0;
		for (var i in users) {
			var currentSock = users[i][3];
			if (currentSock == sockid) {
				var user_id = i;
			}
		}
		return user_id;
	},
	id: function(name) {
		var user_id = 0;
		for (var i in users) {
			var currentName = users[i][0];
			if (currentName.toLowerCase() == name.toLowerCase()) {
				var user_id = i;
			}
		}
		return user_id;
	},
	name: function(src) {
		if (typeof users[src] == "undefined") {
			sys.send("That user does not exist.");
			return 0;
		}
		return users[src][0];
	},
	auth: function(src) {
		if (typeof users[src] == "undefined") {
			sys.send("That user does not exist.");
			return 0;
		}
		return users[src][2];
	},
	getColor: function(src) {
		if (typeof users[src] == "undefined") {
			sys.send("That user does not exist.");
			return 0;
		}
		return users[src][5];
	},
	changeColor: function(src, newcolor, room) {
		if (typeof users[src] == "undefined") {
			sys.send("That user does not exist.");
			return 0;
		}
		users[src][5] = newcolor;
		sys.room.emit('changeColor', {uid: src, color: newcolor, room: room});
	},
	sock: function(id) {
		if (typeof users[id] == "undefined") {
			sys.send("That user does not exist.");
			return 0;
		}
		return sys.socket(users[id][3]);
	},
	sockid: "",
	socket: function(sock) {
		sys.sockid = sock;
		var obj = new Object();
		function emit(event, data) {
			var sock = io.sockets.sockets[sys.sockid];
			if (typeof sock == "undefined") {
				return false;
			}
			sock.emit(event, data);
		}
		obj.emit = emit;
		return obj;
	},
	ip: function(src) {
		if (typeof users[src] == "undefined") {
			sys.send("That user does not exist.");
			return 0;
		}
		return src[4]
	},
	online: function(src) {
		if (typeof users[src] == "undefined") {
			sys.send("That user does not exist.");
			return 0;
		}
		return src[1];
	},
	onroom: function(src) {
		if (typeof users[src] == "undefined") {
			sys.send("That user does not exist.");
			return 0;
		}
		return users[src][6];
	},
	changeAuth: function(src, auth) {
		if (typeof users[src] == "undefined") {
			sys.send("That user does not exist.");
			return 0;
		}
		sys.getFileContent("auths.txt", function(data) {
			var a = sys.auth(src);
			var cleanname = escape(sys.name(src));
			users[src][2] = auth;
			if (auth == "") {
				sys.writeToFile("auths.txt", data.replace("[" + cleanname + "|" + a + "]", ""));
				return;
			}
			if (a == "") {
				sys.appendToFile("auths.txt", "[" + cleanname + "|" + auth + "]");
				return;
			}
			sys.writeToFile("auths.txt", data.replace("[" + cleanname + "|" + a + "]", "[" + cleanname + "|" + auth + "]"));
		});
		sys.sock(src).emit('changeAuth', auth);
	},
	redirect: function(src, url) {
		if (src == 0) {
			sys.send("That user does not exist.");
			return 0;
		}
		if (sys.online(src) == 0) {
			sys.send("That user is not currently online.");
			return 0;
		}
		sys.sock(src).emit('redirect', url);
		return 1;
	},
	kick: function(src, room) {
		if (typeof users[src] == "undefined") {
			sys.send("That user does not exist.", room);
			return 0;
		}
		if (typeof rooms[room] == "undefined") {
			var room = "main";
		}
		for (var i = 1; i < rooms[room].users.length; i++) {
			if (rooms[room].users[i] == src) {
				var id2 = i;
			}
		}
		if (typeof users[src] == "undefined" || typeof rooms[room].users[id2] == "undefined") {
			return false;
		}
		var usersname = users[src][0];
		sys.room.emit('leave', {
			userid: src,
			username: usersname,
			room: room
		});
		rooms[room].users.splice(id2, 1);
		users[src][1] = 0;
	},
	getFileContent: function(file, callback) {
		fs.readFile(file, function(err, data) {
			if (err) throw err;
			callback(data.toString());
		});
	},
	writeToFile: function(file, newval) {
		fs.writeFile(file, newval, function(err, data) {
			if (err) throw err;
		});
	},
	appendToFile: function(file, add) {
		sys.getFileContent(file, function(content) {
			sys.writeToFile(file, content + add);
		});
	},
	shuffle: function(deck) {
		console.log(deck);
		deck.splice(0, 1);
		for(var j, x, i = deck.length; i; j = parseInt(Math.random() * i), x = deck[--i], deck[i] = deck[j], deck[j] = x);
		deck.splice(0, 0, "");
		return deck;
	},
	startDuel: function(p1, p2) {
		sys.shuffle(p1.deck.main);
		sys.shuffle(p2.deck.main);
		var hand1 = ["", p1.deck.main[1], p1.deck.main[2], p1.deck.main[3], p1.deck.main[4], p1.deck.main[5]];
		var hand2 = ["", p2.deck.main[1], p2.deck.main[2], p2.deck.main[3], p2.deck.main[4], p2.deck.main[5]];
		for (var i = 1; i < 6; i++) {
			p1.deck.main.splice(i, 1);
		}
		for (var i = 1; i < 6; i++) {
			p2.deck.main.splice(i, 1);
		}
		//let them know who they're battling
		sys.sock(p1.user_id).emit('startDuel', {
			opp: {
				name: sys.name(p2.user_id),
				id: p2.user_id
			},
			hand1: hand1,
			hand2: hand2,
			extra: p1.deck.extra,
			oppextra: p2.deck.extra
		});
		sys.sock(p2.user_id).emit('startDuel', {
			opp: {
				name: sys.name(p1.user_id),
				id: p1.user_id
			},
			hand1: hand2,
			hand2: hand1,
			extra: p2.deck.extra,
			oppextra: p1.deck.extra
		});
		duels[duels.length] = {
			phase: "DP",
			turn: "p1",
			winner: "",
			spectators: [],
			status: "started",
			p1: {
				borrowed: ["slot"],
				status: "",
				id: p1.user_id,
				points: 8000,
				hand: hand1,
				grave: [""],
				deck: p1.deck.main,
				extra: p1.deck.extra,
				rfg: [""],
				side: p1.deck.side,
				field: [""]
			},
			p2: {
				borrowed: ["slot"],
				status: "",
				id: p2.user_id,
				points: 8000,
				hand: hand2,
				grave: [""],
				deck: p2.deck.main,
				extra: p2.deck.extra,
				rfg: [""],
				side: p2.deck.side,
				field: [""]
			}
		};
		console.log("NEW DUEL: " + p1.user_id + " VS " + p2.user_id);

		sys.sendAll("Battle started between " + sys.name(p1.user_id) + " and " + sys.name(p2.user_id) + ".", sys.onroom(p1.user_id));

		if (typeof cc.afterDuelStarted != "undefined") {
			cc.afterDuelStarted(p1.user_id, p2.user_id);
		}
	},
	isDueling: function(userid) {
		for (var i = 1; i < duels.length; i++) {
			if ((duels[i].p1.id == userid || duels[i].p2.id == userid) && duels[i].winner == "") {
				return duels[i];
			}
		}
	}
	,
	lastDuel: function(userid) {
		for (var i = duels.length-1; i > 0; i--) {
			if ((duels[i].p1.id == userid || duels[i].p2.id == userid) && duels[i].winner != "") {
				return duels[i];
			}
		}
	}
	,
	opp: function(userid) {
		var el = sys.isDueling(userid);
		if (el) {
			var opp = el.p2.id;
			if (userid == opp) {
				var opp = el.p1.id;
			}
			return opp;
		}
	}
	,
	lastOpp: function(userid) {
		var el = sys.lastDuel(userid);
		var opp = el.p2.id;
		if (userid == opp) {
			var opp = el.p1.id;
		}
		return opp;
	}
	,
	duelel: function(userid) {
		var el = sys.isDueling(userid).p2;
		if (userid != el.id) {
			var el = sys.isDueling(userid).p1;
		}
		return el;
	}
	,
	searchSlot: function(field, type) {
		//|1|, |2|, |3|, |4|, |5|, |6|, |7|, |8|, |9|, |10|, |11|
		// 4    3    5    2    6   11   10   12    9    13    1 
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
	}
	,
	searchUpperSlot: function(field) {
		if (typeof field[4] == "undefined") {return 4;}
		if (typeof field[3] == "undefined") {return 3;}
		if (typeof field[5] == "undefined") {return 5;}
		if (typeof field[2] == "undefined") {return 2;}
		if (typeof field[6] == "undefined") {return 6;}
		return 0;
	}
	,
	searchLowerSlot: function(field) {
		if (typeof field[11] == "undefined") {return 11;}
		if (typeof field[10] == "undefined") {return 10;}
		if (typeof field[12] == "undefined") {return 12;}
		if (typeof field[9] == "undefined") {return 9;}
		if (typeof field[13] == "undefined") {return 13;}
		return 0;
	},
	room: {
		emit: function(event, data) {
			for (var i = 1; i < rooms[data.room].users.length; i++) {
				sys.sock(rooms[data.room].users[i]).emit(event, data);
			}
		},
		selfEmit: function(event, data) {
			io.sockets.sockets[data.src].emit(event, data);
		},
		id: function(room, id) {
			var user_id = 0;
			for (var i in rooms[room].users) {
				if (rooms[room].users[i] == id) user_id = i;
			}
			return user_id;
		}
	}
};

io.sockets.on('connection', function (socket) {
	socket.on('disconnect', function () {
		var id = sys.ID(socket.id);
		if (id == 0) return false;
		var room = sys.onroom(id);
		if (typeof rooms[room] == "undefined") {
			var room = "main";
		}
		var id2 = sys.room.id(room, id);
		if (typeof users[id] == "undefined" || typeof rooms[room].users[id2] == "undefined") {
			return false;
		}
		rooms[room].users.splice(id2, 1);
		users[id][1] = 0;
		var usersname = sys.name(id);
		sys.room.emit('leave', {
			userid: id,
			username: usersname,
			room: room
		});
		sys.sock(id).emit('disconnected');
		console.log('LEAVE: ' + usersname);
	});
	socket.on('join', function(data) {
		var auth = "";
		var uid = 0;
		var nodc = false;
		var ip = socket.handshake.address.address;
		var color = data.color;
		var room = data.room;
		if (typeof rooms[room] == "undefined") {
			var room = "main";
		}
		if (typeof color == "undefined") {
			color = randomColor();
		}
		for (var i = 1; i < users.length; i++) {
			if (users[i][0].toLowerCase() == data.username.toLowerCase()) {
				var uid = i;
			}
		}
		if (uid == 0) var uid = users.length;
		sys.getFileContent("auths.txt", function(content) {
			var content = content.toLowerCase();
			var splint = content.split('[' + escape(data.username.toLowerCase()) + '|');
			if (splint.length-1 > 0) {
				auth = splint[1].split(']')[0];
			}
			if (uid != users.length && uid != 0) users[uid][2] = auth;
			sys.sock(uid).emit('changeAuth', auth);
		});
		for (var i = 1; i < rooms[room].users.length; i++) {
			if (rooms[room].users[i] == uid) {
				var nodc = true;
			}
		}
		if (nodc == false) {
			rooms[room].users[rooms[room].users.length] = uid;
		}
		else {
			sys.room.emit('leave', {
				userid: uid,
				username: sys.name(uid),
				room: room
			});
		}
		users[uid] = [data.username, 1, auth, socket.id, ip, color, room];
		var user_id = users.length-1;
		if (sys.isDueling(user_id)) {
			var extra = sys.isDueling(user_id);
		}
		else {
			var extra = null;
		}
		//userid, username
		var everyone = [""];
		for (var i = 1; i < rooms[room].users.length; i++) {
			var user = users[rooms[room].users[i]];
			if (typeof user == "undefined") {
				return false;
			}
			everyone[i] = [rooms[room].users[i], user[0], user[5]];
		}
		socket.emit('iJoin', {
			username: data.username,
			userid: uid,
			symbol: auth,
			everyone: everyone,
			duel: extra,
			room: room
		});
		sys.room.emit('join', {
			userid: uid,
			username: data.username,
			userinfo: [uid, data.username, users[uid][5]],
			symbol: auth,
			room: room
		});
		console.log('REGISTER: ' + data.username);
	});
	socket.on('leave', function(data) {
		var room = data.room;
		if (typeof rooms[room] == "undefined") {
			var room = "main";
		}
		for (var i = 1; i < rooms[room].users.length; i++) {
			if (rooms[room].users[i] == data.userid) {
				var id2 = i;
			}
		}
		if (typeof users[data.userid] == "undefined" || typeof rooms[room].users[id2] == "undefined") {
			return false;
		}
		var usersname = users[data.userid][0];
		sys.room.emit('leave', {
			userid: data.userid,
			username: usersname,
			room: room
		});
		rooms[room].users.splice(id2, 1);
		users[data.userid][1] = 0;
		console.log('LEAVE: ' + usersname);
	});
	socket.on('roomList', function(data) {
		socket.emit('roomList', rooms);
	});
	socket.on('chatMessage', function(data) {
		var room = data.room;
		if (typeof rooms[room] == "undefined") {
			var room = "main";
		}
		var uid = 0;
		var user = "";
		for (var i = 1; i < users.length; i++) {
			var currentName = users[i][0];
			if (currentName == data.user) {
				var user = users[i];
				var uid = i;
			}
		}
		if (uid == 0) {
			return false;
		}
		data.uid = uid;
		sys["ds"] = socket.id;
		cc.commands(sys, uid, data.message, room);
		if (cc.yesido == 1) {
			data.room = room;
			sys.room.emit('chatMessage', data);
		}
		cc.yesido = 1;
	});
	socket.on('pmuser', function(data) {
		sys.sock(data.target).emit('pmuser', data);
	});
	socket.on('find', function(data) {
		for (var i = 1; i < finding.length; i++) {
			if (finding[i].user_id == data.user_id) {
				return false;
			}
		}
		if (finding.length > 1) {
			//means someone else is finding
			//so now we start a duel between data and finding[finding.length]
			sys.startDuel(data, finding[finding.length-1]);
			finding.splice(finding.length-1, 1);
			return false;
		}
		finding[finding.length] = data;
	});
	socket.on('cancelfind', function(data) {
		var spot = 0;
		for (var i = 1; i < finding.length; i++) {
			if (finding[i].user_id == data) {
				var spot = i;
			}
		}
		if (spot != 0) {
			finding.splice(spot, 1);
		}
	});
	socket.on('challenge', function(data) {
		if (typeof challenges[data.target + "*" + data.challenger] != "undefined" || typeof challenges[data.challenger + "*" + data.target] != "undefined") return false;
		challenges[data.target + "*" + data.challenger] = data;
		sys.sock(data.target).emit('challenge', data);
	});
	socket.on('challenge accepted', function(data) {
		if (typeof sys.isDueling(data.challenger) == "undefined") {
			sys.startDuel({user_id: data.challenger, deck: challenges[data.target + "*" + data.challenger].deck}, {user_id: data.target, deck: data.deck});
		}
		else {
			sys.sock(data.challenger).emit('challenge accept too late');
		}
		delete challenges[data.target + "*" + data.challenger];
		delete challenges[data.challenger + "*" + data.target];
	});
	socket.on('challenge decline', function(data) {
		delete challenges[data.target + "*" + data.challenger];
		delete challenges[data.challenger + "*" + data.target];
		sys.sock(data.challenger).emit('challenge decline', data);
	});
	socket.on('duel-chat', function(data) {
		var opp = sys.opp(data.userid);
		if (!opp) {
			//duel is completed so we need to look for our last opp id
			var opp = sys.lastOpp(data.userid);
		}
		var oppsock = sys.sock(opp);
		if (typeof oppsock == "undefined") {
			return false;
		}
		oppsock.emit('duel-chat', {
			username: data.username,
			userid: data.userid,
			message: data.message
		});
	});
	socket.on('HAND - t. of deck', function(data) {
		sys.duelel(data.userid).deck.splice(1, 0, sys.duelel(data.userid).hand[data.num]);
		sys.duelel(data.userid).hand.splice(data.num, 1);
		sys.sock(sys.opp(data.userid)).emit('HAND - t. of deck', data);
	});
	socket.on('HAND - b. of deck', function(data) {
		var el = sys.duelel(data.userid);
		el.deck.splice(el.deck.length, 0, el.hand[data.num]);
		el.hand.splice(data.num, 1);
		sys.sock(sys.opp(data.userid)).emit('HAND - b. of deck', data);
	});
	socket.on('HAND - to grave', function(data) {
		var el = sys.duelel(data.userid);
		el.grave[el.grave.length] = el.hand[data.num];
		el.hand.splice(data.num, 1);
		sys.sock(sys.opp(data.userid)).emit('HAND - to grave', data);
	});
	socket.on('HAND - banish', function(data) {
		var el = sys.duelel(data.userid);
		el.rfg[el.rfg.length] = el.hand[data.num];
		el.hand.splice(data.num, 1);
		sys.sock(sys.opp(data.userid)).emit('HAND - banish', data);
	});
	socket.on('HAND - spe. s. atk', function(data) {
		var el = sys.duelel(data.userid);
		var slot = sys.searchSlot(el.field, "monster");
		if (slot == 0) {
			return false;
		}
		data.slot = slot;
		el.field[slot] = el.hand[data.num];
		el.hand.splice(data.num, 1);
		sys.sock(sys.opp(data.userid)).emit('HAND - spe. s. atk', data);
	});
	socket.on('HAND - spe. s. def', function(data) {
		var el = sys.duelel(data.userid);
		var slot = sys.searchSlot(el.field, "monster");
		if (slot == 0) {
			return false;
		}
		data.slot = slot;
		el.field[slot] = el.hand[data.num];
		el.hand.splice(data.num, 1);
		sys.sock(sys.opp(data.userid)).emit('HAND - spe. s. def', data);
	});
	socket.on('HAND - summon', function(data) {
		var el = sys.duelel(data.userid);
		var slot = sys.searchSlot(el.field, "monster");
		if (slot == 0) {
			return false;
		}
		data.slot = slot;
		el.field[slot] = el.hand[data.num];
		el.hand.splice(data.num, 1);
		sys.sock(sys.opp(data.userid)).emit('HAND - summon', data);
	});
	socket.on('HAND - activate', function(data) {
		var el = sys.duelel(data.userid);
		var slot = sys.searchSlot(el.field, "s/t");
		if (slot == 0) {
			return false;
		}
		data.slot = slot;
		el.field[slot] = el.hand[data.num];
		el.hand.splice(data.num, 1);
		sys.sock(sys.opp(data.userid)).emit('HAND - activate', data);
	});
	socket.on('HAND - set', function(data) {
		var el = sys.duelel(data.userid);
		var slot = sys.searchSlot(el.field, data.type);
		if (slot == 0) {
			return false;
		}
		data.slot = slot;
		el.field[slot] = el.hand[data.num];
		el.hand.splice(data.num, 1);
		sys.sock(sys.opp(data.userid)).emit('HAND - set', data);
	});
	socket.on('addlp', function(data) {
		sys.sock(sys.opp(data.userid)).emit('addlp', data);
		var el = sys.duelel(data.userid);
		el.points = eval(el.points + '+' + data.amount);
	});
	socket.on('sublp', function(data) {
		sys.sock(sys.opp(data.userid)).emit('sublp', data);
		var el = sys.duelel(data.userid);
		el.points = el.points - data.amount;
	});
	socket.on('draw', function(data) {
		var el = sys.duelel(data.userid);
		if (el.deck.length-1 == 0) {
			return false;
		}
		socket.emit('draw', {
			userid: data.userid,
			card: el.deck[1]
		});
		sys.sock(sys.opp(data.userid)).emit('draw', {
			userid: data.userid,
			card: el.deck[1]
		});
		el.hand[el.hand.length] = el.deck[1];
		el.deck.splice(1, 1);
	});
	socket.on('shuffle', function(data) {
		var el = sys.duelel(data.userid);
		if (el.deck.length-1 == 0) {
			return false;
		}
		el.deck = sys.shuffle(el.deck);
		sys.sock(sys.opp(data.userid)).emit('shuffle', data);
		socket.emit('shuffle', data);
	});
	socket.on('mill', function(data) {
		var el = sys.duelel(data.userid);
		if (el.deck.length-1 == 0) {
			return false;
		}
		socket.emit('mill', {
			userid: data.userid,
			card: el.deck[1]
		});
		sys.sock(sys.opp(data.userid)).emit('mill', {
			userid: data.userid,
			card: el.deck[1]
		});
		el.grave[el.grave.length] = el.deck[1];
		el.deck.splice(1, 1);
	});
	socket.on('banish t.', function(data) {
		var el = sys.duelel(data.userid);
		if (el.deck.length-1 == 0) {
			return false;
		}
		socket.emit('banish t.', {
			userid: data.userid,
			card: el.deck[1]
		});
		sys.sock(sys.opp(data.userid)).emit('banish t.', {
			userid: data.userid,
			card: el.deck[1]
		});
		el.rfg[el.rfg.length] = el.deck[1];
		el.deck.splice(1, 1);
	});
	socket.on('deck - view', function(data) {
		var el = sys.duelel(data.userid);
		el.status = "Viewing Deck";
		socket.emit('deck - view', {
			userid: data.userid,
			deck: el.deck
		});
		sys.sock(sys.opp(data.userid)).emit('deck - view', data);
	});
	socket.on('deck - show', function(data) {
		var el = sys.duelel(sys.opp(data.userid));
		el.status = "Viewing Opp Deck";
		socket.emit('deck - show', data);
		sys.sock(sys.opp(data.userid)).emit('deck - show', {
			userid: data.userid,
			deck: sys.duelel(data.userid).deck
		});
	});
	socket.on('clearstatus', function(data) {
		var el = sys.duelel(data.userid);
		el.status = "";
		sys.sock(sys.opp(data.userid)).emit('clearstatus', {
			userid: data.userid
		});
	});
	socket.on('extra - view', function(data) {
		var el = sys.duelel(data.userid);
		el.status = "Viewing Extra Deck";
		sys.sock(sys.opp(data.userid)).emit('extra - view', data);
	});
	socket.on('extra - show', function(data) {
		var el = sys.duelel(sys.opp(data.userid));
		el.status = "Viewing Opp Extra Deck";
		socket.emit('extra - show', data);
		sys.sock(sys.opp(data.userid)).emit('extra - show', {
			userid: data.userid,
			extra: sys.duelel(data.userid).extra
		});
	});
	socket.on('updateStatus', function(data) {
		var el = sys.duelel(data.userid);
		el.status = data.status;
		sys.sock(sys.opp(data.userid)).emit('updateStatus', data.status);
	});
	socket.on('nest - to b. deck', function(data) {
		var el = sys.duelel(data.userid);
		el.deck.splice(el.deck.length, 0, el.field[data.slot]);
		el.field[data.slot] = undefined;
		sys.sock(sys.opp(data.userid)).emit('nest - to b. deck', data);
	});
	socket.on('nest - to t. deck', function(data) {
		sys.duelel(data.userid).deck.splice(1, 0, sys.duelel(data.userid).field[data.slot]);
		sys.duelel(data.userid).field[data.slot] = undefined;
		sys.sock(sys.opp(data.userid)).emit('nest - to t. deck', data);
	});
	socket.on('nest - to hand', function(data) {
		var el = sys.duelel(data.userid);
		el.hand[el.hand.length] = el.field[data.slot];
		el.field[data.slot] = undefined;
		sys.sock(sys.opp(data.userid)).emit('nest - to hand', data);
	});
	socket.on('nest - banish', function(data) {
		var el = sys.duelel(data.userid);
		el.rfg[el.rfg.length] = el.field[data.slot];
		el.field[data.slot] = undefined;
		sys.sock(sys.opp(data.userid)).emit('nest - banish', data);
	});
	socket.on('nest - set', function(data) {
		sys.sock(sys.opp(data.userid)).emit('nest - set', data);
	});
	socket.on('nest - to def.', function(data) {
		sys.sock(sys.opp(data.userid)).emit('nest - to def.', data);
	});
	socket.on('nest - to grave', function(data) {
		var el = sys.duelel(data.userid);
		el.grave[el.grave.length] = el.field[data.slot];
		el.field[data.slot] = undefined;
		sys.sock(sys.opp(data.userid)).emit('nest - to grave', data);
	});
	socket.on('nest - to atk.', function(data) {
		sys.sock(sys.opp(data.userid)).emit('nest - to atk.', data);
	});
	socket.on('nest - flip', function(data) {
		sys.sock(sys.opp(data.userid)).emit('nest - flip', data);
	});
	socket.on('nest - flip summon', function(data) {
		sys.sock(sys.opp(data.userid)).emit('nest - flip summon', data);
	});
	socket.on('nest - to s/t', function(data) {
		var el = sys.duelel(data.userid);
		var stslot = sys.searchLowerSlot(el.field);
		if (stslot == 0) {
			return false;
		}
		el.field[stslot] = el.field[data.slot];
		el.field[data.slot] = undefined;
		sys.sock(sys.opp(data.userid)).emit('nest - to s/t', data);
	});
	socket.on('nest - give control', function(data) {
		var el = sys.duelel(sys.opp(data.userid));
		var youel = sys.duelel(data.userid);
		var oppslot = sys.searchUpperSlot(el.field);
		if (oppslot == 0) {
			return false;
		}
		el.borrowed[el.borrowed.length] = oppslot;
		el.field[oppslot] = youel.field[data.slot];
		youel.field[data.slot] = undefined;
		sys.sock(sys.opp(data.userid)).emit('nest - give control', data);
	});
	socket.on('nest - to mon. zone', function(data) {
		var el = sys.duelel(data.userid);
		var upslot = sys.searchUpperSlot(el.field);
		if (upslot == 0) {
			return false;
		}
		el.field[upslot] = el.field[data.slot];
		el.field[data.slot] = undefined;
		sys.sock(sys.opp(data.userid)).emit('nest - to mon. zone', data);
	});
	socket.on('nest lower - set', function(data) {
		sys.sock(sys.opp(data.userid)).emit('nest lower - set', data);
	});
	socket.on('nest - activate', function(data) {
		sys.sock(sys.opp(data.userid)).emit('nest - activate', data);
	});
	socket.on('atk directly', function(data) {
		sys.sock(sys.opp(data.userid)).emit('atk directly', data);
	});
	socket.on('attack', function(data) {
		sys.sock(sys.opp(data.userid)).emit('attack', data);
	});
	socket.on('view extra deck - banish', function(data) {
		var el = sys.duelel(data.userid);
		el.rfg[el.rfg.length] = el.extra[data.slot];
		el.extra.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view extra deck - banish', data);
	});
	socket.on('view extra deck - to grave', function(data) {
		var el = sys.duelel(data.userid);
		el.grave[el.grave.length] = el.extra[data.slot];
		el.extra.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view extra deck - to grave', data);
	});
	socket.on('view extra deck - spe. s. atk', function(data) {
		var el = sys.duelel(data.userid);
		var slot = sys.searchSlot(el.field, "monster");
		if (slot == 0) {
			return false;
		}
		data.slot2 = slot;
		el.field[slot] = el.extra[data.slot];
		el.extra.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view extra deck - spe. s. atk', data);
	});
	socket.on('view extra deck - spe. s. def', function(data) {
		var el = sys.duelel(data.userid);
		var slot = sys.searchSlot(el.field, "monster");
		if (slot == 0) {
			return false;
		}
		data.slot2 = slot;
		el.field[slot] = el.extra[data.slot];
		el.extra.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view extra deck - spe. s. def', data);
	});
	socket.on('extra deck monster - to extra', function(data) {
		var el = sys.duelel(data.userid);
		el.extra[el.extra.length] = el.field[data.slot];
		el.field[data.slot] = undefined;
		sys.sock(sys.opp(data.userid)).emit('extra deck monster - to extra', data);
	});
	socket.on('view grave - to s/t', function(data) {
		var el = sys.duelel(data.userid);
		var stslot = sys.searchLowerSlot(el.field);
		if (stslot == 0) {
			return false;
		}
		el.field[stslot] = el.grave[data.slot];
		el.grave.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view grave - to s/t', data);
	});
	socket.on('view grave - to b. deck', function(data) {
		var el = sys.duelel(data.userid);
		el.deck.splice(el.deck.length, 0, el.grave[data.slot]);
		el.grave.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view grave - to b. deck', data);
	});
	socket.on('view grave - to t. deck', function(data) {
		var el = sys.duelel(data.userid);
		el.deck.splice(1, 0, el.grave[data.slot]);
		el.grave.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view grave - to t. deck', data);
	});
	socket.on('view grave - banish', function(data) {
		var el = sys.duelel(data.userid);
		el.rfg[el.rfg.length] = el.grave[data.slot];
		el.grave.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view grave - banish', data);
	});
	socket.on('view grave - to hand', function(data) {
		var el = sys.duelel(data.userid);
		el.hand[el.hand.length] = el.grave[data.slot];
		el.grave.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view grave - to hand', data);
	});
	socket.on('view grave - ss atk', function(data) {
		var el = sys.duelel(data.userid);
		var slot = sys.searchSlot(el.field, "monster");
		if (slot == 0) {
			return false;
		}
		data.slot2 = slot;
		el.field[slot] = el.grave[data.slot];
		el.grave.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view grave - ss atk', data);
	});
	socket.on('view grave - ss def', function(data) {
		var el = sys.duelel(data.userid);
		var slot = sys.searchSlot(el.field, "monster");
		if (slot == 0) {
			return false;
		}
		data.slot2 = slot;
		el.field[slot] = el.grave[data.slot];
		el.grave.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view grave - ss def', data);
	});
	socket.on('view grave - to extra', function(data) {
		var el = sys.duelel(data.userid);
		el.extra[el.extra.length] = el.grave[data.slot];
		el.grave.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view grave - to extra', data);
	});
	socket.on('view rfg - to t. deck', function(data) {
		var el = sys.duelel(data.userid);
		el.deck.splice(1, 0, el.rfg[data.slot]);
		el.rfg.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view rfg - to t. deck', data);
	});
	socket.on('view rfg - to grave', function(data) {
		var el = sys.duelel(data.userid);
		el.grave[el.grave.length] = el.rfg[data.slot];
		el.rfg.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view rfg - to grave', data);
	});
	socket.on('view rfg - to hand', function(data) {
		var el = sys.duelel(data.userid);
		el.hand[el.hand.length] = el.rfg[data.slot];
		el.rfg.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view rfg - to hand', data);
	});
	socket.on('view rfg - ss atk', function(data) {
		var el = sys.duelel(data.userid);
		var slot = sys.searchSlot(el.field, "monster");
		if (slot == 0) {
			return false;
		}
		data.slot2 = slot;
		el.field[slot] = el.rfg[data.slot];
		el.rfg.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view rfg - ss atk', data);
	});
	socket.on('view rfg - ss def', function(data) {
		var el = sys.duelel(data.userid);
		var slot = sys.searchSlot(el.field, "monster");
		if (slot == 0) {
			return false;
		}
		data.slot2 = slot;
		el.field[slot] = el.rfg[data.slot];
		el.rfg.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view rfg - ss def', data);
	});
	socket.on('view rfg - to extra', function(data) {
		var el = sys.duelel(data.userid);
		el.extra[el.extra.length] = el.rfg[data.slot];
		el.rfg.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view rfg - to extra', data);
	});
	socket.on('view deck - to s/t', function(data) {
		var el = sys.duelel(data.userid);
		var stslot = sys.searchLowerSlot(el.field);
		if (stslot == 0) {
			return false;
		}
		data.card = el.deck[data.slot];
		el.field[stslot] = el.deck[data.slot];
		el.deck.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view deck - to s/t', data);
	});
	socket.on('view deck - banish', function(data) {
		var el = sys.duelel(data.userid);
		data.card = el.deck[data.slot];
		el.rfg[el.rfg.length] = el.deck[data.slot];
		el.deck.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view deck - banish', data);
	});
	socket.on('view deck - to grave', function(data) {
		var el = sys.duelel(data.userid);
		data.card = el.deck[data.slot];
		el.grave[el.grave.length] = el.deck[data.slot];
		el.deck.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view deck - to grave', data);
	});
	socket.on('view deck - to hand', function(data) {
		var el = sys.duelel(data.userid);
		data.card = el.deck[data.slot];
		el.hand[el.hand.length] = el.deck[data.slot];
		el.deck.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view deck - to hand', data);
	});
	socket.on('view deck - ss def', function(data) {
		var el = sys.duelel(data.userid);
		var slot = sys.searchSlot(el.field, "monster");
		if (slot == 0) {
			return false;
		}
		data.card = el.deck[data.slot];
		data.slot2 = slot;
		el.field[slot] = el.deck[data.slot];
		el.deck.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view deck - ss def', data);
	});
	socket.on('view deck - ss atk', function(data) {
		var el = sys.duelel(data.userid);
		var slot = sys.searchSlot(el.field, "monster");
		if (slot == 0) {
			return false;
		}
		data.card = el.deck[data.slot];
		data.slot2 = slot;
		el.field[slot] = el.deck[data.slot];
		el.deck.splice(data.slot, 1);
		sys.sock(sys.opp(data.userid)).emit('view deck - ss atk', data);
	});
	socket.on('view deck - banish fd', function(data) {
		//need to do
	});
	socket.on('phase', function(data) {
		sys.sock(sys.opp(data.userid)).emit('phase', data);
		var el = sys.isDueling(data.userid);
		el.phase = data.phase;
	});
	socket.on('duel - admit defeat', function(data) {
		var el = sys.isDueling(data.userid);
		if (!el) {
			//game already has a winner
			return false;
		}
		var opp = sys.opp(data.userid);
		el.status = "completed";
		el.winner = sys.duelel(opp).name;
		sys.sock(opp).emit('admitdefeat', data);
		
		var loser = data.userid;
		var winner = opp;
		sys.sendAll(sys.name(winner) + " won their duel against " + sys.name(loser), sys.onroom(winner));
		if (typeof cc.afterDuelEnded != "undefined") {
			cc.afterDuelEnded(winner, loser);
		}
	});
	socket.on('leave duel', function(data) {
		//look for old opp socket
		var lastopp = sys.lastOpp(data.userid);
		sys.sock(lastopp).emit('leaveduel', data);
	});
	socket.on('selection', function(data) {
		var opp = sys.opp(data.userid);
		sys.sock(opp).emit('selection', data);
	});
	socket.on('playrps', function(data) {
		var opp = sys.opp(data.userid);
		sys.sock(opp).emit('playrps', data);
	});
	socket.on('rpschoose', function(data) {
		var opp = sys.opp(data.userid);
		if (!opp) {
			//duel is completed so we need to look for our last opp id
			var opp = sys.lastOpp(data.userid);
		}
		var oppsock = sys.sock(opp);
		if (typeof oppsock == "undefined") {
			return false;
		}
		oppsock.emit('rpschoose', {message: sys.name(data.userid) + " is going <b>" + data.choice + "</b>", choice: data.choice});
		socket.emit('rpschoose', {message: sys.name(data.userid) + " is going <b>" + data.choice + "</b>", choice: data.choice});
	});
});

function htmlescape(text) {
	var m = text.toString();
	if(m.length > 0) {
		return m.replace(/\&/g, "&amp;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;");
	}
	else {
		return "";
	}
}
function randomColor() {
	return '#'+Math.floor(Math.random()*16777215).toString(16);
}