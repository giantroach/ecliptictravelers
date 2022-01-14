{OVERALL_GAME_HEADER}

<!--
--------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- EclipticTravelers implementation : © Tomoki Motohashi <tomoki.motohashi@takoashi.com>
--
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------

ecliptictravelers_ecliptictravelers.tpl

This is the HTML template of your game.

Everything you are writing in this file will be displayed in the HTML page of your game user interface,
in the "main game zone" of the screen.

You can use in this template:
_ variables, with the format {MY_VARIABLE_ELEMENT}.
_ HTML block, with the BEGIN/END format

See your "view" PHP file to check how to set variables and control blocks

Please REMOVE this comment before publishing your game on BGA
-->

<div id="common_table" class="whiteblock">
  <h3 id="ontable_header">
    <span>{ON_TABLE}:</span>
  </h3>
  <div class="ecliptictravelers-table-cards">
    <div id="table_cards"></div>
    <div class="eclipse-wrapper">
      <div id="eclipse_cards"></div>
    </div>
  </div>
</div>

<div id="player_hand" class="whiteblock">
  <h3 id="inhand_header">
    <span>{IN_HAND}:</span>
  </h3>
  <div id="player_cards" class="card_inhand"></div>
</div>


<script type="text/javascript">

// Javascript HTML templates

/*
// Example:
var jstpl_some_game_item='<div class="my_game_item" id="my_game_item_${MY_ITEM_ID}"></div>';

*/

let jstpl_player_board = `
<div class="ecliptictravelers-hand-size">
    <div>
        <span id="hand-count_p\${id}">0</span>
        <span id="hand-icon_p\${id}" class="fa fa-hand-paper-o"></span>
    </div>
</div>`;

</script>

{OVERALL_GAME_FOOTER}
