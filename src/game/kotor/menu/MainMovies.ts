/* KotOR JS - A remake of the Odyssey Game Engine that powered KotOR I & II
*/

import { GameMenu } from "../../../gui";
import type { GUIListBox, GUILabel, GUIButton } from "../../../gui";

/* @file
* The MainMovies menu class.
*/

export class MainMovies extends GameMenu {

  LBL_TITLE: GUILabel;
  LB_MOVIES: GUIListBox;
  BTN_BACK: GUIButton;

  constructor(){
    super();
    this.gui_resref = 'titlemovie';
    this.background = '';
    this.voidFill = false;
  }

  async menuControlInitializer(skipInit: boolean = false) {
    await super.menuControlInitializer();
    if(skipInit) return;
    return new Promise<void>((resolve, reject) => {
      this.BTN_BACK.addEventListener('click', (e: any) => {
        e.stopPropagation();
        this.close();
      });
      this._button_b = this.BTN_BACK;
      resolve();
    });
  }
  
}
