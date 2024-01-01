export interface AmbientSource {
  /**
   * ambient light color (BGR format)
   */
  ambientColor: number;

  /**
   * diffuse light color (BGR format)
   */
  diffuseColor: number;

  /**
   * fog amount (0-15)
   */
  fogAmount: number;

  /**
   * fog color (BGR format)
   */
  fogColor: number;

  /**
   * fogNear
   */
  fogNear: number;

  /**
   * fogFar
   */
  fogFar: number;

  /**
   * fogOn
   */
  fogOn: boolean;

  /**
   * 1 if shadows appear at night, 0 otherwise
   */
  shadows: boolean;
}