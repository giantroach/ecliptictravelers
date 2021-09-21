/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * EclipticTravelers implementation : © <Your name here> <Your email address here>
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

const appName = 'ecliptictraveler';
const reqBase = `/${appName}/${appName}`;

define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock"

], function (dojo, declare) {
    return declare("bgagame.ecliptictravelers", ebg.core.gamegui, {
        constructor: function(){
            console.log('ecliptictravelers constructor');

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

        setup: function (gamedatas) {
            console.log('Starting game setup', arguments);

            // Setting up player boards
            for (let player_id in gamedatas.players) {
                let player = gamedatas.players[player_id];

                // TODO: Setting up players boards if needed
            }

            // TODO: Set up your game interface here, according to "gamedatas"
            this.playerHand = new ebg.stock();
            this.playerHand.image_items_per_row = 8;
            this.playerHand.create(this, $('player_cards'),
                                   1104 / 8, 768 / 4);
            this.playerHand.centerItems = true;
            this.playerHand.setSelectionMode(0);

            for (let cardNo = 1; cardNo <= 31; cardNo++) {
                this.playerHand.addItemType(
                    cardNo, cardNo, g_gamethemeurl + 'img/cards.jpg', cardNo - 1
                );
            }

            for (let cardPos in gamedatas.player_cards) {
                const card = gamedatas.player_cards[cardPos];
                this.playerHand.addToStockWithId(
                    card.type_arg, card.id, 'player_hand');
            }

            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications();

            console.log( "Ending game setup" );
        },


        ///////////////////////////////////////////////////
        //// Game & client states

        // onEnteringState: this method is called each time we are entering into a new game state.
        //                  You can use this method to perform some user interface changes at this moment.
        //
        onEnteringState: function (stateName, args) {
            console.log( 'Entering state: '+stateName );

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
            console.log( 'Leaving state: '+stateName );

            switch (stateName) {

                /* Example:

                   case 'myGameState':

                   // Hide the HTML block we are displaying only during this game state
                   dojo.style( 'my_html_block_id', 'display', 'none' );

                   break;
                */

            case 'playerTurn':
                this.playerHand.setSelectionMode(0);
                break;

            case 'dummmy':
                break;
            }
        },

        // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
        //                        action status bar (ie: the HTML links in the status bar).
        //
        onUpdateActionButtons: function (stateName, args) {
            console.log( 'onUpdateActionButtons: '+stateName );

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
                        this.addActionButton(
                            'putCard_button', // id
                            _('Put selected card.'), // translate (button label)
                            'onPutCard' // name of call back
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


        ///////////////////////////////////////////////////
        //// Reaction to cometD notifications

        /*
          setupNotifications:

          In this method, you associate each of your game notifications with your local method to handle it.

          Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
          your ecliptictravelers.game.php file.

        */
        setupNotifications: function () {
            console.log( 'notifications subscriptions setup' );

            // TODO: here, associate your game notifications with local methods
            dojo.subscribe('puttingCard', this, 'notifyPuttingCard');

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

        notifyPuttingCard: function (notify) {
            console.log('notifyPuttingCard', arguments);
            if (notify.args.player_id === this.getActivePlayerId()) {
                this.playerHand.removeFromStockById(notify.args.card.id);
            }
        },

        onPutCard: function(evt) {
            console.log('onPutCard', arguments);
            dojo.stopEvent(evt);

            let selected = this.playerHand.getSelectedItems();
            if (selected.length <= 0) {
                this.showMessage(_('No cards are selected.'), 'error');
                return;
            }

            this.ajaxcall(`${reqBase}/callPutCard.html`, {
                lock: true,
                cards: selected.map(card => card.id).join(',')

            }, this, (result) => {
                console.log('success: onPutCard', arguments);

            }, (is_error) => {
                console.log('error: onPutCard', arguments);
            });
        }

    });
});
