/**
 * SCRIPT.JS - Interaktivitas & Logika Kalkulator BMI & Kesehatan
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen DOM ---
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');
    const ageInput = document.getElementById('age');
    const activitySelect = document.getElementById('activity');
    const standardSelect = document.getElementById('standardSelect');
    
    const weightError = document.getElementById('weightError');
    const heightError = document.getElementById('heightError');
    const ageError = document.getElementById('ageError');
    const alertBox = document.getElementById('alertBox');
    const alertMessage = document.getElementById('alertMessage');
    
    const bmiForm = document.getElementById('bmiForm');
    const btnReset = document.getElementById('btnReset');
    const resultContainer = document.getElementById('resultContainer');
    
    // Hasil Metrik
    const bmiValueEl = document.getElementById('bmiValue');
    const bmiCategoryBadge = document.getElementById('bmiCategoryBadge');
    const bmiCategoryText = document.getElementById('bmiCategoryText');
    const indicatorCategoryLabel = document.getElementById('indicatorCategoryLabel');
    const scalePointer = document.getElementById('scalePointer');
    const pointerLabel = document.getElementById('pointerLabel');
    
    const explanationBox = document.getElementById('explanationBox');
    const explanationText = document.getElementById('explanationText');
    const suggestionsList = document.getElementById('suggestionsList');
    
    // Metrik Tambahan
    const idealWeightVal = document.getElementById('idealWeightVal');
    const bmrVal = document.getElementById('bmrVal');
    const tdeeVal = document.getElementById('tdeeVal');
    
    // Tabs & Mode
    const tabQuick = document.getElementById('tabQuick');
    const tabComplete = document.getElementById('tabComplete');
    const advancedSection = document.getElementById('advancedSection');
    
    // Tombol Aksi
    const btnCopy = document.getElementById('btnCopy');
    const btnPrint = document.getElementById('btnPrint');
    const btnSaveHistory = document.getElementById('btnSaveHistory');
    const btnClearHistory = document.getElementById('btnClearHistory');
    const historyList = document.getElementById('historyList');
    const toast = document.getElementById('toast');
    const themeToggle = document.getElementById('themeToggle');
    
    // Gender buttons
    const genderOptions = document.querySelectorAll('.gender-option');
    let selectedGender = 'male';
    let currentMode = 'quick'; // 'quick' atau 'complete'
    let currentCalculation = null;

    // --- Inisialisasi Tema (Dark / Light) ---
    const savedTheme = localStorage.getItem('fitmeter_theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('fitmeter_theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        const sunIcon = document.getElementById('sunIcon');
        const moonIcon = document.getElementById('moonIcon');
        if (theme === 'dark') {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        } else {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
    }

    // --- Tab Switcher (Mode Cepat vs Lengkap) ---
    tabQuick.addEventListener('click', () => {
        currentMode = 'quick';
        tabQuick.classList.add('active');
        tabComplete.classList.remove('active');
        advancedSection.classList.remove('active');
    });

    tabComplete.addEventListener('click', () => {
        currentMode = 'complete';
        tabComplete.classList.add('active');
        tabQuick.classList.remove('active');
        advancedSection.classList.add('active');
    });

    // --- Gender Selector ---
    genderOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            genderOptions.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedGender = btn.dataset.gender;
        });
    });

    // --- Normalisasi & Validasi Input ---
    function cleanInput(val) {
        if (!val) return '';
        return val.trim().replace(',', '.');
    }

    // Hapus error saat mengetik
    [weightInput, heightInput, ageInput].forEach(inp => {
        if (!inp) return;
        inp.addEventListener('input', () => {
            inp.classList.remove('error');
            hideErrors();
        });
    });

    function hideErrors() {
        if (weightError) weightError.classList.remove('show');
        if (heightError) heightError.classList.remove('show');
        if (ageError) ageError.classList.remove('show');
        if (alertBox) alertBox.classList.remove('show');
    }

    function validateField(val, min, max, allowEmpty = false) {
        if (!val || val.trim() === '') {
            return allowEmpty ? { valid: true, value: null } : { valid: false, reason: 'kosong' };
        }
        const clean = cleanInput(val);
        // Validasi regex: hanya digit dengan maksimal satu tanda titik desimal
        if (!/^[0-9]+(\.[0-9]+)?$/.test(clean)) {
            return { valid: false, reason: 'huruf' };
        }
        const num = parseFloat(clean);
        if (isNaN(num) || num <= 0) {
            return { valid: false, reason: 'nol' };
        }
        if (num < min || num > max) {
            return { valid: false, reason: 'range' };
        }
        return { valid: true, value: num };
    }

    // --- Submit Form BMI ---
    bmiForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideErrors();

        const checkWeight = validateField(weightInput.value, 20, 400);
        const checkHeight = validateField(heightInput.value, 50, 270);
        const checkAge = validateField(ageInput.value, 10, 120, currentMode === 'quick');

        let hasError = false;

        // Validasi Berat Badan
        if (!checkWeight.valid) {
            weightInput.classList.add('error');
            weightError.classList.add('show');
            if (checkWeight.reason === 'kosong') {
                weightError.textContent = 'Berat badan wajib diisi!';
            } else if (checkWeight.reason === 'huruf') {
                weightError.textContent = 'Hanya boleh berisi angka (contoh: 65 atau 65.5)!';
            } else if (checkWeight.reason === 'range') {
                weightError.textContent = 'Masukkan berat wajar (20 - 400 kg)!';
            }
            hasError = true;
        }

        // Validasi Tinggi Badan
        if (!checkHeight.valid) {
            heightInput.classList.add('error');
            heightError.classList.add('show');
            if (checkHeight.reason === 'kosong') {
                heightError.textContent = 'Tinggi badan wajib diisi!';
            } else if (checkHeight.reason === 'huruf') {
                heightError.textContent = 'Hanya boleh berisi angka (contoh: 170 atau 168.5)!';
            } else if (checkHeight.reason === 'range') {
                heightError.textContent = 'Masukkan tinggi wajar (50 - 270 cm)!';
            }
            hasError = true;
        }

        // Validasi Usia jika mode Lengkap
        if (currentMode === 'complete' && !checkAge.valid) {
            ageInput.classList.add('error');
            ageError.classList.add('show');
            if (checkAge.reason === 'kosong') {
                ageError.textContent = 'Usia wajib diisi untuk hitung kalori!';
            } else if (checkAge.reason === 'huruf') {
                ageError.textContent = 'Hanya boleh berisi angka bulat (contoh: 25)!';
            } else if (checkAge.reason === 'range') {
                ageError.textContent = 'Masukkan usia antara 10 - 120 tahun!';
            }
            hasError = true;
        }

        if (hasError) {
            alertMessage.textContent = 'Harap periksa form! Pastikan angka tidak kosong dan tidak diisi huruf.';
            alertBox.classList.add('show');
            resultContainer.classList.remove('active');
            return;
        }

        prosesKalkulasi({
            weight: checkWeight.value,
            height: checkHeight.value,
            age: checkAge.value || 25,
            gender: selectedGender,
            activityFactor: parseFloat(activitySelect.value),
            standard: standardSelect.value
        });
    });

    // --- Perhitungan & Penentuan Kategori ---
    function prosesKalkulasi(data) {
        const tinggiM = data.height / 100;
        const bmi = data.weight / (tinggiM * tinggiM);
        const roundedBMI = Math.round(bmi * 10) / 10;

        // Rentang Berat Ideal (WHO: 18.5 - 24.9, Kemenkes: 18.5 - 22.9)
        const isKemenkes = data.standard === 'kemenkes';
        const maxNormalBMI = isKemenkes ? 22.9 : 24.9;
        const minIdealWeight = (18.5 * tinggiM * tinggiM).toFixed(1);
        const maxIdealWeight = (maxNormalBMI * tinggiM * tinggiM).toFixed(1);

        // Kategori WHO vs Kemenkes RI
        let category = '';
        let statusKey = ''; // 'underweight', 'normal', 'overweight', 'obese'
        let explanation = '';
        let pointerPercent = 0;
        let tips = [];

        if (isKemenkes) {
            // Standar Kemenkes RI (Asia-Pasifik)
            if (roundedBMI < 18.5) {
                category = 'Berat Badan Kurang (Kurus)';
                statusKey = 'underweight';
                pointerPercent = Math.max(4, Math.min(22, (roundedBMI / 18.5) * 22));
            } else if (roundedBMI <= 22.9) {
                category = 'Normal / Ideal';
                statusKey = 'normal';
                pointerPercent = 22 + ((roundedBMI - 18.5) / (22.9 - 18.5)) * 33;
            } else if (roundedBMI <= 24.9) {
                category = 'Kelebihan Berat Badan (Overweight)';
                statusKey = 'overweight';
                pointerPercent = 55 + ((roundedBMI - 23.0) / (24.9 - 23.0)) * 25;
            } else {
                category = roundedBMI < 30 ? 'Obesitas Tingkat I' : 'Obesitas Tingkat II';
                statusKey = 'obese';
                pointerPercent = Math.min(96, 80 + ((roundedBMI - 25.0) / 15) * 16);
            }
        } else {
            // Standar WHO Global
            if (roundedBMI < 18.5) {
                category = 'Kurang Berat Badan (Kurus)';
                statusKey = 'underweight';
                pointerPercent = Math.max(4, Math.min(22, (roundedBMI / 18.5) * 22));
            } else if (roundedBMI <= 24.9) {
                category = 'Normal (Ideal)';
                statusKey = 'normal';
                pointerPercent = 22 + ((roundedBMI - 18.5) / (24.9 - 18.5)) * 33;
            } else if (roundedBMI <= 29.9) {
                category = 'Kelebihan Berat Badan (Gemuk)';
                statusKey = 'overweight';
                pointerPercent = 55 + ((roundedBMI - 25.0) / (29.9 - 25.0)) * 25;
            } else {
                category = 'Obesitas';
                statusKey = 'obese';
                pointerPercent = Math.min(96, 80 + ((roundedBMI - 30.0) / 10) * 16);
            }
        }

        // Penjelasan & Saran Khusus
        if (statusKey === 'underweight') {
            explanation = `Skor BMI Anda adalah <strong>${roundedBMI}</strong>, tergolong dalam kategori <strong>${category}</strong> (${isKemenkes ? 'Standar Kemenkes RI' : 'Standar WHO'}). Berat tubuh Anda berada di bawah proporsi sehat untuk tinggi badan ${data.height} cm.`;
            tips = [
                {
                    icon: '🥑',
                    title: 'Surplus Kalori Sehat (+300–500 kkal)',
                    desc: 'Tingkatkan asupan kalori harian di atas kebutuhan pemeliharaan. Tambahkan cemilan bergizi di antara jam makan utama dan perbesar porsi secara bertahap.'
                },
                {
                    icon: '🥩',
                    title: 'Pilihan Makanan Padat Gizi & Protein',
                    desc: 'Konsumsi makanan padat nutrisi: telur utuh, daging tanpa lemak, ikan kembung/salmon, alpukat, kacang almond, susu, keju, serta karbohidrat kompleks seperti oatmeal dan ubi.'
                },
                {
                    icon: '🏋️‍♂️',
                    title: 'Latihan Beban (Hypertrophy Training)',
                    desc: 'Fokus pada latihan beban teratur 3–4 kali seminggu untuk menstimulasi pertumbuhan massa otot dan kepadatan tulang, bukan sekadar menumpuk lemak.'
                }
            ];
        } else if (statusKey === 'normal') {
            explanation = `Luar biasa! Skor BMI Anda adalah <strong>${roundedBMI}</strong>, berada dalam kategori <strong>${category}</strong> (${isKemenkes ? 'Standar Kemenkes RI' : 'Standar WHO'}). Komposisi tubuh Anda sudah proporsional dengan tinggi badan Anda.`;
            tips = [
                {
                    icon: '🥗',
                    title: 'Mempertahankan Pola Hidup Sehat',
                    desc: 'Jaga konsistensi pola makan seimbang tanpa melewatkan sarapan. Minum air putih 2-2.5 liter per hari dan hindari konsumsi gula berlebih.'
                },
                {
                    icon: '🍱',
                    title: 'Keseimbangan Makronutrien Terjaga',
                    desc: 'Terapkan konsep piring sehat: 50% sayur & buah segar, 25% sumber protein berkualitas tinggi, dan 25% karbohidrat kompleks kaya serat.'
                },
                {
                    icon: '🏃‍♀️',
                    title: 'Kardio & Aktivitas Rutin (150 Menit/Minggu)',
                    desc: 'Lakukan olahraga kardio intensitas sedang seperti jogging santai, renang, atau bersepeda minimal 150 menit per minggu untuk kesehatan jantung dan paru-paru.'
                }
            ];
        } else if (statusKey === 'overweight') {
            explanation = `Skor BMI Anda adalah <strong>${roundedBMI}</strong>, berada dalam kategori <strong>${category}</strong> (${isKemenkes ? 'Standar Kemenkes RI' : 'Standar WHO'}). Anda disarankan mulai mengontrol asupan kalori dan meningkatkan aktivitas fisik.`;
            tips = [
                {
                    icon: '📉',
                    title: 'Defisit Kalori Moderat (-300 s/d 500 kkal)',
                    desc: 'Kurangi porsi makan secara bertahap tanpa diet ekstrem. Hindari makanan tinggi minyak/gorengan, sirup, dan minuman kemasan berpemanis.'
                },
                {
                    icon: '🚶‍♂️',
                    title: 'Olahraga Low-Impact yang Konsisten',
                    desc: 'Pilih jenis olahraga yang aman dan nyaman bagi persendian seperti jalan cepat 40 menit, berenang, atau bersepeda statis untuk membakar cadangan lemak tubuh.'
                },
                {
                    icon: '😴',
                    title: 'Manajemen Stres & Waktu Tidur Cukup',
                    desc: 'Tidur teratur 7–8 jam per hari. Kurang tidur meningkatkan produksi hormon ghrelin yang memicu rasa lapar berlebih dan memperlambat metabolisme.'
                }
            ];
        } else {
            explanation = `Skor BMI Anda adalah <strong>${roundedBMI}</strong>, tergolong dalam kategori <strong>${category}</strong> (${isKemenkes ? 'Standar Kemenkes RI' : 'Standar WHO'}). Disarankan untuk berkonsultasi dengan dokter atau ahli gizi untuk rencana penurunan berat badan yang aman dan terarah.`;
            tips = [
                {
                    icon: '🎯',
                    title: 'Defisit Kalori Terencana & Pemantauan Pola Makan',
                    desc: 'Buat jurnal makanan harian. Perbanyak sayuran berdaun hijau tinggi serat yang memberikan rasa kenyang lebih lama dengan kalori minimal.'
                },
                {
                    icon: '🏊‍♂️',
                    title: 'Olahraga Low-Impact Ramah Persendian',
                    desc: 'Lakukan olahraga aman bagi lutut dan sendi seperti senam air (*aquatic exercise*), berjalan kaki santai, dan latihan fleksibilitas 20-30 menit per hari.'
                },
                {
                    icon: '🩺',
                    title: 'Manajemen Gaya Hidup & Konsultasi Medis',
                    desc: 'Periksakan parameter kesehatan seperti tekanan darah, gula darah, dan kolesterol secara berkala. Hindari makan larut malam dan kelola stres dengan baik.'
                }
            ];
        }

        // Perhitungan BMR & TDEE (Mifflin-St Jeor)
        let bmr = 0;
        if (data.gender === 'male') {
            bmr = (10 * data.weight) + (6.25 * data.height) - (5 * data.age) + 5;
        } else {
            bmr = (10 * data.weight) + (6.25 * data.height) - (5 * data.age) - 161;
        }
        const tdee = Math.round(bmr * data.activityFactor);
        const roundedBMR = Math.round(bmr);

        // Simpan objek perhitungan aktif
        currentCalculation = {
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
            weight: data.weight,
            height: data.height,
            bmi: roundedBMI,
            category: category,
            statusKey: statusKey,
            standard: isKemenkes ? 'Kemenkes RI' : 'WHO Global',
            idealWeightRange: `${minIdealWeight} - ${maxIdealWeight} kg`,
            bmr: roundedBMR,
            tdee: tdee
        };

        renderHasil(currentCalculation, explanation, tips, pointerPercent);
    }

    // --- Render Hasil ke Layar ---
    function renderHasil(calc, explanation, tips, pointerPercent) {
        // Animasi Count-Up Angka BMI
        animateCountUp(bmiValueEl, calc.bmi);

        // Badge Status
        bmiCategoryBadge.className = `status-badge bg-${calc.statusKey}`;
        bmiCategoryText.textContent = calc.category;
        indicatorCategoryLabel.textContent = calc.category;
        indicatorCategoryLabel.className = `text-${calc.statusKey}`;

        // Pointer Needle Spektrum
        scalePointer.style.left = `${pointerPercent}%`;
        pointerLabel.textContent = `${calc.bmi}`;

        // Metrik Ekstra
        idealWeightVal.textContent = `${calc.idealWeightRange}`;
        bmrVal.textContent = `${calc.bmr} kkal`;
        tdeeVal.textContent = `${calc.tdee} kkal`;

        // Penjelasan Box
        explanationBox.className = `explanation-card border-${calc.statusKey}`;
        explanationText.innerHTML = explanation;

        // Render List Saran
        suggestionsList.innerHTML = '';
        tips.forEach(t => {
            const item = document.createElement('div');
            item.className = 'tip-item';
            item.innerHTML = `
                <div class="tip-icon icon-${calc.statusKey}">${t.icon}</div>
                <div class="tip-body">
                    <h4>${t.title}</h4>
                    <p>${t.desc}</p>
                </div>
            `;
            suggestionsList.appendChild(item);
        });

        // Buka container hasil
        resultContainer.classList.add('active');

        // Scroll halus ke container hasil
        setTimeout(() => {
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 150);
    }

    // Animasi angka count-up
    function animateCountUp(element, target) {
        const duration = 600;
        const start = performance.now();
        function frame(time) {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            const current = progress * (2 - progress) * target;
            element.textContent = current.toFixed(1);
            if (progress < 1) {
                requestAnimationFrame(frame);
            } else {
                element.textContent = target.toFixed(1);
            }
        }
        requestAnimationFrame(frame);
    }

    // --- Reset Form ---
    btnReset.addEventListener('click', () => {
        weightInput.value = '';
        heightInput.value = '';
        if (ageInput) ageInput.value = '';
        hideErrors();
        resultContainer.classList.remove('active');
        weightInput.focus();
    });

    // Perubahan standar memicu hitung ulang otomatis jika sudah ada hasil
    standardSelect.addEventListener('change', () => {
        if (resultContainer.classList.contains('active')) {
            bmiForm.dispatchEvent(new Event('submit'));
        }
    });

    // --- Copy Ringkasan ke Clipboard ---
    btnCopy.addEventListener('click', () => {
        if (!currentCalculation) return;

        const textToCopy = `📋 LAPORAN KESEHATAN BMI
---------------------------
• Berat Badan: ${currentCalculation.weight} kg
• Tinggi Badan: ${currentCalculation.height} cm
• Skor BMI: ${currentCalculation.bmi}
• Status: ${currentCalculation.category} (${currentCalculation.standard})
• Kisaran Berat Ideal: ${currentCalculation.idealWeightRange}
• Kalori Harian (TDEE): ${currentCalculation.tdee} kkal/hari
---------------------------
Dihitung otomatis melalui Kalkulator BMI & Kesehatan.`;

        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('✅ Ringkasan berhasil disalin ke clipboard!');
        }).catch(() => {
            showToast('⚠️ Gagal menyalin ringkasan.');
        });
    });

    // --- Cetak / Simpan PDF ---
    btnPrint.addEventListener('click', () => {
        window.print();
    });

    // --- Toast Notification ---
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // --- Riwayat (LocalStorage) ---
    function getHistory() {
        try {
            return JSON.parse(localStorage.getItem('fitmeter_history')) || [];
        } catch {
            return [];
        }
    }

    function saveHistoryItem(item) {
        const hist = getHistory();
        hist.unshift(item);
        if (hist.length > 5) hist.pop(); // Simpan maksimal 5 riwayat terbaru
        localStorage.setItem('fitmeter_history', JSON.stringify(hist));
        renderHistory();
    }

    function renderHistory() {
        const hist = getHistory();
        if (!historyList) return;

        if (hist.length === 0) {
            historyList.innerHTML = '<div class="history-empty">Belum ada riwayat pengukuran yang tersimpan.</div>';
            return;
        }

        historyList.innerHTML = '';
        hist.forEach((h) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-meta">
                    <strong>${h.weight} kg / ${h.height} cm</strong>
                    <span class="history-date">${h.date} &bull; ${h.standard}</span>
                </div>
                <div class="history-score-badge">
                    <span class="history-bmi-val text-${h.statusKey}">BMI ${h.bmi}</span>
                    <span class="history-category-pill bg-${h.statusKey}">${h.category}</span>
                </div>
            `;
            historyList.appendChild(div);
        });
    }

    btnSaveHistory.addEventListener('click', () => {
        if (!currentCalculation) return;
        saveHistoryItem(currentCalculation);
        showToast('💾 Hasil pengukuran disimpan ke riwayat!');
    });

    btnClearHistory.addEventListener('click', () => {
        localStorage.removeItem('fitmeter_history');
        renderHistory();
        showToast('🗑️ Riwayat pengukuran telah dihapus.');
    });

    // Render riwayat awal saat dimuat
    renderHistory();
});

