import { GameState } from "../../../GameState";
import { GameMenu } from "../../../gui";
import type { GUILabel, GUIButton } from "../../../gui";

/**
 * CharGenName class.
 * 
 * KotOR JS - A remake of the Odyssey Game Engine that powered KotOR I & II
 * 
 * @file CharGenName.ts
 * @author KobaltBlu <https://github.com/KobaltBlu>
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 */
export class CharGenName extends GameMenu {

  MAIN_TITLE_LBL: GUILabel;
  SUB_TITLE_LBL: GUILabel;
  NAME_BOX_EDIT: GUILabel;
  END_BTN: GUIButton;
  BTN_RANDOM: GUIButton;
  BTN_BACK: GUIButton;

  constructor(){
    super();
    this.gui_resref = 'name';
    this.background = '1600x1200back';
    this.voidFill = false;
  }

  async menuControlInitializer(skipInit: boolean = false) {
    await super.menuControlInitializer();
    if(skipInit) return;
    return new Promise<void>((resolve, reject) => {
      this.NAME_BOX_EDIT.setEditable(true);

      this.BTN_BACK.addEventListener('click', (e: any) => {
        e.stopPropagation();
        this.close();
      });

      this.END_BTN.addEventListener('click', (e: any) => {
        e.stopPropagation();
        GameState.CharGenManager.selectedCreature.firstName = this.NAME_BOX_EDIT.getValue();
        this.manager.CharGenQuickPanel.step2 = true;
        this.close();
      });

      this.BTN_RANDOM.addEventListener('click', (e: any) => {
        e.stopPropagation();
        this.NAME_BOX_EDIT.setText(GameState.CharGenManager.generateRandomName());
      });
      resolve();
    });
  }

  show() {
    super.show();
    this.NAME_BOX_EDIT.setText(GameState.CharGenManager.selectedCreature.firstName);
  }
  
}
