/* KotOR JS - A remake of the Odyssey Game Engine that powered KotOR I & II
*/

import type { GUILabel } from "../../../gui";
import { InGameComputerCam as K1_InGameComputerCam } from "../../kotor/KOTOR";

/* @file
* The InGameComputerCam menu class.
*/

export class InGameComputerCam extends K1_InGameComputerCam {

  declare LBL_RETURN: GUILabel;

  constructor(){
    super();
    this.gui_resref = 'computercam_p';
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
