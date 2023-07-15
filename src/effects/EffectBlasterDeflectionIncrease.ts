import { GameEffect } from ".";
import { GameEffectType } from "../enums/effects/GameEffectType";

export class EffectBlasterDeflectionIncrease extends GameEffect {
  constructor(){
    super();
    this.type = GameEffectType.EffectBlasterDeflectionIncrease;

    //intList[0] : nChange
    //intList[1] : ???

  }

  onApply(){
    if(this.applied)
      return;
      
    super.onApply();
  }

}
