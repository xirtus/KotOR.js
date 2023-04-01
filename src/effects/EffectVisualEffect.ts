import { AudioEmitter } from "../audio/AudioEmitter";
import { GameEffectDurationType } from "../enums/effects/GameEffectDurationType";
import { GameEffectType } from "../enums/effects/GameEffectType";
import { GameState } from "../GameState";
import { TextureLoader } from "../loaders/TextureLoader";
import { TwoDAManager } from "../managers/TwoDAManager";
import { ModuleCreature } from "../module";
import { OdysseyModel } from "../odyssey";
import { OdysseyModel3D } from "../three/odyssey";
import { Utility } from "../utility/Utility";
import { GameEffect } from "./GameEffect";

export class EffectVisualEffect extends GameEffect {
  visualEffect: any;
  model: OdysseyModel3D;
  impact_model: OdysseyModel3D;
  impact_root_model: OdysseyModel3D;
  impact_head_model: OdysseyModel3D;
  impactTimer: number;
  impactRootTimer: number;
  impactHeadTimer: number;

  constructor(){
    super();
    this.type = GameEffectType.EffectVisualEffect;

    //intList[0] : VisualEffect.2da Id

  }

  initialize(){
    super.initialize();

    const visualeffects2DA = TwoDAManager.datatables.get('visualeffects');
    if(visualeffects2DA){
      this.visualEffect = visualeffects2DA.getByID(this.getInt(0));
    }

    return this;
  }

  update(delta = 0){
    super.update(delta);

    if(this.durationEnded && this.getDurationType() == GameEffectDurationType.TEMPORARY){
      return;
    }

    //Impact Node
    if(this.impact_model){
      if(this.impactTimer == undefined){
        this.impactTimer = 3000;
        if(this.visualEffect.type_fd == 'D'){
          this.impact_model.playAnimation('duration', true);
        }else if(this.visualEffect.type_fd == 'F'){
          this.impact_model.playAnimation('impact');
        }
      }

      if(this.impactTimer <= 0){
        //this.impact_model.dispose();
        //this.impact_model = undefined;
      }else{
        this.impact_model.update(delta);
      }

      this.impactTimer -= 1000 * delta;
    }

    //Root Node
    if(this.impact_root_model){
      if(this.impactRootTimer == undefined){
        this.impactRootTimer = 3000;
        if(this.visualEffect.type_fd == 'D'){
          this.impact_root_model.playAnimation('duration', true);
        }else if(this.visualEffect.type_fd == 'F'){
          this.impact_root_model.playAnimation('impact');
        }
      }

      if(this.impactRootTimer <= 0){
        //this.impact_root_model.dispose();
        //this.impact_root_model = undefined;
      }else{
        this.impact_root_model.update(delta);
      }

      this.impactRootTimer -= 1000 * delta;
    }

    //Head Conjure
    if(this.impact_head_model){
      if(this.impactHeadTimer == undefined){
        this.impactHeadTimer = 3000;
        if(this.visualEffect.type_fd == 'D'){
          this.impact_head_model.playAnimation('duration', true);
        }else if(this.visualEffect.type_fd == 'F'){
          this.impact_head_model.playAnimation('impact');
        }
      }

      if(this.impactHeadTimer <= 0){
        //this.impact_head_model.dispose();
        //this.impact_head_model = undefined;
      }else{
        this.impact_head_model.update(delta);
      }

      this.impactHeadTimer -= 1000 * delta;
    }

    if(this.model){

      this.model.animationManager.currentAnimation = undefined;

      if(this.object.model && this.model){
        for(let node of this.object.model.nodes){
          let c_node = this.model.nodes.get(node[0]);
          c_node.position.copy(node[1].position);
          c_node.quaternion.copy(node[1].quaternion);
          c_node.scale.copy(node[1].scale);
        }
      }

      this.model.position.copy(this.object.position);
      this.model.rotation.copy(this.object.model.rotation);

      this.model.update(delta);

    }

  }

  onApply(){
    if(this.applied)
      return;

    super.onApply();

    if(this.object instanceof ModuleCreature){

      //FireAndForget
      if(this.visualEffect.type_fd == 'F'){
        //Handle progfx_Impact
        this.progFX_Impact();
      }

      this.impact();

      //Duration
      if(this.visualEffect.type_fd == 'D'){
        //Handle progfx_Duration
        this.progFX_Duration();
      }

      //Beam
      if(this.visualEffect.type_fd == 'B'){
      }

    }else if(typeof this.object != 'undefined'){
      this.impact();
    }

    this.applied = true;
  }

  getImpactRootModel(){
    if(this.object instanceof ModuleCreature){
      switch(this.object.getAppearance().sizecategory){
        case 1: //TINY
          return this.visualEffect.imp_root_s_node;
        case 2: //SMALL
          return this.visualEffect.imp_root_s_node;
        case 3: //MEDIUM
          return this.visualEffect.imp_root_m_node;
        case 4: //LARGE
          return this.visualEffect.imp_root_l_node;
        case 5: //HUGE
          return this.visualEffect.imp_root_h_node;
      }
      return '****';
    }else{
      return this.visualEffect.imp_root_m_node;
    }
  }

  impact(){
    if(this.visualEffect.imp_impact_node != '****'){
      GameState.ModelLoader.load(this.visualEffect.imp_impact_node)
      .then(
        (mdl: OdysseyModel) => {
          OdysseyModel3D.FromMDL(mdl, {
            context: this.object.context
          }).then(
            (model: OdysseyModel3D) => {
              this.impact_model = model;
              if(this.object.model){
                if(this.object.model.impact){
                  this.object.model.impact.add(this.impact_model);
                  TextureLoader.LoadQueue();
                }else{
                  this.object.model.add(this.impact_model);
                  TextureLoader.LoadQueue();
                }
              }else{
                this.impact_model.dispose();
              }
            }
          )
        }
      );
    }

    this.impactRoot();
    this.impactHead();

    if(this.visualEffect.soundimpact != '***'){
      if(this.object instanceof ModuleCreature || this.object?.audioEmitter instanceof AudioEmitter){
        this.object.audioEmitter.PlaySound(this.visualEffect.soundimpact);
      }
    }
  }

  impactRoot(){
    if(this.getImpactRootModel() != '****'){
      GameState.ModelLoader.load(this.getImpactRootModel())
      .then((mdl: OdysseyModel) => {
        OdysseyModel3D.FromMDL(mdl, {
          context: this.object.context,
        }).then((model: OdysseyModel3D) => {
          this.impact_root_model = model;
          if(this.object.model){
            this.object.model.add(this.impact_root_model);
            TextureLoader.LoadQueue();
          }else{
            this.impact_root_model.dispose();
          }
        });
      });
    }
  }

  impactHead(){
    if(this.visualEffect.imp_headcon_node != '****'){
      GameState.ModelLoader.load(this.visualEffect.imp_headcon_node).then(
        (mdl: OdysseyModel) => {
          OdysseyModel3D.FromMDL(mdl, {
            context: this.object.context,
          }).then((model: OdysseyModel3D) => {
            this.impact_head_model = model;
            if(this.object.model.headconjure){
              this.object.model.headconjure.add(this.impact_head_model);
              TextureLoader.LoadQueue();
            }else if(this.object.model.headhook){
              this.object.model.headhook.add(this.impact_head_model);
              TextureLoader.LoadQueue();
            }else{
              this.impact_root_model.dispose();
            }
          })
        }
      );
    }
  }

  getProgFXTexture(progFX = 1400){
    let fxNumber = progFX - 1400;
    switch(fxNumber){
      case 26:
        return 'fx_tex_stealth';
      default:
        //Skips 13 for some reason
        if(fxNumber >= 13)
          fxNumber += 1;

        return 'fx_tex_' + Utility.PadInt(fxNumber, 2);
    }
  }

  progFX_Impact(){

    if(this.visualEffect.progfx_impact == '****')
      return;

    //ForceShield progFX_impact
    if(this.visualEffect.progfx_impact > 1400 && this.visualEffect.progfx_impact < 1500){
      let fx_tex = this.getProgFXTexture(this.visualEffect.progfx_impact);
      
      if(this.object instanceof ModuleCreature){
        GameState.ModelLoader.load(this.object.bodyModel)
        .then(
          (mdl: OdysseyModel) => {
            OdysseyModel3D.FromMDL(mdl, {
              textureVar: fx_tex,
              isForceShield: true,
              context: this.object.context
            }).then((model: OdysseyModel3D) => {
              this.model = model;
              GameState.scene.add(model);
              model.position.copy(this.object.position);
              model.rotation.copy(this.object.rotation);
              model.quaternion.copy(this.object.quaternion);
              //model.disableMatrixUpdate();
              
              if(this.object instanceof ModuleCreature){
                if(this.object.headModel){
                  GameState.ModelLoader.load(this.object.headModel).then(
                    (mdl: OdysseyModel) => {
                    OdysseyModel3D.FromMDL(mdl, {
                      textureVar: fx_tex,
                      context: this.object.context,
                      isForceShield: true,
                    }).then((head: OdysseyModel3D) => {
                      this.model.attachHead(head);
                      //head.disableMatrixUpdate();
                      TextureLoader.LoadQueue();
                    })
                  })
                }else{
                  TextureLoader.LoadQueue();
                }
              }else{
                TextureLoader.LoadQueue();
              }
            })
          }
        );
      }

    }
  }

  progFX_Duration(){

    if(this.visualEffect.progfx_duration == '****')
      return;

    //ForceShield progFX_impact
    if(this.visualEffect.progfx_duration > 1400 && this.visualEffect.progfx_duration < 1500){
      let fx_tex = this.getProgFXTexture(this.visualEffect.progfx_duration);
      
      if(this.object instanceof ModuleCreature){
        GameState.ModelLoader.load(this.object.bodyModel).then((mdl: OdysseyModel) => {
          OdysseyModel3D.FromMDL(mdl, {
            textureVar: fx_tex,
            isForceShield: true,
            context: this.object.context,
            onComplete: (model: OdysseyModel3D) => {
              this.model = model;
              GameState.scene.add(model);
              model.position.copy(this.object.position);
              model.rotation.copy(this.object.rotation);
              model.quaternion.copy(this.object.quaternion);
              //model.disableMatrixUpdate();
              if(this.object instanceof ModuleCreature){
                if(this.object.headModel){
                  GameState.ModelLoader.load(this.object.headModel)
                  .then((mdl: OdysseyModel) => {
                    OdysseyModel3D.FromMDL(mdl, {
                      textureVar: fx_tex,
                      context: this.object.context,
                      isForceShield: true,
                    }).then((head: OdysseyModel3D) => {
                      this.model.attachHead(head);
                      //head.disableMatrixUpdate();
                      TextureLoader.LoadQueue();
                    }).catch(() => {
                      TextureLoader.LoadQueue();
                    });
                  }).catch(() => {
                    TextureLoader.LoadQueue();
                  });
                }else{
                  TextureLoader.LoadQueue();
                }
              }else{
                TextureLoader.LoadQueue();
              }
            }
          });
        });
      }

    }
  }

  onRemove(){
    if(this.model instanceof OdysseyModel3D){
      this.model.dispose();
    }

    if(this.impact_model instanceof OdysseyModel3D){
      this.impact_model.dispose();
    }

    if(this.impact_root_model instanceof OdysseyModel3D){
      this.impact_root_model.dispose();
    }

    if(this.impact_head_model instanceof OdysseyModel3D){
      this.impact_head_model.dispose();
    }
  }

}
