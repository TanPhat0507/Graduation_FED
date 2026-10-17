'use strict';

/*
  Bản ĐƠN GIẢN HÓA — chỉ dùng kiến thức đã học qua Lesson 9 -> 13:
  - Lesson 9 : biến, lấy/đổi nội dung phần tử bằng JS
  - Lesson 10: hàm, sự kiện (addEventListener), setTimeout
  - Lesson 11: điều kiện if/else, mảng, vòng lặp for
  - Lesson 12: template literal (dấu backtick `)
  - Lesson 13: (phần hoạt ảnh nằm ở CSS, không cần code JS riêng)

  KHÔNG dùng (vì thuộc Lesson 14 - đang "Developing", hoặc chưa học):
  - location.hash / sự kiện hashchange (thuộc BOM, Lesson 14)
  - Set, spread "...", destructuring, .map()/.find()/.join(), closest()
  Thay vào đó dùng mảng thường + vòng lặp for + if/else cho mọi thứ.
*/

/* ---------- Dữ liệu ---------- */
const state = {
  coins: 100000,
  tab: 'daily',
  // passLevel: 0,
  // passXp: 162,     // 162/200 = 81%
  // passNeed: 200,
};

let ownedStars = [];   // mảng chứa id các cầu thủ đã ký (thay cho Set)

const quests = {
  daily: [
    { id: 'd1', title: 'Score 100 goals', progress: 55, target: 100, reward: 500, claimed: false },
    { id: 'd2', title: 'Assist with LW', progress: 10, target: 10, reward: 500, claimed: false },
  ],
  weekly: [
    { id: 'w1', title: 'Win 5 matches', progress: 3, target: 5, reward: 1200, claimed: false },
    { id: 'w2', title: 'Keep 3 clean sheets', progress: 3, target: 3, reward: 800, claimed: false },
  ],
  season: [
    { id: 's1', title: 'Score 500 goals', progress: 120, target: 500, reward: 5000, claimed: false },
  ],
};
// Danh sách cầu thủ ở trang Home (thêm người mới = thêm 1 object)
const players = [
  {
    name: 'Lamine Yamal', img: 'images/yamal.png',
    meta: 'RW FC Barcelona Spain',
    bio: 'A left-footed forward known for his dribbling, passing.',
    stats: [
      { value: '52', label: 'goals' },
      { value: '149', label: 'official matches' },
      { value: '1.78 m', label: 'height' },
    ],
  },
  {
    name: 'Kylian Mbappé', img: 'images/mbappe.png',
    meta: 'LW Real Madrid France',
    bio: 'A lightning-fast forward known for his speed and finishing.',
    stats: [
      { value: '48', label: 'goals' },
      { value: '91', label: 'official matches' },
      { value: '1.78 m', label: 'height' },
    ],
  },
  {
    name: 'Gareth Bale', img: 'images/bale.png',
    meta: 'RW Real Madrid Wales',
    bio: 'A powerful winger known for his pace and long-range shots.',
    stats: [
      { value: '41', label: 'goals' },
      { value: '111', label: 'official matches' },
      { value: '1.83 m', label: 'height' },
    ],
  },
];

let playerIndex = 0;   // đang hiển thị cầu thủ số mấy (0 = người đầu tiên)
const stars = [
  { id: 'bale', name: 'Bale', price: 15000, img: 'images/bale.png' },
  { id: 'mbappe', name: 'Mbappé', price: 12000, img: 'images/mbappe.png' },
  { id: 'maradona', name: 'Maradona', price: 9000, img: 'images/maradona.png' },
  { id: 'courtois', name: 'Courtois', price: 11000, img: 'images/courtois.png' },
];

// const XP_PER_CLAIM = 40;

/* ---------- Hàm tiện ích (Lesson 9 - DOM) ---------- */
function $(selector) {
  return document.querySelector(selector);
}
function $all(selector) {
  return document.querySelectorAll(selector);
}
function fmt(n) {
  return n.toLocaleString('en-US');
}

/* ---------- Toast (Lesson 10 - setTimeout) ---------- */
let toastTimer;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    el.classList.remove('is-visible');
  }, 2200);
}

/* ---------- Số dư coin ---------- */
function renderCoins() {
  const coinEls = $all('.js-coins');
  for (let i = 0; i < coinEls.length; i++) {
    coinEls[i].textContent = fmt(state.coins);
  }
}

/* ---------- Chuyển trang (Home / Quests / Star signings) ---------- */
function showPage(name) {
  const pages = $all('.page');
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    if (p.id === 'page-' + name) {
      p.hidden = false;
    } else {
      p.hidden = true;
    }
  }

  const menuButtons = $all('.menu__item');
  for (let i = 0; i < menuButtons.length; i++) {
    const btn = menuButtons[i];
    if (btn.dataset.page === name) {
      btn.classList.add('is-active');
      btn.setAttribute('aria-current', 'page');
    } else {
      btn.classList.remove('is-active');
      btn.removeAttribute('aria-current');
    }
  }
}

function setupMenu() {
  const menuButtons = $all('.menu__item');
  for (let i = 0; i < menuButtons.length; i++) {
    menuButtons[i].addEventListener('click', function () {
      showPage(this.dataset.page);
    });
  }
}

/* ---------- Quests ---------- */
function questStatus(q) {
  if (q.claimed) {
    return 'done';
  }
  if (q.progress >= q.target) {
    return 'ready';
  }
  return 'progress';
}

// function renderPass() {
//   $('#pass-level').textContent = state.passLevel;

//   let percent = (state.passXp / state.passNeed) * 100;
//   if (percent > 100) {
//     percent = 100;
//   }
//   $('#pass-fill').style.width = percent + '%';
// }

function renderQuests() {
  const list = quests[state.tab];
  let html = '';

  for (let i = 0; i < list.length; i++) {
    const q = list[i];
    const status = questStatus(q);

    let percent = (q.progress / q.target) * 100;
    if (percent > 100) {
      percent = 100;
    }

    let label = 'In progress';
    if (status === 'ready') {
      label = 'Claim';
    }
    if (status === 'done') {
      label = 'Claimed';
    }

    let extraClass = '';
    if (status === 'done') {
      extraClass = ' is-done';
    }

    let disabledAttr = 'disabled';
    if (status === 'ready') {
      disabledAttr = '';
    }

    html += `
      <div class="card">
        <div class="card__head">
          <span>${q.title}&nbsp;&nbsp;-&nbsp;&nbsp;${q.progress}/${q.target}</span>
          <span class="reward"><img class="coin" src="images/coin.png" alt="">${fmt(q.reward)}</span>
        </div>
        <div class="progress"><div class="progress__fill" style="width:${percent}%"></div></div>
        <button class="btn-pill${extraClass}" data-claim="${q.id}" ${disabledAttr}>
          ${label}
        </button>
      </div>`;
  }

  $('#quest-list').innerHTML = html;
  setupClaimButtons();   // gắn lại sự kiện vì nút vừa được tạo mới
}

// function addXp(amount) {
//   state.passXp += amount;
//   if (state.passXp >= state.passNeed) {
//     state.passXp -= state.passNeed;
//     state.passLevel += 1;
//   }
//   renderPass();
// }

function setupTabs() {
  const tabButtons = $all('.tab');
  for (let i = 0; i < tabButtons.length; i++) {
    tabButtons[i].addEventListener('click', function () {
      state.tab = this.dataset.tab;

      for (let j = 0; j < tabButtons.length; j++) {
        if (tabButtons[j] === this) {
          tabButtons[j].classList.add('is-active');
        } else {
          tabButtons[j].classList.remove('is-active');
        }
      }
      renderQuests();
    });
  }
}

function findQuestById(id) {
  const list = quests[state.tab];
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return list[i];
    }
  }
  return null;
}

function setupClaimButtons() {
  const claimButtons = $all('[data-claim]');
  for (let i = 0; i < claimButtons.length; i++) {
    claimButtons[i].addEventListener('click', function () {
      if (this.disabled) {
        return;
      }

      const quest = findQuestById(this.dataset.claim);
      if (quest === null || quest.claimed) {
        return;
      }

      quest.claimed = true;
      state.coins += quest.reward;
      // addXp(XP_PER_CLAIM);
      renderCoins();
      renderQuests();
      toast('+' + fmt(quest.reward) + ' coins');
    });
  }
}

/* ---------- Star signings ---------- */
function isOwned(id) {
  for (let i = 0; i < ownedStars.length; i++) {
    if (ownedStars[i] === id) {
      return true;
    }
  }
  return false;
}

function findStarById(id) {
  for (let i = 0; i < stars.length; i++) {
    if (stars[i].id === id) {
      return stars[i];
    }
  }
  return null;
}

function renderSignings() {
  let html = '';

  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    const owned = isOwned(s.id);

    let extraClass = '';
    let disabledAttr = '';
    let label = 'Sign star';
    if (owned) {
      extraClass = ' is-done';
      disabledAttr = 'disabled';
      label = 'Signed';
    }

    html += `
      <div class="sign-card">
        <img src="${s.img}" alt="${s.name} player card">
        <div class="price"><img class="coin" src="images/coin.png" alt="">${fmt(s.price)}</div>
        <button class="btn-pill${extraClass}" data-sign="${s.id}" ${disabledAttr}>
          ${label}
        </button>
      </div>`;
  }

  $('#signing-grid').innerHTML = html;
  setupSignButtons();   // gắn lại sự kiện vì nút vừa được tạo mới
}

function setupSignButtons() {
  const signButtons = $all('[data-sign]');
  for (let i = 0; i < signButtons.length; i++) {
    signButtons[i].addEventListener('click', function () {
      const star = findStarById(this.dataset.sign);
      if (star === null || isOwned(star.id)) {
        return;
      }

      if (state.coins < star.price) {
        toast('Need ' + fmt(star.price - state.coins) + ' more coins');
        return;
      }

      state.coins -= star.price;
      ownedStars.push(star.id);
      renderCoins();
      renderSignings();
      toast(star.name + ' signed!');
    });
  }
}
/* ---------- Home: chuyển qua lại giữa các cầu thủ ---------- */
function renderPlayer() {
  const p = players[playerIndex];

  $('#player-img').src = p.img;
  $('#player-img').alt = p.name + ' player card';
  $('#player-name').textContent = p.name;
  $('#player-meta').textContent = p.meta;
  $('#player-bio').textContent = p.bio;

  // 3 ô thống kê
  let statsHtml = '';
  for (let i = 0; i < p.stats.length; i++) {
    const s = p.stats[i];
    statsHtml += `<li class="stat"><strong>${s.value}</strong><span>${s.label}</span></li>`;
  }
  $('#player-stats').innerHTML = statsHtml;

  // chấm tròn: chấm của cầu thủ đang xem sẽ có màu xanh
  let dotsHtml = '';
  for (let i = 0; i < players.length; i++) {
    let dotClass = 'dot';
    if (i === playerIndex) {
      dotClass = 'dot is-active';
    }
    dotsHtml += `<span class="${dotClass}"></span>`;
  }
  $('#player-dots').innerHTML = dotsHtml;
}

function setupPlayerSwitch() {
  $('#next-player').addEventListener('click', function () {
    playerIndex++;
    if (playerIndex >= players.length) {
      playerIndex = 0;                    // hết người cuối -> quay về đầu
    }
    renderPlayer();
  });

  $('#prev-player').addEventListener('click', function () {
    playerIndex--;
    if (playerIndex < 0) {
      playerIndex = players.length - 1;   // đang ở người đầu -> nhảy về cuối
    }
    renderPlayer();
  });
}
/* ---------- Khởi động trang ---------- */
/* ---------- Hiệu ứng nghiêng 3D theo chuột (Module 6 - Lesson 1) ---------- */
// Càng xa tâm màn hình, thẻ càng nghiêng. Góc tối đa = 20 độ.
// Công thức tỉ lệ: góc = 20 * dx / (innerWidth / 2)
const MAX_ANGLE = 20;

function tiltCards(angleX, angleY) {
  // Xoay quanh trục X là lên/xuống => dùng angleY, và ngược lại
  const transformValue = `rotateX(${angleY}deg) rotateY(${angleX}deg)`;

  // Các thẻ ở trang Star signings (tạo bằng JS nên phải tìm lại mỗi lần)
  const signImgs = $all('.sign-card > img');
  for (let i = 0; i < signImgs.length; i++) {
    signImgs[i].style.transform = transformValue;
  }
}

function setupTilt() {
  document.addEventListener('mousemove', function (e) {
    const dx = e.pageX - window.innerWidth / 2;
    const dy = e.pageY - window.innerHeight / 2;

    const angleX = MAX_ANGLE * dx / (window.innerWidth / 2);
    const angleY = MAX_ANGLE * dy / (window.innerHeight / 2);

    tiltCards(angleX, angleY);
  });

  // Chuột rời khỏi cửa sổ -> thẻ trở lại thẳng
  document.addEventListener('mouseleave', function () {
    tiltCards(0, 0);
  });
}
setupMenu();
setupTabs();
setupTilt();
setupPlayerSwitch();   // <-- THÊM
renderPlayer();
renderCoins();
// renderPass();
renderQuests();
renderSignings();
showPage('home');