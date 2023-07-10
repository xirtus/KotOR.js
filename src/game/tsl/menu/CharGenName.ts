/* KotOR JS - A remake of the Odyssey Game Engine that powered KotOR I & II
*/

import type { GUILabel, GUIButton } from "../../../gui";
import { CharGenName as K1_CharGenName } from "../../kotor/KOTOR";
import { CharGenManager } from "../../../managers";

/* @file
* The CharGenName menu class.
*/

export class CharGenName extends K1_CharGenName {

  declare MAIN_TITLE_LBL: GUILabel;
  declare SUB_TITLE_LBL: GUILabel;
  declare NAME_BOX_EDIT: GUILabel;
  declare END_BTN: GUIButton;
  declare BTN_RANDOM: GUIButton;
  declare BTN_BACK: GUIButton;

  constructor(){
    super();
    this.gui_resref = 'name_p';
    this.background = '';
    this.voidFill = false;
  }

  async menuControlInitializer(skipInit: boolean = false) {
    await super.menuControlInitializer(true);
    if(skipInit) return;
    return new Promise<void>((resolve, reject) => {
      this.NAME_BOX_EDIT.setEditable(true);

      this.BTN_BACK.addEventListener('click', (e: any) => {
        e.stopPropagation();
        this.close();
      });

      this.END_BTN.addEventListener('click', (e: any) => {
        e.stopPropagation();
        CharGenManager.selectedCreature.firstName = this.NAME_BOX_EDIT.getValue();
        this.manager.CharGenQuickPanel.step2 = true;
        this.close();
      });
      resolve();
    });
  }

  show() {
    super.show();
    this.NAME_BOX_EDIT.setText(CharGenManager.selectedCreature.firstName);
  }
  
}
