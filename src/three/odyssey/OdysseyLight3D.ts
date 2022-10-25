// import { Forge } from "../../Forge";
import { GameState } from "../../GameState";
import { ApplicationProfile } from "../../utility/ApplicationProfile";
import { OdysseyObject3D } from "./";
import * as THREE from "three";
import { OdysseyModel } from "../../odyssey/OdysseyModel";
import { OdysseyModelNodeLight } from "../../odyssey/OdysseyModelNodeLight";


//THREE.js representation of an OdysseyLight
export class OdysseyLight3D extends OdysseyObject3D {

  worldPosition: THREE.Vector3;
  sphere: THREE.Sphere;
  isAnimated: boolean;
  parentUUID: string;
  priority: number;
  isAmbient: boolean;
  isDynamic: boolean;
  affectDynamic: boolean;
  genFlare: boolean;
  isFading: number;
  maxIntensity: number;
  color: THREE.Color;

  constructor(node: OdysseyModelNodeLight){
    super(node);
    this.type = 'OdysseyLight';
    this.worldPosition = new THREE.Vector3();
    this.sphere = new THREE.Sphere();
  }

  getIntensity(){
    if(this.odysseyModelNode)
      //return this.odysseyModelNode.multiplier;
      return 0.5;//(this.odysseyModelNode.multiplier > 1 && (Number(this.odysseyModelNode.multiplier) === this.odysseyModelNode.multiplier && this.odysseyModelNode.multiplier % 1 === 0) ? this.odysseyModelNode.multiplier : this.odysseyModelNode.multiplier);
    else
      return 0;
  }

  getRadius(){
    if(this.odysseyModelNode)
      return (this.odysseyModelNode as OdysseyModelNodeLight).radius;
    else
      return 0;
  }

  isOnScreen( frustum = GameState.viewportFrustum ){
    // if(ApplicationProfile.MODE == 'FORGE'){
    //   if(Forge.tabManager.currentTab instanceof ModuleEditorTab){
    //     if(!this.odysseyModel.visible)
    //       return false;
        
    //     frustum = Forge.tabManager.currentTab.viewportFrustum;
    //     this.sphere.center.copy(this.worldPosition);
    //     this.sphere.radius = this.getRadius();
    //     return frustum.intersectsSphere(this.sphere);
    //   }
    //   return false;
    // }else{
      if(!this.odysseyModel.visible)
        return false;

      this.sphere.center.copy(this.worldPosition);
      this.sphere.radius = this.getRadius();
      return frustum.intersectsSphere(this.sphere);
    // }
  }

}