<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * EclipticTravelers implementation : © Tomoki Motohashi <tomoki.motohashi@takoashi.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * ecliptictravelers.game.php
 *
 * This is the main file for your game logic.
 *
 * In this PHP file, you are going to defines the rules of the game.
 *
 */


require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );


class EclipticTravelers extends Table
{
    function __construct( )
    {
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();

        self::initGameStateLabels(array(
            //    "my_first_global_variable" => 10,
            //    "my_second_global_variable" => 11,
            //      ...
            //    "my_first_game_variant" => 100,
            //    "my_second_game_variant" => 101,
            //      ...
            "num_of_rounds" => 100,
        ));

        // create instance specifying card module
        $this->cards = self::getNew("module.common.deck");
        $this->cards->init("cards"); // specify cards table and init
    }

    protected function getGameName( )
    {
        // Used for translations and stuff. Please do not modify.
        return "ecliptictravelers";
    }

    /*
      setupNewGame:

      This method is called only once, when a new game is launched.
      In this method, you must setup the game according to the game rules, so that
      the game is ready to be played.
    */
    protected function setupNewGame($players, $options = array())
    {
        // Set the colors of the players with HTML color code
        // The default below is red/green/blue/orange/brown
        // The number of colors defined here must correspond to the maximum number of players allowed for the gams
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];

        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
        $values = array();
        foreach ($players as $player_id => $player) {
            $color = array_shift($default_colors);
            $values[] = "('" . $player_id . "', '$color', '" . $player['player_canal'] . "', '" . addslashes($player['player_name']) . "','" . addslashes($player['player_avatar']) . "')";
        }
        $sql .= implode($values, ',');
        self::DbQuery($sql);
        self::reattributeColorsBasedOnPreferences($players, $gameinfos['player_colors']);
        self::reloadPlayersBasicInfos();

        /************ Start the game initialization *****/

        // Init global values with their initial values
        //self::setGameStateInitialValue( 'my_first_global_variable', 0 );

        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        //self::initStat( 'table', 'table_teststat1', 0 );    // Init a table statistics
        //self::initStat( 'player', 'player_teststat1', 0 );  // Init a player statistics (for all players)

        $cards = [];

        $players = self::getCollectionFromDb("SELECT player_id id FROM player");
        $numOfPlayers = count($players);
        $numOfCards = 31;

        switch ($numOfPlayers) {
        case 2:
            $numOfCards = 18;
            break;
        case 3:
            $numOfCards = 26;
            break;
        }

        for ($cardNo = 1; $cardNo <= $numOfCards; $cardNo++) {
            $cards[] = [
                'type' => 0,
                'type_arg' => $cardNo,
                'nbr' => 1
            ];
        }

        $this->cards->createCards($cards, 'deck');
        $this->cards->shuffle('deck');

        // add an eclipse card
        $eclipseCards = [[
            'type' => 0,
            'type_arg' => 99,
            'nbr' => 1,
        ]];
        $this->cards->createCards($eclipseCards, 'eclipseUnused');

        $this->gamestate->nextState('roundSetup');

        /************ End of the game initialization *****/
    }

    /*
      getAllDatas:

      Gather all informations about current game situation (visible by the current player).

      The method is called each time the game interface is displayed to a player, ie:
      _ when the game starts
      _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas()
    {
        $result = array();

        // !! We must only return informations visible by this player !!
        $current_player_id = self::getCurrentPlayerId();

        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
        $sql = "SELECT player_id id, player_score score FROM player ";
        $result['players'] = self::getCollectionFromDb($sql);

        // return number of cards in the hand
        foreach($result['players'] as $key => $value) {
            $player_id = $key;
            $count = count($this->cards->getCardsInLocation("hand", $player_id));
            $result['players'][$key]['cards'] = $count;
        }

        // return eclipse card state
        $eclipseCards = $this->cards->getCardsInLocation("eclipseUsed");
        if (count($eclipseCards) == 0) {
            $result['eclipse'] = 0;
        } else {
            $result['eclipse'] = array_pop($eclipseCards)['location_arg'];
        }

        $currentPlayerID = self::getCurrentPlayerId();
        $result['player_cards'] = array_values(
            $this->cards->getCardsInLocation("hand", $currentPlayerID));
        $result['table_cards'] = array_values(
            $this->cards->getCardsInLocation("ontable"));

        return $result;
    }

    /*
      getGameProgression:

      Compute and return the current game progression.
      The number returned must be an integer beween 0 (=the game just started) and
      100 (= the game is finished or almost finished).

      This method is called each time we are in a game state with the "updateGameProgression" property set to true
      (see states.inc.php)
    */
    function getGameProgression()
    {
        // sum up score / (number of players * (number of max score - 1) + 1)
        $sql = "SELECT player_id id, player_score score FROM player ";
        $players = self::getCollectionFromDb($sql);
        $numOfPlayers = count($players);

        $maxRound = intval($this->getGameStateValue('num_of_rounds'));

        $totalScore = 0;
        foreach($players as $k => $v) {
            $totalScore += intval($v['score']);
        }
        $pct = $totalScore / ($numOfPlayers * ($maxRound - 1) + 1);

        // use sqrt to adjust the progress
        $adjustedPct = sqrt($pct);
        $progress = $adjustedPct * 100;
        return $progress;
    }


    //////////////////////////////////////////////////////////////////////////////
    //////////// Utility functions
    ////////////

    /*
      In this space, you can put any utility methods useful for your game logic
    */

    function clearTable($notify)
    {
        $this->cards->moveAllCardsInLocation(
            'ontable',
            'ondiscard'
        );
        $this->cards->moveAllCardsInLocation(
            'eclipseUsed',
            'eclipseUnused'
        );
        if ($notify) {
            self::notifyAllPlayers('break', clienttranslate('Let\'s have a break!'), []);
        }
    }

    function isCardPlayable($cFrom, $cTo, $cPrev = null, $eclipsed = false)
    {
        // self::dump('$cFrom', $cFrom);
        // self::dump('$cTo', $cTo);
        // self::dump('$cPrev', $cPrev);
        if (!$cFrom) { return false; }
        $f = $this->card_types[intval($cFrom['type_arg']) - 1];
        $t = $this->card_types[intval($cTo['type_arg']) - 1];
        $p = false;
        if ($cPrev) {
            $p = $this->card_types[intval($cPrev['type_arg']) - 1];
        }

        $ft = $f->time;
        if ($eclipsed) {
            switch ($ft) {
            case 'd':
                $ft = 'n';
                break;
            case 'md':
                $ft = 'mn';
                break;
            case 'n':
                $ft = 'd';
                break;
            case 'mn':
                $ft = 'md';
                break;
            }
        }

        // time
        if ($ft == 'd') {
            if (in_array($t->time, ['n', 'mn', 'td'])) {
                return false;
            }
        }
        if ($ft == 'md') {
            if (in_array($t->time, ['n', 'mn', 'td', 'tn', 't'])) {
                return false;
            }
        }
        if ($ft == 'n') {
            if (in_array($t->time, ['d', 'md', 'tn'])) {
                return false;
            }
        }
        if ($ft == 'mn') {
            if (in_array($t->time, ['d', 'md', 'td', 'tn', 't'])) {
                return false;
            }
        }
        if ($ft == 'tn') {
            if (in_array($t->time, ['d', 'md', 'td', 'tn', 't'])) {
                return false;
            }
        }
        if ($ft == 'td') {
            if (in_array($t->time, ['n', 'mn', 'td', 'tn', 't'])) {
                return false;
            }
        }
        if ($ft == 't') {
            if ($p && $p->time == 'd' &&
                in_array($t->time, ['d', 'md', 'td', 'tn', 't'])) {
                return false;
            }
            if ($p && $p->time == 'n' &&
                in_array($t->time, ['n', 'mn', 'td', 'tn', 't'])) {
                return false;
            }
            if (!$p &&
                in_array($t->time, ['td', 'tn', 't'])) {
                return false;
            }
        }

        // location
        if ($f->location == 'f') {
            if (in_array($t->location, ['c'])) {
                return false;
            }
        }
        if ($f->location == 'c') {
            if (in_array($t->location, ['f'])) {
                return false;
            }
        }

        // river
        if ($f->river == 'r') {
            if (in_array($t->river, [''])) {
                return false;
            }
        }
        if ($f->river == 'b') {
            if (in_array($t->river, ['r'])) {
                return false;
            }
        }

        return true;
    }

    function isEclipsed()
    {
        $cards = array_values(
            $this->cards->getCardsInLocation("eclipseUsed"));
        if (count($cards) == 0) {
            return false;
        }

        $cardsOnTable = $this->cards->countCardInLocation('ontable');
        if (intval($cards[0]['location_arg']) != $cardsOnTable) {
            return false;
        }

        return true;
    }


    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    ////////////

    /*
      Each time a player is doing some game action, one of the methods below is called.
      (note: each method below must match an input method in ecliptictravelers.action.php)
    */

    /*

      Example:

      function playCard( $card_id )
      {
      // Check that this is the player's turn and that it is a "possible action" at this game state (see states.inc.php)
      self::checkAction( 'playCard' );

      $player_id = self::getActivePlayerId();

      // Add your game logic to play a card there
      ...

      // Notify all players about the card played
      self::notifyAllPlayers( "cardPlayed", clienttranslate( '${player_name} plays ${card_name}' ), array(
      'player_id' => $player_id,
      'player_name' => self::getActivePlayerName(),
      'card_name' => $card_name,
      'card_id' => $card_id
      ) );

      }

    */

    function playCards($cardList)
    {
        self::checkAction('playCard');

        $cardID = $cardList[0];

        $cardInfo = $this->cards->getCard($cardID);
        $actorID = self::getActivePlayerId();

        if (!$cardInfo) {
            self::notifyPlayer($actorID, 'logError', '', [
                'message' => clienttranslate('Invalid card selection! You cannot choose it.')
            ]);
            return;
        }

        if ($cardInfo['location'] != 'hand' || $cardInfo['location_arg'] != $actorID) {
            self::notifyPlayer($actorID, 'logError', '', [
                'message' => clienttranslate('Invalid card selection! You cannot choose it.')
            ]);
            return;
        }

        // check if the card is playable
        $tCards = array_values(
            $this->cards->getCardsInLocation("ontable"));
        usort($tCards, function ($a, $b) {
            return -($a['location_arg'] <=> $b['location_arg']);
        });
        $pCard = null;
        if (count($tCards) > 1) {
            $pCard = $tCards[1];
        }
        if (!count($tCards) == 0 && !self::isCardPlayable($tCards[0], $cardInfo, $pCard, self::isEclipsed())) {
            self::notifyPlayer($actorID, 'logError', '', [
                'message' => clienttranslate('Invalid card selection! Reload the page.')
            ]);
            return;
        }

        $this->cards->moveCard(
            $cardID,
            'ontable',
            $this->cards->countCardInLocation('ontable') + 1
        );

        $numberOfcards = $this->cards->countCardInLocation('hand', $actorID);

        self::DbQuery("UPDATE player SET player_passed=0");

        $cardDef = $this->card_types[intval($cardInfo['type_arg'] - 1)];
        if ($cardDef->break) {
            self::notifyAllPlayers('playBreakCard', clienttranslate('${player_name} played a break card.'), [
                'player_id' => $actorID,
                'player_name' => self::getActivePlayerName(),
                'card' => $cardInfo,
                'cards' => $numberOfcards
            ]);
            self::clearTable(false);

        } else {
            self::notifyAllPlayers('playCards', clienttranslate('${player_name} played a card.'), [
                'player_id' => $actorID,
                'player_name' => self::getActivePlayerName(),
                'card' => $cardInfo,
                'cards' => $numberOfcards
            ]);
        }

        $this->gamestate->nextState('nextPlayer');
    }

    function pass()
    {
        self::checkAction('pass');

        $actorID = self::getActivePlayerId();
        self::DbQuery("UPDATE player SET player_passed=1 WHERE player_id='".$actorID."'");

        self::notifyAllPlayers('pass', clienttranslate('${player_name} passed.'), [
            'player_id' => $actorID,
            'player_name' => self::getActivePlayerName()
        ]);

        // check if everybody else are passed
        // FIXME: use better query like COUNT(*)
        $sql = "SELECT player_id FROM player WHERE player_passed = 0";
        $notPassedPlayers = self::getCollectionFromDb($sql);
        $notPassedPlayersCount = count($notPassedPlayers);
        if ($notPassedPlayersCount <= 1) {
            $result = self::clearTable(true);
            self::DbQuery("UPDATE player SET player_passed=0");
        }

        $this->gamestate->nextState('nextPlayer');
    }

    function eclipse()
    {
        self::checkAction('eclipse');

        $actorID = self::getActivePlayerId();

        $cards = array_values(
            $this->cards->getCardsInLocation("eclipseUnused"));

        if (count($cards) == 0) {
            self::notifyPlayer($actorID, 'logError', '', [
                'message' => clienttranslate('Invalid action. Eclipse is unavailable.')
            ]);
            return;
        }

        $location_arg = $this->cards->countCardInLocation('ontable');
        $this->cards->moveCard(
            $cards[0]['id'],
            'eclipseUsed',
            $location_arg
        );
        self::DbQuery("UPDATE player SET player_passed=0");

        self::notifyAllPlayers('eclipsed', clienttranslate('${player_name} triggered Eclipse!'), [
            'player_id' => $actorID,
            'player_name' => self::getActivePlayerName(),
            'location_arg' => $location_arg
        ]);

        $this->gamestate->nextState('nextPlayer');
    }


    //////////////////////////////////////////////////////////////////////////////
    //////////// Game state arguments
    ////////////

    /*
      Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
      These methods function is to return some additional information that is specific to the current
      game state.
    */

    /*

      Example for game state "MyGameState":

      function argMyGameState()
      {
      // Get some values from the current game situation in database...

      // return values:
      return array(
      'variable1' => $value1,
      'variable2' => $value2,
      ...
      );
      }
    */

    //////////////////////////////////////////////////////////////////////////////
    //////////// Game state actions
    ////////////

    /*
      Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
      The action method of state X is called everytime the current game state is set to X.
    */

    /*

      Example for game state "MyGameState":

      function stMyGameState()
      {
      // Do some stuff ...

      // (very often) go to another gamestate
      $this->gamestate->nextState( 'some_gamestate_transition' );
      }
    */

    function stRoundSetup()
    {
        $this->cards->moveAllCardsInLocation(
            'ondiscard',
            'deck'
        );
        $this->cards->moveAllCardsInLocation(
            'ontable',
            'deck'
        );
        $this->cards->moveAllCardsInLocation(
            'hand',
            'deck'
        );
        $this->cards->moveAllCardsInLocation(
            'eclipseUsed',
            'eclipseUnused'
        );

        $players = self::getCollectionFromDb("SELECT player_id id FROM player");
        foreach($players as $playerID => $value) {
            $this->cards->pickCards(6, 'deck', $playerID);
        }
        self::DbQuery("UPDATE player SET player_passed=0");

        // give a extra card for the first player
        $apID = $this->getActivePlayerId();
        if (!$apID) {
            $this->activeNextPlayer();
            $apID = $this->getActivePlayerId();
            $this->cards->pickCards(1, 'deck', $apID);

        } else {
            self::giveExtraTime($apID);
            $this->cards->pickCards(1, 'deck', $apID);
            $sql = "SELECT player_id id, player_score score FROM player ";
            $players = self::getCollectionFromDb($sql);

            // return number of cards in the hand
            foreach($players as $key => $value) {
                $player_id = $key;
                $count = count($this->cards->getCardsInLocation("hand", $player_id));
                $players[$key]['cards'] = $count;
            }

            foreach($players as $key => $value) {
                $player_id = $key;
                $player_cards = array_values(
                    $this->cards->getCardsInLocation("hand", $player_id));

                self::notifyPlayer($player_id, 'newRound', clienttranslate('Let\'s start a new journey!'), [
                    'player_cards' => $player_cards,
                    'players' => $players,
                    'scoredPlayerID' => $apID
                ]);
            }

            $this->gamestate->nextState('playerTurn');
        }
    }

    function stNextPlayer()
    {
        $lastPlayerID = self::getActivePlayerId();

        $allData = self::getAllDatas();

        foreach ($allData['players'] as $playerID => $player) {
            if ($this->cards->countCardInLocation('hand', $lastPlayerID) <= 0) {
                $this->gamestate->nextState('endRound');
                return;
            }
        }

        $playerID = self::activeNextPlayer();

        self::giveExtraTime($playerID);
        $this->gamestate->nextState('playerTurn');
    }

    function stEndRound()
    {
        $actorID = self::getActivePlayerId();
        $score = intval(self::getUniqueValueFromDB("SELECT player_score score FROM player WHERE player_id='".$actorID."'"));

        $maxRound = intval($this->getGameStateValue('num_of_rounds'));
        if ($score >= ($maxRound - 1)) {
            self::DbQuery("UPDATE player SET player_score='".$maxRound."' WHERE player_id='".$actorID."'");
            self::notifyAllPlayers('endGame', clienttranslate('${player_name} completed the journey!'), [
                'player_id' => $actorID,
                'player_name' => self::getActivePlayerName()
            ]);
            $this->gamestate->nextState('endGame');
            return;
        }
        $updatedScore = $score + 1;
        self::DbQuery("UPDATE player SET player_score='".$updatedScore."' WHERE player_id='".$actorID."'");

        self::notifyAllPlayers('endRound', clienttranslate('${player_name} completed the journey!'), [
            'player_id' => $actorID,
            'player_name' => self::getActivePlayerName()
        ]);

        $this->gamestate->nextState('roundSetup');
    }


    //////////////////////////////////////////////////////////////////////////////
    //////////// Zombie
    ////////////

    /*
      zombieTurn:

      This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
      You can do whatever you want in order to make sure the turn of this player ends appropriately
      (ex: pass).

      Important: your zombie code will be called when the player leaves the game. This action is triggered
      from the main site and propagated to the gameserver from a server, not from a browser.
      As a consequence, there is no current player associated to this action. In your zombieTurn function,
      you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message.
    */

    function zombieTurn($state, $active_player)
    {
        $statename = $state['name'];

        if ($state['type'] === "activeplayer") {
            switch ($statename) {
            default:
                $this->gamestate->nextState( "zombiePass" );
                break;
            }

            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive($active_player, '');

            return;
        }

        throw new feException("Zombie mode not supported at this game state: " . $statename);
    }

    ///////////////////////////////////////////////////////////////////////////////////:
    ////////// DB upgrade
    //////////

    /*
      upgradeTableDb:

      You don't have to care about this until your game has been published on BGA.
      Once your game is on BGA, this method is called everytime the system detects a game running with your old
      Database scheme.
      In this case, if you change your Database scheme, you just have to apply the needed changes in order to
      update the game database and allow the game to continue to run with your new version.

    */

    function upgradeTableDb($from_version)
    {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345

        // Example:
        //        if( $from_version <= 1404301345 )
        //        {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
        //            self::applyDbUpgradeToAllDB( $sql );
        //        }
        //        if( $from_version <= 1405061421 )
        //        {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
        //            self::applyDbUpgradeToAllDB( $sql );
        //        }
        //        // Please add your future database scheme changes here
        //
        //

    }
}
