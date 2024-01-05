import { ActionMoveToPoint } from ".";
import { ActionParameterType } from "../enums/actions/ActionParameterType";
import { ActionStatus } from "../enums/actions/ActionStatus";
import { ActionType } from "../enums/actions/ActionType";
import { EngineMode } from "../enums/engine/EngineMode";
import { ModuleCreatureAnimState } from "../enums/module/ModuleCreatureAnimState";
import { GameState } from "../GameState";
import { MenuManager } from "../managers";
import { ModuleCreature, ModuleObject } from "../module";
import { NWScriptInstance } from "../nwscript/NWScriptInstance";
import { DLGObject } from "../resource/DLGObject";
import { ResourceTypes } from "../resource/ResourceTypes";
import { Utility } from "../utility/Utility";
import { Action } from "./Action";

/**
 * ActionDialogObject class.
 * 
 * KotOR JS - A remake of the Odyssey Game Engine that powered KotOR I & II
 * 
 * @file ActionDialogObject.ts
 * @author KobaltBlu <https://github.com/KobaltBlu>
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 */
export class ActionDialogObject extends Action {
  declare target: ModuleObject;

  validate_conversation_resref: boolean = false;
  conversation: DLGObject;

  constructor( actionId: number = -1, groupId: number = -1 ){
    super(groupId);
    this.type = ActionType.ActionDialogObject;
    this.clearable = false;

    //PARAMS
    // 0 - dword:   speaker object id
    // 1 - string:  conversation resref
    // 2 - int:     bPrivateConversation 
    // 3 - int:     (?) nConversationType
    // 4 - int:     ignoreStartRange
    // 5 - dword:   (?) listener - `appears to be object_invalid mostly`
    
  }

  update(delta: number = 0): ActionStatus {
    //console.log('ActionDialogObject', this);

    this.target = this.getParameter(0);
    let conversation_resref: string = this.getParameter(1) || '';
    let ignoreStartRange = this.getParameter(4) || 0;

    if(!this.validate_conversation_resref){
      this.validate_conversation_resref = true;
      if(conversation_resref){
        this.conversation = DLGObject.FromResRef(conversation_resref);
      }
    }

    if(this.owner instanceof ModuleCreature){
      if(GameState.Mode != EngineMode.DIALOG){
        let distance = Utility.Distance2D(this.owner.position, this.target.position);
        if(distance > 4.5 && !ignoreStartRange){

          this.owner.openSpot = undefined;
          let actionMoveToTarget = new ActionMoveToPoint();
          actionMoveToTarget.setParameter(0, ActionParameterType.FLOAT, this.target.position.x);
          actionMoveToTarget.setParameter(1, ActionParameterType.FLOAT, this.target.position.y);
          actionMoveToTarget.setParameter(2, ActionParameterType.FLOAT, this.target.position.z);
          actionMoveToTarget.setParameter(3, ActionParameterType.DWORD, GameState.module.area.id);
          actionMoveToTarget.setParameter(4, ActionParameterType.DWORD, this.target.id);
          actionMoveToTarget.setParameter(5, ActionParameterType.INT, 1);
          actionMoveToTarget.setParameter(6, ActionParameterType.FLOAT, 4.5 );
          actionMoveToTarget.setParameter(7, ActionParameterType.INT, 0);
          actionMoveToTarget.setParameter(8, ActionParameterType.FLOAT, 30.0);
          this.owner.actionQueue.addFront(actionMoveToTarget);

          return ActionStatus.IN_PROGRESS;
        }else{
          this.owner.setAnimationState(ModuleCreatureAnimState.IDLE);
          this.owner.force = 0;
          this.owner.speed = 0;

          this.target._conversation = this.conversation;

          this.owner.heardStrings = [];
          this.target.heardStrings = [];
          if(this.target.scripts.onDialog instanceof NWScriptInstance){
            this.target.onDialog(this.owner, -1);
          }else{
            MenuManager.InGameDialog.StartConversation(this.conversation ? this.conversation : this.owner.conversation, this.target, this.owner);
          }
          return ActionStatus.COMPLETE;
        }
      }else{
        console.log('ActionDialogObject: Already in dialog', this.owner.getName(), this.owner.getTag());
        return ActionStatus.FAILED;
      }
    }else{
      MenuManager.InGameDialog.StartConversation(this.conversation ? this.conversation : this.owner.conversation, this.owner, this.target);
      return ActionStatus.COMPLETE;
    }
    
    return ActionStatus.FAILED;
  }

}
