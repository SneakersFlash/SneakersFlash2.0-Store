/**
 * Bunyi game Kemerdekaan - disintesis WebAudio, tanpa berkas aset sama sekali.
 *
 * Disalin dari demo artifact. Dibikin modul tersendiri, bukan hook, karena yang
 * membunyikan ada di dalam loop kanvas (60x per detik, di luar React) sementara
 * yang menyalakan/mematikan ada di HUD. Satu keadaan modul jauh lebih sederhana
 * daripada mengoper callback bolak-balik ke dalam loop.
 */

let audio: AudioContext | null = null;
let nyala = true;

export function suaraNyala(): boolean {
  return nyala;
}

export function setSuara(aktif: boolean): void {
  nyala = aktif;
}

/**
 * Satu bunyi pendek. Semua efek game dibangun dari ini: nada tinggi pendek
 * untuk "pas", nada rendah panjang untuk gagal, deret nada naik untuk menang.
 *
 * Gagal disintesis diperlakukan sebagai "browser ini tidak mau bunyi" dan
 * mematikan suara seterusnya - lebih baik diam daripada melempar galat tiap
 * dus mendarat.
 */
export function blip(
  freq: number,
  durasi: number,
  bentuk: OscillatorType = "square",
  volume = 0.06,
): void {
  if (!nyala || typeof window === "undefined") return;
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;

    audio = audio ?? new Ctx();
    // Browser menahan AudioContext sampai ada interaksi; ketukan pertama
    // pemain yang membangunkannya.
    if (audio.state === "suspended") void audio.resume();

    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = bentuk;
    o.frequency.setValueAtTime(freq, audio.currentTime);
    g.gain.setValueAtTime(volume, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + durasi);
    o.connect(g);
    g.connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + durasi);
  } catch {
    nyala = false;
  }
}

/** Deret nada naik saat menara berdiri penuh. */
export function fanfarMenang(): void {
  [523, 659, 784, 1046].forEach((f, i) =>
    setTimeout(() => blip(f, 0.18, "triangle", 0.07), i * 120),
  );
}

/** Deret nada saat roda berhenti di hadiah. */
export function fanfarHadiah(): void {
  [659, 880, 1175].forEach((f, i) =>
    setTimeout(() => blip(f, 0.2, "triangle", 0.07), i * 130),
  );
}
