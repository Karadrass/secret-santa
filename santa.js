// Outils communs du Secret Santa (aucun serveur nécessaire)

const SANTA_KEY = "PereNoel-Secret-2026";

// Cache le résultat dans le lien : on ne peut pas lire le nom en regardant l'adresse.
function encodeToken(obj) {
  const data = new TextEncoder().encode(JSON.stringify(obj));
  const key = new TextEncoder().encode(SANTA_KEY);
  let bin = "";
  data.forEach((b, i) => { bin += String.fromCharCode(b ^ key[i % key.length]); });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeToken(token) {
  try {
    let s = token.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    const bin = atob(s);
    const key = new TextEncoder().encode(SANTA_KEY);
    const bytes = Uint8Array.from(bin, (c, i) => c.charCodeAt(0) ^ key[i % key.length]);
    const obj = JSON.parse(new TextDecoder().decode(bytes));
    return obj && obj.d && obj.r ? obj : null;
  } catch (e) {
    return null;
  }
}

// Tirage en "grande boucle" : A → B → C → … → A.
// Personne ne se tire soi-même, et pas d'échange A↔B (dès 3 participants).
function drawCycle(names) {
  const a = [...names];
  for (let i = a.length - 1; i > 0; i--) {
    const r = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
    const j = Math.floor(r * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.map((giver, i) => ({ giver, receiver: a[(i + 1) % a.length] }));
}

// Décor : ciel étoilé, neige et collines enneigées
function addDecor() {
  const sky = document.createElement("div");
  sky.className = "sky";
  sky.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 70; i++) {
    const s = document.createElement("span");
    s.className = "star";
    const size = Math.random() < 0.85 ? 1 + Math.random() : 2.5;
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 75}%;width:${size}px;height:${size}px;animation-delay:${-Math.random() * 3}s;animation-duration:${2 + Math.random() * 3}s`;
    sky.appendChild(s);
  }
  for (let i = 0; i < 28; i++) {
    const f = document.createElement("span");
    f.className = "flake";
    f.textContent = Math.random() < 0.5 ? "❄" : "•";
    f.style.cssText = `left:${Math.random() * 100}%;font-size:${8 + Math.random() * 12}px;--drift:${-30 + Math.random() * 60}px;animation-duration:${9 + Math.random() * 10}s;animation-delay:${-Math.random() * 18}s`;
    sky.appendChild(f);
  }
  sky.insertAdjacentHTML("beforeend", `
    <svg class="moon" viewBox="0 0 92 92">
      <defs><radialGradient id="moonHalo"><stop offset=".45" stop-color="#f6dc9a" stop-opacity=".14"/><stop offset="1" stop-color="#f6dc9a" stop-opacity="0"/></radialGradient></defs>
      <circle cx="46" cy="46" r="46" fill="url(#moonHalo)"/>
      <circle cx="46" cy="46" r="22" fill="#f7efdf" opacity=".92"/>
      <circle cx="55" cy="40" r="20" fill="#0a1530"/>
    </svg>
    <svg class="hills" viewBox="0 0 1440 170" preserveAspectRatio="xMidYMax slice">
      <path d="M0 95 C 240 40 420 120 720 80 S 1200 30 1440 85 V170 H0Z" fill="#1a2b55" opacity=".7"/>
      <g fill="#14234a">
        <path d="M150 92 l22 -56 l22 56z M180 96 l16 -40 l16 40z"/>
        <path d="M1180 70 l26 -64 l26 64z M1220 76 l18 -44 l18 44z"/>
        <path d="M640 86 l14 -36 l14 36z"/>
      </g>
      <path d="M0 130 C 300 90 520 150 820 118 S 1260 95 1440 125 V170 H0Z" fill="#d9e3f5" opacity=".14"/>
      <path d="M0 150 C 380 125 700 165 1000 145 S 1320 135 1440 148 V170 H0Z" fill="#e8eefb" opacity=".1"/>
    </svg>`);
  document.body.prepend(sky);
}

// "Béa et Fab" → on dit "vous", "Estelle" → on dit "tu"
function isPlural(name) {
  return /\s(et|&)\s/i.test(name);
}
