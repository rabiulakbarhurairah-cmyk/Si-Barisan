/*=============== CONFIG ===============*/
// Alamat Web App Google Apps Script (penyimpanan terpusat di Google Sheets + Sign In).
// Kosongkan "" untuk mode lokal: tanpa login, data hanya tersimpan di perangkat ini.
const API_URL = "https://script.google.com/macros/s/AKfycbzCZJsPYjRp_Xh-5j3QVsXz6SLAuiURxowcLbPdeV2P7vZvF9F7tgSqtu587FwzS0e_/exec"

// Foto kartu indikator: isi dengan nama file foto yang satu folder dengan index.html.
// Urutan: Bersih, Asri, Rindang, Indah, Sehat, Aman, Nyaman. Kosongkan "" untuk foto bawaan.
// Contoh: ["bersih.jpg", "asri.jpg", "rindang.jpg", "indah.jpg", "sehat.jpg", "aman.jpg", "nyaman.jpg"]
const FOTO_INDIKATOR = ["", "", "", "", "", "", ""]

// Daftar indikator: [nama, satuan, foto bawaan]
const INDIKATOR = [
    ['Bersih', 'kegiatan', 'beach'],
    ['Asri', 'kegiatan', 'isl'],
    ['Rindang', 'kegiatan', 'alp'],
    ['Indah', 'kegiatan', 'lake'],
    ['Sehat', 'kegiatan', 'bg'],
    ['Aman', 'kegiatan', 'alp'],
    ['Nyaman', 'kegiatan', 'isl'],
]

const STORAGE_KEY = 'bsipakainge-monev'
const CENTRAL = Boolean(API_URL)
const IMG = window.ASSETS || {}

const $ = (selector, root = document) => root.querySelector(selector)
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)]

document.documentElement.classList.add('js')

/*=============== LOAD IMAGES ===============*/
$$('[data-img]').forEach(img =>{
    if(IMG[img.dataset.img]) img.src = IMG[img.dataset.img]
})

/*=============== SHOW MENU ===============*/
const navMenu = $('#nav-menu'),
      navToggle = $('#nav-toggle'),
      navClose = $('#nav-close')

/* Menu show */
if(navToggle){
    navToggle.addEventListener('click', () =>{
        navMenu.classList.add('show')
    })
}

/* Menu hidden */
if(navClose){
    navClose.addEventListener('click', () =>{
        navMenu.classList.remove('show')
    })
}

/*=============== REMOVE MENU MOBILE ===============*/
const navLink = $$('.nav__link')

const linkAction = () =>{
    // When we click on each nav__link, we remove the show class
    navMenu.classList.remove('show')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/*=============== DARK LIGHT THEME ===============*/
const themeButtons = $$('.js-theme')

const setTheme = (theme) =>{
    document.documentElement.dataset.theme = theme
    themeButtons.forEach(button =>{
        button.innerHTML = `<svg class="i"><use href="#${theme === 'dark' ? 'sun' : 'moon'}"/></svg>`
    })
}

// Previously selected theme (if user selected)
let selectedTheme = null
try{ selectedTheme = localStorage.getItem('theme') }catch(e){}
setTheme(selectedTheme || 'light')

// Active / deactive the theme manually with the button
themeButtons.forEach(button => button.addEventListener('click', () =>{
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
    setTheme(theme)
    try{ localStorage.setItem('theme', theme) }catch(e){}
}))

/*=============== SLIDER HOME & TESTIMONIAL ===============*/
const initSlider = (slider) =>{
    const track = $('.slider__track', slider),
          total = $$('.slide', slider).length
    let index = 0,
        timer,
        startX = null

    const goTo = (n) =>{
        index = (n + total) % total
        track.style.transform = `translateX(-${index * 100}%)`
    }

    const play = () =>{
        const delay = Number(slider.dataset.auto)
        if(delay && !matchMedia('(prefers-reduced-motion: reduce)').matches){
            clearInterval(timer)
            timer = setInterval(() => goTo(index + 1), delay)
        }
    }

    $('.prev', slider).addEventListener('click', () =>{ goTo(index - 1); play() })
    $('.next', slider).addEventListener('click', () =>{ goTo(index + 1); play() })

    slider.addEventListener('mouseenter', () => clearInterval(timer))
    slider.addEventListener('mouseleave', play)

    slider.addEventListener('touchstart', e =>{ startX = e.touches[0].clientX }, {passive: true})
    slider.addEventListener('touchend', e =>{
        if(startX === null) return
        const diff = e.changedTouches[0].clientX - startX
        if(Math.abs(diff) > 40){
            goTo(index + (diff < 0 ? 1 : -1))
            play()
        }
        startX = null
    })

    play()
}
$$('.slider').forEach(initSlider)

/*=============== CHANGE BACKGROUND HEADER ===============*/
const header = $('#header')

const scrollHeader = () =>{
    // Add a class if the bottom offset is greater than 40 of the viewport
    header.classList.toggle('scrolled', window.scrollY > 40)
}
window.addEventListener('scroll', scrollHeader, {passive: true})

/*=============== SHOW SCROLL UP ===============*/
const scrollUpButton = $('#scroll-up')

const scrollUp = () =>{
    // When the scroll is higher than 350 viewport height, add the show class
    scrollUpButton.classList.toggle('show', window.scrollY > 350)
}
window.addEventListener('scroll', scrollUp, {passive: true})

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = $$('main section[id]')

const scrollActive = () =>{
    const scrollY = window.scrollY
    let currentId = sections[0].id

    sections.forEach(current =>{
        if(scrollY + 120 >= current.offsetTop) currentId = current.id
    })

    navLink.forEach(link =>{
        link.classList.toggle('active-link', link.getAttribute('href') === '#' + currentId)
    })
}
window.addEventListener('scroll', scrollActive, {passive: true})

scrollHeader()
scrollUp()
scrollActive()

/*=============== SCROLL REVEAL ANIMATION ===============*/
const revealItems = $$('.rv')

if('IntersectionObserver' in window){
    const observer = new IntersectionObserver(entries =>{
        entries.forEach(entry =>{
            if(entry.isIntersecting){
                entry.target.classList.add('in')
                observer.unobserve(entry.target)
            }
        })
    }, {threshold: .12})

    revealItems.forEach(item => observer.observe(item))
}else{
    revealItems.forEach(item => item.classList.add('in'))
}

/*=============== DATA STORAGE (LOCAL MODE) ===============*/
const loadLocal = () =>{
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
    catch(e){ return memoryData }
}

const saveLocal = (list) =>{
    memoryData = list
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) }catch(e){}
}

let memoryData = []
let reports = CENTRAL ? [] : loadLocal()

const saveReports = (list) =>{
    reports = list
    if(!CENTRAL) saveLocal(list)
}

/*=============== SIGN IN SESSION ===============*/
const SESSION_KEY = 'si-barisan-session'
const STORES = ['sessionStorage', 'localStorage']
let session = null // {token, user}

const readSession = () =>{
    for(const name of STORES){
        try{
            const saved = JSON.parse(window[name].getItem(SESSION_KEY))
            if(saved && saved.token && saved.user) return saved
        }catch(e){}
    }
    return null
}

const clearSession = () =>{
    STORES.forEach(name =>{
        try{ window[name].removeItem(SESSION_KEY) }catch(e){}
    })
}

const writeSession = (data, remember) =>{
    clearSession()
    try{ window[remember ? 'localStorage' : 'sessionStorage'].setItem(SESSION_KEY, JSON.stringify(data)) }catch(e){}
}

const isAdmin = () => Boolean(session && session.user && session.user.peran === 'admin')

// Local mode has no accounts, so everything can be deleted. Central mode: admin only.
const canDelete = () => !CENTRAL || isAdmin()

/*=============== SIGN IN PAGE ===============*/
const loginForm = $('#login-form'),
      loginUser = $('#login-user'),
      loginPass = $('#login-pass'),
      loginRemember = $('#login-remember'),
      loginButton = $('#login-button'),
      loginMessage = $('#login-msg'),
      passToggle = $('#pass-toggle'),
      navUser = $('#nav-user'),
      logoutButton = $('#logout-button')

const showLoginMessage = (text, success) =>{
    loginMessage.textContent = text
    loginMessage.style.color = success ? '#1f8a5b' : '#d64545'
}

const setLoginBusy = (busy) =>{
    loginButton.disabled = busy
    loginUser.disabled = busy
    loginPass.disabled = busy
}

const lockApp = () =>{
    document.body.classList.add('locked')
    window.scrollTo(0, 0)
}

const unlockApp = () =>{
    document.body.classList.remove('locked')
}

const loginError = (err) =>{
    if(err instanceof TypeError) return 'Tidak dapat terhubung ke server. Periksa koneksi internet.'
    if(err instanceof SyntaxError) return 'Jawaban server tidak dikenali. Pastikan deployment Apps Script sudah versi terbaru.'
    return err.message || 'Gagal masuk.'
}

/* Show / hide password */
passToggle.addEventListener('click', () =>{
    const show = loginPass.type === 'password'
    loginPass.type = show ? 'text' : 'password'
    passToggle.setAttribute('aria-label', show ? 'Sembunyikan password' : 'Tampilkan password')
    passToggle.innerHTML = `<svg class="i"><use href="#${show ? 'eye-off' : 'eye'}"/></svg>`
})

/*=============== GOOGLE SHEETS (CENTRAL MODE) ===============*/
const statusText = $('#stat')

const setStatus = (text) =>{
    statusText.textContent = text
}

// Session is no longer valid (expired, signed out): back to the Sign In page
const expireSession = (text, success) =>{
    session = null
    clearSession()
    reports = []
    render()
    setStatus('')
    lockApp()
    showLoginMessage(text || 'Sesi berakhir. Silakan masuk lagi.', Boolean(success))
}

const callApi = (body) =>{
    const payload = session ? {...body, token: session.token} : body

    return fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'text/plain;charset=utf-8'},
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(json =>{
            if(json && json.auth && session) expireSession(json.error)
            return json
        })
}

const normalize = (row) =>({
    id: String(row.id),
    tgl: String(row.tgl).slice(0, 10),
    nama: String(row.nama),
    wil: String(row.wil),
    sk: String(row.sk),
    ind: Number(row.ind),
    tg: parseFloat(row.tg),
    rl: parseFloat(row.rl),
    cat: String(row.cat || ''),
    by: String(row.by || '')
})

// Returns true when the data was loaded
const refresh = () =>{
    if(!CENTRAL || !session) return Promise.resolve(false)

    setStatus('Memuat data dari Google Sheets...')
    return callApi({action: 'list'})
        .then(json =>{
            if(json.auth) throw new Error('auth')
            if(!json.ok) throw new Error('Gagal memuat')
            reports = json.data.map(normalize).filter(r => r.ind >= 0 && r.ind < INDIKATOR.length && r.tg > 0 && !isNaN(r.rl))
            render()
            const time = new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})
            setStatus(`Terhubung ke Google Sheets. Diperbarui ${time}.`)
            return true
        })
        .catch(err =>{
            if(err.message !== 'auth') setStatus('Gagal memuat data dari Google Sheets. Periksa koneksi atau alamat Apps Script.')
            return false
        })
}

// Fill region and work unit from the signed-in account (can still be edited)
const fillProfile = () =>{
    if(CENTRAL && session){
        $('#wil').value = session.user.wilayah || ''
        $('#sk').value = session.user.satker || ''
    }
}

const applyUser = () =>{
    if(!session) return
    navUser.textContent = `${session.user.nama} (${isAdmin() ? 'Admin' : 'Operator'})`
    fillProfile()
    render()
}

/* Sign in */
loginForm.addEventListener('submit', e =>{
    e.preventDefault()

    const username = loginUser.value.trim(),
          password = loginPass.value

    if(!username || !password){
        showLoginMessage('Isi username dan password.', false)
        return
    }
    if(!CENTRAL) return

    setLoginBusy(true)
    showLoginMessage('Memeriksa akun...', true)

    callApi({action: 'login', username, password})
        .then(res =>{
            if(!res.ok) throw new Error(res.error || 'Gagal masuk.')
            session = {token: res.token, user: res.user}
            writeSession(session, loginRemember.checked)
            loginPass.value = ''
            return refresh()
        })
        .then(loaded =>{
            if(!loaded){
                session = null
                clearSession()
                throw new Error('Berhasil masuk, tetapi data gagal dimuat. Silakan coba lagi.')
            }
            showLoginMessage('', true)
            unlockApp()
            applyUser()
        })
        .catch(err => showLoginMessage(loginError(err), false))
        .finally(() => setLoginBusy(false))
})

/* Sign out */
logoutButton.addEventListener('click', () =>{
    if(!confirm('Keluar dari Si-Barisan?')) return
    callApi({action: 'logout'}).catch(() =>{})
    expireSession('Anda sudah keluar.', true)
})

/*=============== HELPERS ===============*/
const escapeHtml = (text) =>{
    const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}
    return String(text).replace(/[&<>"']/g, c => map[c])
}

const percent = (done, target) => target > 0 ? Math.round(done / target * 100) : 0

const pillClass = (p) => p >= 80 ? '' : p >= 50 ? ' m' : ' l'

/*=============== INDICATOR SELECT ===============*/
const indicatorSelect = $('#ind')

INDIKATOR.forEach((item, i) => indicatorSelect.add(new Option(item[0], i)))

const updateUnit = () =>{
    const unit = `(${INDIKATOR[indicatorSelect.value][1]})`
    $('#u1').textContent = unit
    $('#u2').textContent = unit
}
indicatorSelect.addEventListener('change', updateUnit)
updateUnit()

/*=============== RENDER DASHBOARD, CARDS & TABLE ===============*/
const render = () =>{
    let totalDone = 0,
        totalTarget = 0,
        thisMonth = 0
    const regions = {},
          currentMonth = new Date().toISOString().slice(0, 7)

    reports.forEach(r =>{
        totalDone += r.rl
        totalTarget += r.tg
        regions[r.wil.toLowerCase()] = true
        if(r.tgl.slice(0, 7) === currentMonth) thisMonth++
    })

    /* Summary */
    const overall = percent(totalDone, totalTarget)
    $('#s1').textContent = reports.length
    $('#s2').textContent = overall + '%'
    $('#s3').textContent = Object.keys(regions).length
    $('#s4').textContent = thisMonth
    $('#sb').style.width = Math.min(overall, 100) + '%'

    /* Indicator cards */
    $('#cards').innerHTML = INDIKATOR.map((item, i) =>{
        let done = 0,
            target = 0

        reports.forEach(r =>{
            if(r.ind === i){
                done += r.rl
                target += r.tg
            }
        })

        const p = percent(done, target),
              photo = FOTO_INDIKATOR[i] ? encodeURI(FOTO_INDIKATOR[i]) : (IMG[item[2]] || '')

        return `
            <article class="destination__card">
                <img src="${escapeHtml(photo)}" alt="" class="destination__img">
                <div class="destination__data">
                    <h3 class="destination__subtitle">${done} / ${target} ${item[1]}</h3>
                    <h2 class="destination__title">${escapeHtml(item[0])}</h2>
                    <p class="destination__country"><b>${p}%</b>&nbsp;capaian</p>
                    <div class="trk"><i style="width:${Math.min(p, 100)}%"></i></div>
                </div>
            </article>`
    }).join('')

    // If a photo file is not found, use the default photo
    $$('#cards img').forEach((img, i) =>{
        img.addEventListener('error', () =>{ img.src = IMG[INDIKATOR[i][2]] || '' }, {once: true})
    })

    /* Report table */
    $('#tb').innerHTML = reports.slice().sort((a, b) => b.tgl.localeCompare(a.tgl)).map(r =>{
        const p = percent(r.rl, r.tg),
              indikator = INDIKATOR[r.ind],
              by = r.by ? ' &middot; oleh ' + escapeHtml(r.by) : ''

        return `
            <tr>
                <td>${escapeHtml(r.tgl)}</td>
                <td><b>${escapeHtml(r.nama)}</b><br><small>${escapeHtml(r.sk)}${r.cat ? ' &middot; ' + escapeHtml(r.cat) : ''}${by}</small></td>
                <td>${escapeHtml(r.wil)}</td>
                <td>${escapeHtml(indikator[0])}</td>
                <td>${r.rl} / ${r.tg} ${indikator[1]}</td>
                <td><span class="pill${pillClass(p)}">${p}%</span></td>
                <td>${canDelete() ? `<button class="button line" data-id="${escapeHtml(r.id)}">Hapus</button>` : ''}</td>
            </tr>`
    }).join('')

    $('#em').style.display = reports.length ? 'none' : 'block'
}

/*=============== INPUT REPORT FORM ===============*/
const form = $('#f'),
      message = $('#msg')

const showMessage = (text, success) =>{
    message.textContent = text
    message.style.color = success ? '#1f8a5b' : '#d64545'
}

form.addEventListener('submit', e =>{
    e.preventDefault()

    const report = {
        nama: $('#nama').value.trim(),
        tgl: $('#tgl').value,
        wil: $('#wil').value.trim(),
        sk: $('#sk').value.trim(),
        ind: Number(indicatorSelect.value),
        tg: parseFloat($('#tg').value),
        rl: parseFloat($('#rl').value),
        cat: $('#cat').value.trim(),
        id: String(Date.now())
    }

    if(!report.nama || !report.tgl || !report.wil || !report.sk || !(report.tg > 0) || isNaN(report.rl) || report.rl < 0){
        showMessage('Lengkapi semua kolom wajib. Target harus lebih dari 0.', false)
        return
    }

    // Central mode: save to Google Sheets
    if(CENTRAL){
        showMessage('Menyimpan ke Google Sheets...', true)
        callApi({action: 'add', row: report})
            .then(res =>{
                if(res.auth) return
                if(!res.ok) throw new Error(res.error || 'Gagal menyimpan')
                form.reset()
                fillProfile()
                updateUnit()
                return refresh().then(() => showMessage('Laporan tersimpan di Google Sheets.', true))
            })
            .catch(err => showMessage(err instanceof TypeError ? 'Gagal menyimpan. Periksa koneksi internet.' : (err.message || 'Gagal menyimpan.'), false))
        return
    }

    // Local mode: save in this device
    saveReports([...reports, report])
    form.reset()
    updateUnit()
    render()
    showMessage('Laporan tersimpan. Capaian sudah diperbarui.', true)
})

/*=============== DELETE REPORT ===============*/
$('#tb').addEventListener('click', e =>{
    const button = e.target.closest('[data-id]')
    if(!button || !canDelete() || !confirm('Hapus laporan ini?')) return

    const id = button.dataset.id

    if(CENTRAL){
        callApi({action: 'delete', id})
            .then(res =>{
                if(res.auth) return
                if(!res.ok) throw new Error(res.error || 'Gagal menghapus')
                return refresh()
            })
            .catch(err => alert(err instanceof TypeError ? 'Gagal menghapus. Periksa koneksi internet.' : (err.message || 'Gagal menghapus.')))
        return
    }

    saveReports(reports.filter(r => r.id !== id))
    render()
})

$('#clr').addEventListener('click', () =>{
    if(reports.length && confirm('Hapus semua laporan?')){
        saveReports([])
        render()
    }
})

/*=============== SAMPLE DATA ===============*/
// Format: [kegiatan, wilayah, satuan kerja, indeks indikator, target, realisasi]
const sampleData = [
    ['Kerja bakti dan pemilahan sampah', 'Kota Makassar', 'MAN 3 Kota Makassar', 0, 10, 8],
    ['Penataan taman madrasah', 'Kab. Gowa', 'MTsN 1 Gowa', 1, 5, 4],
    ['Tanam pohon di halaman masjid', 'Kab. Maros', 'KUA Maros Baru', 2, 20, 12],
    ['Pengecatan dan penghiasan lingkungan', 'Kab. Bone', 'KUA Tanete Riattang', 3, 6, 3],
    ['Senam dan sosialisasi hidup sehat', 'Kab. Wajo', 'Kemenag Wajo', 4, 8, 8],
    ['Piket dan patroli lingkungan', 'Kab. Soppeng', 'MAN Soppeng', 5, 10, 7],
    ['Penataan ruang ibadah dan kelas', 'Kab. Takalar', 'MIN 1 Takalar', 6, 6, 5],
]

$('#demo').addEventListener('click', () =>{
    const today = new Date().toISOString().slice(0, 10),
          now = Date.now()

    const samples = sampleData.map((item, i) =>({
        nama: item[0],
        wil: item[1],
        sk: item[2],
        ind: item[3],
        tg: item[4],
        rl: item[5],
        tgl: today,
        cat: 'Contoh data',
        id: String(now + i),
        by: ''
    }))

    saveReports([...reports, ...samples])
    render()
})

/*=============== DOWNLOAD CSV ===============*/
const csvCell = (value) =>{
    let text = String(value)
    // Prevent spreadsheet formula injection
    if(/^[=+\-@]/.test(text)) text = "'" + text
    return '"' + text.replace(/"/g, '""') + '"'
}

$('#csv').addEventListener('click', () =>{
    if(!reports.length){
        alert('Belum ada data untuk diunduh.')
        return
    }

    const header = ['Tanggal', 'Kegiatan', 'Wilayah', 'Satuan Kerja', 'Indikator', 'Target', 'Realisasi', 'Capaian (%)', 'Catatan', 'Diinput Oleh']
    const rows = reports.map(r => [
        r.tgl, r.nama, r.wil, r.sk, INDIKATOR[r.ind][0], r.tg, r.rl, percent(r.rl, r.tg), r.cat, r.by || ''
    ])

    const csv = [header, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n')

    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob(['\ufeff' + csv], {type: 'text/csv;charset=utf-8'}))
    link.download = 'si-barisan.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
})

/*=============== START APP ===============*/
if(CENTRAL){
    // Central mode: hide local-only buttons, show refresh, auto refresh every minute
    $('#demo').style.display = 'none'
    $('#clr').style.display = 'none'
    $('#rf').style.display = ''
    $('#rf').addEventListener('click', refresh)

    setInterval(() =>{
        if(!document.hidden && session) refresh()
    }, 60000)

    // Continue a previous session if it is still valid
    session = readSession()
    if(session){
        setLoginBusy(true)
        showLoginMessage('Memeriksa sesi...', true)

        refresh().then(loaded =>{
            setLoginBusy(false)
            if(loaded){
                showLoginMessage('', true)
                unlockApp()
                applyUser()
            }else if(session){
                // could not reach the server: ask to sign in again
                session = null
                showLoginMessage('Tidak dapat memeriksa sesi. Periksa koneksi, lalu masuk lagi.', false)
            }
        })
    }
}else{
    // Local mode: no accounts, open the app directly
    unlockApp()
    logoutButton.style.display = 'none'
    navUser.style.display = 'none'
    setStatus('Mode lokal: data hanya tersimpan di perangkat ini.')
}

render()
