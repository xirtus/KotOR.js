/* KotOR JS - A remake of the Odyssey Game Engine that powered KotOR I & II
 */

import { BinaryReader } from "../BinaryReader";
import { BinaryWriter } from "../BinaryWriter";
import { AudioFileAudioType } from "../enums/audio/AudioFileAudioType";
import { AudioFileWaveEncoding } from "../enums/audio/AudioFileWaveEncoding";
import { GameFileSystem } from "../utility/GameFileSystem";
import { Utility } from "../utility/Utility";
import { ADPCMDecoder } from "./ADPCMDecoder";

/* @file
 * The AudioFile class is a general purpose class used for retrieving and passing on useful audio bytes 
 * as some file have extra garbage in the headers.
 */

export class AudioFile {
  audioType: AudioFileAudioType;
  data: Buffer;
  isProcessed: boolean;
  filename: any;
  header: any = { riff: {}, riffSize: {}, wave: {}, };
  reader: BinaryReader;

  constructor(data: Buffer, onComplete?: Function){
    this.audioType = AudioFileAudioType.Unknown;
    this.data = data;
    this.isProcessed = false;

    //Open Binary Stream
    //this.GetBinaryStream( (reader: BinaryReader) => {

      if(typeof onComplete == 'function')
        onComplete(this);

    //});

  }

  //Get the binary data and remove any junk bytes that may be padding the file
  GetBinaryStream(onComplete?: Function){
    //String file path
    if(typeof this.data == 'string'){

      let info = Utility.filePathInfo(this.data);

      if(info.location == 'local'){

        this.filename = info.file.name;

        GameFileSystem.readFile(info.path).then( (buffer) => {
          try{
            this.reader = new BinaryReader(buffer);
            this.ProcessFile(onComplete);
            return;
          }
          catch (e) {
            console.error(e);
          }

        }).catch( (err) => {
          throw err;
        })

      }else if(info.location == 'archive'){

        switch(info.archive.type){
          case 'bif':
            // Global.kotorBIF[info.archive.name].getResourceBuffer(Global.kotorBIF[info.archive.name].GetResourceByLabel(info.file.name, ResourceTypes[info.file.ext]), (buffer) => {
            //   this.reader = new BinaryReader(buffer);
            //   this.ProcessFile(onComplete);
            //   return;
            // }, (e: any) => {
            //   throw 'Resource not found in BIF archive '+pathInfo.archive.name;
            // });
          break;
        }

      }

    }

    //BinaryReader
    else if(this.data instanceof BinaryReader){
      this.filename = 'Unknown';
      if(this.isProcessed){
        if(onComplete != null)
          onComplete( this.data );
      }else{
        this.ProcessFile(onComplete);
      }

    } else {
      this.filename = 'Unknown';
      if(this.isProcessed){
        this.reader = new BinaryReader(this.data);
        if(onComplete != null)
          onComplete(this.data);
      }else{
        this.reader = new BinaryReader(this.data);
        this.ProcessFile(onComplete);
      }

    }

  }

  ProcessFile(onComplete?: Function){
    this.isProcessed = true;
    let flag = this.reader.readBytes(4);
    let riffSize = this.reader.readUInt32(); //for an MP3 this will be 50
    this.reader.seek(0);
    let fakeHeaderTest = [0xFF, 0xF3, 0x60, 0xC4];
    let riffHeaderTest = [0x52, 0x49, 0x46, 0x46];

    //MP3 Tests
    let lameHeaderTest = [0x4C, 0x41, 0x4D, 0x45];
    let id3HeaderTest = [0x49, 0x44, 0x33];
    let mp3HeaderTest = [0xFF, 0xFB];

    if(Utility.ArrayMatch(flag, fakeHeaderTest)) {
      this.audioType = AudioFileAudioType.WAVE;

      this.reader = this.reader.slice(470, this.reader.length()); //Remove the fake data
      this.header = this.ReadWavHeader(this.reader);
      //console.log(this.header);
      this.reader.seek(0);
      this.data = this.reader.buffer;
      if(onComplete != null)
        onComplete(this.data);

      return;

    }

    //Test for RIFF header
    if(Utility.ArrayMatch(flag, riffHeaderTest)) {

      this.header = this.ReadWavHeader(this.reader);
      this.reader.seek(0);

      //Test for MP3 offset
      if(riffSize == 50){

        this.audioType = AudioFileAudioType.MP3;

        this.reader = this.reader.slice(58, this.reader.length()); //Remove the fake data
        this.header = this.ReadMP3Header(this.reader);
        this.reader.seek(0);
        this.data = this.reader.buffer; 
        
        if(onComplete != null)
          onComplete(this.reader);
        
        return;
      
      }else{

        //Looks like we have a real wave file
        this.audioType = AudioFileAudioType.WAVE;
        
        if(onComplete != null)
          onComplete(this.reader);
        
        return;
      
      }

    }

    /*if(Utility.ArrayMatch(flag.slice(0, 3), id3HeaderTest) || 
        Utility.ArrayMatch(flag.slice(0, 2), mp3HeaderTest) ||
        Utility.ArrayMatch(flag.slice(0, 4), lameHeaderTest)) {*/

      this.audioType = AudioFileAudioType.MP3;

      this.header = this.ReadMP3Header(this.reader);
      this.reader.seek(0);
      
      if(onComplete != null)
        onComplete(this.reader);

      return;

    /*}

    throw 'Unable to decode AUDIO file';*/
  }

  GetPlayableByteStream(onComplete?: Function){

    this.GetBinaryStream( () => {

      if(!(this.reader instanceof BinaryReader))
        console.error('AudioFile.GetPlayableByteStream', this.data);

      this.reader.seek(0);

      if(this.audioType == AudioFileAudioType.WAVE){
        if(this.header.format == AudioFileWaveEncoding.ADPCM){

          let rawDataOffset = 60;
          //console.log('rawDataOffset', rawDataOffset);
          this.reader.seek(rawDataOffset);
          let dataADPCM = this.reader.readBytes(this.reader.length() - (rawDataOffset));
          let adpcm = new ADPCMDecoder({header: this.header, data: Buffer.from(dataADPCM)});
          //console.log('ADPCMDecoder', adpcm);

          let decompiled = this.BuildWave({
            sampleRate: this.header.sampleRate,
            bytesPerSec: 176400,
            bits: 16,
            channels: this.header.channels
          }, adpcm.pcm);

          if(typeof onComplete == 'function')
            onComplete(new Uint8Array(decompiled).buffer);

        }else if(this.header.format == AudioFileWaveEncoding.PCM){
          let dataBuffer = new Uint8Array(this.reader.buffer).buffer;
          
          if(onComplete != null)
            onComplete(dataBuffer);
        }else{
          throw 'Unsupported WAVE encoding';
        }

      }else if(this.audioType == AudioFileAudioType.MP3){
        let dataBuffer = new Uint8Array(this.reader.buffer).buffer;
        
        if(onComplete != null)
          onComplete(dataBuffer);
      }else{
        console.error('AudioFile.GetPlayableByteStream', this.header);
        throw 'Not a valid audio file'
      }

    });

  }

  ReadMP3Header (reader: BinaryReader){

  }

  ReadWavHeader (reader: BinaryReader){

    let header = {
      riff: reader.readChars(4),
      riffSize: reader.readUInt32(),
      wave: reader.readChars(4)
    };

    if(header.wave != 'WAVE')
      throw 'Not a valid wave header';

    let subChunkParser = (header: any, reader: BinaryReader) => {
      let chunkID = reader.readChars(4);
      switch(chunkID){
        case 'fmt ':
          header.fmt = chunkID;
          header.chunkSize = reader.readUInt32();
          header.format = reader.readUInt16();
          header.channels = reader.readUInt16();
          header.sampleRate = reader.readUInt32();
          header.bytesPerSec = reader.readUInt32();
          header.frameSize = reader.readUInt16();
          header.bits = reader.readUInt16();

          if(header.format == AudioFileWaveEncoding.ADPCM){
            header.blobSize = reader.readUInt16();
            header.blobData = reader.readBytes(header.blobSize);
          }
          return true;
        break;
        case 'fact':
          header.fact = chunkID;
          header.factSize = reader.readUInt32();
          header.factBOH = reader.readUInt32();
          return true;
        break;
        case 'data':
          header.data = chunkID;
          header.dataSize = reader.readUInt32();
          header.dataOffset = reader.tell();
          return false;
        break;
        default:
          throw 'Unkown WAVE chunk';
          return false;
        break;
      }

    };

    while(subChunkParser(header, reader))

    return header;

  }

  BuildWave(header: any, data: Buffer){

    let riffHeaderLen = 8;
    let waveHeaderLen = 56;

    let buffer = Buffer.alloc( data.length + 44 );//data.length + riffHeaderLen + waveHeaderLen );
    let bWriter = new BinaryWriter(buffer);

    let riffSize = data.length + waveHeaderLen;

    //console.log(header)
    //console.log((header.channels == 2 ? 4 : 2))
    //console.log(header.sampleRate * (header.channels == 2 ? 4 : 2));

    //header.sampleRate = header.sampleRate / 2;
    //header.channels = 2;

	  header.bits = 16;

    bWriter.writeChars('RIFF');
    bWriter.writeUInt32(riffSize);
    bWriter.writeChars('WAVE');
    bWriter.writeChars('fmt ');
    bWriter.writeUInt32(16);
    bWriter.writeUInt16(1);
    bWriter.writeUInt16( header.channels );
    bWriter.writeUInt32( header.sampleRate );
    bWriter.writeUInt32(header.sampleRate * 4);
    bWriter.writeUInt16( (header.bits*header.channels) / 8 );
    bWriter.writeUInt16( header.bits );
    //bWriter.WriteUInt16(0);
    bWriter.writeChars('data');
    bWriter.writeUInt32(data.length);

    bWriter.writeBytes(data);

    /*fs.writeFile('test.wav', bWriter.buffer, (err) => {
      if (err) {
       return console.error(err);
      }
      console.log('wave Saved');
    });*/

    return buffer;

  }

  GetExportableData(){

    switch(this.audioType){
      case AudioFileAudioType.WAVE:
        switch(this.header.format){
          case AudioFileWaveEncoding.ADPCM:
            /*let rawDataOffset = 60;
            console.log('rawDataOffset', rawDataOffset);
            this.data.seek(rawDataOffset);
            let dataADPCM = this.data.readBytes(this.data.Length() - (rawDataOffset));
            let adpcm = new ADPCMDecoder({header: this.header, data: Buffer.from(dataADPCM)});
            console.log('ADPCMDecoder', adpcm);

            let decompiled = this.BuildWave({
              sampleRate: this.header.sampleRate,
              bytesPerSec: 176400,
              bits: 16,
              channels: this.header.channels
            }, adpcm.pcm);

            return decompiled;*/
            return this.reader.buffer;
          break;
          case AudioFileWaveEncoding.PCM:
            return this.reader.buffer;
          break;
        }
      break;
      case AudioFileAudioType.MP3:
        return this.reader.buffer;
      break;
    }

    return Buffer.allocUnsafe(0);

  }

  GetExportExtension(){
    switch(this.audioType){
      case AudioFileAudioType.MP3:
        return 'mp3';
      break;
      case AudioFileAudioType.WAVE:
        return 'wav';
      break;
    }
  }

  Export( args: any = {} ){

    args = Object.assign({
      file: null,
      onComplete: null,
      onError: null
    }, args);

    if(args.file!=null){

      // fs.writeFile(args.file, this.GetExportableData(), (err) => {
      //   if (err) {
      //     if(typeof args.onError == 'function')
      //       args.onError(err);
      //   }else{
      //     if(typeof args.onComplete == 'function')
      //       args.onComplete();
      //   }
      //   console.log('AudioFile Saved');
      // });

    }

  }

}
