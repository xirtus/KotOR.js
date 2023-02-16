import { ModuleCalendar } from ".";
import { GFFObject } from "../resource/GFFObject";


export class ModuleTimeManager {

  //minutesPerHour = 2;
  // pauseDay = 0;
  // pauseTime = 0;
  // year = 0;
  // month = 0;
  // day = 0;
  // hour = 0;
  // minute = 0;
  // second = 0;
  // milisecond = 0;
  dawnHour = 6;
  duskHour = 18;

  enabled = true;
  calendar: ModuleCalendar;

  constructor(){
    this.calendar = new ModuleCalendar();

    //24 = days in a month
    //12 = months in a year
    //02 = default minutes per hour
  }

  update(delta = 0){
    if(!this.enabled) return;
    this.calendar.advanceDeltaTime(delta);
  }

  setTime(hour = 0, minute = 0, second = 0, milisecond = 0){
    hour = (hour % 24) | 0;
    minute =  (this.minutesPerHour * ( ( ( minute % 60 ) +1 ) / 60 ) ) | 0;
    second = (second % 60) | 0;
    milisecond = (milisecond % 1000) | 0;

    const time = ( hour * this.minutesPerHour * ModuleCalendar.SECONDS_IN_MINUTE * ModuleCalendar.MILISECONDS_IN_SECOND ) + 
      ( minute * ModuleCalendar.SECONDS_IN_MINUTE * ModuleCalendar.MILISECONDS_IN_SECOND ) + 
      ( second * ModuleCalendar.MILISECONDS_IN_SECOND ) + milisecond;

    let advanceDay = 0;
    let advanceTime = 0;
    if(time <= this.pauseTime){
      advanceTime = Math.abs((this.calendar.MAX_DAY_TIME - this.pauseTime) + time)|0;
      advanceDay++;
    }else{
      advanceTime = Math.abs(this.pauseTime - time)|0;
    }
    this.calendar.advanceDayAndTime(advanceDay, advanceTime);
  }

  getCalendarTimeFromPauseTime( calendar = new ModuleCalendar ){
    calendar.hour       = this.pauseTime / ModuleCalendar.MILISECONDS_IN_SECOND / ModuleCalendar.SECONDS_IN_MINUTE / this.minutesPerHour | 0;
    calendar.minute     = this.pauseTime / ModuleCalendar.MILISECONDS_IN_SECOND / ModuleCalendar.SECONDS_IN_MINUTE % this.minutesPerHour | 0;
    calendar.second     = this.pauseTime / ModuleCalendar.MILISECONDS_IN_SECOND % ModuleCalendar.SECONDS_IN_MINUTE | 0;
    calendar.milisecond = this.pauseTime % ModuleCalendar.MILISECONDS_IN_SECOND | 0;
    return calendar;
  }

  getCalendarDateFromPauseDay( calendar = new ModuleCalendar ){
    calendar.year   = this.pauseDay / ModuleCalendar.DAYS_IN_MONTH / ModuleCalendar.MONTHS_IN_YEAR | 0;
    calendar.month  = this.pauseDay / ModuleCalendar.DAYS_IN_MONTH % ModuleCalendar.MONTHS_IN_YEAR + 1 | 0;
    calendar.day    = this.pauseDay % ModuleCalendar.DAYS_IN_MONTH + 1 | 0;
    return calendar;
  }

  setMinutesPerHour(mph: number = 0){
    this.minutesPerHour = mph | 0;
  }

  getHoursFromPauseTime(){
    return this.pauseTime / ModuleCalendar.MILISECONDS_IN_SECOND / ModuleCalendar.SECONDS_IN_MINUTE / this.minutesPerHour | 0;
  }

  getMinutesFromPauseTime(){
    return this.pauseTime / ModuleCalendar.MILISECONDS_IN_SECOND / ModuleCalendar.SECONDS_IN_MINUTE % this.minutesPerHour | 0;
  }

  getSecondsFromPauseTime(){
    return this.pauseTime / ModuleCalendar.MILISECONDS_IN_SECOND % ModuleCalendar.SECONDS_IN_MINUTE | 0;
  }

  getMilisecondsFromPauseTime(){
    return this.pauseTime % ModuleCalendar.MILISECONDS_IN_SECOND | 0;
  }

  getFutureTimeFromSeconds(seconds: number = 0){
    // console.log('getFutureTimeFromSeconds', seconds);
    let future = this.calendar.clone();
    future.advanceDeltaTime(seconds);
    // console.log('getFutureTimeFromSeconds.future', (future.pauseTime - this.pauseTime), (future.pauseTime - this.pauseTime) / 1000 );
    return future;
  }

  getMilisecondsElapsed(day: number = 0, time: number = 0){
    const days_since = (this.pauseDay - day)|0;
    const time_since = (this.pauseTime - time) |0;
    return (days_since * this.calendar.MAX_DAY_TIME)|0 + time_since;
  }

  toString(){
    return `${('0000'+this.year).slice(-4)}-${('00'+this.month).slice(-2)}-${('00'+this.day).slice(-2)} ${('00'+this.hour).slice(-2)}:${('00'+this.minute).slice(-2)}:${('00'+this.second).slice(-2)}.${('0000'+this.milisecond).slice(-4)}`;
  }

  setFromIFO(ifo: GFFObject){
    if(ifo instanceof GFFObject){
      if(ifo.RootNode.HasField('Mod_PauseDay')){
        this.pauseDay = ifo.GetFieldByLabel('Mod_PauseDay').GetValue();
      }

      if(ifo.RootNode.HasField('Mod_PauseTime')){
        this.pauseTime = ifo.GetFieldByLabel('Mod_PauseTime').GetValue();
      }

      if(ifo.RootNode.HasField('Mod_DawnHour')){
        this.dawnHour = ifo.GetFieldByLabel('Mod_DawnHour').GetValue();
      }

      if(ifo.RootNode.HasField('Mod_DuskHour')){
        this.duskHour = ifo.GetFieldByLabel('Mod_DuskHour').GetValue();
      }

      if(ifo.RootNode.HasField('Mod_MinPerHour')){
        this.minutesPerHour = ifo.GetFieldByLabel('Mod_MinPerHour').GetValue();
      }

      if(ifo.RootNode.HasField('Mod_StartYear')){
        this.year = ifo.GetFieldByLabel('Mod_StartYear').GetValue();
      }

      if(ifo.RootNode.HasField('Mod_StartMonth')){
        this.month = ifo.GetFieldByLabel('Mod_StartMonth').GetValue();
      }

      if(ifo.RootNode.HasField('Mod_StartDay')){
        this.day = ifo.GetFieldByLabel('Mod_StartDay').GetValue();
      }

      if(ifo.RootNode.HasField('Mod_StartHour')){
        this.hour = ifo.GetFieldByLabel('Mod_StartHour').GetValue();
      }

      if(ifo.RootNode.HasField('Mod_StartMinute')){
        this.minute = ifo.GetFieldByLabel('Mod_StartMinute').GetValue();
      }

      if(ifo.RootNode.HasField('Mod_StartSecond')){
        this.second = ifo.GetFieldByLabel('Mod_StartSecond').GetValue();
      }

      if(ifo.RootNode.HasField('Mod_StartMiliSec')){
        this.milisecond = ifo.GetFieldByLabel('Mod_StartMiliSec').GetValue();
      }
    }
  }

  get MAX_DAY_TIME(){
    return ModuleCalendar.HOURS_IN_DAY * (ModuleCalendar.SECONDS_IN_MINUTE * this.minutesPerHour) * ModuleCalendar.MILISECONDS_IN_SECOND;
  }

  get milisecond(){
    return this.calendar.milisecond;
  }

  set milisecond(milisecond: number){
    this.calendar.milisecond = milisecond|0;
  }

  get second(){
    return this.calendar.second;
  }

  set second(second: number){
    this.calendar.second = second|0;
  }

  get minute(){
    return this.calendar.minute;
  }

  set minute(minute: number){
    this.calendar.minute = minute|0;
  }

  get hour(){
    return this.calendar.hour;
  }

  set hour(hour: number){
    this.calendar.hour = hour|0;
  }

  get day(){
    return this.calendar.day;
  }

  set day(day: number){
    this.calendar.day = day|0;
  }

  get month(){
    return this.calendar.month;
  }

  set month(month: number){
    this.calendar.month = month|0;
  }

  get year(){
    return this.calendar.year;
  }

  set year(year: number){
    this.calendar.year = year|0;
  }

  get pauseTime(){
    return this.calendar.pauseTime|0;
  }

  set pauseTime(pauseTime: number){
    this.calendar.pauseTime = pauseTime|0;
  }

  get pauseDay(){
    return this.calendar.pauseDay|0;
  }

  set pauseDay(pauseDay: number){
    this.calendar.pauseDay = pauseDay|0;
  }

  get minutesPerHour(){
    return this.calendar.minutesPerHour;
  }

  set minutesPerHour(minutesPerHour: number){
    this.calendar.minutesPerHour = minutesPerHour|0;
  }

}
