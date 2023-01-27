/* KotOR JS - A remake of the Odyssey Game Engine that powered KotOR I & II
 */

import * as fs from 'fs';
import isBuffer from 'is-buffer';
import { BinaryReader } from "../BinaryReader";
import { GameFileSystem } from '../utility/GameFileSystem';
import { BinaryWriter } from '../BinaryWriter';

/* @file
 * The TwoDAObject class.
 */

export class TwoDAObject {

  file: Buffer|string|undefined = undefined;
  FileType: string;
  FileVersion: string;
  ColumnCount: number;
  RowCount: number;
  CellCount: number;
  columns: string[];
  rows: any = {};

  constructor(file: Buffer|string|undefined = undefined, onComplete?: Function){
    this.file = file;
    this.columns = ["__rowlabel"];
    this.ColumnCount = 0;
    this.CellCount = 0;
    this.rows = {};
    
    if(!!file){
      if(isBuffer(file)) {
        let br = new BinaryReader(file as Buffer);
        this.read2DA(br);

        if(onComplete != null)
          onComplete();
      }else if(typeof file === "string"){
        this.file = file;
        GameFileSystem.readFile(this.file).then((buffer) => {
          let br = new BinaryReader(buffer);
          this.read2DA(br);

          if(onComplete != null)
            onComplete();
        }).catch((err) => {
          throw err;
        });
      }else{
        //invalid resource
      }
    }else{
      //invalid resource
    }
  }

  read2DA(br: BinaryReader): void {
    this.FileType = br.ReadChars(4);
    this.FileVersion = br.ReadChars(4);

    br.position += 1; //0x0A = Newline (Skip)

    let str = "";
    let ch;
    this.columns = ["__rowlabel"];
    while ((ch = br.ReadChar()).charCodeAt(0) != 0){
      if(ch.charCodeAt(0) != 9){
        str = str + ch;
      }else{
        this.columns.push(str);
        str = '';
      }
    }

    this.ColumnCount = this.columns.length - 1;
    this.RowCount = br.ReadUInt32();

    //Get the row index numbers
    let RowIndexes = [];
    for (let i = 0; i < this.RowCount; i++){
      let rowIndex = "";
      let c;

      while ((c = br.ReadChar()).charCodeAt(0) != 9){
        rowIndex = rowIndex + c;
      }

      RowIndexes[i] = parseInt(rowIndex);
    }

    //Get the Row Data Offsets
    this.CellCount = this.ColumnCount * this.RowCount;
    let offsets = [];
    for (let i = 0; i < this.CellCount; i++){
      offsets[i] = br.ReadUInt16();
    }

    const dataSize = br.ReadUInt16();
    let dataOffset = br.position;

    //Get the Row Data
    for (let i = 0; i < this.RowCount; i++){

      let row: any = {"__index": i, "__rowlabel": RowIndexes[i] };

      for (let j = 0; j < this.ColumnCount; j++){

        let offset = dataOffset + offsets[i * this.ColumnCount + j];

        try{
          br.position = offset;
        }catch(e){
          console.error(e);
          throw e;
        }

        let token = "";
        let c;

        while((c = br.ReadChar()).charCodeAt(0) != 0)
          token = token + c;

        if(token == "")
          token = "****";

        row[this.columns[j+1]] = token;
      }

      this.rows[ i ] = row;

    }

  }

  toExportBuffer(): Buffer {
    try{
      const bw = new BinaryWriter();
      bw.WriteChars('2DA ');
      bw.WriteChars('V2.b');
      bw.WriteByte(0x0A);//NewLine

      for(let i = 1; i < this.columns.length; i++){
        bw.WriteChars(this.columns[i]);
        bw.WriteByte(0x09); //HT Delineate Column Entry 
      }

      bw.WriteByte(0x00); //Null Terminate Columns List

      const indexes = Object.keys(this.rows);
      //Write the row count as a UInt32
      bw.WriteUInt32(indexes.length);

      for(let i = 0; i < indexes.length; i++){
        bw.WriteChars(indexes[i]);
        bw.WriteByte(0x09); //HT Delineate Row Index Entry 
      }

      const valuesWriter = new BinaryWriter();
      const values = new Map<string, number>(); //value, offset
      // values.set('Some Value', 0);
      for(let i = 0; i < indexes.length; i++){
        const index = indexes[i];
        const row = this.rows[index];
        const rowKeys = Object.keys(row);
        for(let j = 0; j < rowKeys.length; j++){
          const key = rowKeys[j];
          if(key != '__rowlabel' && key != '__index'){
            const value: string = row[key] == '****' ? '' : String(row[key]);
            if(values.has(value)){
              bw.WriteUInt16(values.get(value));
            }else{
              const offset = valuesWriter.position;
              bw.WriteUInt16(offset);
              valuesWriter.WriteStringNullTerminated(value);
              values.set(value, offset);
            }
          }
        }
      }

      bw.WriteUInt16(valuesWriter.buffer.length);
      bw.WriteBytes(valuesWriter.buffer);

      return bw.buffer;
    }catch(e){
      console.error(e);
      return Buffer.alloc(0);
    }
  }

  getRowByIndex(index = -1){
    for (let key of Object.keys(this.rows)) {
      if(this.rows[key]['__index'] == index){
        return this.rows[key];
      }
    }
  }

  getByID(index = -1){
    for (let key of Object.keys(this.rows)) {
      if(this.rows[key]['__rowlabel'] == index){
        return this.rows[key];
      }
    }
  }

  getRowByColumnAndValue(column: string = '', value: any = undefined){
    for (let key of Object.keys(this.rows)) {
      if(this.rows[key][column] == value){
        return this.rows[key];
      }
    }
  }

  static cellParser(cell: any){
    if(cell === '****'){
      return null;
    }else{
      return cell;
    }
  }

}
