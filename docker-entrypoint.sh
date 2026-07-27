#!/bin/sh
set -e

# ─────────────────────────────────────────────────────────────────────────────
# Menjaga chunk lama tetap tersaji lintas deploy.
#
# Nama file di /_next/static/ ber-hash dan BERUBAH tiap build. Container baru
# hanya membawa chunk versi barunya, sementara browser yang masih memegang HTML
# lama (tab menganggur, tombol back, bfcache, atau HTML yang ke-cache nginx lalu
# menyeberangi momen deploy) tetap meminta nama file versi lama → 404 →
# ChunkLoadError → halaman blank.
#
# .next/static di-mount ke volume persisten `store_static`, jadi hasil build
# lama menumpuk di sana dan hash lama tetap resolve. Build baru disalin masuk
# tiap start. File bernama sama pasti isinya identik (nama = hash isi), jadi
# aman ditimpa.
# ─────────────────────────────────────────────────────────────────────────────
cp -R /app/.next/static-dist/. /app/.next/static/

# Tanpa penyapuan, volume tumbuh selamanya. 30 hari jauh melampaui umur tab
# menganggur mana pun. Chunk milik build yang sedang aktif ikut ter-refresh
# mtime-nya oleh cp di atas tiap start, jadi tidak akan pernah kena sapu.
find /app/.next/static -type f -mtime +30 -delete 2>/dev/null || true
find /app/.next/static -mindepth 1 -type d -empty -delete 2>/dev/null || true

exec "$@"
