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
 * material.inc.php
 *
 * EclipticTravelers game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */


/*

  Example:

  $this->card_types = array(
  1 => array( "card_name" => ...,
  ...
  )
  );

*/

$this->card_types = [
    (object) ["id" => "1", "time" => "md", "location" => "c", "river" => "", "break" => false],
    (object) ["id" => "2", "time" => "md", "location" => "f", "river" => "", "break" => false],
    (object) ["id" => "3", "time" => "md", "location" => "f", "river" => "", "break" => false],
    (object) ["id" => "4", "time" => "d", "location" => "f", "river" => "r", "break" => false],
    (object) ["id" => "5", "time" => "d", "location" => "f", "river" => "r", "break" => false],
    (object) ["id" => "6", "time" => "d", "location" => "", "river" => "r", "break" => false],
    (object) ["id" => "7", "time" => "tn", "location" => "", "river" => "b", "break" => false],
    (object) ["id" => "8", "time" => "d", "location" => "", "river" => "b", "break" => true],

    (object) ["id" => "9", "time" => "mn", "location" => "c", "river" => "", "break" => false],
    (object) ["id" => "10", "time" => "mn", "location" => "f", "river" => "", "break" => false],
    (object) ["id" => "11", "time" => "mn", "location" => "f", "river" => "", "break" => false],
    (object) ["id" => "12", "time" => "n", "location" => "f", "river" => "r", "break" => false],
    (object) ["id" => "13", "time" => "n", "location" => "f", "river" => "r", "break" => false],
    (object) ["id" => "14", "time" => "n", "location" => "", "river" => "r", "break" => false],
    (object) ["id" => "15", "time" => "td", "location" => "", "river" => "b", "break" => false],
    (object) ["id" => "16", "time" => "n", "location" => "", "river" => "b", "break" => true],

    (object) ["id" => "17", "time" => "t", "location" => "f", "river" => "b", "break" => false],
    (object) ["id" => "18", "time" => "t", "location" => "c", "river" => "b", "break" => false],
    (object) ["id" => "19", "time" => "d", "location" => "c", "river" => "r", "break" => false],
    (object) ["id" => "20", "time" => "md", "location" => "f", "river" => "", "break" => false],
    (object) ["id" => "21", "time" => "d", "location" => "f", "river" => "b", "break" => false],
    (object) ["id" => "22", "time" => "tn", "location" => "", "river" => "r", "break" => false],
    (object) ["id" => "23", "time" => "n", "location" => "c", "river" => "r", "break" => false],
    (object) ["id" => "24", "time" => "mn", "location" => "f", "river" => "", "break" => true],

    (object) ["id" => "25", "time" => "n", "location" => "f", "river" => "b", "break" => false],
    (object) ["id" => "26", "time" => "td", "location" => "", "river" => "r", "break" => false],
    (object) ["id" => "27", "time" => "d", "location" => "f", "river" => "r", "break" => false],
    (object) ["id" => "28", "time" => "d", "location" => "", "river" => "r", "break" => false],
    (object) ["id" => "29", "time" => "n", "location" => "f", "river" => "r", "break" => false],
    (object) ["id" => "30", "time" => "n", "location" => "", "river" => "r", "break" => false],
    (object) ["id" => "31", "time" => "t", "location" => "", "river" => "r", "break" => false],
    (object) ["id" => "32", "time" => "", "location" => "", "river" => "", "break" => false],
];
