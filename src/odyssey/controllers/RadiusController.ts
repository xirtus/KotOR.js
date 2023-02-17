import { OdysseyControllerFrameGeneric } from "../../interface/odyssey/controller/OdysseyControllerFrameGeneric";
import { OdysseyControllerGeneric } from "../../interface/odyssey/controller/OdysseyControllerGeneric";
import { OdysseyModelControllerType } from "../../interface/odyssey/OdysseyModelControllerType";
import { OdysseyModelNodeType } from "../../interface/odyssey/OdysseyModelNodeType";
import { OdysseyModelAnimation } from "../OdysseyModelAnimation";
import { OdysseyModelAnimationManager } from "../OdysseyModelAnimationManager";
import { OdysseyModelNodeLight } from "../OdysseyModelNodeLight";
import { OdysseyController } from "./OdysseyController";

export class RadiusController extends OdysseyController {

  type: OdysseyModelControllerType = OdysseyModelControllerType.Radius;

  constructor( controller: OdysseyControllerGeneric){
    super(controller);
  }

  setFrame(manager: OdysseyModelAnimationManager, anim: OdysseyModelAnimation, data: OdysseyControllerFrameGeneric){
    if ((manager.modelNode.odysseyModelNode.NodeType & OdysseyModelNodeType.Light) == OdysseyModelNodeType.Light) {
      (manager.modelNode.odysseyModelNode as OdysseyModelNodeLight).radius = data.value || 0.000000001;
    }
  }

  animate(manager: OdysseyModelAnimationManager, anim: OdysseyModelAnimation, last: OdysseyControllerFrameGeneric, next: OdysseyControllerFrameGeneric, fl: number = 0){
    if ((manager.modelNode.odysseyModelNode.NodeType & OdysseyModelNodeType.Light) == OdysseyModelNodeType.Light) {
      (manager.modelNode.odysseyModelNode as OdysseyModelNodeLight).radius = ((next.value - last.value) * fl + last.value) || 0.000000001;
    }
  }

}
