/* KotOR JS - A remake of the Odyssey Game Engine that powered KotOR I & II
*/

import { GameMenu } from "../../../gui";
import type { GUIListBox, GUILabel, GUIButton } from "../../../gui";

/* @file
* The MenuResolutions menu class.
*/

import { IScreenResolution } from "../../../interface/graphics/IScreenResolution";
import { ResolutionManager } from "../../../managers";

export class MenuResolutions extends GameMenu {

  BTN_OK: GUIButton;
  BTN_CANCEL: GUIButton;
  LB_RESOLUTIONS: GUIListBox;
  LBL_RESOLUTION: GUILabel;

  activeResolution: IScreenResolution;
  supportedResolutions: IScreenResolution[] = [];

  constructor(){
    super();
    this.isOverlayGUI = true;
    this.gui_resref = 'optresolution';
    this.background = '';
    this.voidFill = false;
  }

  async menuControlInitializer(skipInit: boolean = false) {
    await super.menuControlInitializer();
    if(skipInit) return;
    return new Promise<void>((resolve, reject) => {
      this.BTN_CANCEL.addEventListener('click', (e: any) => {
        e.stopPropagation();
        this.close();
      });
      this._button_b = this.BTN_CANCEL;

      this.BTN_OK.addEventListener('click', (e: any) => {
        e.stopPropagation();
        ResolutionManager.screenResolution = this.activeResolution;
        window.dispatchEvent(new Event('resize'));
        this.close();
      });

      this.LB_RESOLUTIONS.onSelected = (res: IScreenResolution) => {
        console.log('LB_RESOLUTIONS', res);
        this.activeResolution = res;
      }
      resolve();
    });
  }

  show() {
    super.show();
    this.supportedResolutions = ResolutionManager.getSupportedResolutions();
    this.activeResolution = this.supportedResolutions[0];
    this.LB_RESOLUTIONS.clearItems();

    for(let i = 0; i < this.supportedResolutions.length; i++){
      const res = this.supportedResolutions[i];
      this.LB_RESOLUTIONS.addItem( res );
    }

    this.LB_RESOLUTIONS.setSelectedIndex(this.supportedResolutions.indexOf(this.activeResolution));
    this.tGuiPanel.widget.position.z = 10;
  }
  
}
