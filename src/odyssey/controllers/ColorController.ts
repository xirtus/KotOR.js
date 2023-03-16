import { OdysseyController } from ".";
import { OdysseyModelAnimation, OdysseyModelAnimationManager } from "..";
import { OdysseyModelControllerType } from "../../enums/odyssey/OdysseyModelControllerType";
import { OdysseyControllerFrameGeneric } from "../../interface/odyssey/controller/OdysseyControllerFrameGeneric";
import { OdysseyControllerGeneric } from "../../interface/odyssey/controller/OdysseyControllerGeneric";

export class ColorController extends OdysseyController {

  type: OdysseyModelControllerType = OdysseyModelControllerType.Color;

  constructor( controller: OdysseyControllerGeneric){
    super(controller);
  }

  setFrame(manager: OdysseyModelAnimationManager, anim: OdysseyModelAnimation, data: OdysseyControllerFrameGeneric){
    // if ((manager.modelNode.odysseyModelNode.nodeType & NODETYPE.Light) == NODETYPE.Light) {
    //   manager.modelNode.odysseyModelNode.light.color.setRGB( data.x, data.y, data.z );
    // }
  }

  animate(manager: OdysseyModelAnimationManager, anim: OdysseyModelAnimation, last: OdysseyControllerFrameGeneric, next: OdysseyControllerFrameGeneric, fl: number = 0){
    // if ((manager.modelNode.odysseyModelNode.nodeType & NODETYPE.Light) == NODETYPE.Light) {
    //   manager.modelNode.odysseyModelNode.light.color.r = ((next.x - last.x) * fl + last.x);
    //   manager.modelNode.odysseyModelNode.light.color.g = ((next.y - last.y) * fl + last.y);
    //   manager.modelNode.odysseyModelNode.light.color.b = ((next.z - last.z) * fl + last.z);
    // }
  }

}
