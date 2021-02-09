class EffectHeal extends GameEffect {
  constructor(){
    super();
    this.type = GameEffect.Type.EffectHeal;
    
    //intList[0] : heal amount

  }

  onApply(){
    if(this.applied)
      return;
      
    super.onApply();
    
    this.object.addHP(this.getAmount());
  }

  getAmount(){
    return this.getInt(0);
  }

}

module.exports = EffectHeal;