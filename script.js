let currentStep = "start";
let stats = { sanity: 100, trauma: 0, attachment: 0, inventory: [] };
let unlockedEndings = JSON.parse(localStorage.getItem('tulpa_endings')) || [];

const itemDB = {
    "foto": { n: "Foto Kelas 20xx", i: "🖼️", d: "Wajah Yuna dicoret tinta merah." },
    "kapak": { n: "Kapak Karat", i: "🪓", d: "Benda tumpul yang masih mematikan." },
    "obat": { n: "Antipsikotik", i: "💊", d: "Menghapus ilusi, membunuh harapan." },
    "kunci": { n: "Kunci Atap", i: "🔑", d: "Akses menuju ketinggian." },
    "diary": { n: "Buku Harian", i: "📖", d: "Berisi rahasia Projek Tulpa." }
};

const endingNames = {
    "end_true": "🌟 TRUE END: REINTEGRASI",
    "end_tulpa": "❤️ TULPA END: HIDUP DALAM DELUSI",
    "end_die": "💀 DEAD END: TERHAPUS",
    "end_insane": "🌀 INSANE END: LABIRIN PIKIRAN",
    "end_suicide": "🕊️ LEAP END: KEBEBASAN PALSU",
    "end_betrayal": "🔪 BETRAYAL END: PENGKHIANATAN",
    "end_neutral": "😐 NEUTRAL END: DUNIA KOSONG"
};

function initAudio() {
    const bgm = document.getElementById("bgm");
    if(bgm.paused) {
        bgm.src = "horror_ambience.mp3";
        bgm.volume = 0.4;
        bgm.play().catch(() => {});
    }
}

function triggerJump() {
    const sfx = document.getElementById("sfx");
    sfx.src = "scary_jump.mp3";
    sfx.play();
    document.getElementById("glitch-overlay").style.opacity = "0.5";
    document.getElementById("game-container").style.animation = "shake 0.2s infinite";
    setTimeout(() => {
        document.getElementById("glitch-overlay").style.opacity = "0";
        document.getElementById("game-container").style.animation = "";
    }, 400);
}

const story = {
    "start": {
        name: "KELAS 12",
        text: "x january 20xx. SMA Akasaka. Kelas ini sunyi, kecuali suara detak jam yang melambat. Yuna berdiri di sana, menatapmu datar. 'Kau datang lagi? Padahal pintu keluar sudah terbuka tadi.'",
        bg: "kelas.jpg", character: "yuna.png",
        choices: [
            { text: "Tanya siapa dia sebenarnya", next: "ask_identity" },
            { text: "Cari sesuatu di loker", next: "check_locker" },
            { text: "Keluar ke Koridor", next: "koridor_main" }
        ]
    },
    "ask_identity": {
        name: "Yuna",
        text: "'Aku? Aku adalah apa yang kau inginkan. Aku adalah memori yang kau tolak untuk kau lupakan. Tanpaku, kau hanya cangkang kosong, [Player].'",
        callback: () => { stats.attachment += 5; stats.trauma += 2; },
        next: "koridor_main"
    },
    "check_locker": {
        name: "LOKER",
        text: "Kau menemukan Foto Kelas. Di belakangnya tertulis: 'Jangan percaya pada penglihatanmu sendiri'.",
        callback: () => { stats.inventory.push("foto"); stats.sanity -= 5; },
        next: "koridor_main"
    },
    "koridor_main": {
        name: "KORIDOR",
        text: "Lorong sekolah ini memanjang secara tidak wajar. Suara langkah kaki mengejarmu dari kegelapan.",
        bg: "koridor.jpg",
        choices: [
            { text: "Lari ke Gudang Olahraga", next: "gudang_gym" },
            { text: "Masuk ke Ruang Guru", next: "ruang_guru" },
            { text: "Naik ke Lantai Atas", next: "stairs" }
        ]
    },
    "gudang_gym": {
        name: "GUDANG OLAHRAGA",
        text: "Ruangan ini penuh manekin tanpa wajah. Di pojok, kau menemukan Kapak Karat yang tertancap di sebuah matras.",
        callback: () => { stats.inventory.push("kapak"); triggerJump(); },
        choices: [
            { text: "Ambil Kapak", next: "gym_scare" },
            { text: "Lari Keluar", next: "koridor_main" }
        ]
    },
    "gym_scare": {
        text: "Saat kau mengambil kapak, manekin-manekin itu mendadak menoleh ke arahmu!",
        callback: () => { stats.sanity -= 20; },
        next: "koridor_main"
    },
    "ruang_guru": {
        name: "RUANG GURU",
        text: "Ada catatan di meja: 'Projek Tulpa: Subjek 01 mulai menunjukkan gejala delusi berat.' Di laci, ada Kunci Atap.",
        callback: () => { stats.inventory.push("kunci"); stats.inventory.push("diary"); },
        next: "koridor_main"
    },
    "stairs": {
        name: "TANGGA",
        text: "Tangga ini terus berputar. Yuna muncul di atasmu. 'Jika kau terus naik, kau tidak akan bisa kembali.'",
        choices: [
            { text: "Terus Naik ke Atap", next: "rooftop", needItem: "kunci", altNext: "stairs_locked" },
            { text: "Turun ke Basement", next: "basement_entry" }
        ]
    },
    "stairs_locked": {
        text: "Pintu ke atap terkunci. Kau butuh kunci dari Ruang Guru.",
        next: "koridor_main"
    },
    "rooftop": {
        name: "ATAP SEKOLAH",
        text: "Angin kencang. Langit berwarna merah darah. 'Loncatlah, [Player]. Itulah satu-satunya cara untuk bangun,' bisik sebuah suara asing.",
        choices: [
            { text: "Terjun (Akhiri Semuanya)", next: "end_suicide" },
            { text: "Tolak & Turun", next: "basement_entry" }
        ]
    },
    "basement_entry": {
        name: "BASEMENT",
        text: "Pintu laboratorium terbuka lebar. Bau obat kimia menyengat. Dokter tanpa wajah sudah menunggumu di kursi integrasi.",
        bg: "basement.jpg",
        choices: [
            { text: "Hadapi Mereka", next: "final_choice" }
        ]
    },
    "final_choice": {
        name: "KONFRONTASI",
        text: "Yuna menghalangi para dokter. 'Tentukan pilihanmu sekarang! Aku, mereka, atau dirimu sendiri?'",
        choices: [
            { text: "Hancurkan Kursi (Kapak)", next: "eval_axe", needItem: "kapak", altNext: "end_die" },
            { text: "Minum Obat", next: "eval_med", needItem: "obat", altNext: "end_die" },
            { text: "Tunjukkan Foto & Diary", next: "eval_true", needItem: "foto", altNext: "end_die" },
            { text: "Serang Yuna", next: "end_betrayal", needItem: "kapak" }
        ]
    },
    "eval_axe": {
        callback: () => { currentStep = stats.sanity < 40 ? "end_insane" : "end_tulpa"; renderScene(); }
    },
    "eval_med": {
        callback: () => { currentStep = "end_neutral"; renderScene(); }
    },
    "eval_true": {
        callback: () => { currentStep = (stats.attachment > 10 && stats.bravery > 5) ? "end_true" : "end_neutral"; renderScene(); }
    },
    "end_true": { name: "ENDING", text: "Kau menerima trauma itu.", epilogue: "Yuna tidak hilang, dia menjadi bagian darimu yang sehat. Kau bangun di dunia nyata.", isEnding: "end_true" },
    "end_tulpa": { name: "ENDING", text: "Kau menghancurkan realitas.", epilogue: "Kau memilih tinggal di dunia ilusi bersama Yuna selamanya. SMA Akasaka menjadi istanamu.", isEnding: "end_tulpa" },
    "end_die": { name: "ENDING", text: "Kau gagal.", epilogue: "Para dokter menghapus memorimu. Kau menjadi pasien tanpa nama di RSJ.", isEnding: "end_die" },
    "end_insane": { name: "ENDING", text: "Pikiranmu hancur.", epilogue: "Kau tertawa saat kegelapan menelanmu. Bahkan Yuna takut padamu sekarang.", isEnding: "end_insane" },
    "end_suicide": { name: "ENDING", text: "Kau terjun.", epilogue: "Tubuhmu hancur, tapi jiwamu tetap terjebak di koridor sekolah ini sebagai hantu.", isEnding: "end_suicide" },
    "end_betrayal": { name: "ENDING", text: "Kau membunuhnya.", epilogue: "Kau membunuh manifestasi jiwamu sendiri. Kau bangun, tapi kau tidak lagi memiliki emosi.", isEnding: "end_betrayal" },
    "end_neutral": { name: "ENDING", text: "Obat itu bekerja.", epilogue: "Yuna lenyap. Kau bangun, merasa hampa, dan melupakan semua kejadian ini.", isEnding: "end_neutral" }
};

function startGame() {
    document.getElementById("main-menu").style.display = "none";
    document.getElementById("game-ui").style.display = "block";
    document.getElementById("dialog-box").style.display = "block";
    renderScene();
}

function renderScene() {
    const scene = story[currentStep];
    if(scene.callback) scene.callback();
    
    if(scene.isEnding && !unlockedEndings.includes(scene.isEnding)) {
        unlockedEndings.push(scene.isEnding);
        localStorage.setItem('tulpa_endings', JSON.stringify(unlockedEndings));
    }

    document.getElementById("stat-sanity").innerText = stats.sanity;
    document.getElementById("stat-trauma").innerText = stats.trauma;
    document.getElementById("stat-attachment").innerText = stats.attachment;
    document.getElementById("name").innerText = scene.name || "SISTEM";
    document.getElementById("text").innerHTML = scene.epilogue ? `<strong>${scene.text}</strong><br><br><small style='color:red'>${scene.epilogue}</small>` : scene.text;
    if(scene.bg) document.getElementById("background").style.backgroundImage = `url('${scene.bg}')`;

    const charImg = document.getElementById("character");
    charImg.style.display = scene.character ? "block" : "none";

    const choicesDiv = document.getElementById("choices");
    choicesDiv.innerHTML = "";
    if(scene.choices) {
        scene.choices.forEach(c => {
            const has = c.needItem ? stats.inventory.includes(c.needItem) : true;
            const btn = document.createElement("div");
            btn.className = "choice-btn";
            btn.innerText = has ? c.text : c.text + " (Terkunci)";
            btn.onclick = (e) => { e.stopPropagation(); currentStep = has ? c.next : (c.altNext || currentStep); renderScene(); };
            choicesDiv.appendChild(btn);
        });
    }
}

function toggleAlbum() {
    const o = document.getElementById("album-overlay");
    o.style.display = o.style.display === "flex" ? "none" : "flex";
    document.getElementById("album-list").innerHTML = Object.keys(endingNames).map(k => 
        unlockedEndings.includes(k) ? `<div class='item-card'>${endingNames[k]}</div>` : "<div class='item-card' style='color:#333'>🔒 ???</div>"
    ).join("");
}

function toggleInventory() {
    const o = document.getElementById("inventory-overlay");
    o.style.display = o.style.display === "flex" ? "none" : "flex";
    document.getElementById("item-list").innerHTML = stats.inventory.map(i => `<div class='item-card'>${itemDB[i].i} <strong>${itemDB[i].n}</strong><br>${itemDB[i].d}</div>`).join("");
}

document.getElementById("game-container").onclick = () => {
    if(story[currentStep].isEnding) location.reload();
    else if(!story[currentStep].choices && story[currentStep].next) { currentStep = story[currentStep].next; renderScene(); }
};
