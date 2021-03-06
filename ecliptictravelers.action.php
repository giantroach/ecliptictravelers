<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * EclipticTravelers implementation : © Tomoki Motohashi <tomoki.motohashi@takoashi.com>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 *
 * ecliptictravelers.action.php
 *
 * EclipticTravelers main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/ecliptictravelers/ecliptictravelers/myAction.html", ...)
 *
 */


class action_ecliptictravelers extends APP_GameAction
{
    // Constructor: please do not modify
    public function __default()
    {
        if (self::isArg('notifwindow')) {
            $this->view = "common_notifwindow";
            $this->viewArgs['table'] = self::getArg("table", AT_posint, true);
        } else {
            $this->view = "ecliptictravelers_ecliptictravelers";
            self::trace("Complete reinitialization of board game");
        }
    }

    // TODO: defines your action entry points there


    /*

      Example:

      public function myAction()
      {
      self::setAjaxMode();

      // Retrieve arguments
      // Note: these arguments correspond to what has been sent through the javascript "ajaxcall" method
      $arg1 = self::getArg( "myArgument1", AT_posint, true );
      $arg2 = self::getArg( "myArgument2", AT_posint, true );

      // Then, call the appropriate method in your game logic, like "playCard" or "myAction"
      $this->game->myAction( $arg1, $arg2 );

      self::ajaxResponse( );
      }

    */

    public function callPlayCard()
    {
        self::setAjaxMode();

        $numList = explode(',', self::getArg('cards', AT_numberlist, true));
        $cardIDList = [];

        foreach ($numList as $pos => $numStr) {
            $cardIDList[] = intval($numStr);
        }

        $this->game->playCards($cardIDList);
        self::ajaxResponse();
    }

    public function callPass()
    {
        self::setAjaxMode();

        $this->game->pass();
        self::ajaxResponse();
    }


    public function callEclipse()
    {
        self::setAjaxMode();

        $this->game->eclipse();
        self::ajaxResponse();
    }

}
