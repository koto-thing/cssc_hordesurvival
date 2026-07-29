const DEFAULT_VERTEX_SHADER = `
void main(void) {
  gl_Position = vec4(vertexPosition.x, vertexPosition.y, 0.0, 1.0);
  vRenderCoord = uvPosition;
  vTextureCoord = vec2(uvPosition.x, abs(uUpright - uvPosition.y));
}
`;

const DEFAULT_FRAGMENT_SHADER = `
uniform float time;

void main(void) {
  gl_FragColor = texture2D(uSampler, vTextureCoord);
}
`;

/**
 * StageGLのフィルターとして動作するカスタム VFXShader
 *
 * Shader本体にはCreateJSによって次の値があらかじめ宣言される
 * - vertexPosition / uvPosition / uUpright（vertex）
 * - vRenderCoord / vTextureCoord / uSampler（fragment）
 */
export class VFXShader extends createjs.Filter {
  /**
   * @param {{
   *   vertex?: string,
   *   fragment?: string,
   *   uniforms?: Record<string, number|boolean|number[]|Float32Array|function>
   * }} options
   */
  constructor({
    vertex = DEFAULT_VERTEX_SHADER,
    fragment = DEFAULT_FRAGMENT_SHADER,
    uniforms = {},
  } = {}) {
    super();

    this.VTX_SHADER_BODY = vertex;
    this.FRAG_SHADER_BODY = fragment;
    this.uniforms = { ...uniforms };
    this.time = 0;
    this._uniformLocations = new WeakMap();
  }

  /**
   * uniformを設定する
   * 関数を指定した場合、描画時に `({ time, stage, shader })` を引数として評価される
   * @param {string} name
   * @param {number|boolean|number[]|Float32Array|function} value
   * @returns {VFXShader}
   */
  setUniform(name, value) {
    this.uniforms[name] = value;
    return this;
  }

  /**
   * Shaderの経過時間を進める
   * @param {number} deltaTime
   */
  tick(deltaTime) {
    this.time += Math.max(0, Number(deltaTime) || 0);
  }

  /**
   * CreateJS StageGLから呼ばれるuniform設定処理
   * @param {WebGLRenderingContext} gl
   * @param {createjs.StageGL} stage
   * @param {WebGLProgram} shaderProgram
   */
  shaderParamSetup(gl, stage, shaderProgram) {
    let locations = this._uniformLocations.get(shaderProgram);
    if (!locations) {
      locations = new Map();
      this._uniformLocations.set(shaderProgram, locations);
    }

    this._setUniform(gl, shaderProgram, locations, "time", this.time);

    for (const [name, source] of Object.entries(this.uniforms)) {
      const value =
        typeof source === "function" ? source({ time: this.time, stage, shader: this }) : source;
      this._setUniform(gl, shaderProgram, locations, name, value);
    }
  }

  /**
   * @private
   */
  _setUniform(gl, program, locations, name, value) {
    let location = locations.get(name);
    if (location === undefined) {
      location = gl.getUniformLocation(program, name);
      locations.set(name, location);
    }

    // 最適化で削除されたuniformはnull
    if (location === null || value === undefined || value === null) {
      return;
    }

    if (typeof value === "boolean") {
      gl.uniform1i(location, value ? 1 : 0);
      return;
    }

    if (typeof value === "number") {
      gl.uniform1f(location, value);
      return;
    }

    const values = value instanceof Float32Array ? value : Float32Array.from(value);
    switch (values.length) {
      case 1:
        gl.uniform1fv(location, values);
        break;
      case 2:
        gl.uniform2fv(location, values);
        break;
      case 3:
        gl.uniform3fv(location, values);
        break;
      case 4:
        gl.uniform4fv(location, values);
        break;
      case 9:
        gl.uniformMatrix3fv(location, false, values);
        break;
      case 16:
        gl.uniformMatrix4fv(location, false, values);
        break;
      default:
        gl.uniform1fv(location, values);
        break;
    }
  }

  clone() {
    return new VFXShader({
      vertex: this.VTX_SHADER_BODY,
      fragment: this.FRAG_SHADER_BODY,
      uniforms: this.uniforms,
    });
  }

  toString() {
    return "[VFXShader]";
  }
}

export { DEFAULT_FRAGMENT_SHADER, DEFAULT_VERTEX_SHADER };
