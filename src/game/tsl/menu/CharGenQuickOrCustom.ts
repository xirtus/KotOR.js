import type { GUIListBox, GUIButton } from "../../../gui";
import { CharGenManager, TwoDAManager } from "../../../managers";
import { TalentFeat } from "../../../talents";
import { CharGenQuickOrCustom as K1_CharGenQuickOrCustom } from "../../kotor/KOTOR";

/**
 * CharGenQuickOrCustom class.
 * 
 * KotOR JS - A remake of the Odyssey Game Engine that powered KotOR I & II
 * 
 * @file CharGenQuickOrCustom.ts
 * @author KobaltBlu <https://github.com/KobaltBlu>
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 */
export class CharGenQuickOrCustom extends K1_CharGenQuickOrCustom {

  declare BTN_BACK: GUIButton;
  declare LB_DESC: GUIListBox;
  declare QUICK_CHAR_BTN: GUIButton;
  declare CUST_CHAR_BTN: GUIButton;

  constructor(){
    super();
    this.gui_resref = 'qorcpnl_p';
    this.background = '';
    this.voidFill = false;
  }

  async menuControlInitializer(skipInit: boolean = false) {
    await super.menuControlInitializer(true);
    if(skipInit) return;
    return new Promise<void>((resolve, reject) => {
      this.QUICK_CHAR_BTN.addEventListener('click', (e: any) => {
        e.stopPropagation();
        try{
          let class_data = TwoDAManager.datatables.get('classes').rows[CharGenManager.selectedClass];
          let saving_throw_label = class_data['savingthrowtable'].toLowerCase();
          let saving_throw_data = TwoDAManager.datatables.get(saving_throw_label).rows[0];
          let feats_table = TwoDAManager.datatables.get('feat');

          CharGenManager.selectedCreature.str = parseInt(class_data.str);
          CharGenManager.selectedCreature.dex = parseInt(class_data.dex);
          CharGenManager.selectedCreature.con = parseInt(class_data.con);
          CharGenManager.selectedCreature.wis = parseInt(class_data.wis);
          CharGenManager.selectedCreature.int = parseInt(class_data.int);
          CharGenManager.selectedCreature.cha = parseInt(class_data.cha);
          CharGenManager.selectedCreature.str = parseInt(class_data.str);

          CharGenManager.selectedCreature.fortbonus = parseInt(saving_throw_data.fortsave);
          CharGenManager.selectedCreature.willbonus = parseInt(saving_throw_data.willsave);
          CharGenManager.selectedCreature.refbonus = parseInt(saving_throw_data.refsave);

          let featstable_key = class_data['featstable'].toLowerCase();

          for(let i = 0, len = feats_table?.rows.length; i < len; i++){
            let feat_data = feats_table?.rows[i];
            if(feat_data[featstable_key+'_granted'] == 1){
              CharGenManager.selectedCreature.feats.push(new TalentFeat(i));
            }
          }
          this.manager.CharGenMain.close();
          this.manager.CharGenMain.childMenu = this.manager.CharGenQuickPanel;
          this.manager.CharGenMain.open();
        }catch(e){
          console.log(e);
        }
      });

      this.CUST_CHAR_BTN.addEventListener('click', (e: any) => {
        e.stopPropagation();
        //GameState.CharGenMain.state = CharGenMain.STATES.CUSTOM;
        //GameState.CharGenCustomPanel.Show();
        this.manager.CharGenMain.close();
        this.manager.CharGenMain.childMenu = this.manager.CharGenCustomPanel;
        this.manager.CharGenMain.open();

        //Reset the Attributes window
        this.manager.CharGenAbilities.reset();

        //Reset the Skills window
        this.manager.CharGenSkills.reset();
      });

      this.BTN_BACK.addEventListener('click', (e: any) => {
        e.stopPropagation();
        //Game.CharGenMain.Hide();

        try{
          CharGenManager.selectedCreature.model.parent.remove(CharGenManager.selectedCreature.model);
        }catch(e){}

        // this.manager.CharGenClass.getControlByName('_3D_MODEL'+(CharGenManager.selectedClass+1))
        //  .userData._3dView.scene.add(CharGenManager.selectedCreature.model);
        this.manager.CharGenMain.close();
      });

      //Hide because this submenu is very incomplete.
      //Comment out this line to work on the custom chargen screen
      this.CUST_CHAR_BTN.hide();

      // this.tGuiPanel.offset.x = -180;
      // this.tGuiPanel.offset.y = 100;
      this.recalculatePosition();
      resolve();
    });
  }
  
}
