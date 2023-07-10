/* KotOR JS - A remake of the Odyssey Game Engine that powered KotOR I & II
*/

import type { GUIListBox } from "../../../gui";
import { MenuCredits as K1_MenuCredits } from "../../kotor/KOTOR";

/* @file
* The MenuCredits menu class.
*/

export class MenuCredits extends K1_MenuCredits {

  declare LB_CREDITS: GUIListBox;

  constructor(){
    super();
    this.gui_resref = 'credits_p';
    this.background = '';
    this.voidFill = false;
  }

  async menuControlInitializer(skipInit: boolean = false) {
    await super.menuControlInitializer(true);
    if(skipInit) return;
    return new Promise<void>((resolve, reject) => {
      resolve();
    });
  }
  
}
