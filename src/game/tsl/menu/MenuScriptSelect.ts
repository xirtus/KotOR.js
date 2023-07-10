/* KotOR JS - A remake of the Odyssey Game Engine that powered KotOR I & II
*/

import type { GUIListBox, GUILabel, GUIButton } from "../../../gui";
import { MenuScriptSelect as K1_MenuScriptSelect } from "../../kotor/KOTOR";

/* @file
* The MenuScriptSelect menu class.
*/

export class MenuScriptSelect extends K1_MenuScriptSelect {

  declare LST_AIState: GUIListBox;
  declare LB_DESC: GUIListBox;
  declare LBL_TITLE: GUILabel;
  declare BTN_Back: GUIButton;
  declare BTN_Accept: GUIButton;

  constructor(){
    super();
    this.gui_resref = 'scriptselect_p';
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
