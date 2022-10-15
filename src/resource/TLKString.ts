/* KotOR JS - A remake of the Odyssey Game Engine that powered KotOR I & II
 */

import { BinaryReader } from "../BinaryReader";

/* @file
 * The TLKString class.
 */

export class TLKString {
  // public flags: number;
  // public SoundResRef: any;

  constructor(
    public flags: number, 
    public SoundResRef: any, 
    public VolumeVariance: number, 
    public PitchVariance: number, 
    public StringOffset: number, 
    public StringLength: number, 
    public SoundLength: number, 
    public Value: any = undefined
  ) {
    // this.flags = flags;
    // this.SoundResRef = SoundResRef;
    // this.VolumeVariance = VolumeVariance;
    // this.PitchVariance = PitchVariance;
    // this.StringOffset = StringOffset;
    // this.StringLength = StringLength;
    // this.SoundLength = SoundLength;
    // this.Value = Value;
  }

  GetValue(binary: BinaryReader, onReturn?: Function) {
    if(this.Value == null) {
      let pos = binary.Tell();
      binary.Seek(this.StringOffset);
      this.Value = binary.ReadChars(this.StringLength).replace(/\0[\s\S]*$/g,'');
      if(onReturn != null)
        onReturn(this.Value);
      binary.Seek(pos);
    }
  }

  ToDB() {
    return {
      flags: this.flags,
      SoundResRef: this.SoundResRef,
      VolumeVariance: this.VolumeVariance,
      PitchVariance: this.PitchVariance,
      Value: this.Value.replace(/\0[\s\S]*$/g,'')
    };
  }

  FromDB(row: any) {
    this.flags = row.flags;
    this.SoundResRef = row.SoundResRef;
    this.VolumeVariance = row.VolumeVariance;
    this.PitchVariance = row.PitchVariance;
    this.Value = row.Value.replace(/\0[\s\S]*$/g,'');
  }

  static FromDBObj (row: any) {
    return new TLKString(row.flags, row.SoundResRef, row.VolumeVariance, row.PitchVariance, 0, row.Value.length, 0, row.Value);
  }

}
