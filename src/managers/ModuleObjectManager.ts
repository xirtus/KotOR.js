import EngineLocation from "../engine/EngineLocation";
import { CreatureType } from "../enums/nwscript/CreatureType";
import { ModuleObjectType } from "../enums/nwscript/ModuleObjectType";
import { ReputationType } from "../enums/nwscript/ReputationType";
import { GameState } from "../GameState";
import { ModuleArea, ModuleCreature, ModuleObject } from "../module";
import { PartyManager } from "./PartyManager";
import * as THREE from "three";

export class ModuleObjectManager {

  static objSearchIndex: number;

  public static GetObjectByTag(sTag = '', iNum = 0, oType = ModuleObjectType.ALL){

    /*ModuleObjectType.CREATURE         = 1;
    ModuleObjectType.ITEM             = 2;
    ModuleObjectType.TRIGGER          = 4;
    ModuleObjectType.DOOR             = 8;
    ModuleObjectType.AOE   = 16;
    ModuleObjectType.WAYPOINT         = 32;
    ModuleObjectType.PLACEABLE        = 64;
    ModuleObjectType.STORE            = 128;
    ModuleObjectType.ENCOUNTER        = 256;
    ModuleObjectType.SOUND            = 512;
    OBJECT_TYPE_ALL              = 32767;*/

    sTag = sTag.toLowerCase();
    let results: ModuleObject[] = [];
    let obj: any = undefined;
    if((oType & ModuleObjectType.PLACEABLE) == ModuleObjectType.PLACEABLE){
      for(let i = 0, len = GameState.module.area.placeables.length; i < len; i++){
        obj = GameState.module.area.placeables[i];
        if(obj.getTag().toLowerCase() == sTag)
          results.push(obj);
      }
    }

    if((oType & ModuleObjectType.CREATURE) == ModuleObjectType.CREATURE){
      for(let i = 0, len = GameState.module.area.creatures.length; i < len; i++){
        obj = GameState.module.area.creatures[i];
        if(obj.getTag().toLowerCase() == sTag)
          results.push(obj);
      }
    }

    if((oType & ModuleObjectType.CREATURE) == ModuleObjectType.CREATURE){
      for(let i = 0, len = PartyManager.party.length; i < len; i++){
        obj = PartyManager.party[i];
        if(obj.getTag().toLowerCase() == sTag)
          results.push(obj);
      }
    }

    if((oType & ModuleObjectType.STORE) == ModuleObjectType.STORE){
      for(let i = 0, len = GameState.module.area.stores.length; i < len; i++){
        obj = GameState.module.area.stores[i];
        if(obj.getTag().toLowerCase() == sTag)
          results.push(obj);
      }
    }

    if((oType & ModuleObjectType.DOOR) == ModuleObjectType.DOOR){
      for(let i = 0, len = GameState.module.area.doors.length; i < len; i++){
        obj = GameState.module.area.doors[i];
        if(obj.getTag().toLowerCase() == sTag)
          results.push(obj);
      }
    }

    if((oType & ModuleObjectType.TRIGGER) == ModuleObjectType.TRIGGER){
      for(let i = 0, len = GameState.module.area.triggers.length; i < len; i++){
        obj = GameState.module.area.triggers[i];
        if(obj.getTag().toLowerCase() == sTag)
          results.push(obj);
      }
    }

    if((oType & ModuleObjectType.WAYPOINT) == ModuleObjectType.WAYPOINT){
      for(let i = 0, len = GameState.module.area.waypoints.length; i < len; i++){
        obj = GameState.module.area.waypoints[i];
        if(obj.getTag().toLowerCase() == sTag)
          results.push(obj);
      }
    }

    if((oType & ModuleObjectType.SOUND) == ModuleObjectType.SOUND){
      for(let i = 0, len = GameState.module.area.sounds.length; i < len; i++){
        obj = GameState.module.area.sounds[i];
        if(obj.getTag().toLowerCase() == sTag)
          results.push(obj);
      }
    }

    if((oType & ModuleObjectType.ITEM) == ModuleObjectType.ITEM){
      for(let i = 0, len = GameState.module.area.items.length; i < len; i++){
        obj = GameState.module.area.items[i];
        if(obj.getTag().toLowerCase() == sTag)
          results.push(obj);
      }
    }

    if(sTag == '' || sTag == 'player'){
      return GameState.player;
    }else if(results.length){
      return results[iNum];
    }

    return undefined;

  }

  public static GetNearestObjectByTag(sTag = '', oObject: ModuleObject, iNum = 0){
    sTag = sTag.toLowerCase();
    let results: ModuleObject[] = [];
    let len = GameState.module.area.placeables.length;
    for(let i = 0; i < len; i++){
      if(GameState.module.area.placeables[i].getTag().toLowerCase() == sTag)
        if(oObject != GameState.module.area.placeables[i])
          results.push(GameState.module.area.placeables[i]);
    }

    len = PartyManager.party.length;
    for(let i = 0; i < len; i++){
      if(PartyManager.party[i].getTag().toLowerCase() == sTag)
        if(oObject != PartyManager.party[i])
          results.push(PartyManager.party[i]);
    }

    len = GameState.module.area.creatures.length;
    for(let i = 0; i < len; i++){
      if(GameState.module.area.creatures[i].getTag().toLowerCase() == sTag)
        if(oObject != GameState.module.area.creatures[i])
          results.push(GameState.module.area.creatures[i]);
    }

    len = GameState.module.area.items.length;
    for(let i = 0; i < len; i++){
      if(GameState.module.area.items[i].getTag().toLowerCase() == sTag)
        if(oObject != GameState.module.area.items[i])
          results.push(GameState.module.area.items[i]);
    }

    len = GameState.module.area.doors.length;
    for(let i = 0; i < len; i++){
      if(GameState.module.area.doors[i].getTag().toLowerCase() == sTag)
        if(oObject != GameState.module.area.doors[i])
          results.push(GameState.module.area.doors[i]);
    }

    len = GameState.module.area.triggers.length;
    for(let i = 0; i < len; i++){
      if(GameState.module.area.triggers[i].getTag().toLowerCase() == sTag)
        if(oObject != GameState.module.area.triggers[i])
          results.push(GameState.module.area.triggers[i]);
    }

    len = GameState.module.area.waypoints.length;
    for(let i = 0; i < len; i++){
      if(GameState.module.area.waypoints[i].getTag().toLowerCase() == sTag)
        if(oObject != GameState.module.area.waypoints[i])
          results.push(GameState.module.area.waypoints[i]);
    }

    len = GameState.module.area.sounds.length;
    for(let i = 0; i < len; i++){
      if(GameState.module.area.sounds[i].getTag().toLowerCase() == sTag)
        if(oObject != GameState.module.area.sounds[i])
          results.push(GameState.module.area.sounds[i]);
    }

    results.sort(
      function(a,b) {
        try{
          let distanceA = a.getModel().position.distanceTo(oObject.getModel().position);
          let distanceB = b.getModel().position.distanceTo(oObject.getModel().position);
          return (distanceB > distanceA) ? -1 : ((distanceA > distanceB) ? 1 : 0);
        }catch(e){
          return 0;
        }
      }
    );

    if(results.length){
      return results[iNum];
    }

    return undefined;

  }

  public static GetNearestInteractableObject(oObject?: ModuleObject){
    let results: ModuleObject[] = [];

    results = results.concat(PartyManager.party);
    results = results.concat(GameState.module.area.creatures);
    results = results.concat(GameState.module.area.doors);
    results = results.concat(GameState.module.area.placeables);

    results.sort(
      function(a,b) {
        try{
          let distanceA = a.position.distanceTo(oObject.position);
          let distanceB = b.position.distanceTo(oObject.position);
          return (distanceB > distanceA) ? -1 : ((distanceA > distanceB) ? 1 : 0);
        }catch(e){
          return 0;
        }
      }
    );

    let result: any;
    let count = results.length;

    for(let i = 0; i < count; i++){
      result = results[i];
      if( result != GameState.getCurrentPlayer() && result.isOnScreen() && result.isUseable() ){
        if( result.hasLineOfSight( GameState.getCurrentPlayer() ) ){
          break;
        }
      }
      result = undefined;
    }

    return result;

  }

  public static GetNearestObject(oType = 0, oObject: ModuleObject, iNum = 0){
    let results: ModuleObject[] = [];

    if((oType & ModuleObjectType.CREATURE) == ModuleObjectType.CREATURE){
      results = results.concat(GameState.module.area.creatures);
    }
    if((oType & ModuleObjectType.ITEM) == ModuleObjectType.ITEM){
      results = results.concat(GameState.module.area.items);
    }
    if((oType & ModuleObjectType.TRIGGER) == ModuleObjectType.TRIGGER){
      results = results.concat(GameState.module.area.triggers);
    }
    if((oType & ModuleObjectType.DOOR) == ModuleObjectType.DOOR){
      results = results.concat(GameState.module.area.doors);
    }
    if((oType & ModuleObjectType.AOE) == ModuleObjectType.AOE){
      //results = results.concat([]);
    }
    if((oType & ModuleObjectType.WAYPOINT) == ModuleObjectType.WAYPOINT){
      results = results.concat(GameState.module.area.waypoints);
    }
    if((oType & ModuleObjectType.PLACEABLE) == ModuleObjectType.PLACEABLE){
      results = results.concat(GameState.module.area.placeables);
    }
    if((oType & ModuleObjectType.STORE) == ModuleObjectType.STORE){
      results = results.concat(GameState.module.area.stores);
    }
    if((oType & ModuleObjectType.ENCOUNTER) == ModuleObjectType.ENCOUNTER){
      results = results.concat(GameState.module.area.encounters);
    }
    if((oType & ModuleObjectType.SOUND) == ModuleObjectType.SOUND){
      results = results.concat(GameState.module.area.sounds);
    }

    results.sort(
      function(a,b) {
        try{
          let distanceA = a.position.distanceTo(oObject.position);
          let distanceB = b.position.distanceTo(oObject.position);
          return (distanceB > distanceA) ? -1 : ((distanceA > distanceB) ? 1 : 0);
        }catch(e){
          return 0;
        }
      }
    );

    if(results.length){
      return results[iNum];
    }

    return undefined;

  }

  public static GetFirstObjectInArea(oArea = GameState.module.area, oType = 0){

    if(!(oArea instanceof ModuleArea)){
      console.error(oArea);
      oArea = GameState.module.area;
    }
      

    ModuleObjectManager.objSearchIndex = 0;

    let results: ModuleObject[] = [];
    if((oType & ModuleObjectType.CREATURE) == ModuleObjectType.CREATURE){
      results = results.concat(GameState.module.area.creatures);
    }
    if((oType & ModuleObjectType.ITEM) == ModuleObjectType.ITEM){
      results = results.concat(GameState.module.area.items);
    }
    if((oType & ModuleObjectType.TRIGGER) == ModuleObjectType.TRIGGER){
      results = results.concat(GameState.module.area.triggers);
    }
    if((oType & ModuleObjectType.DOOR) == ModuleObjectType.DOOR){
      results = results.concat(GameState.module.area.doors);
    }
    if((oType & ModuleObjectType.AOE) == ModuleObjectType.AOE){
      //results = results.concat([]);
    }
    if((oType & ModuleObjectType.CREATURE) == ModuleObjectType.CREATURE){
      results = results.concat(GameState.module.area.creatures);
    }
    if((oType & ModuleObjectType.WAYPOINT) == ModuleObjectType.WAYPOINT){
      results = results.concat(GameState.module.area.waypoints);
    }
    if((oType & ModuleObjectType.PLACEABLE) == ModuleObjectType.PLACEABLE){
      results = results.concat(GameState.module.area.placeables);
    }
    if((oType & ModuleObjectType.STORE) == ModuleObjectType.STORE){
      results = results.concat(GameState.module.area.stores);
    }
    if((oType & ModuleObjectType.ENCOUNTER) == ModuleObjectType.ENCOUNTER){
      results = results.concat(GameState.module.area.encounters);
    }
    if((oType & ModuleObjectType.SOUND) == ModuleObjectType.SOUND){
      results = results.concat(GameState.module.area.sounds);
    }

    if(results.length){
      return results[ModuleObjectManager.objSearchIndex];
    }
    return undefined;
  }

  public static GetNextObjectInArea(oArea = GameState.module.area, oType = 0){
    if(!(oArea instanceof ModuleArea)){
      console.error(oArea);
      oArea = GameState.module.area;
    }
    ++ModuleObjectManager.objSearchIndex;

    let results: ModuleObject[] = [];
    if((oType & ModuleObjectType.CREATURE) == ModuleObjectType.CREATURE){
      results = results.concat(GameState.module.area.creatures);
    }
    if((oType & ModuleObjectType.ITEM) == ModuleObjectType.ITEM){
      results = results.concat(GameState.module.area.items);
    }
    if((oType & ModuleObjectType.TRIGGER) == ModuleObjectType.TRIGGER){
      results = results.concat(GameState.module.area.triggers);
    }
    if((oType & ModuleObjectType.DOOR) == ModuleObjectType.DOOR){
      results = results.concat(GameState.module.area.doors);
    }
    if((oType & ModuleObjectType.AOE) == ModuleObjectType.AOE){
      //results = results.concat([]);
    }
    if((oType & ModuleObjectType.CREATURE) == ModuleObjectType.CREATURE){
      results = results.concat(GameState.module.area.creatures);
    }
    if((oType & ModuleObjectType.WAYPOINT) == ModuleObjectType.WAYPOINT){
      results = results.concat(GameState.module.area.waypoints);
    }
    if((oType & ModuleObjectType.PLACEABLE) == ModuleObjectType.PLACEABLE){
      results = results.concat(GameState.module.area.placeables);
    }
    if((oType & ModuleObjectType.STORE) == ModuleObjectType.STORE){
      results = results.concat(GameState.module.area.stores);
    }
    if((oType & ModuleObjectType.ENCOUNTER) == ModuleObjectType.ENCOUNTER){
      results = results.concat(GameState.module.area.encounters);
    }
    if((oType & ModuleObjectType.SOUND) == ModuleObjectType.SOUND){
      results = results.concat(GameState.module.area.sounds);
    }

    if(ModuleObjectManager.objSearchIndex < results.length-1){
      return results[ModuleObjectManager.objSearchIndex];
    }
    return undefined;
  }

  public static GetNearestCreature(nFirstCriteriaType: CreatureType, nFirstCriteriaValue: any, oTarget: ModuleObject, nNth=1, nSecondCriteriaType=-1, nSecondCriteriaValue=-1, nThirdCriteriaType=-1,  nThirdCriteriaValue=-1, list?: ModuleCreature[] ): ModuleCreature {
    
    if(!list){
      list = GameState.module.area.creatures;
      list = list.concat(PartyManager.party);
    }

    let results: ModuleCreature[] = [];
    
    switch(nFirstCriteriaType){
      case CreatureType.RACIAL_TYPE:

      break;
      case CreatureType.PLAYER_CHAR:

      break;
      case CreatureType.CLASS:

      break;
      case CreatureType.REPUTATION:
        switch(nFirstCriteriaValue){
          case ReputationType.FRIEND:
            for(let i = 0; i < list.length; i++){
              if(list[i].isFriendly(oTarget) && oTarget.hasLineOfSight(list[i])){
                results.push(list[i]);
              }
            }
          break;
          case ReputationType.ENEMY:
            for(let i = 0; i < list.length; i++){
              if(list[i].isHostile(oTarget) && oTarget.hasLineOfSight(list[i])){
                results.push(list[i]);
              }
            }
          break;  
          case ReputationType.NEUTRAL:
            for(let i = 0; i < list.length; i++){
              if(list[i].isNeutral(oTarget) && oTarget.hasLineOfSight(list[i])){
                results.push(list[i]);
              }
            }
          break;
        }
      break;
      case CreatureType.IS_ALIVE:
        for(let i = 0; i < list.length; i++){
          if(!list[i].isDead()){
            results.push(list[i]);
          }
        }
      break;
      case CreatureType.HAS_SPELL_EFFECT:

      break;
      case CreatureType.DOES_NOT_HAVE_SPELL_EFFECT:

      break;
      case CreatureType.PERCEPTION:
        for(let i = 0; i < list.length; i++){
          switch(nFirstCriteriaValue){
            case 0:// PERCEPTION_SEEN_AND_HEARD	0	Both seen and heard (Spot beats Hide, Listen beats Move Silently).
              if(oTarget.perceptionList.filter( (o: any) => o.object == list[i] && o.seen && o.heard ).length){
                results.push(list[i]);
              }
            break;
            case 1:// PERCEPTION_NOT_SEEN_AND_NOT_HEARD	1	Neither seen nor heard (Hide beats Spot, Move Silently beats Listen).
              if(oTarget.perceptionList.filter( (o: any) => o.object == list[i] && !o.seen && !o.heard ).length){
                results.push(list[i]);
              }
            break;
            case 2:// PERCEPTION_HEARD_AND_NOT_SEEN	2	 Heard only (Hide beats Spot, Listen beats Move Silently). Usually arouses suspicion for a creature to take a closer look.
              if(oTarget.perceptionList.filter( (o: any) => o.object == list[i] && !o.seen && o.heard ).length){
                results.push(list[i]);
              }
            break;
            case 3:// PERCEPTION_SEEN_AND_NOT_HEARD	3	Seen only (Spot beats Hide, Move Silently beats Listen). Usually causes a creature to take instant notice.
              if(oTarget.perceptionList.filter( (o: any) => o.object == list[i] && o.seen && !o.heard ).length){
                results.push(list[i]);
              }
            break;
            case 4:// PERCEPTION_NOT_HEARD 4 Not heard (Move Silently beats Listen), no line of sight.
              if(oTarget.perceptionList.filter( (o: any) => o.object == list[i] && !o.heard ).length){
                results.push(list[i]);
              }
            break;
            case 5:// PERCEPTION_HEARD 5 Heard (Listen beats Move Silently), no line of sight.
              if(oTarget.perceptionList.filter( (o: any) => o.object == list[i] && o.heard ).length){
                results.push(list[i]);
              }
            break;
            case 6:// PERCEPTION_NOT_SEEN	6	Not seen (Hide beats Spot), too far away to heard or magically silcenced.
              if(oTarget.perceptionList.filter( (o: any) => o.object == list[i] && !o.seen ).length){
                results.push(list[i]);
              }
            break;
            case 7:// PERCEPTION_SEEN	7	Seen (Spot beats Hide), too far away to heard or magically silcenced.
              if(oTarget.perceptionList.filter( (o: any) => o.object == list[i] && o.seen ).length){
                results.push(list[i]);
              }
            break;
          }

        }
      break;
    }

    if(nSecondCriteriaType >= 0){
      return ModuleObjectManager.GetNearestCreature(nSecondCriteriaType, nSecondCriteriaValue, oTarget, nNth, nThirdCriteriaType, nThirdCriteriaValue, -1, -1, results);
    }

    if(results.length){
      results.sort((a: any, b: any) => {
        return oTarget.position.distanceTo(a.position) - oTarget.position.distanceTo(b.position);
      });
      return results[nNth-1];
    }

    return undefined;
  }

  public static GetObjectsInShape(shape = -1, size = 1, target: EngineLocation, lineOfSight = false, oType = -1, origin = new THREE.Vector3, idx = -1){

    let object_pool: ModuleObject[] = [];
    let results: ModuleObject[] = [];

    /*
    int    ModuleObjectType.CREATURE         = 1;
    int    ModuleObjectType.ITEM             = 2;
    int    ModuleObjectType.TRIGGER          = 4;
    int    ModuleObjectType.DOOR             = 8;
    int    ModuleObjectType.AOE   = 16;
    int    ModuleObjectType.WAYPOINT         = 32;
    int    ModuleObjectType.PLACEABLE        = 64;
    int    ModuleObjectType.STORE            = 128;
    int    ModuleObjectType.ENCOUNTER        = 256;
    int    ModuleObjectType.SOUND            = 512;
    int    OBJECT_TYPE_ALL              = 32767;
    */

    //console.log('GetObjectsInShape', objectFilter, shape);

    if((oType & ModuleObjectType.CREATURE) == ModuleObjectType.CREATURE){ //CREATURE
      object_pool = object_pool.concat(GameState.module.area.creatures);
    }

    if((oType & ModuleObjectType.ITEM) == ModuleObjectType.ITEM){ //ITEM
      object_pool = object_pool.concat(GameState.module.area.items);
    }

    if((oType & ModuleObjectType.TRIGGER) == ModuleObjectType.TRIGGER){ //TRIGGER
      object_pool = object_pool.concat(GameState.module.area.triggers); 
    }

    if((oType & ModuleObjectType.DOOR) == ModuleObjectType.DOOR){ //DOOR
      object_pool = object_pool.concat(GameState.module.area.doors); 
    }

    if((oType & ModuleObjectType.AOE) == ModuleObjectType.AOE){ //AOE
              
    }

    if((oType & ModuleObjectType.WAYPOINT) == ModuleObjectType.WAYPOINT){ //WAYPOINTS
      object_pool = object_pool.concat(GameState.module.area.waypoints);
    }
    
    if((oType & ModuleObjectType.PLACEABLE) == ModuleObjectType.PLACEABLE){ //PLACEABLE
      object_pool = object_pool.concat(GameState.module.area.placeables);
    }

    if((oType & ModuleObjectType.STORE) == ModuleObjectType.STORE){ //STORE
          
    }
    
    if((oType & ModuleObjectType.ENCOUNTER) == ModuleObjectType.ENCOUNTER){ //ENCOUNTER
          
    }
    
    if((oType & ModuleObjectType.SOUND) == ModuleObjectType.SOUND){ //SOUND
      object_pool = object_pool.concat(GameState.module.area.sounds);
    }

    for(let i = 0, len = object_pool.length; i < len; i++){
      if(object_pool[i] instanceof ModuleObject){
        if(object_pool[i].position.distanceTo(target.position) < size){
          results.push(object_pool[i]);
        }
      }
    }

    if(idx == -1){
      return results;
    }else{
      return results[idx];
    }

  }

  public static GetAttackerByIndex(oTarget: ModuleObject, index: number = 0): ModuleObject {
    let object_pool: ModuleObject[] = [];
    
    object_pool.concat(
      GameState.module.area.creatures.filter( 
        (
          creature => 
          {
            return (
              creature.combatData.lastAttackTarget == oTarget ||
              creature.combatData.lastSpellTarget == oTarget
            );
          }
        )
      )
    );

    return object_pool[index];
  }

}