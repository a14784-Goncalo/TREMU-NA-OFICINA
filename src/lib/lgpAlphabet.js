const LM = {
  WRIST: 0,
  THUMB_CMC: 1, THUMB_MCP: 2, THUMB_IP: 3, THUMB_TIP: 4,
  INDEX_MCP: 5, INDEX_PIP: 6, INDEX_DIP: 7, INDEX_TIP: 8,
  MIDDLE_MCP: 9, MIDDLE_PIP: 10, MIDDLE_DIP: 11, MIDDLE_TIP: 12,
  RING_MCP: 13, RING_PIP: 14, RING_DIP: 15, RING_TIP: 16,
  PINKY_MCP: 17, PINKY_PIP: 18, PINKY_DIP: 19, PINKY_TIP: 20,
};

export const SUPPORTED_LETTERS = ['A','B','C','D','E','F','G','H','I','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y'];

function sub(a, b) { return [a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0)]; }
function len(v) { return Math.hypot(v[0], v[1], v[2]); }
function dot(a, b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
function dist(a, b) { return len(sub(a, b)); }
function angleAt(a, b, c) {
  const v1 = sub(a, b), v2 = sub(c, b);
  const m = len(v1) * len(v2) + 1e-9;
  const cos = Math.max(-1, Math.min(1, dot(v1, v2) / m));
  return (Math.acos(cos) * 180) / Math.PI;
}

function fingerAngles(lm) {
  return {
    thumb: angleAt(lm[LM.THUMB_MCP], lm[LM.THUMB_IP], lm[LM.THUMB_TIP]),
    index: angleAt(lm[LM.INDEX_MCP], lm[LM.INDEX_PIP], lm[LM.INDEX_TIP]),
    middle: angleAt(lm[LM.MIDDLE_MCP], lm[LM.MIDDLE_PIP], lm[LM.MIDDLE_TIP]),
    ring: angleAt(lm[LM.RING_MCP], lm[LM.RING_PIP], lm[LM.RING_TIP]),
    pinky: angleAt(lm[LM.PINKY_MCP], lm[LM.PINKY_PIP], lm[LM.PINKY_TIP]),
  };
}

function extended(angles) {
  return {
    thumb: angles.thumb > 150,
    index: angles.index > 160,
    middle: angles.middle > 160,
    ring: angles.ring > 160,
    pinky: angles.pinky > 160,
  };
}

function palmSize(lm) {
  return dist(lm[LM.WRIST], lm[LM.MIDDLE_MCP]) || 1e-6;
}

function averageTipMcpRatio(lm) {
  const p = palmSize(lm);
  const tips = [
    [LM.INDEX_TIP, LM.INDEX_MCP],
    [LM.MIDDLE_TIP, LM.MIDDLE_MCP],
    [LM.RING_TIP, LM.RING_MCP],
    [LM.PINKY_TIP, LM.PINKY_MCP],
  ];
  let s = 0;
  for (const [tip, mcp] of tips) s += dist(lm[tip], lm[mcp]) / p;
  return s / tips.length;
}

function near(value, target, tolerance) {
  return Math.max(0, 1 - Math.abs(value - target) / tolerance);
}
function above(value, threshold, slack) {
  if (value >= threshold) return 1;
  return Math.max(0, 1 - (threshold - value) / slack);
}
function below(value, threshold, slack) {
  if (value <= threshold) return 1;
  return Math.max(0, 1 - (value - threshold) / slack);
}

function scoreLetter(letter, lm, ext, angles, ratio) {
  const p = palmSize(lm);
  const thumbIndexD = dist(lm[LM.THUMB_TIP], lm[LM.INDEX_TIP]) / p;
  const thumbMiddleD = dist(lm[LM.THUMB_TIP], lm[LM.MIDDLE_MCP]) / p;
  const indexMiddleD = dist(lm[LM.INDEX_TIP], lm[LM.MIDDLE_TIP]) / p;
  const thumbOutFromPalm = dist(lm[LM.THUMB_TIP], lm[LM.INDEX_MCP]) / p;
  const thumbVec = sub(lm[LM.THUMB_TIP], lm[LM.THUMB_MCP]);
  const indexVec = sub(lm[LM.INDEX_TIP], lm[LM.INDEX_MCP]);
  const cosTI = dot(thumbVec, indexVec) / (len(thumbVec) * len(indexVec) + 1e-9);
  const thumbIndexAngle = (Math.acos(Math.max(-1, Math.min(1, cosTI))) * 180) / Math.PI;

  switch (letter) {
    case 'B':
      return [
        ext.index && ext.middle && ext.ring && ext.pinky ? 1 : 0,
        below(angles.thumb, 150, 30),
      ];
    case 'D':
      return [
        ext.index && !ext.middle && !ext.ring && !ext.pinky ? 1 : 0,
        below(thumbOutFromPalm, 0.7, 0.3),
      ];
    case 'F':
      return [
        ext.middle && ext.ring && ext.pinky ? 1 : 0,
        below(thumbIndexD, 0.35, 0.3),
      ];
    case 'I':
      return [
        ext.pinky ? 1 : 0,
        !ext.index && !ext.middle && !ext.ring ? 1 : 0,
      ];
    case 'L':
      return [
        ext.index && !ext.middle && !ext.ring && !ext.pinky ? 1 : 0,
        above(thumbOutFromPalm, 0.75, 0.35),
        near(thumbIndexAngle, 90, 45),
      ];
    case 'U':
      return [
        ext.index && ext.middle && !ext.ring && !ext.pinky ? 1 : 0,
        below(indexMiddleD, 0.4, 0.3),
      ];
    case 'V':
      return [
        ext.index && ext.middle && !ext.ring && !ext.pinky ? 1 : 0,
        above(indexMiddleD, 0.55, 0.3),
      ];
    case 'W':
      return [
        ext.index && ext.middle && ext.ring && !ext.pinky ? 1 : 0,
        1,
      ];
    case 'Y':
      return [
        ext.thumb && ext.pinky ? 1 : 0,
        !ext.index && !ext.middle && !ext.ring ? 1 : 0,
      ];
    case 'O':
      return [
        !ext.index && !ext.middle && !ext.ring && !ext.pinky ? 1 : 0,
        near(ratio, 0.65, 0.35),
        below(thumbIndexD, 0.5, 0.3),
      ];
    case 'C':
      return [
        !ext.index && !ext.middle && !ext.ring && !ext.pinky ? 1 : 0,
        above(ratio, 0.85, 0.25),
        above(thumbIndexD, 0.45, 0.3),
      ];
    case 'A':
      return [
        !ext.index && !ext.middle && !ext.ring && !ext.pinky ? 1 : 0,
        below(ratio, 0.55, 0.2),
        above(thumbMiddleD, 0.6, 0.3),
      ];
    // E: indicador, médio e anelar dobrados com pontas a tocar no polegar; mindinho dobrado
    case 'E':
      return [
        !ext.index && !ext.middle && !ext.ring && !ext.pinky ? 1 : 0,
        below(angles.thumb, 130, 30),
        below(ratio, 0.45, 0.2),
      ];
    // G: indicador aponta horizontalmente, polegar paralelo; restantes fechados
    case 'G':
      return [
        ext.index && !ext.middle && !ext.ring && !ext.pinky ? 1 : 0,
        below(thumbOutFromPalm, 0.7, 0.3),
        // polegar e indicador em direções opostas (ângulo ~180°)
        above(thumbIndexAngle, 120, 40),
      ];
    // H: indicador e médio juntos a apontar horizontalmente
    case 'H':
      return [
        ext.index && ext.middle && !ext.ring && !ext.pinky ? 1 : 0,
        below(indexMiddleD, 0.35, 0.25),
        below(angles.thumb, 140, 30),
      ];
    // K: indicador para cima, médio a meio (dobrado na ponta), polegar entre eles
    case 'K':
      return [
        ext.index && !ext.ring && !ext.pinky ? 1 : 0,
        above(angles.middle, 100, 40) && angles.middle < 160 ? 1 : 0,
        above(thumbOutFromPalm, 0.6, 0.3),
      ];
    // M: três dedos (indicador, médio, anelar) dobrados sobre o polegar; mindinho fechado
    case 'M':
      return [
        !ext.index && !ext.middle && !ext.ring && !ext.pinky ? 1 : 0,
        below(ratio, 0.5, 0.2),
        below(angles.thumb, 120, 30),
        below(dist(lm[LM.INDEX_TIP], lm[LM.THUMB_TIP]) / p, 0.32, 0.18),
      ];
    // N: indicador e médio dobrados sobre o polegar; anelar e mindinho fechados
    case 'N':
      return [
        !ext.index && !ext.middle && !ext.ring && !ext.pinky ? 1 : 0,
        below(ratio, 0.5, 0.2),
        below(angles.thumb, 130, 30),
        above(dist(lm[LM.INDEX_TIP], lm[LM.THUMB_TIP]) / p, 0.38, 0.18),
      ];
    // P: indicador aponta para baixo, polegar para fora; médio para baixo; anelar e mindinho fechados
    case 'P':
      return [
        ext.index && !ext.ring && !ext.pinky ? 1 : 0,
        lm[LM.INDEX_TIP].y > lm[LM.INDEX_MCP].y ? 1 : 0.2, // indicador a apontar para baixo
        above(thumbOutFromPalm, 0.55, 0.3),
      ];
    // Q: polegar e indicador a apontar para baixo, paralelos (como G mas virados)
    case 'Q':
      return [
        ext.index && !ext.middle && !ext.ring && !ext.pinky ? 1 : 0,
        lm[LM.INDEX_TIP].y > lm[LM.INDEX_MCP].y ? 1 : 0.2, // aponta para baixo
        below(thumbIndexD, 0.5, 0.3),
        below(thumbIndexAngle, 60, 40),
      ];
    // R: indicador e médio cruzados, esticados para cima
    case 'R':
      return [
        ext.index && ext.middle && !ext.ring && !ext.pinky ? 1 : 0,
        above(indexMiddleD, 0.3, 0.2),
        below(indexMiddleD, 0.6, 0.25),
        lm[LM.INDEX_TIP].x > lm[LM.MIDDLE_TIP].x ? 0.5 : 1, // cruzados
      ];
    // S: punho fechado, polegar sobre os dedos dobrados
    case 'S':
      return [
        !ext.index && !ext.middle && !ext.ring && !ext.pinky ? 1 : 0,
        below(ratio, 0.5, 0.2),
        above(thumbMiddleD, 0.35, 0.2),
        below(thumbMiddleD, 0.7, 0.2),
      ];
    // T: polegar entre indicador e médio dobrados; punho fechado
    case 'T':
      return [
        !ext.index && !ext.middle && !ext.ring && !ext.pinky ? 1 : 0,
        below(ratio, 0.55, 0.2),
        below(thumbIndexD, 0.45, 0.25),
        above(angles.thumb, 110, 30),
      ];
    // X: indicador dobrado em gancho; restantes fechados
    case 'X':
      return [
        !ext.middle && !ext.ring && !ext.pinky ? 1 : 0,
        above(angles.index, 80, 30),
        below(angles.index, 150, 30),
        above(dist(lm[LM.INDEX_TIP], lm[LM.INDEX_MCP]) / p, 0.3, 0.2),
      ];
    default:
      return [0];
  }
}

export function classify(lm) {
  if (!lm || lm.length < 21) return { letter: null, confidence: 0, ext: null };
  const angles = fingerAngles(lm);
  const ext = extended(angles);
  const ratio = averageTipMcpRatio(lm);

  let best = { letter: null, confidence: 0 };
  for (const letter of SUPPORTED_LETTERS) {
    const parts = scoreLetter(letter, lm, ext, angles, ratio);
    const score = parts.reduce((a, b) => a + b, 0) / parts.length;
    if (score > best.confidence) best = { letter, confidence: score };
  }
  return { ...best, ext, ratio };
}

export function createStabilityFilter({ holdFrames = 12, minConf = 0.75 } = {}) {
  let last = null;
  let count = 0;
  let locked = null;

  return {
    push({ letter, confidence }) {
      if (!letter || confidence < minConf) {
        last = null;
        count = 0;
        // Liberta o "lock" quando a mão deixa de mostrar o gesto com confiança.
        // Isto permite repetir a mesma letra na tentativa seguinte (ex: duas
        // letras iguais seguidas) só depois de a mão sair de facto da posição,
        // em vez de depender de um reset externo disparado a meio do gesto.
        locked = null;
        return { committed: null, candidate: letter, progress: 0 };
      }
      if (letter === last) count++;
      else { last = letter; count = 1; }
      const progress = Math.min(1, count / holdFrames);
      if (count >= holdFrames && letter !== locked) {
        locked = letter;
        return { committed: letter, candidate: letter, progress: 1 };
      }
      return { committed: null, candidate: letter, progress };
    },
    reset() { last = null; count = 0; locked = null; },
    clearLock() { locked = null; },
  };
}