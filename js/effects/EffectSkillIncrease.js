class EffectSkillIncrease extends GameEffect {
  constructor(){
    super();
    this.type = GameEffect.Type.EffectSkillIncrease;
    
    //intList[0] : skill id
    //intList[1] : amount
    //intList[2] : racialtypes.2da rowcount
    
  }

  onApply(){
    if(this.applied)
      return;
      
    super.onApply();
    
    if(this.object instanceof ModuleObject){
      //
    }
  }

}

module.exports = EffectSkillIncrease;