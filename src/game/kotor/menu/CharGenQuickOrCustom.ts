import { GameState } from "../../../GameState";
import { GameMenu } from "../../../gui";
import type { GUIListBox, GUILabel, GUIButton } from "../../../gui";
import { TalentFeat } from "../../../talents";

/**
 * CharGenQuickOrCustom class.
 * 
 * KotOR JS - A remake of the Odyssey Game Engine that powered KotOR I & II
 * 
 * @file CharGenQuickOrCustom.ts
 * @author KobaltBlu <https://github.com/KobaltBlu>
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 */
export class CharGenQuickOrCustom extends GameMenu {

  LBL_DECORATION: GUILabel;
  BTN_BACK: GUIButton;
  LBL_RBG: GUILabel;
  LB_DESC: GUIListBox;
  QUICK_CHAR_BTN: GUIButton;
  CUST_CHAR_BTN: GUIButton;

  constructor(){
    super();
    this.gui_resref = 'qorcpnl';
    this.background = '';
    this.voidFill = false;
  }

  async menuControlInitializer(skipInit: boolean = false) {
    await super.menuControlInitializer();
    if(skipInit) return;
    return new Promise<void>((resolve, reject) => {
      this.QUICK_CHAR_BTN.addEventListener('click', (e: any) => {
        e.stopPropagation();
        try{
          let class_data = GameState.TwoDAManager.datatables.get('classes').rows[GameState.CharGenManager.selectedClass];
          let saving_throw_label = class_data['savingthrowtable'].toLowerCase();
          let saving_throw_data = GameState.TwoDAManager.datatables.get(saving_throw_label).rows[0];
          let feats_table = GameState.TwoDAManager.datatables.get('feat');

          GameState.CharGenManager.selectedCreature.str = parseInt(class_data.str);
          GameState.CharGenManager.selectedCreature.dex = parseInt(class_data.dex);
          GameState.CharGenManager.selectedCreature.con = parseInt(class_data.con);
          GameState.CharGenManager.selectedCreature.wis = parseInt(class_data.wis);
          GameState.CharGenManager.selectedCreature.int = parseInt(class_data.int);
          GameState.CharGenManager.selectedCreature.cha = parseInt(class_data.cha);
          GameState.CharGenManager.selectedCreature.str = parseInt(class_data.str);

          GameState.CharGenManager.selectedCreature.fortbonus = parseInt(saving_throw_data.fortsave);
          GameState.CharGenManager.selectedCreature.willbonus = parseInt(saving_throw_data.willsave);
          GameState.CharGenManager.selectedCreature.refbonus = parseInt(saving_throw_data.refsave);

          let featstable_key = class_data['featstable'].toLowerCase();

          for(let i = 0, len = feats_table.rows.length; i < len; i++){
            let feat_data = feats_table.rows[i];
            if(feat_data[featstable_key+'_granted'] == 1){
              GameState.CharGenManager.selectedCreature.feats.push(new TalentFeat(i));
            }
          }
          this.manager.CharGenMain.close();
          this.manager.CharGenMain.childMenu = this.manager.CharGenQuickPanel;
          this.manager.CharGenQuickPanel.tGuiPanel.widget.position.x = 142.5;
          this.manager.CharGenQuickPanel.tGuiPanel.widget.position.y = 0;
          this.manager.CharGenMain.open();
        }catch(e){
          console.log(e);
        }
      });

      this.CUST_CHAR_BTN.addEventListener('click', (e: any) => {
        e.stopPropagation();
        //Game.CharGenMain.state = CharGenMain.STATES.CUSTOM;
        //Game.CharGenCustomPanel.Show();
        this.manager.CharGenMain.close();
        this.manager.CharGenMain.childMenu = this.manager.CharGenCustomPanel;
        this.manager.CharGenCustomPanel.tGuiPanel.widget.position.x = 142.5;
        this.manager.CharGenCustomPanel.tGuiPanel.widget.position.y = 0;
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
          GameState.CharGenManager.selectedCreature.model.parent.remove(GameState.CharGenManager.selectedCreature.model);
        }catch(e){}

        // this.manager.CharGenClass.getControlByName('_3D_MODEL'+(GameState.CharGenManager.selectedClass+1))
        //  .userData._3dView.scene.add(GameState.CharGenManager.selectedCreature.model);
        this.manager.CharGenMain.close();
      });

      //Hide because this submenu is very incomplete.
      //Comment out this line to work on the custom chargen screen
      this.CUST_CHAR_BTN.hide();

      this.tGuiPanel.offset.x = -180;
      this.tGuiPanel.offset.y = 100;
      this.recalculatePosition();
      resolve();
    });
  }
  
}
