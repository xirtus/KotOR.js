/* KotOR JS - A remake of the Odyssey Game Engine that powered KotOR I & II
*/

import { CurrentGame } from "../../../CurrentGame";
import { GameState } from "../../../GameState";
import { GameMenu } from "../../../gui";
import type { GUIControl, GUILabel, GUIButton } from "../../../gui";
import { CharGenManager, GlobalVariableManager, PartyManager } from "../../../managers";

/* @file
* The CharGenCustomPanel menu class.
*/

export class CharGenCustomPanel extends GameMenu {

  LBL_BG: GUILabel;
  LBL_6: GUIControl;
  LBL_5: GUIControl;
  LBL_4: GUIControl;
  LBL_3: GUIControl;
  LBL_2: GUIControl;
  LBL_1: GUIControl;
  BTN_STEPNAME1: GUIButton;
  LBL_NUM1: GUILabel;
  BTN_STEPNAME2: GUIButton;
  LBL_NUM2: GUILabel;
  BTN_STEPNAME3: GUIButton;
  LBL_NUM3: GUILabel;
  BTN_STEPNAME4: GUIButton;
  LBL_NUM4: GUILabel;
  BTN_STEPNAME5: GUIButton;
  LBL_NUM5: GUILabel;
  BTN_STEPNAME6: GUIButton;
  LBL_NUM6: GUILabel;
  BTN_BACK: GUIButton;
  BTN_CANCEL: GUIButton;

  constructor(){
    super();
    this.gui_resref = 'custpnl';
    this.background = '';
    this.voidFill = false;
  }

  async menuControlInitializer(skipInit: boolean = false) {
    await super.menuControlInitializer();
    if(skipInit) return;
    return new Promise<void>((resolve, reject) => {
      this.BTN_BACK.addEventListener('click', (e: any) => {
        e.stopPropagation();
        this.manager.CharGenMain.close();
        this.manager.CharGenMain.childMenu = this.manager.CharGenQuickOrCustom;
        this.manager.CharGenMain.open();
      });

      this.BTN_STEPNAME1.addEventListener('click', (e: any) => {
        e.stopPropagation();
        this.manager.CharGenPortCust.open();
      });

      this.BTN_STEPNAME2.addEventListener('click', (e: any) => {
        e.stopPropagation();
        this.manager.CharGenAbilities.setCreature(GameState.getCurrentPlayer());
        this.manager.CharGenAbilities.open();
      });

      this.BTN_STEPNAME3.addEventListener('click', (e: any) => {
        e.stopPropagation();
        this.manager.CharGenSkills.open();
      });

      this.BTN_STEPNAME4.addEventListener('click', (e: any) => {
        e.stopPropagation();
        this.manager.CharGenFeats.open();
      });

      this.BTN_STEPNAME5.addEventListener('click', (e: any) => {
        e.stopPropagation();
        this.manager.CharGenName.open();
      });

      this.BTN_STEPNAME6.addEventListener('click', (e: any) => {
        e.stopPropagation();
        CharGenManager.selectedCreature.equipment.ARMOR = undefined;
        CharGenManager.selectedCreature.template.getFieldByLabel('Equip_ItemList').childStructs = [];
        GlobalVariableManager.Init();
        PartyManager.PlayerTemplate = CharGenManager.selectedCreature.save();
        PartyManager.AddPortraitToOrder(CharGenManager.selectedCreature.getPortraitResRef());
        CurrentGame.InitGameInProgressFolder(true).then( () => {
          GameState.LoadModule('end_m01aa');
        });
      });

      this.tGuiPanel.offset.x = -180;
      this.tGuiPanel.offset.y = 85;
      this.recalculatePosition();
      resolve();
    });
  }
  
}
