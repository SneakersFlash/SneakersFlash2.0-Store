/**
 * Sumber tunggal data campaign "Freedom in Every Step" (Kemerdekaan).
 *
 * Kurasinya sudah FINAL: 208 kode artikel di bawah adalah isi tab campaign di
 * sheet Freedom (794 baris ukuran → 210 produk), diverifikasi satu-satu ada di
 * katalog SF, aktif, berstok, dan seluruh variannya punya ginee_sku_id.
 * Urutan array = urutan tayang, sama dengan urutan barisnya di sheet dan sama
 * dengan display_order event "freedom-in-every-step" (events.id = 9) di backend.
 *
 * PENTING — prefiks `LC-`. Separuh isi campaign ini barang clearance, dan di
 * katalog SF salinan clearance punya `sku_parent` sendiri yang berprefiks `LC-`.
 * Filter `?skus=` backend mencocokkan `sku_parent` PERSIS (case-insensitive),
 * jadi menulis kode telanjang untuk barang clearance bikin produknya hilang
 * diam-diam dari grid — bukan error. Jangan "rapikan" prefiks ini.
 *
 * Harga promonya TIDAK diatur di sini. Untuk 104 produk reguler harga sheet
 * sudah jadi harga varian di DB; untuk 106 produk clearance harga sheet hidup
 * sebagai special_price di event. Angka di komentar cuma catatan saat kurasi
 * ini dibuat (14 Agt 2026) — bukan sumber kebenaran.
 */

/** WIB = UTC+7, ditulis eksplisit supaya tidak ikut zona waktu server. */
export const FREEDOM_MULAI = "2026-08-12T00:00:00+07:00";
export const FREEDOM_BERAKHIR = "2026-08-17T23:59:59+07:00";

/**
 * Jam belanja dibuka — BEDA dari jam campaign mulai.
 *
 * Campaign tayang 12 Agt supaya orang bisa lihat-lihat dan menyusun keranjang
 * lebih dulu, tapi pesanan baru boleh diselesaikan 15 Agt. Angka ini harus sama
 * dengan `events.checkout_opens_at` event id 9 di backend: yang menolak checkout
 * adalah backend, yang di sini cuma menghitung mundur dan menahan tombol supaya
 * pembeli tidak menabrak penolakan itu.
 */
export const FREEDOM_BELANJA_BUKA = "2026-08-15T00:00:00+07:00";

export const FREEDOM_HREF = "/freedom-in-every-step";
export const FREEDOM_NAMA = "Freedom in Every Step";

/**
 * Nama pendek untuk tempat sempit: menu navbar dan tombol mengambang.
 * "Freedom in Every Step" terlalu panjang untuk dua tempat itu.
 */
export const FREEDOM_LABEL_PENDEK = "Freedom Step";

/** Slug event backend yang memuat kurasi yang sama beserta harga promonya. */
export const FREEDOM_EVENT_SLUG = "freedom-in-every-step";

/**
 * Dipakai sebagai `limit` saat menarik grid — SENGAJA bukan `SKU_PAIRS.length`.
 *
 * 208 kode menghasilkan 210 produk (dua artikel punya produk kembar di katalog,
 * lihat catatan SKU_PAIRS), jadi memakai panjang array bikin dua produk terakhir
 * kepotong paginasi tanpa gejala apa pun. Angkanya dilebihkan sedikit supaya
 * kembaran baru dari sisi katalog tidak langsung memotong grid lagi.
 */
export const FREEDOM_LIMIT_GRID = 240;

/**
 * Section "Pairs Worth Checking Out" — seluruh isi campaign.
 *
 * 208 kode untuk 210 produk: dua artikel (Dunk Low Dark Curry & AJ1 Mid White
 * Industrial) ketulis dua kali di sheet dengan kapital berbeda dan memang punya
 * dua produk kembar di katalog SF. Karena pencocokan `?skus=` case-insensitive,
 * satu kode sudah menarik kedua-duanya — jadi dua artikel itu tampil dobel
 * dengan harga berbeda. Hapus salah satu produk kembarnya di admin kalau tidak
 * mau begitu; menambah/mengurangi baris di sini tidak bisa memilih yang mana.
 *
 * Kode yang tidak ada di katalog SF dilewati diam-diam oleh backend: daftarnya
 * memendek, bukan error.
 */
export const SKU_PAIRS = [
  "M880U15",         // NEW BALANCE 880 V15 Blue Grey — Rp1.679.000
  "LC-216010KHK",    // SKECHERS Go Walk Max Khaki — Rp769.000
  "233060WGY",       // SKECHERS Sport Dlux Vapor White — Rp1.049.000
  "LC-UBP2573BL",    // REEBOK Reebok Canon Waistba Black — Rp239.000
  "LC-1162031FGZ",   // HOKA ONE ONE Clifton 10 First Orange Zest — Rp1.649.000
  "JH9184",          // ADIDAS Ultraboost 1 Cloud White Better Scarlet Gum — Rp1.819.000
  "JR3148",          // ADIDAS Ultraboost 1 Grey Blue — Rp1.819.000
  "FZ1347100",       // NIKE Cortez White Varsity Red Varsity Blue — Rp1.359.000
  "LC-LAB51207BK",   // NEW BALANCE Accessory Belt Black — Rp629.000
  "M411RY3",         // NEW BALANCE 411 V3 Dove Grey — Rp749.000
  "LC-FD6033008",    // NIKE Quest 6 Black Red — Rp1.039.000
  "U370AI",          // NEW BALANCE 370 Brown — Rp1.319.000
  "M860U14",         // NEW BALANCE Fresh Foam X 860 V14 Dark Green — Rp1.569.000
  "LC-205338BLK",    // SKECHERS Mens Usa Pollard Black Grey — Rp999.000
  "LC-100225489",    // REEBOK Zig Dynamica 6 Grey — Rp949.000
  "LC-232043BBK",    // SKECHERS Sport Arch Fit Triple Black — Rp819.000
  "1147850DTDR",     // HOKA ONE ONE Arahi 7 Droplet Druzy — Rp1.599.000
  "LC-216372TPE",    // SKECHERS Go Walk Now Taupe — Rp829.000
  "100074882",       // REEBOK Lite Plus 4 Black Grey — Rp829.000
  "LC-100212289",    // REEBOK Fluxlite Triple Black — Rp749.000
  "232965BKCC",      // SKECHERS Sport Track Black Grey — Rp749.000
  "FD7039200",       // NIKE Air Force 1 Low Retro Qs Chocolate White — Rp1.739.000
  "LC-U475FC",       // NEW BALANCE 475 Reflection White Slate Grey — Rp909.000
  "100204842",       // REEBOK Energen Tech 2 Black White — Rp829.000
  "220382BBK",       // SKECHERS Go Run Now Triple Black — Rp889.000
  "1147851NKV",      // HOKA ONE ONE Arahi 7 Nautical Dust Varsity Navy — Rp1.699.000
  "LC-150059BBK",    // SKECHERS Sport Arch Fit 2 Black — Rp869.000
  "1155130YZT",      // HOKA ONE ONE Rincon 4 Yuzu Tart Green — Rp1.569.000
  "WRCXCS4",         // NEW BALANCE Sc Trainer White — Rp2.039.000
  "WL574CUL",        // NEW BALANCE 574 Boulder Permafrost Brown — Rp1.409.000
  "LC-150480NVTQ",   // SKECHERS Sport Dynamight 2 Navy — Rp779.000
  "39771707",        // PUMA Seoul White Red Fire — Rp1.239.000
  "UA950AB1",        // NEW BALANCE 950 Blue — Rp1.419.000
  "HV6929299",       // NIKE Air Zoom Spiridon Cage 2 Medium Ash Metallic Silver Taupe Grey — Rp1.859.000
  "LC-216332BBK",    // SKECHERS Go Walk Flex Black — Rp829.000
  "36944930",        // PUMA Rs X Toys White Vivid Blue — Rp1.409.000
  "37492301",        // PUMA Basket Classic Xxi White White — Rp1.159.000
  "1147930WTTR",     // HOKA ONE ONE Kawana 2 White Tart Apple — Rp1.699.000
  "LC-216633WWNVOR", // SKECHERS Go Walk 7 Navy Orange — Rp869.000
  "WRCELLR5",        // NEW BALANCE Fuelcell Supercomp Elite V5 Urgent Red — Rp2.379.000
  "LC-100245392",    // REEBOK Float Zig 2 White Grey — Rp1.159.000
  "A11752C",         // CONVERSE Ct 70S Ox Clay Court Orange — Rp909.000
  "1147790BWHT",     // HOKA ONE ONE Mach 6 Black White — Rp1.699.000
  "LC-DIAX25F0506B", // DIADORA Nixon Black White — Rp829.000
  "LC-124678NVAQ",   // SKECHERS Go Walk Joy Navy White — Rp829.000
  "LC-IE7262",       // ADIDAS Duramo Sl White Black — Rp799.000
  "IE8463",          // ADIDAS Pureboost 5 White Grey — Rp1.829.000
  "LC-M413LW3",      // NEW BALANCE 413 V3 Triple White — Rp629.000
  "DJ6258003",       // NIKE Tanjun Black White — Rp999.000
  "216335OFWT",      // SKECHERS Go Walk Flex White Natural — Rp829.000
  "LC-100238234",    // REEBOK Flex Point Trainer White Pink — Rp889.000
  "1147790FRT",      // HOKA ONE ONE Mach 6 Forest Lichen Tart Apple — Rp1.599.000
  "LC-1162030FGZ",   // HOKA ONE ONE Clifton 10 White Orange — Rp1.659.000
  "LC-HJ8485002",    // NIKE W Revolution 8 Black — Rp1.069.000
  "124649BKW",       // SKECHERS Go Walk Joy Black White — Rp829.000
  "LC-JS0321",       // ADIDAS Ultra Dream Dna Cloud White — Rp949.000
  "IH4772",          // ADIDAS Gazelle Indoor Focus Olive — Rp1.709.000
  "LC-U370AG",       // NEW BALANCE 370 Navy White — Rp1.319.000
  "M108014C",        // NEW BALANCE 1080 Sand Sand — Rp1.829.000
  "LC-FB2207010",    // NIKE Revolution 7 Black Lime — Rp869.000
  "100010618",       // REEBOK Court Advance White Cold Grey — Rp829.000
  "LC-100208895",    // REEBOK Court Advance White Chalk Purple — Rp709.000
  "LC-125251BKRG",   // SKECHERS Go Walk 7 Black — Rp869.000
  "MARISRA4",        // NEW BALANCE Arishi V4 White Beige — Rp929.000
  "LC-ID6318",       // ADIDAS Questar 3 White Grey — Rp969.000
  "M86014G",         // NEW BALANCE 860 V14 Sea Salt White — Rp1.659.000
  "LC-149057BBK",    // SKECHERS Arch Fit Big Appeal Triple Black — Rp769.000
  "MT410CN8",        // NEW BALANCE 410 V8 Navy White — Rp999.000
  "LC-100033357",    // REEBOK FLEXAGON ENERGY TR 4 TRIPLE BLACK — Rp1.189.000
  "MS237MCG",        // NEW BALANCE 237 Light Brown — Rp1.199.000
  "DN2158100",       // NIKE Blazer Low 77 Jumbo White Alpha Orange Grey Fog Sail — Rp1.159.000
  "CJ1288001",       // NIKE Air Zoom Spiridon Cage 2 Lt Smoke Grey Metallic Silver — Rp1.859.000
  "LC-100220888",    // REEBOK COURT CLEAN WHITE LIGHT BLUE — Rp719.000
  "IB8182100",       // NIKE T90 White Black Gum Light Brown — Rp1.559.000
  "40237301",        // PUMA Rs X Tmnt Black Leafy Green — Rp1.449.000
  "JH9078",          // ADIDAS SAMOA WHITE GREEN — Rp1.379.000
  "LC-FJ4195001",    // NIKE WAFFLE DEBUT BLACK GREY — Rp1.039.000
  "JJ5663",          // ADIDAS Basefwd Black Red — Rp699.000
  "LC-DM8465400",    // NIKE Air Adjust Force Ambush University Blue — Rp1.659.000
  "LC-232862BBK",    // SKECHERS SPORT SKECH AIR ELEMENT 2 TRIPLE BLACK — Rp999.000
  "JH9079",          // ADIDAS SAMOA WHITE RED — Rp1.379.000
  "LC-DM8465800",    // NIKE Air Adjust Force Ambush Light Madder Root — Rp1.659.000
  "LC-1127929MCN",   // HOKA ONE ONE GAVIOTA 5 MIDNIGHT OCEANIC — Rp1.509.000
  "31028204",        // PUMA Pwr Hybrid Tr Black Green Moon — Rp999.000
  "Fq6965700",       // NIKE Dunk Low Qs Dark Curry White — Rp1.639.000
  "100211907",       // REEBOK Flexagon Energy Tr 4 Black White — Rp749.000
  "HV3860783",       // NIKE Ld 1000 Sp Team Gold — Rp1.279.000
  "LC-100210045",    // REEBOK ZIG DYNAMICA 5 VINTAGE CHALK TRUE PINK — Rp1.079.000
  "LC-100032921",    // REEBOK ULTRA FLASH BLACK WHITE — Rp749.000
  "LC-LAB13194DTR",  // NEW BALANCE MESH POCKET BACKPACK BLACK RED — Rp429.000
  "Fn5215141",       // NIKE Air Jordan 1 Mid Se White Industrial Blue — Rp1.789.000
  "LC-IG1811",       // ADIDAS JAVA NIGHT SKY — Rp1.159.000
  "LC-URC42LB",      // NEW BALANCE URC42 BLACK WHITE GUM — Rp1.249.000
  "LC-IH4823",       // ADIDAS SL 72 RS WHITE BLACK — Rp1.079.000
  "LC-104451BKW",    // SKECHERS SP ACTIV VIRTUE BLACK WHOTE — Rp829.000
  "GM500TPG",        // NEW BALANCE 500 Brown — Rp999.000
  "LC-FB2207103",    // NIKE REVOLUTION 7 WHITE — Rp1.009.000
  "FQ8762100",       // NIKE Field General 82 Sp White Varsity Red — Rp1.279.000
  "LC-1155131SSTC",  // HOKA ONE ONE RINCON 4 STARDUST GREY — Rp1.629.000
  "LC-UWRPDTBK",     // NEW BALANCE WRPD RUNNER BLACK BLUE — Rp1.239.000
  "UWRPDCON",        // NEW BALANCE Wrpd Runner Grey Matter — Rp1.299.000
  "LC-DQ1470002",    // NIKE Blazer Low 77 Jumbo Black White Sail — Rp949.000
  "LC-232686NVOR",   // SKECHERS Sport Flex Comfort Navy Orange — Rp789.000
  "U991BL2",         // NEW BALANCE 991 Miuk Dazzling Blue — Rp2.319.000
  "100228695",       // REEBOK Court Advance White — Rp669.000
  "LC-1147850STLC",  // HOKA ONE ONE Arahi 7 Stardust Elecobalt — Rp1.489.000
  "LC-A03277C",      // CONVERSE Chuck 70 At Cx Hi Black Egret — Rp889.000
  "LC-IE7798",       // ADIDAS Don Issue 5 Semi Blue Burst — Rp1.079.000
  "LC-H64739",       // ADIDAS Optimized Packing System Shoe Blue — Rp109.000
  "LC-CZ0775001",    // AIR JORDAN 1 Low Og Black Cement — Rp1.079.000
  "LC-HQ4425",       // ADIDAS Forum Low Black Neon Green — Rp829.000
  "LC-FJ0698100",    // NIKE Air Max 1 Prm Escape Treeline — Rp1.209.000
  "LC-39902803",     // PUMA Easy Rider Vintage Archieve Green — Rp1.019.000
  "ID2151",          // ADIDAS Superstar 82 Crystal White Clear Blue — Rp1.239.000
  "LC-ID2879",       // ADIDAS Rivalry Low Consortium Solebox Ice Cream — Rp1.079.000
  "LC-IF2391",       // ADIDAS Pureboost 23 Black Gold — Rp959.000
  "LC-1160050NCWT",  // HOKA ONE ONE Clifton L Athletics Nimbus Cloud — Rp1.329.000
  "IE1763",          // ADIDAS Ultraboost Light Bold Onix Silver Metallic Core — Rp1.369.000
  "LC-100208921",    // REEBOK COURT Retro White Chalk Green — Rp639.000
  "GY9353",          // ADIDAS Ultraboost Light Core Black — Rp1.819.000
  "U1500PGL",        // NEW BALANCE 1500 Mi Uk Light Grey — Rp2.479.000
  "UWRPDMMB",        // NEW BALANCE Wrpd Runner Navy Sea Salt — Rp1.299.000
  "U998BG",          // NEW BALANCE 998 Made In Usa Brown Green — Rp2.029.000
  "LC-U991TB2",      // NEW BALANCE 991 V2 Miuk Nostalgic Sepia — Rp1.979.000
  "LC-39468701",     // PUMA Clyde Vintage White Navy — Rp949.000
  "LC-U9060NRH",     // NEW BALANCE 9060 Dark Royal Blue — Rp1.159.000
  "UWRPDMMA",        // NEW BALANCE Wrpd Runner Dark Olivine — Rp1.299.000
  "LC-FD2110001",    // NIKE Air Max Flyknit Venture Black — Rp1.589.000
  "U998OB",          // NEW BALANCE 998 Made In Usa Orange Royal — Rp2.479.000
  "FD1437401",       // NIKE Air Jordan 1 Retro High Og Midnight Navy (Gs) — Rp1.409.000
  "LC-AR0715101",    // NIKE 11 Retro Neapolitan — Rp1.669.000
  "LC-IE7766",       // ADIDAS Trae Unlimited 2 Blue Burst Royal — Rp949.000
  "IE7793",          // ADIDAS Dame Certified 2 Metal Grey Cloud White — Rp1.009.000
  "FQ8226101",       // NIKE Court Legacy Next Nature White Blue — Rp579.000
  "LC-ID9637",       // ADIDAS Ultraboost 1.0 Black Lucid Lemon — Rp1.359.000
  "LC-GW8588",       // ADIDAS Pureboost 22 Core Black — Rp909.000
  "LC-37990503",     // PUMA Genetics White Yellow Sizzle — Rp749.000
  "100209934",       // REEBOK Lite 4 Black White — Rp829.000
  "DM4044102",       // NIKE Cortez White Campfire Orange — Rp1.109.000
  "DV2440002",       // NIKE Lunar Roam Dark Smoke Grey Black — Rp1.629.000
  "ID5774",          // ADIDAS Centennial 85 Lo 001 Sesame Cream White — Rp1.509.000
  "LC-38469211",     // PUMA Slipstream Lo Retro White Malachite — Rp909.000
  "LC-DV2440001",    // NIKE Lunar Roam Pure Platinum Tint — Rp1.399.000
  "FQ9079300",       // NIKE Ld 1000 Sp Vintage Green — Rp1.279.000
  "39771705",        // PUMA Seoul White Vapor Gray — Rp1.239.000
  "LC-1127929DHN",   // HOKA ONE One Gaviota 5 Downpour Thunder Cloud — Rp1.509.000
  "378038170",       // NIKE Air Jordan 11 Retro Dmp Gratitude White Black (Gs) — Rp1.739.000
  "30969105",        // PUMA Genetics Speckle Club Navy — Rp1.239.000
  "39684101",        // PUMA Palermo Vintage Hyperlink Blue — Rp1.299.000
  "LC-DV1305433",    // AIR JORDAN 1 High Zoom Cmft 2 Green — Rp1.029.000
  "LC-HQ8578",       // ADIDAS Pureboost 22 Black Pulse Mint — Rp959.000
  "LC-177964BKRD",   // SKECHERS X Rolling Stones Uno — Rp619.000
  "LC-MEVOZCG3",     // NEW BALANCE Ff X Evoz V3 Marine Blue — Rp829.000
  "39857201",        // PUMA Roma Classic Warm White — Rp1.299.000
  "LC-IG7178",       // ADIDAS Kids Suru365 X Disney Multicolor Sepatu Sneakers Anak — Rp539.000
  "MEVOZFG3",        // NEW BALANCE Ff X Evoz V3 Shadow Grey — Rp829.000
  "UWRPDKOM",        // NEW BALANCE Wrpd Runner Green Black — Rp1.239.000
  "LC-30789702",     // PUMA Ferrari Slipstream White Grey — Rp979.000
  "31040502",        // PUMA Genetics Speckle Black White — Rp1.239.000
  "39934801",        // PUMA Palermo Elevata Black Gum — Rp1.299.000
  "LC-HQ6346",       // ADIDAS Ultraboost Light Black Yellow — Rp1.359.000
  "LC-FD4849106",    // AIR JORDAN 2 Retro Chicago Twist — Rp1.109.000
  "LC-38754422",     // PUMA Slipstream Lth White Pumpkin Pie — Rp869.000
  "LC-39156701",     // PUMA Suede X Staple Fresh Sun Yellow — Rp999.000
  "LC-39311501",     // PUMA Clyde Hairy Suede Gray — Rp949.000
  "LC-38469210",     // PUMA Slipstream Lo Retro White — Rp909.000
  "39311401",        // PUMA Clyde Huskie White — Rp979.000
  "38660718",        // PUMA Army Trainer White Red Gum — Rp1.299.000
  "LC-W990BK6",      // NEW BALANCE 990 V6 Made In Usa Black — Rp1.869.000
  "LC-1147790ECC",   // HOKA ONE ONE Mach 6 Elecobalt Varsity Navy — Rp1.329.000
  "LC-M475VTE",      // NEW BALANCE 475 V1 Ice Wine Purple — Rp1.149.000
  "DN2158101",       // NIKE Blazer Low 77 Jumbo White Black Sail — Rp1.159.000
  "LC-GV8750",       // ADIDAS Ultraboost 5.0 Dna Shadow Navy — Rp1.079.000
  "LC-177967BKRD",   // SKECHERS X Rolling Roadies Surge — Rp619.000
  "DZ3497140",       // NIKE Jordan Air Ship Pe Sp Summit White Diffused Blue — Rp1.669.000
  "LC-216259TPE",    // SKECHERS Go Walk Arch Fit Taupe — Rp959.000
  "MS237WG",         // NEW BALANCE 237 White — Rp1.159.000
  "LC-IE3232",       // ADIDAS Country Xlg Semi Blue Burst Cloud White — Rp1.049.000
  "IG6190",          // ADIDAS Hand 2 Grey Light Blue Gum — Rp1.559.000
  "LC-URC42EA",      // NEW BALANCE Rc42 Linen Gum — Rp1.159.000
  "U998GB",          // NEW BALANCE 998 Made In Usa Grey Cream — Rp2.029.000
  "LC-38340111",     // PUMA Slipstream Lo White Island Pink — Rp869.000
  "LC-38495804",     // PUMA Trc Blaze White Peach Pink — Rp1.029.000
  "LC-38402401",     // PUMA Blaze Of Glory D South — Rp1.079.000
  "LC-172062GROR",   // SKECHERS Go Run Speed Beast Yellow — Rp1.359.000
  "LC-GX0535",       // ADIDAS Supernova Boost Black Acid Red — Rp889.000
  "GW2415",          // ADIDAS Superstar Pride Love Unites — Rp889.000
  "LC-38662201",     // PUMA Trc Blaze Haunted White Pistachio Sepatu Uniseks — Rp979.000
  "CU9174600",       // NIKE Airmax 2090 Sp Infrared Duck Camo — Rp1.199.000
  "38643002",        // PUMA Trc Blaze Chance Black White Sepatu Uniseks — Rp979.000
  "LC-CU7623002",    // NIKE Joyride Cc3 Setter Matthew Williams Grey — Rp1.219.000
  "LC-A01392C",      // CONVERSE Ct As Hi Goretex Yellow — Rp789.000
  "LC-CU7623001",    // NIKE Joyride Cc3 Setter Matthew Williams Black — Rp1.219.000
  "LC-GX5591",       // ADIDAS Ultraboost 22 Black White — Rp1.109.000
  "LC-CQ6639001",    // NIKE Air Max 90 Metallic Pack Silver — Rp1.109.000
  "38636101",        // PUMA Trc Blaze Re Collection White Sepatu Uniseks — Rp979.000
  "1201A942001",     // ASICS EX89 X NEEDLES BLACK PURPLE GREY — Rp1.719.000
  "1201A942100",     // ASICS EX89 X NEEDLES WHITE PURPLE GREY — Rp1.719.000
  "1203A641400",     // ASICS UB8 S GT 2160 AZURE PURE GOLD — Rp1.589.000
  "1203A594004",     // ASICS GEL QUANTUM 180 VIII BLACK DIVA PINK — Rp1.429.000
  "1203A600250",     // ASICS GEL NIMBUS 9 OATMEAL INDIGO FOG — Rp1.749.000
  "1203A603001",     // ASICS GEL K1011 BLACK PURE SILVER — Rp1.669.000
  "1203A603100",     // ASICS GEL K1011 WHITE PURE SILVER — Rp1.669.000
  "LC-LMT33538W",    // NEW BALANCE SPORT SEASONAL GRAPHIC 2 WHITE — Rp309.000
  "VN0A7TRO60Q",     // VANS TEE UNISEX AP M CUT SS DEEP TEAL — Rp579.000
  "VN0A7TRXF3X",     // VANS TEE UNISEX AP SEASONAL BEAR LOGO SS GOLDEN YELLOW — Rp489.000
  "VN0A7YGHBLK",     // VANS SWEATSHIRT UNISEX AP CAMPER MIX PO CREW BLACK — Rp899.000
  "LC-SU11636WH",    // SKECHERS LOW SOCK 6 PAIR WHITE — Rp249.000
];

/**
 * Section "Flash Hour" — SENGAJA kosong.
 *
 * Sheet campaign ini tidak menandai barang mana yang masuk potongan sekejap
 * (kolom `tag` kosong di seluruh 794 baris), jadi tidak ada dasar untuk memilih
 * isinya. Selama array ini kosong, section Flash Hour tidak dirender dan
 * request-nya pun tidak ditembakkan (lihat page.tsx). Mau dihidupkan: tulis
 * kode artikelnya di sini, ingat prefiks `LC-` untuk barang clearance.
 */
export const SKU_FLASH_HOUR: string[] = [];
