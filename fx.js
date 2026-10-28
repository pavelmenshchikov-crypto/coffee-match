/* =====================================================================
   THE MINERS — Festival Coffee Match · фон на WebGL

   Три состояния в одном шейдере, переключаются uniform-ом boom (0…1):
     0       — тёмный экран и сфера: градиент #070200 → #e34900 → #ffb200,
               прогрессивный блюр (основание чёткое, верх размыт на 100 px),
               верх сферы медленно колышется, как пламя
     0…0.45  — взрыв: сфера раздувается в три пятна из Figma (Group 1195)
     0.45…1  — пятна растворяются в живом градиенте: картинка из Photoshop
               (assets/bg/gradient.png), которую медленно «плавит» шум

   Все координаты — в пикселях макета 1024 × 1366, привязка к низу экрана.
   ===================================================================== */

(function () {
  'use strict';

  const VERT = 'attribute vec2 a_pos; void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }';

  const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_scale;
uniform vec2 u_off;
uniform float u_time;
uniform float u_boom;
uniform sampler2D u_tex;

const vec3 BG = vec3(34.0, 7.0, 0.0) / 255.0;
const vec3 C0 = vec3(7.0, 2.0, 0.0) / 255.0;
const vec3 C1 = vec3(227.0, 73.0, 0.0) / 255.0;
const vec3 C2 = vec3(255.0, 178.0, 0.0) / 255.0;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(dot(hash2(i), f), dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
             mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v;
}
float grain(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

// Покрытие размытой фигуры: d — расстояние до края (px, внутри < 0), w — радиус блюра
float cover(float d, float w) { return 1.0 - smoothstep(-w, w, d); }

vec3 sphereGrad(float t) {
  t = clamp(t, 0.0, 1.0);
  return t < 0.5 ? mix(C0, C1, t * 2.0) : mix(C1, C2, (t - 0.5) * 2.0);
}

// Сфера: центр (512, 873), диаметр 940. grow > 1 — сфера раздувается при взрыве
vec3 sphere(vec2 p, float t, float grow) {
  vec2 c = vec2(512.0, 873.0);
  float R = 470.0;
  float ty0 = (p.y - (c.y - R)) / (2.0 * R);
  float flame = 1.0 - smoothstep(0.32, 0.92, ty0);          // 1 вверху, 0 у основания
  vec2 q = p / 330.0;
  float n1 = fbm(q + vec2(0.0, t * 0.14));
  float n2 = fbm(q * 1.25 + vec2(4.7, t * 0.18));
  vec2 warp = vec2(n1, n2) * 55.0 * flame;
  warp.y -= 10.0 * flame * (0.5 + 0.5 * sin(t * 0.5));
  vec2 pw = c + (p + warp - c) / grow;
  float Rb = R + 5.0 * sin(t * 0.5);
  float d = length(pw - c) - Rb;
  float ty = (pw.y - (c.y - Rb)) / (2.0 * Rb);
  float blur = 100.0 * clamp((1.0 - ty) / (1.0 - 0.406), 0.0, 1.0) + 160.0 * (grow - 1.0);
  float a = cover(d * grow, max(blur, 1.0));
  vec3 col = sphereGrad(ty + 0.03 * n1 * flame);
  return mix(BG, col, a);
}

// Взрыв: три пятна из Figma, масштаб k вокруг центра
vec3 boom(vec2 p, float k) {
  vec3 col = BG;
  vec2 o = vec2(512.0, 900.0);
  vec2 s = o + (p - o) / k;
  float d1 = length(s - vec2(512.0, 732.0)) - 611.0;
  col = mix(col, C1, cover(d1, 240.0));
  vec2 e3 = (s - vec2(512.5, 941.0)) / vec2(523.5, 264.0);
  col = mix(col, C2, cover((length(e3) - 1.0) * 264.0, 140.0));
  vec2 e2 = (s - vec2(512.5, 1081.5)) / vec2(446.5, 261.5);
  float ty2 = clamp((s.y - 820.0) / 523.0, 0.0, 1.0);
  col = mix(col, C2, cover((length(e2) - 1.0) * 261.5, max(100.0 * (1.0 - ty2), 1.0)));
  return col;
}

// Живой градиент: картинка из Photoshop + медленная деформация шумом
vec3 living(vec2 p, float t) {
  vec2 uv = p / vec2(1024.0, 1366.0);
  vec2 w = vec2(fbm(uv * 2.0 + vec2(t * 0.035, 0.0)), fbm(uv * 2.0 + vec2(7.3, -t * 0.03)));
  vec2 w2 = vec2(fbm(uv * 3.1 - vec2(0.0, t * 0.025) + 3.1), fbm(uv * 3.1 + vec2(t * 0.02, 9.2)));
  uv += w * 0.10 + w2 * 0.04;
  uv = clamp(uv, 0.002, 0.998);
  return texture2D(u_tex, uv).rgb;
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);
  vec2 p = (frag - u_off) / u_scale;
  float t = u_time;
  float e = u_boom;
  vec3 col;
  if (e <= 0.001) {
    col = sphere(p, t, 1.0);
  } else if (e >= 0.999) {
    col = living(p, t);
  } else {
    float grow = 1.0 + 0.9 * smoothstep(0.0, 0.45, e);
    float a = smoothstep(0.05, 0.42, e);
    float b = smoothstep(0.38, 0.95, e);
    float k = 1.0 + 1.7 * smoothstep(0.2, 1.0, e);
    vec3 c = mix(sphere(p, t, grow), boom(p, k), a);
    col = mix(c, living(p, t), b);
  }
  col += (grain(frag + fract(t) * 91.7) - 0.5) / 255.0;   // против полос на градиентах
  gl_FragColor = vec4(col, 1.0);
}`;

  const FX = {
    ok: false,
    boom: 0,
    _anim: null,

    async init(canvas, textureUrl) {
      const debug = /[?&]debug/.test(location.search);
      const gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: debug });
      if (!gl) return false;
      const prog = link(gl, VERT, FRAG);
      if (!prog) return false;
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'a_pos');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const img = await loadImage(textureUrl);
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);

      const u = {};
      for (const n of ['u_res', 'u_scale', 'u_off', 'u_time', 'u_boom', 'u_tex']) u[n] = gl.getUniformLocation(prog, n);
      gl.uniform1i(u.u_tex, 0);

      this.gl = gl; this.u = u; this.canvas = canvas; this.ok = true;
      canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.ok = false; document.body.classList.add('no-gl'); });

      const resize = () => {
        // Буфер в CSS-пикселях: градиенты мягкие, двойное разрешение ретины им не нужно
        const w = Math.round(canvas.clientWidth), h = Math.round(canvas.clientHeight);
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
        const s = Math.min(w / 1024, h / 1366);
        gl.uniform2f(u.u_res, w, h);
        gl.uniform1f(u.u_scale, s);
        gl.uniform2f(u.u_off, (w - 1024 * s) / 2, h - 1366 * s);
      };
      resize();
      window.addEventListener('resize', resize);

      const t0 = performance.now();
      const frame = (now) => {
        if (!this.ok) return;
        if (this._anim) this._step(now);
        gl.uniform1f(u.u_time, (now - t0) / 1000);
        gl.uniform1f(u.u_boom, this.boom);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
      return true;
    },

    // Плавно ведём boom к значению to за ms миллисекунд
    animateBoom(to, ms) {
      if (!this.ok) { this.boom = to; return Promise.resolve(); }
      return new Promise((resolve) => {
        this._anim = { from: this.boom, to, ms, start: performance.now(), resolve };
      });
    },
    _step(now) {
      const a = this._anim;
      const k = Math.min(1, (now - a.start) / a.ms);
      const eased = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      this.boom = a.from + (a.to - a.from) * eased;
      if (k >= 1) { this._anim = null; a.resolve(); }
    }
  };

  function link(gl, vs, fs) {
    const make = (type, src) => {
      const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(sh)); return null; }
      return sh;
    };
    const v = make(gl.VERTEX_SHADER, vs), f = make(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    const p = gl.createProgram(); gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(p)); return null; }
    return p;
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = src; });
  }

  window.TM_FX = FX;
})();
