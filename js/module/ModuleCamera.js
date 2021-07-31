/* KotOR JS - A remake of the Odyssey Game Engine that powered KotOR I & II
 */

/* @file
 * The ModuleCamera class.
 */

class ModuleCamera extends ModuleObject {

  constructor ( gff = new GFFObject() ) {
    super();
    this.id = -1;
    this.template = gff;
  }

  Load( onLoad = null ){

    this.InitProperties( () => {

      //console.log('ModuleCamera', 'Loaded')
      if(onLoad != null)
        onLoad(this);

    });
    
  }

  InitProperties( onLoad = undefined ){

    if(this.template.RootNode.HasField('CameraID'))
      this.cameraID = this.template.GetFieldByLabel('CameraID').GetValue();

    if(this.template.RootNode.HasField('FieldOfView'))
      this.fov = this.template.GetFieldByLabel('FieldOfView').GetValue();

    if(this.template.RootNode.HasField('Height'))
      this.height = this.template.GetFieldByLabel('Height').GetValue();

    if(this.template.RootNode.HasField('MicRange'))
      this.micRange = this.template.GetFieldByLabel('MicRange').GetValue();

    if(this.template.RootNode.HasField('Orientation'))
      this.orientation = this.template.GetFieldByLabel('Orientation').GetOrientation();

    if(this.template.RootNode.HasField('Pitch'))
      this.pitch = this.template.GetFieldByLabel('Pitch').GetValue();

    if(this.template.RootNode.HasField('Position'))
      this.position.copy(this.template.GetFieldByLabel('Position').GetVector());

    this.initialized = true;

    if(typeof onLoad == 'function')
      onLoad();

  }

  save(){
    let gff = new GFFObject();
    gff.RootNode.Type = 14;

    gff.RootNode.AddField( new Field(GFFDataTypes.INT, 'CameraID') ).SetValue(this.cameraID);
    gff.RootNode.AddField( new Field(GFFDataTypes.DWORD, 'FieldOfView') ).SetValue(this.fov);
    gff.RootNode.AddField( new Field(GFFDataTypes.BYTE, 'Height') ).SetValue(this.height);
    gff.RootNode.AddField( new Field(GFFDataTypes.FLOAT, 'MicRange') ).SetValue(this.micRange);
    gff.RootNode.AddField( new Field(GFFDataTypes.ORIENTATION, 'Orientation') ).SetValue( this.template.GetFieldByLabel('Orientation').GetOrientation() );
    gff.RootNode.AddField( new Field(GFFDataTypes.BYTE, 'Pitch') ).SetValue(this.pitch);
    gff.RootNode.AddField( new Field(GFFDataTypes.VECTOR, 'Position') ).SetValue( this.template.GetFieldByLabel('Position').GetVector() );

    this.template = gff;
    return gff;
  }

  toToolsetInstance(){

    let instance = new Struct(4);
    
    instance.AddField(
      new Field(GFFDataTypes.INT, 'CameraID', this.cameraID)
    );
    
    instance.AddField(
      new Field(GFFDataTypes.FLOAT, 'FieldOfView', this.fov)
    );

    instance.AddField(
      new Field(GFFDataTypes.FLOAT, 'Height', this.height)
    );
    
    instance.AddField(
      new Field(GFFDataTypes.FLOAT, 'MicRange', this.micRange)
    );
    
    instance.AddField(
      new Field(GFFDataTypes.ORIENTATION, 'Orientation', this.orientation)
    )
    
    instance.AddField(
      new Field(GFFDataTypes.FLOAT, 'Pitch', this.position.z)
    );
    
    instance.AddField(
      new Field(GFFDataTypes.VECTOR, 'Position', this.position)
    );

    return instance;

  }

}

module.exports = ModuleCamera;