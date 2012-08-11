function iSomething(data) {
	username = data.username;
	user_id = data.userid;
	authority = data.symbol;
	ygo.getUsers(data.everyone);
	$.ajax({
		type: "POST",
		url: "post.php",
		data: "d=teams&u=" + username,
		success: function(data) {
			var deck = data.split('|');
			var count = deck.length-1;
			for (var i = 0; i < count; i++) {
				var current = deck[i];
				var deckname = current.split('^')[0];
				var d = current.split('^')[1];
				var main = "\n" + d.split('MainDeck:\n')[1].split('\n\nExtraDeck:\n')[0];
				var main = main.split('\n');
				var extra = "\n" + d.split('\nExtraDeck:\n')[1].split('\nSideDeck:\n')[0];
				var extra = extra.split('\n');
				extra.splice(extra.length-1, 1);
				var side = "\n" + d.split('\nSideDeck:\n')[1];
				var side = side.split('\n');
				decks[deckname] = {
					main: main,
					extra: extra,
					side: side
				};
			}
		}
	});
	for (var i = 1; i < data.duels.length; i++) {
		ygo.addDuel(data.duels[i]);
	}
	if (data.duel != null) {
		
	}
}
socket.on('iJoin', function(data) {
	iSomething(data);
	room = data.room;
});
socket.on('leave', function(data) {
	ygo.userLeave(data);
});
socket.on('join', function(data) {
	if (data.room != room) {
		return false;
	}
	ygo.userJoin(data);
});
socket.on('disconnected', function() {
	if (user_id == 0) return false;
	notice("You disconnected.<br /><button onclick=\"socket.emit(\'reconnect\');$(\'#notice-close\').mousedown();\">Reconnect</button></a>");
});
socket.on('chatMessage', function(data) {
	ygo.formatSendChat(data);
});
socket.on('serverMessage', function(data) {
	data.msg = data.msg.replace(/<timestamp\/>/g, ygo.timestamp());
	ygo.chatMessage("<td>" + data.msg + "</td>");
});
socket.on('redirect', function(data) {
	window.location.href = data;
});
socket.on('challenge', function(data) {
	challenges[data.challenger] = data;
	$("#challenges").prepend('<div id="challenge' + data.challenger + '" class="unselectable challenge"><div class="challengeHeader">Challenge</div><table cellpadding="0" cellspacing="0" align="center"><tr><td align="center"><b>From:</b> ' + htmlesc(users[data.challenger][1]) + '<br /><select id="challengeselect' + data.challenger + '"></select><br /><button onclick="challengeaccepted(' + data.challenger + ');">Accept</button><button onclick="challengedeclined(' + data.challenger + ');">Decline</button></td></tr></table></div></div>');
	$("#challengeselect" + data.challenger).html("");
	for (var i in decks) {
		$("#challengeselect" + data.challenger).append("<option>" + i + "</option>");
	}
});
socket.on('challenge accept too late', function() {
	ygo.chatMessage('<font color="red">' + ygo.timestamp() + '<b>You accepted to late. This user is already dueling.</b></font>');
});
socket.on('challenge decline', function(data) {
	delete challenges[data.target];
	ygo.chatMessage('<font color="red">' + ygo.timestamp() + '<b>' + users[data.target][1] + ' rejected your challenge.</b></font>');
});
socket.on('pmuser', function(data) {
	if ($("#pm" + data.uid).length > 0) {
		$("#pm" + data.uid).show();
	}
	else {
		$("body").append('<div class="pm" id="pm' + data.uid + '"><div class="pmheader unselectable" id="' + data.uid + '"><b>PM: </b> ' + htmlesc(users[data.uid][1]) + '<span class="pmexit" onclick="$(\'#pm' + data.uid + '\').fadeOut();">X</span></div><div class="pmlogs" id="pmlogs' + data.uid + '"></div><input type="text" class="pminput" id="' + data.uid + '" /></div>');
		pms[data.uid] = users[data.uid];
	}
	ygo.pmuser(data);
});
socket.on('changeColor', function(data) {
	if (data.uid == user_id) {
		eatcookie("color");
		bake("color", data.color, 365);
	}
	users[data.uid][2] = data.color;
	ygo.usersChanged();
});
socket.on('changeAuth', function(data) {
	authority = data;
});
socket.on('newDuel', function(data) {
	ygo.duelStart(data);
});
socket.on('duel end', function(data) {
	$("#duel" + data.duelid).remove();
});
socket.on('startDuel', function(data) {
	delete challenges[data.opp.id];

	//restart visuals
	$("#duel").show();
	$("#rps").css({
		position: "absolute",
		top: $("#youhand").position().top + "px",
		left: $(".division").offset().left + "px"
	}).show();
	$("#everything-main").hide();
	$("#o_fd").html("Find Duel");
	$("#duel-chat-message").val("");
	$("#duel-chat-logs").html("");
	
	$("#duel-you-name").html(username);
	$("#duel-opp-name").html(data.opp.name);
	$("#duel-you-lp").css("width", "100%");
	$("#duel-opp-lp").css("width", "100%");
	$("#duel-you-lpnum").html(8000);
	$("#duel-opp-lpnum").html(8000);
	$("#duel-you-info").attr("class", "");
	$("#duel-opp-info").attr("class", "");
	$("#" + duel.phase).attr("class", "");
	$("#dp").attr("class", "selected-phase");
	$("#youbanished").html("");
	$("#oppbanished").html("");
	$("#youhand").html("");
	$("#opphand").html("");
	
	var clearslots = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13];
	for (var i = 0; i < clearslots.length; i++) {
		$("#you" + clearslots[i]).html("");
		$("#opp" + clearslots[i]).html("");
	}
	
	//resets statuses
	ygo.finding = 0;
	duel.status = 1;
	duel.you.name = username;
	duel.opp.name = data.opp.name;
	duel.you.id = user_id;
	duel.opp.id = data.opp.id;
	duel.you.hand = data.hand1;
	duel.opp.hand = data.hand2;
	duel.you.extra = data.extra;
	duel.opp.extra = data.oppextra;
	duel.turn = "";
	duel.you.field = [""];
	duel.opp.field = [""];
	duel.you.borrowed = [""];
	duel.opp.borrowed = [""];
	duel.phase = "dp";
	duel.you.decklen = 0;
	duel.opp.decklen = 0;
	duel.winner = "";
	duel.you.overlayed = {
		"2": [],
		"3": [],
		"4": [],
		"5": [],
		"6": []
	};
	duel.opp.overlayed = {
		"2": [],
		"3": [],
		"4": [],
		"5": [],
		"6": []
	};

	//draw 5
	for (var i = 1; i < duel.you.hand.length; i++) {
		$("#youhand").append(ygo.format.you.hand(duel.you.hand[i]).replace('/>', 'class="' + i + '" />'));
	}
	for (var i = 1; i < duel.opp.hand.length; i++) {
		$("#opphand").append(ygo.format.opp.hand(duel.opp.hand[i]).replace('/>', 'class="' + i + '" />'));
	}
	
	$("#card-list").css({
		left: $("#oppdivision").offset().left + "px",
		top: $("#oppdivision").offset().top + "px",
		width: $("#oppdivision").width() + "px",
		height: $("#oppdivision").height() + "px"
	});
	$("#youstatus").css({
		left: $("#youimg").offset().left - ($(this).width() / 2) + "px"
	});
	$("#oppstatus").css({
		left: $("#oppimg").offset().left - ($(this).width() / 2) + "px"
	});
});
socket.on('duel-chat', function(data) {
	ygo.duelChatMessage(data);
});
socket.on('HAND - t. of deck', function(data) {
	$("#opphand ." + data.num).remove();
	duel.opp.hand.splice(data.num, 1);
	duel.opp.reset(data.num);
});
socket.on('HAND - b. of deck', function(data) {
	$("#opphand ." + data.num).remove();
	$("#opphand ." + data.num).remove();
	duel.opp.hand.splice(data.num, 1);
	duel.opp.reset(data.num);
});
socket.on('HAND - to grave', function(data) {
	duel.opp.grave[duel.opp.grave.length] = duel.opp.hand[data.num];
	$("#opp7").html(ygo.dfc(duel.opp.hand[data.num]));
	$("#opphand ." + data.num).remove();
	duel.opp.reset(data.num);
	duel.opp.hand.splice(data.num, 1);
});
socket.on('HAND - banish', function(data) {
	duel.opp.rfg[duel.opp.rfg.length] = duel.opp.hand[data.num];
	$("#oppbanished").html(ygo.dfc(duel.opp.hand[data.num]));
	$("#opphand ." + data.num).remove();
	duel.opp.hand.splice(data.num, 1);
	duel.opp.reset(data.num);
});
socket.on('HAND - spe. s. atk', function(data) {
	duel.opp.field[data.slot] = duel.opp.hand[data.num];
	$("#opp" + data.slot).html(ygo.dfc(duel.opp.hand[data.num]));
	$("#opphand ." + data.num).remove();
	duel.opp.hand.splice(data.num, 1);
	duel.opp.reset(data.num);
});
socket.on('HAND - spe. s. def', function(data) {
	duel.opp.field[data.slot] = duel.opp.hand[data.num];
	$("#opp" + data.slot).html(ygo.dfcdefense(duel.opp.hand[data.num]));
	$("#opphand ." + data.num).remove();
	duel.opp.hand.splice(data.num, 1);
	duel.opp.reset(data.num);
});
socket.on('HAND - summon', function(data) {
	duel.opp.field[data.slot] = duel.opp.hand[data.num];
	$("#opp" + data.slot).html(ygo.dfc(duel.opp.hand[data.num]));
	$("#opphand ." + data.num).remove();
	duel.opp.hand.splice(data.num, 1);
	duel.opp.reset(data.num);
});
socket.on('HAND - activate', function(data) {
	duel.opp.field[data.slot] = duel.opp.hand[data.num];
	$("#opp" + data.slot).html(ygo.dfc(duel.opp.hand[data.num]));
	$("#opphand ." + data.num).remove();
	duel.opp.hand.splice(data.num, 1);
	duel.opp.reset(data.num);
});
socket.on('HAND - set', function(data) {
	var type = "facedowndfc";
	if (data.type == "monster") {
		var type = "facedowndefensedfc";
	}
	duel.opp.field[data.slot] = duel.opp.hand[data.num];
	$("#opp" + data.slot).html(ygo[type](duel.opp.hand[data.num]));
	$("#opphand ." + data.num).remove();
	duel.opp.hand.splice(data.num, 1);
	duel.opp.reset(data.num);
});
socket.on('phase', function(data) {
	$(".selected-phase").attr("class", "");
	$("#et").attr("class", "");
	$("#" + data.phase).attr("class", "selected-phase");
	if ($("#" + data.phase).attr("id") == "et") {
		$("#" + data.phase).attr("class", "blink");
	}
});
socket.on('addlp', function(data) {
	duel.opp.points = eval(duel.opp.points + '+' + data.amount);
	var percent = (duel.opp.points / 8000) * 100;
	if (percent > 100) {
		var percent = 100;
	}
	if (percent < 0) {
		var percent = 0;
	}
	$("#duel-opp-lp").animate({"width": percent + "%"});
	$("#duel-opp-lpnum").html(duel.opp.points);
});
socket.on('sublp', function(data) {
	duel.opp.points = duel.opp.points - data.amount;
	var percent = (duel.opp.points / 8000) * 100;
	if (percent > 100) {
		var percent = 100;
	}
	if (percent < 0) {
		var percent = 0;
	}
	$("#duel-opp-lp").animate({"width": percent + "%"});
	$("#duel-opp-lpnum").html(duel.opp.points);
});
socket.on('draw', function(data) {
	if (user_id == data.userid) {
		$("#youhand").append(ygo.format.you.hand(data.card).replace('/>', 'class="' + duel.you.hand.length + '" />'));
		duel.you.hand[duel.you.hand.length] = data.card;
	}
	else {
		$("#opphand").append(ygo.format.opp.hand(data.card).replace('/>', 'class="' + duel.opp.hand.length + '" />'));
		duel.opp.hand[duel.opp.hand.length] = data.card;
	}
});
socket.on('mill', function(data) {
	if (user_id == data.userid) {
		$("#you7").html(ygo.dfc(data.card));
		duel.you.grave[duel.you.grave.length] = data.card;
	}
	else {
		$("#opp7").html(ygo.dfc(data.card));
		duel.opp.grave[duel.opp.grave.length] = data.card;
	}
});
socket.on('banish t.', function(data) {
	if (user_id == data.userid) {
		$("#youbanished").html(ygo.dfc(data.card));
		duel.you.rfg[duel.you.rfg.length] = data.card;
	}
	else {
		$("#oppbanished").html(ygo.dfc(data.card));
		duel.opp.rfg[duel.opp.rfg.length] = data.card;
	}
});
socket.on('shuffle', function(data) {
	//only data = userid (data.userid) && only opponent can use this ok ok
	//maybe do an animation or something or mention the shuffling in the logs.
	shuffleanim();
});
socket.on('deck - view', function(data) {
	if (data.userid == user_id) {
		//you viewing your deck
		$("#card-list").fadeIn();
		$("#card-list-content").html("");
		for (var i = 1; i < data.deck.length; i++) {
			$("#card-list-content").append(ygo.dfc(data.deck[i]).replace('/>', 'class="' + i + '" />'));
		}
		duel.you.status = "Viewing Deck";
		$("#card-list-header").html(duel.you.status);
		duel.you.decklen = data.deck.length;
		youstatus(duel.you.status);
	}
	else {
		//opponent viewing their deck
		duel.opp.status = "Viewing Deck";
		oppstatus(duel.opp.status);
	}
});
socket.on('deck - show', function(data) {
	if (data.userid == user_id) {
		duel.opp.status = "Viewing Opp Deck";
		oppstatus(duel.opp.status);
	}
	else {
		$("#card-list").fadeIn();
		$("#card-list-content").html("");
		for (var i = 1; i < data.deck.length; i++) {
			$("#card-list-content").append(ygo.dfc(data.deck[i]).replace('/>', 'class="' + i + '" />'));
		}
		duel.you.status = "Viewing Opp Deck";
		$("#card-list-header").html(duel.you.status);
		duel.opp.decklen = data.deck.length;
		youstatus(duel.you.status);
	}
});
socket.on('clearstatus', function(data) {
	duel.opp.status = "";
	oppclearstatus();
});
socket.on('extra - view', function(data) {
	duel.opp.status = "Viewing Extra Deck";
	oppstatus(duel.opp.status);
});
socket.on('extra - show', function(data) {
	if (data.userid == user_id) {
		duel.opp.status = "Viewing Opp Extra Deck";
		oppstatus(duel.opp.status);
	}
	else {
		duel.you.status = "Viewing Opp Extra Deck";
		$("#card-list-header").html(duel.you.status);
		youstatus(duel.you.status);
		$("#card-list").fadeIn();
		$("#card-list-content").html("");
		for (var i = 1; i < data.extra.length; i++) {
			$("#card-list-content").append(ygo.dfc(data.extra[i]).replace('/>', 'class="' + i + '" />'));
		}
	}
});
socket.on('updateStatus', function(data) {
	duel.opp.status = data;
	oppstatus(duel.opp.status);
});
socket.on('nest - to b. deck', function(data) {
	duel.opp.field[data.slot] = undefined;
	$("#opp" + data.slot).html("");
});
socket.on('nest - to t. deck', function(data) {
	duel.opp.field[data.slot] = undefined;
	$("#opp" + data.slot).html("");
});
socket.on('nest - to hand', function(data) {
	$("#opp" + data.slot).html("");
	$("#opphand").append(ygo.format.opp.hand(duel.opp.field[data.slot]).replace('/>', 'class="' + duel.opp.hand.length + '" />'));
	duel.opp.hand[duel.opp.hand.length] = duel.opp.field[data.slot];
	duel.opp.field[data.slot] = undefined;
});
socket.on('nest - banish', function(data) {
	duel.opp.rfg[duel.opp.rfg.length] = duel.opp.field[data.slot];
	$("#oppbanished").html(ygo.dfc(duel.opp.field[data.slot]));
	duel.opp.field[data.slot] = undefined;
	$("#opp" + data.slot).html("");
});
socket.on('nest - set', function(data) {
	$("#opp" + data.slot + " img").attr({"class": "defense", "src": "./card.png"});
});
socket.on('nest - to def.', function(data) {
	$("#opp" + data.slot + " img").attr({"class": "defense"});
});
socket.on('nest - to grave', function(data) {
	duel.opp.grave[duel.opp.grave.length] = duel.opp.field[data.slot];
	$("#opp7").html(ygo.dfc(duel.opp.field[data.slot]));
	duel.opp.field[data.slot] = undefined;
	$("#opp" + data.slot).html("");
});
socket.on('nest - to atk.', function(data) {
	$("#opp" + data.slot + " img").attr({"class": ""});
});
socket.on('nest - flip', function(data) {
	$("#opp" + data.slot + " img").attr({"src": ygo.imgsrc(duel.opp.field[data.slot])});
});
socket.on('nest - flip summon', function(data) {
	$("#opp" + data.slot + " img").attr({"class": "", "src": ygo.imgsrc(duel.opp.field[data.slot])});
});
socket.on('nest - to s/t', function(data) {
	var stslot = ygo.searchLowerSlot(duel.opp.field);
	if (stslot == 0) {
		return false;
	}
	$("#opp" + stslot).html($("#opp" + data.slot).html());
	$("#opp" + stslot + " img").attr({"class": ""});
	duel.opp.field[stslot] = duel.opp.field[data.slot];
	duel.opp.field[data.slot] = undefined;
	$("#opp" + data.slot).html("");
});
socket.on('nest - give control', function(data) {
	var oppslot = ygo.searchUpperSlot(duel.you.field);
	if (oppslot == 0) {
		return false;
	}
	$("#you" + oppslot).html($("#opp" + data.slot).html());
	duel.you.field[oppslot] = duel.opp.field[data.slot];
	duel.opp.field[data.slot] = undefined;
	duel.you.borrowed[duel.you.borrowed.length] = oppslot;
	$("#opp" + data.slot).html("");
});
socket.on('nest - to mon. zone', function(data) {
	var upslot = ygo.searchUpperSlot(duel.opp.field);
	if (upslot == 0) {
		return false;
	}
	$("#opp" + upslot).html($("#opp" + data.slot).html());
	$("#opp" + upslot + " img").attr({"class": ""});
	duel.opp.field[upslot] = duel.opp.field[data.slot];
	duel.opp.field[data.slot] = undefined;
	$("#opp" + data.slot).html("");
});
socket.on('nest lower - set', function(data) {
	$("#opp" + data.slot + " img").attr({"src": "./card.png"});
});
socket.on('nest - activate', function(data) {
	$("#opp" + data.slot + " img").attr({"src": ygo.imgsrc(duel.opp.field[data.slot])});
});
socket.on('atk directly', function(data) {
	oppattack(data.slot, 11);
});
socket.on('attack', function(data) {
	oppattack(data.slot, data.selected);
});
socket.on('view extra deck - banish', function(data) {
	var id = duel.opp.extra[data.slot];
	duel.opp.rfg[duel.opp.rfg.length] = id;
	duel.opp.extra.splice(data.slot, 1);
	$("#oppbanished").html(ygo.dfc(id));
});
socket.on('view extra deck - to grave', function(data) {
	var id = duel.opp.extra[data.slot];
	duel.opp.grave[duel.opp.grave.length] = id;
	duel.opp.extra.splice(data.slot, 1);
	$("#opp7").html(ygo.dfc(id));
});
socket.on('view extra deck - spe. s. atk', function(data) {
	var id = duel.opp.extra[data.slot];
	var slot2 = ygo.searchSlot(duel.opp.field, "monster");
	if (slot2 == 0) {return false;}
	duel.opp.field[slot2] = id;
	$("#opp" + slot2).html(ygo.dfc(id));
	duel.opp.extra.splice(data.slot, 1);
});
socket.on('view extra deck - spe. s. def', function(data) {
	var id = duel.opp.extra[data.slot];
	var slot2 = ygo.searchSlot(duel.opp.field, "monster");
	if (slot2 == 0) {return false;}
	duel.opp.field[slot2] = id;
	$("#opp" + slot2).html(ygo.dfcdefense(id));
	duel.opp.extra.splice(data.slot, 1);
});
socket.on('extra deck monster - to extra', function(data) {
	duel.opp.extra[duel.opp.extra.length] = duel.opp.field[data.slot];
	duel.opp.field[data.slot] = undefined;
	$("#opp" + data.slot).html("");
});
socket.on('view grave - to s/t', function(data) {
	var stslot = ygo.searchLowerSlot(duel.opp.field);
	if (stslot == 0) {
		return false;
	}
	$("#opp" + stslot).html(ygo.dfc(duel.opp.grave[data.slot]));
	duel.opp.field[stslot] = duel.opp.grave[data.slot];
	duel.opp.grave.splice(data.slot, 1);
	resetgravedisplay("opp");
});
socket.on('view grave - to b. deck', function(data) {
	duel.opp.grave.splice(data.slot, 1);
	resetgravedisplay("opp");
});
socket.on('view grave - to t. deck', function(data) {
	duel.opp.grave.splice(data.slot, 1);
	resetgravedisplay("opp");
});
socket.on('view grave - banish', function(data) {
	$("#oppbanished").html(ygo.dfc(duel.opp.grave[data.slot]));
	duel.opp.rfg[duel.opp.rfg.length] = duel.opp.grave[data.slot];
	duel.opp.grave.splice(data.slot, 1);
	resetgravedisplay("opp");
});
socket.on('view grave - to hand', function(data) {
	$("#opphand").append(ygo.format.opp.hand(duel.opp.grave[data.slot]).replace('/>', 'class="' + duel.opp.hand.length + '" />'));
	duel.opp.hand[duel.opp.hand.length] = duel.opp.grave[data.slot];
	duel.opp.grave.splice(data.slot, 1);
	resetgravedisplay("opp");
});
socket.on('view grave - ss atk', function(data) {
	duel.opp.field[data.slot2] = duel.opp.grave[data.slot];
	$("#opp" + data.slot2).html(ygo.dfc(duel.opp.grave[data.slot]));
	duel.opp.grave.splice(data.slot, 1);
	resetgravedisplay("opp");
});
socket.on('view grave - ss def', function(data) {
	duel.opp.field[data.slot2] = duel.opp.grave[data.slot];
	$("#opp" + data.slot2).html(ygo.dfcdefense(duel.opp.grave[data.slot]));
	duel.opp.grave.splice(data.slot, 1);
	resetgravedisplay("opp");
});
socket.on('view grave - to extra', function(data) {
	duel.opp.extra[duel.opp.extra.length] = duel.opp.grave[data.slot];
	duel.opp.grave.splice(data.slot, 1);
	resetgravedisplay("opp");
});
socket.on('view rfg - to t. deck', function(data) {
	duel.opp.rfg.splice(data.slot, 1);
	resetrfgdisplay("opp");
});
socket.on('view rfg - to grave', function(data) {
	$("#opp7").html(ygo.dfc(duel.opp.rfg[data.slot]));
	duel.opp.grave[duel.opp.grave.length] = duel.opp.rfg[data.slot];
	duel.opp.rfg.splice(data.slot, 1);
	resetrfgdisplay("opp");
});
socket.on('view rfg - to hand', function(data) {
	$("#opphand").append(ygo.format.opp.hand(duel.opp.rfg[data.slot]).replace('/>', 'class="' + duel.opp.hand.length + '" />'));
	duel.opp.hand[duel.opp.hand.length] = duel.opp.rfg[data.slot];
	duel.opp.rfg.splice(data.slot, 1);
	resetrfgdisplay("opp");
});
socket.on('view rfg - ss atk', function(data) {
	duel.opp.field[data.slot2] = duel.opp.rfg[data.slot];
	$("#opp" + data.slot2).html(ygo.dfc(duel.opp.rfg[data.slot]));
	duel.opp.rfg.splice(data.slot, 1);
	resetrfgdisplay("opp");
});
socket.on('view rfg - ss def', function(data) {
	duel.opp.field[data.slot2] = duel.opp.rfg[data.slot];
	$("#opp" + data.slot2).html(ygo.dfcdefense(duel.opp.rfg[data.slot]));
	duel.opp.rfg.splice(data.slot, 1);
	resetrfgdisplay("opp");
});
socket.on('view rfg - to extra', function(data) {
	duel.opp.extra[duel.opp.extra.length] = duel.opp.rfg[data.slot];
	duel.opp.rfg.splice(data.slot, 1);
	resetrfgdisplay("opp");
});
socket.on('view deck - to s/t', function(data) {
	var stslot = ygo.searchLowerSlot(duel.opp.field);
	if (stslot == 0) {
		return false;
	}
	$("#opp" + stslot).html(ygo.dfc(data.card));
	duel.opp.field[stslot] = data.card;
});
socket.on('view deck - banish', function(data) {
	$("#oppbanished").html(ygo.dfc(data.card));
	duel.opp.rfg[duel.opp.rfg.length] = data.card
});
socket.on('view deck - to grave', function(data) {
	$("#opp7").html(ygo.dfc(data.card));
	duel.opp.grave[duel.opp.grave.length] = data.card;
});
socket.on('view deck - to hand', function(data) {
	$("#opphand").append(ygo.format.opp.hand(data.card).replace('/>', 'class="' + duel.opp.hand.length + '" />'));
	duel.opp.hand[duel.opp.hand.length] = data.card;
});
socket.on('view deck - ss def', function(data) {
	duel.opp.field[data.slot2] = data.card;
	$("#opp" + data.slot2).html(ygo.dfcdefense(data.card));
});
socket.on('view deck - ss atk', function(data) {
	duel.opp.field[data.slot2] = data.card;
	$("#opp" + data.slot2).html(ygo.dfc(data.card));
});
socket.on('view deck - banish fd', function(data) {
	//need to do
});
socket.on('admitdefeat', function(data) {
	duel.winner = duel.you.name;
	ygo.serverDuelChatMessage({message: "<b>The winner is " + htmlescape(duel.you.name) + ".</b>"});
});
socket.on('leaveduel', function(data) {
	ygo.serverDuelChatMessage({message: htmlescape(duel.opp.name) + " has left the duel."});
});
socket.on('selection', function(data) {
	selection(data.where, data.element, "opp");
});
socket.on("playrps", function(data) {
	choice2 = data.choice;
	if (choice != "") {
		playrps();
	}
});
socket.on("duel-chat-server", function(data) {
	ygo.serverDuelChatMessage({message: data.message});
});
socket.on("rpschoose", function(data) {
	$("#rps").fadeOut();
	ygo.serverDuelChatMessage({message: data.message});
});