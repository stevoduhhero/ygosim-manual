$(function() {
	deck = {
		main: [""],
		extra: [""],
		side: [""]
	};
	fun = {
		dfc: function(card) {
			var card = db[card];
			var set = card.set;
			var set0 = set.split('-')[0].toLowerCase();
			return '<img id="' + htmlescape(card.name) + '" src="http://ygosim.dyndns.org/ygo/cards/' + set0 + '/' + set + '.jpg" />';
		},
		add: function(id) {
			var card = db[id];
			var type = fun.type(id);
			var copies = 0;
			
			//check if maxed out copies of card
			for (var i = 1; i < deck["main"].length; i++) {
				if (deck["main"][i] == id) {
					copies++;
				}
			}
			for (var i = 1; i < deck["extra"].length; i++) {
				if (deck["extra"][i] == id) {
					copies++;
				}
			}
			for (var i = 1; i < deck["side"].length; i++) {
				if (deck["side"][i] == id) {
					copies++;
				}
			}
			if (maxcopies(card.name) == copies) {
				return false;
			}
			
			//check if maxed out cards in deck
			if (type == 0) {
				if (deck.main.length-1 >= 60) {
					return false;
				}
			}
			if (type == 1) {
				if (deck.extra.length-1 >= 15) {
					return false;
				}
			}
			
			//add to appropriate deck [main, extra]
			if (type == 0) {
				$('#main').append(fun.dfc(id).replace('/>', 'class="main' + deck.main.length + '" width="8%" />'));
				deck.main[deck.main.length] = id;
			}
			else {
				$('#extra').append(fun.dfc(id).replace('/>', 'class="extra' + deck.extra.length + '" width="6%" />'));
				deck.extra[deck.extra.length] = id;
			}
		},
		type: function(id) {
			var card = db[id];
			var count1 = card.type.split('Fusion').length-1;
			var count2 = card.type.split('Xyz').length-1;
			var count3 = card.type.split('Synchro').length-1;
			var counts = count1+count2+count3;
			return counts;
		}
	};
	$("#v1").css('height', $(document).height());
	$("#v1search").focus(function() {
		if (this.innerHTML == "Search...") {
			this.innerHTML = "";
			$(this).focus();
		}
	}).blur(function() {
		if (this.innerHTML == "") {
			this.innerHTML = "Search...";
		}
	}).keypress(function(e) {
		if (e.keyCode == 13) {
			$("#search-results").html("");
			var resultnum = 0;
			var val = this.innerHTML.toLowerCase();
			for (var i in db) {
				var count = i.toLowerCase().split(val).length-1;
				if (count > 0) {
					resultnum++;
					if (resultnum > 41) {
						return false;
					}
					setTimeout('$("#search-results").append(\'' + fun.dfc(i).replace('/>', 'width="25%" />') + '\');', 10*resultnum);
				}
			}
			return false;
		}
	});
	$('#search-results img').live('mouseover', function() {
		var id = this.id;
		cardmouse = id;
		carddesc(id);
	}).live('mousedown', function() {
		var id = this.id;
		fun.add(id);
	}).live('mouseout', function() {
		cardmouse = "";
	});
	$('#cards img').live('mouseover', function() {
		var id = this.id;
		cardmouse = id;
		carddesc(id);		carddesc(id);

	}).live('mouseout', function() {
		cardmouse = "";
	});
	$("#main img").live('mousedown', function() {
		var slot = this.className.replace('main', '').replace('extra', '').replace('side', '');
		var id = this.id;
		var which = "main";
		$(this).remove();
		deck[which].splice(slot, 1);
		for (var i = slot; i < deck[which].length; i++) {
			$("." + which + eval(i + '+' + 1)).attr("class", which + i);
		}
	});
	$("#extra img").live('mousedown', function() {
		var slot = this.className.replace('main', '').replace('extra', '').replace('side', '');
		var id = this.id;
		var which = "extra";
		$(this).remove();
		deck[which].splice(slot, 1);
		for (var i = slot; i < deck[which].length; i++) {
			$("." + which + eval(i + '+' + 1)).attr("class", which + i);
		}
	});
	$("#side img").live('mousedown', function() {
		var slot = this.className.replace('main', '').replace('extra', '').replace('side', '');
		var id = this.id;
		var which = "side";
		$(this).remove();
		deck[which].splice(slot, 1);
		for (var i = slot; i < deck[which].length; i++) {
			$("." + which + eval(i + '+' + 1)).attr("class", which + i);
		}
	});
	$("#clear").mousedown(function() {
		$("#main").html("");
		$("#extra").html("");
		$("#side").html("");
		deck = {
			main: [""],
			extra: [""],
			side: [""]
		};
	});
	$("#import").mousedown(function() {
		center("Import", '<center><h3>Paste The Team In The Box Below Then Hit Submit</h3><textarea id="imported" style="width: 80%;height: 100px;"></textarea><br /><img style="cursor: pointer;" src="./imgs/submit.png" onmousedown="importdeck();" /></center>');
	});
	$("#export").mousedown(function() {
		exportdeck();
	});
	$("img").live('mousedown', function() {
		return false;
	}).live('contextmenu', function() {
		return false;
	});
})
function carddesc(id) {
	var card = db[id];
	setTimeout("if (cardmouse == '" + id + "') {$('#info').html(cardinfo(cardmouse));}", 500);
}
function importdeck() {
	$("#clear").mousedown();
	var d = $("#imported").val();
	var main = d.split('MainDeck:\n')[1].split('\n\nExtraDeck:\n')[0];
	var main = main.split('\n');
	main.splice(0, 0, "");
	var extra = "\n" + d.split('\nExtraDeck:\n')[1].split('\nSideDeck:\n')[0];
	var extra = extra.split('\n');
	extra.splice(extra.length-1, 1);
	var side = "\n" + d.split('\nSideDeck:\n')[1];
	var side = side.split('\n');
	side.splice(side.length-1, 1);
	for (var i = 1; i < main.length; i++) {
		fun.add(main[i]);
	}
	for (var i = 1; i < extra.length; i++) {
		fun.add(extra[i]);
	}
	for (var i = 1; i < side.length; i++) {
		//fun.addSide(side[i]);
	}
	deck = {
		main: main,
		extra: extra,
		side: side
	};
	center('Imported your deck successfully.');
}
function exportdeck() {
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
	center("Export", '<center><font color="green"><b>Exported your deck successfully.</b></font><br /><textarea style="width: 80%;height: 100px;" onclick="this.select();">' + d + '</textarea></center>');
}
function center(title, text) {
	$("#header").html(title);
	$("#center-content").html(text);
	$("#center").fadeIn();
}
function cardeffect(eff) {
	var eff = eff.replace(/&break;/g, '<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>-</strong> ');
	var eff = eff.replace(/\?/g, '<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>-</strong> ');
	return eff;
}
function cardimage(card) {
	var set = card.set;
	var set0 = set.split('-')[0].toLowerCase();
	return '<img id="' + htmlescape(card.name) + '" src="http://ygosim.dyndns.org/ygo/cards/' + set0 + '/' + set + '.jpg" width="90%" />';
}
function cardinfo(card) {
	var card = db[card];
	var info = '<center>' + cardimage(card) + '</center>';
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