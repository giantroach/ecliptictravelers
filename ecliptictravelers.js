/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * EclipticTravelers implementation : © Tomoki Motohashi <tomoki.motohashi@takoashi.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * ecliptictravelers.js
 *
 * EclipticTravelers user interface script
 *
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

const appName = 'ecliptictravelers';
const reqBase = `/${appName}/${appName}`;
const cardDef = [
    {id: 1, time: 'md', location: 'c', river: '', break: false},
    {id: 2, time: 'md', location: 'f', river: '', break: false},
    {id: 3, time: 'md', location: 'f', river: '', break: false},
    {id: 4, time: 'd', location: 'f', river: 'r', break: false},
    {id: 5, time: 'd', location: 'f', river: 'r', break: false},
    {id: 6, time: 'd', location: '', river: 'r', break: false},
    {id: 7, time: 'tn', location: '', river: 'b', break: false},
    {id: 8, time: 'd', location: '', river: 'b', break: true},

    {id: 9, time: 'mn', location: 'c', river: '', break: false},
    {id: 10, time: 'mn', location: 'f', river: '', break: false},
    {id: 11, time: 'mn', location: 'f', river: '', break: false},
    {id: 12, time: 'n', location: 'f', river: 'r', break: false},
    {id: 13, time: 'n', location: 'f', river: 'r', break: false},
    {id: 14, time: 'n', location: '', river: 'r', break: false},
    {id: 15, time: 'td', location: '', river: 'b', break: false},
    {id: 16, time: 'n', location: '', river: 'b', break: true},

    {id: 17, time: 't', location: 'f', river: 'b', break: false},
    {id: 18, time: 't', location: 'c', river: 'b', break: false},
    {id: 19, time: 'd', location: 'c', river: 'r', break: false},
    {id: 20, time: 'md', location: 'f', river: '', break: false},
    {id: 21, time: 'd', location: 'f', river: 'b', break: false},
    {id: 22, time: 'tn', location: '', river: 'r', break: false},
    {id: 23, time: 'n', location: 'c', river: 'r', break: false},
    {id: 24, time: 'mn', location: 'f', river: '', break: true},

    {id: 25, time: 'n', location: 'f', river: 'b', break: false},
    {id: 26, time: 'td', location: '', river: 'r', break: false},
    {id: 27, time: 'd', location: 'f', river: 'r', break: false},
    {id: 28, time: 'd', location: '', river: 'r', break: false},
    {id: 29, time: 'n', location: 'f', river: 'r', break: false},
    {id: 30, time: 'n', location: '', river: 'r', break: false},
    {id: 31, time: 't', location: '', river: 'r', break: false},
    {id: 32, time: '', location: '', river: '', break: false},
];

define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock"

], function (dojo, declare) {
    return declare("bgagame.ecliptictravelers", ebg.core.gamegui, {
        constructor: function(){
            // Here, you can init the global variables of your user interface
            // Example:
            // this.myGlobalValue = 0;

        },

        /*
          setup:

          This method must set up the game user interface according to current game situation specified
          in parameters.

          The method is called each time the game interface is displayed to a player, ie:
          _ when the game starts
          _ when a player refreshes the game page (F5)

          "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
        */

        playerHand: null,
        commonTable: null,
        eclipse: null,

        setup: function (gamedatas) {
            // Setting up player boards
            this.handCounters = {};
            for (let player_id in gamedatas.players) {
                const player = gamedatas.players[player_id];

                // TODO: Setting up players boards if needed

                // create handsize counter per player
                const elmPb = $(`player_board_${player_id}`);
                dojo.place(
                    this.format_block('jstpl_player_board', player), elmPb);
                this.handCounters[player_id] = new ebg.counter();
                this.handCounters[player_id].create(`hand-count_p${player_id}`);
                this.handCounters[player_id].setValue(player.cards);
            }

            // TODO: Set up your game interface here, according to "gamedatas"
            // setup player hand
            this.playerHand = new ebg.stock();
            this.playerHand.image_items_per_row = 8;
            this.playerHand.create(this, $('player_cards'),
                                   1104 / 8, 768 / 4);
            this.playerHand.centerItems = true;
            this.playerHand.setSelectionMode(0);
            this.playerHand.setSelectionAppearance('class');

            for (let cardNo = 1; cardNo <= 31; cardNo++) {
                this.playerHand.addItemType(
                    cardNo, cardNo, g_gamethemeurl + 'img/cards.png', cardNo - 1);
            }

            for (let cardPos in gamedatas.player_cards) {
                const card = gamedatas.player_cards[cardPos];
                this.playerHand.addToStockWithId(
                    card.type_arg, card.id, 'player_hand');
            }

            dojo.connect(this.playerHand, 'onChangeSelection', this,
                         'onCardSelect');

            // setup table
            this.commonTable = new ebg.stock();
            this.commonTable.image_items_per_row = 8;
            this.commonTable.create(this, $('table_cards'),
                                   1104 / 8, 768 / 4);
            this.commonTable.centerItems = true;
            this.commonTable.item_margin = -115;
            this.commonTable.setSelectionMode(0);

            for (let cardNo = 1; cardNo <= 32; cardNo++) {
                this.commonTable.addItemType(
                    cardNo, null, g_gamethemeurl + 'img/cards.png', cardNo - 1);
            }

            const sortedTableCards  = gamedatas.table_cards.sort(
                (a, b) => Number(a.location_arg) - Number(b.location_arg));
            for (let cardPos in gamedatas.table_cards) {
                const card = gamedatas.table_cards[cardPos];
                this.commonTable.addToStockWithId(
                    card.type_arg, card.id, 'common_table');
            }

            if (!this.commonTable.count()) {
                // no card sign
                this.commonTable.addToStockWithId(32, 32, 'common_table');
            }

            // eclipse cards
            this.eclipse = new ebg.stock();
            this.eclipse.image_items_per_row = 2;
            this.eclipse.create(this, $('eclipse_cards'),
                                384 / 2, 138);
            // this.eclipse.centerItems = true;
            this.eclipse.setSelectionMode(0);
            this.eclipse.setSelectionAppearance('class');
            for (let cardNo = 1; cardNo <= 2; cardNo++) {
                this.eclipse.addItemType(
                    cardNo, null, g_gamethemeurl + 'img/eclipse.png', cardNo - 1);
            }
            if (!gamedatas.eclipse) {
                this.eclipse.addToStockWithId(1, 1, 'eclipse_cards');
            } else {
                this.eclipse.addToStockWithId(2, 1, 'eclipse_cards');
                this.appendEclipsedImg(Number(gamedatas.eclipse));
            }
            dojo.connect(this.eclipse, 'onChangeSelection', this,
                         'onEclipseSelect');

            // update background image
            this.refreshBgImg();

            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications();
        },


        ///////////////////////////////////////////////////
        //// Game & client states

        // onEnteringState: this method is called each time we are entering into a new game state.
        //                  You can use this method to perform some user interface changes at this moment.
        //
        onEnteringState: function (stateName, args) {
            switch (stateName) {

                /* Example:

                   case 'myGameState':

                   // Show some HTML block at this game state
                   dojo.style( 'my_html_block_id', 'display', 'block' );

                   break;
                */

            case 'playerTurn':
                if (this.isCurrentPlayerActive()) {
                    this.playerHand.setSelectionMode(1);
                    this.updateHandStyle();
                    this.updateEclipseStyle();
                }
                break;

            case 'dummmy':
                break;
            }
        },

        // onLeavingState: this method is called each time we are leaving a game state.
        //                 You can use this method to perform some user interface changes at this moment.
        //
        onLeavingState: function (stateName) {
            switch (stateName) {

                /* Example:

                   case 'myGameState':

                   // Hide the HTML block we are displaying only during this game state
                   dojo.style( 'my_html_block_id', 'display', 'none' );

                   break;
                */

            case 'playerTurn':
                this.playerHand.setSelectionMode(0);
                this.disableHandStyle();
                this.eclipse.setSelectionMode(0);
                this.disableEclipseStyle();
                break;

            case 'dummmy':
                break;
            }
        },

        // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
        //                        action status bar (ie: the HTML links in the status bar).
        //
        onUpdateActionButtons: function (stateName, args) {
            if (this.isCurrentPlayerActive()) {
                switch (stateName) {
                    /*
                      Example:

                      case 'myGameState':

                      // Add 3 action buttons in the action status bar:

                      this.addActionButton( 'button_1_id', _('Button 1 label'), 'onMyMethodToCall1' );
                      this.addActionButton( 'button_2_id', _('Button 2 label'), 'onMyMethodToCall2' );
                      this.addActionButton( 'button_3_id', _('Button 3 label'), 'onMyMethodToCall3' );
                      break;
                    */

                case 'playerTurn':
                    if (this.isCurrentPlayerActive()) {
                        // TODO: check if there are any playable card
                        this.addActionButton(
                            'playCard_button', // id
                            _('Play selected card.'), // translate (button label)
                            'onPlayCard' // name of call back
                        );

                        this.addActionButton(
                            'pass_button', // id
                            _('Pass'), // translate (button label)
                            'onPass' // name of call back
                        );
                    }
                    break;
                }
            }
        },

        ///////////////////////////////////////////////////
        //// Utility methods

        /*

          Here, you can defines some utility methods that you can use everywhere in your javascript
          script.

        */

        updateHandStyle: function () {
            const tCardID = Number(this.commonTable.items[this.commonTable.items.length - 1].type);
            const pCardID = this.commonTable.items.length < 2 ? null :
                  Number(this.commonTable.items[this.commonTable.items.length - 2].type);
            this.playerHand.items.forEach((i) => {
                const hCardID = Number(this.playerHand.getItemById(i.id).type);
                const elm = $(`player_cards_item_${i.id}`);
                const cls = elm.className;
                if (this.isCardPlayable(tCardID, hCardID, pCardID, this.isEclipsed())) {
                    elm.className = cls.replace(/ ecliptictravelers-unplayable/g, '') + ' ecliptictravelers-playable';
                } else {
                    elm.className = cls.replace(/ ecliptictravelers-playable/g, '') + ' ecliptictravelers-unplayable';
                }
            });
        },

        disableHandStyle: function () {
            this.playerHand.items.forEach((i) => {
                const elm = $(`player_cards_item_${i.id}`);
                const cls = elm.className;
                elm.className = cls.replace(/ ecliptictravelers-playable/g, '') + ' ecliptictravelers-unplayable';
            });
        },

        updateEclipseStyle: function () {
            if (this.isEclipsePlayable()) {
                const elm = $(`eclipse_cards_item_1`);
                const cls = elm.className;
                elm.className = cls.replace(/ ecliptictravelers-unplayable/g, '') + ' ecliptictravelers-playable';
                this.eclipse.setSelectionMode(1);
                return;
            }
            this.eclipse.setSelectionMode(0);
        },

        disableEclipseStyle: function () {
            const elm = $(`eclipse_cards_item_1`);
            const cls = elm.className;
            elm.className = cls.replace(/ ecliptictravelers-playable/g, '') + ' ecliptictravelers-unplayable';
            this.eclipse.setSelectionMode(0);
        },

        isCardPlayable: function (cFrom, cTo, cPrev = null, eclipsed = false) {
            const f = cardDef.find((c) => c.id === cFrom);
            const t = cardDef.find((c) => c.id === cTo);
            const p = cardDef.find((c) => c.id === cPrev);

            let ft = f.time;
            if (eclipsed) {
                switch (f.time) {
                case 'd':
                    ft = 'n';
                    break;
                case 'md':
                    ft = 'mn';
                    break;
                case 'n':
                    ft = 'd';
                    break;
                case 'mn':
                    ft = 'md';
                    break;
                }
            }

            { // time
                if (ft === 'd') {
                    if (['n', 'mn', 'td'].includes(t.time)) {
                        return false;
                    }
                }
                if (ft === 'md') {
                    if (['n', 'mn', 'td', 'tn', 't'].includes(t.time)) {
                        return false;
                    }
                }
                if (ft === 'n') {
                    if (['d', 'dn', 'tn'].includes(t.time)) {
                        return false;
                    }
                }
                if (ft === 'mn') {
                    if (['d', 'md', 'td', 'tn', 't'].includes(t.time)) {
                        return false;
                    }
                }
                if (ft === 'tn') {
                    if (['d', 'md', 'td', 'tn', 't'].includes(t.time)) {
                        return false;
                    }
                }
                if (ft === 'td') {
                    if (['n', 'mn', 'td', 'tn', 't'].includes(t.time)) {
                        return false;
                    }
                }
                if (ft === 't') {
                    if (p && p.time === 'd' &&
                        ['d', 'md', 'td', 'tn', 't'].includes(t.time)) {
                        return false;
                    }
                    if (p && p.time === 'n' &&
                        ['n', 'mn', 'td', 'tn', 't'].includes(t.time)) {
                        return false;
                    }
                    if (!p &&
                        ['td', 'tn', 't'].includes(t.time)) {
                        return false;
                    }
                }
            }

            { // location
                if (f.location === 'f') {
                    if (['c'].includes(t.location)) {
                        return false;
                    }
                }
                if (f.location === 'c') {
                    if (['f'].includes(t.location)) {
                        return false;
                    }
                }
            }

            { // river
                if (f.river === 'r') {
                    if ([''].includes(t.river)) {
                        return false;
                    }
                }
                if (f.river === 'b') {
                    if (['r'].includes(t.river)) {
                        return false;
                    }
                }
            }

            return true;
        },

        isEclipsePlayable: function () {
            const cFrom = Number(this.commonTable.items[this.commonTable.items.length - 1].type);

            // if no card is on the table
            if (cFrom === 32) {
                return false;
            }

            // if eclipse is already used
            if (this.eclipse.items[0].type === 2) {
                return false;
            }

            // if transition is on the top
            const f = cardDef.find((c) => c.id === cFrom);
            if (['t', 'tn', 'td'].includes(f.time)) {
                return false;
            }

            return true;
        },

        isEclipsed: function () {
            if (this.eclipse.items[0].type === 1) {
                return false;
            }

            const id = this.commonTable.items[this.commonTable.items.length - 1].id;
            const elm = $(`table_cards_item_${id}`);
            if (!elm.children.length) {
                return false;
            }

            return true;
        },

        appendEclipsedImg: function (idx) {
            if (this.commonTable.count() === idx) {
                const id = this.commonTable.items[this.commonTable.items.length - 1].id;
                const elm = $(`table_cards_item_${id}`);
                const eclipseElm = document.createElement('div');
                eclipseElm.className = 'ecliptictravelers-eclipsed';
                eclipseElm.style.backgroundImage = `url(${g_gamethemeurl}img/eclipsed.png)`;
                elm.appendChild(eclipseElm);
            }
        },

        refreshBgImg: function () {
            const cFrom = Number(this.commonTable.items[this.commonTable.items.length - 1].type);
            const eclipsed = this.isEclipsed();
            const f = cardDef.find((c) => c.id === cFrom);

            let ft = f.time;
            if (eclipsed) {
                switch (f.time) {
                case 'd':
                    ft = 'n';
                    break;
                case 'md':
                    ft = 'mn';
                    break;
                case 'n':
                    ft = 'd';
                    break;
                case 'mn':
                    ft = 'md';
                    break;
                }
            }

            switch (ft) {
            case 'd':
            case 'md':
                document.body.style.backgroundImage = `url(${g_gamethemeurl}img/bg_day.jpg)`;
                break;
            case 'n':
            case 'mn':
                document.body.style.backgroundImage = `url(${g_gamethemeurl}img/bg_night.jpg)`;
                break;
            case 'tn':
            case 'td':
            case 't':
                document.body.style.backgroundImage = `url(${g_gamethemeurl}img/bg_sunset.jpg)`;
                break;
            default:
                document.body.style.backgroundImage = '';
                break;
            }
        },


        ///////////////////////////////////////////////////
        //// Player's action

        /*

          Here, you are defining methods to handle player's action (ex: results of mouse click on
          game objects).

          Most of the time, these methods:
          _ check the action is possible at this game state.
          _ make a call to the game server

        */

        /* Example:

           onMyMethodToCall1: function( evt )
           {
           console.log( 'onMyMethodToCall1' );

           // Preventing default browser reaction
           dojo.stopEvent( evt );

           // Check that this action is possible (see "possibleactions" in states.inc.php)
           if( ! this.checkAction( 'myAction' ) )
           {   return; }

           this.ajaxcall( "/ecliptictravelers/ecliptictravelers/myAction.html", {
           lock: true,
           myArgument1: arg1,
           myArgument2: arg2,
           ...
           },
           this, function( result ) {

           // What to do after the server call if it succeeded
           // (most of the time: nothing)

           }, function( is_error) {

           // What to do after the server call in anyway (success or failure)
           // (most of the time: nothing)

           } );
           },

        */

        onCardSelect: function (controlName, itemID) {
            if (!itemID) { return; }
            this.eclipse.unselectAll();
            const tCardID = Number(this.commonTable.items[this.commonTable.items.length - 1].type);
            const hCardID = Number(this.playerHand.getItemById(itemID).type);
            const pCardID = this.commonTable.items.length < 2 ? null :
                  Number(this.commonTable.items[this.commonTable.items.length - 2].type);
            if (!this.isCardPlayable(tCardID, hCardID, pCardID, this.isEclipsed())) {
                this.playerHand.unselectAll();
            }
        },

        onEclipseSelect: function (controlName, itemID) {
            if (!itemID) { return; }
            this.playerHand.unselectAll();
            if (!this.isEclipsePlayable()) {
                this.eclipse.unselectAll();
            }
        },

        onPlayCard: function (evt) {
            dojo.stopEvent(evt);

            const hSelected = this.playerHand.getSelectedItems();
            const eSelected = this.eclipse.getSelectedItems();

            if (hSelected.length <= 0 && eSelected.length <= 0) {
                this.showMessage(_('No card is selected.'), 'error');
                return;
            }

            if (eSelected.length) {
                const eclUrl = `${reqBase}/callEclipse.html`;
                this.ajaxcall(eclUrl, {
                    lock: true

                }, this, (result) => {
                    // console.log('success: onEclipse', arguments);

                }, (is_error) => {
                    // console.log('error: onEclipse', arguments);
                });
                return;
            }

            const plyUrl = `${reqBase}/callPlayCard.html`;
            this.ajaxcall(plyUrl, {
                lock: true,
                cards: hSelected.map(card => card.id).join(',')

            }, this, (result) => {
                // console.log('success: onPlayCard', arguments);

            }, (is_error) => {
                // console.log('error: onPlayCard', arguments);
            });
        },

        onPass: function (evt) {
            dojo.stopEvent(evt);

            const url = `${reqBase}/callPass.html`;
            this.ajaxcall(url, {
                lock: true

            }, this, (result) => {
                // console.log('success: onPlayCard', arguments);

            }, (is_error) => {
                // console.log('error: onPlayCard', arguments);
            });
        },


        ///////////////////////////////////////////////////
        //// Reaction to cometD notifications

        /*
          setupNotifications:

          In this method, you associate each of your game notifications with your local method to handle it.

          Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
          your ecliptictravelers.game.php file.

        */
        setupNotifications: function() {
            // TODO: here, associate your game notifications with local methods
            dojo.subscribe('playCards', this, 'notifyPlayCard');
            dojo.subscribe('playBreakCard', this, 'notifyPlayBreakCard');
            dojo.subscribe('break', this, 'notifyBreak');
            dojo.subscribe('eclipsed', this, 'notifyEclipsed');
            dojo.subscribe('newRound', this, 'notifyNewRound');
            dojo.subscribe('endGame', this, 'notifyEndGame');

            // Example 1: standard notification handling
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );

            // Example 2: standard notification handling + tell the user interface to wait
            //            during 3 seconds after calling the method in order to let the players
            //            see what is happening in the game.
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            // this.notifqueue.setSynchronous( 'cardPlayed', 3000 );
            //
        },

        // TODO: from this point and below, you can write your game notifications handling methods

        /*
          Example:

          notif_cardPlayed: function( notif )
          {
          console.log( 'notif_cardPlayed' );
          console.log( notif );

          // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call

          // TODO: play the card in the user interface.
          },

        */

        notifyPlayCard: function (notify) {
            const card = notify.args.card;
            this.playerHand.removeFromStockById(card.id);

            if (this.commonTable.items.length &&
                this.commonTable.items[0].type === 32) {
                this.commonTable.removeAll();
            }
            this.commonTable.addToStockWithId(
                card.type_arg, card.id, 'common_table');

            // update hand size
            this.handCounters[notify.args.player_id]
                .setValue(Number(notify.args.cards));

            this.refreshBgImg();
        },

        notifyPlayBreakCard: function (notify) {
            const card = notify.args.card;
            this.playerHand.removeFromStockById(card.id);

            this.commonTable.removeAll();
            this.commonTable.addToStockWithId(32, 32, 'common_table');

            // update hand size
            this.handCounters[notify.args.player_id]
                .setValue(Number(notify.args.cards));

            this.eclipse.removeAll();
            this.eclipse.addToStockWithId(1, 1, 'eclipse_cards');
            this.refreshBgImg();
        },

        notifyBreak: function (notify) {
            this.commonTable.removeAll();
            this.commonTable.addToStockWithId(32, 32, 'common_table');
            this.eclipse.removeAll();
            this.eclipse.addToStockWithId(1, 1, 'eclipse_cards');
            this.refreshBgImg();
        },

        notifyEclipsed: function (notify) {
            const eclipse = notify.args.location_arg;
            this.appendEclipsedImg(Number(eclipse));
            this.eclipse.removeAll();
            this.eclipse.addToStockWithId(2, 1, 'eclipse_cards');
            this.refreshBgImg();
        },

        notifyNewRound: function (notify) {
            const scoredPlayerID = notify.args.scoredPlayerID;
            const cards = notify.args.player_cards;
            const players = notify.args.players;

            // refresh table
            this.commonTable.removeAll();
            this.commonTable.addToStockWithId(32, 32, 'common_table');

            // refresh hand
            this.playerHand.removeAll();
            cards.forEach((card) => {
                this.playerHand.addToStockWithId(
                    card.type_arg, card.id, 'player_hand');
            });

            // update hand size
            for (let player_id in players) {
                const player = players[player_id];
                this.handCounters[player_id].setValue(player.cards);
            }

            // refresh eclipse
            const eclipse = notify.args.location_arg;
            this.appendEclipsedImg(Number(eclipse));
            this.eclipse.removeAll();
            this.eclipse.addToStockWithId(1, 1, 'eclipse_cards');

            // increment score
            this.scoreCtrl[scoredPlayerID].incValue(1);

            this.refreshBgImg();
        },

        notifyEndGame: function (notify) {
            const scoredPlayerID = notify.args.player_id;

            // increment score
            this.scoreCtrl[scoredPlayerID].incValue(1);
        }

    });
});
