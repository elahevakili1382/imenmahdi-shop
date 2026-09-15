precision mediump float;

varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;
uniform float uIntensity;
uniform float uReduce;

void main() {
  vec2 uv = vUv;
  float t = mix(0.0, uTime, 1.0 - uReduce);
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 center = vec2(0.76, 0.4) + vec2(sin(t * 0.16) * 0.045, cos(t * 0.12) * 0.03);
  vec2 delta = (uv - center) * vec2(aspect, 1.0);
  float spot = exp(-dot(delta, delta) * 3.6);
  float grain = fract(sin(dot(uv * uResolution + t * 18.0, vec2(12.9898, 78.233))) * 43758.5453);
  vec3 ember = vec3(0.769, 0.361, 0.149);
  vec3 copper = vec3(0.769, 0.643, 0.518);
  vec3 color = ember * spot * 0.62 + copper * spot * 0.14;
  float vig = smoothstep(1.12, 0.32, length(uv - 0.5));
  float alpha = (0.16 + spot * 0.26 + grain * 0.045) * uIntensity * vig;
  gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.42));
}
