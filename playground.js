/* C‑Terminal Playground 전용 JS
 * ──────────────────────────────
 * ① 사용자 정의 테마(customTheme) 추가  ←★ 새로 들어간 부분
 * ② Blockly.inject() 시 theme: customTheme 전달
 *    → 기존 기능·이벤트·로직은 전부 그대로 보존
 */

let workspace;
let terminal;
let isRunning = false;
const STORAGE_KEY = 'c‑terminal‑playground‑project';

/* ───────── ① 사용자 정의 테마 ───────── */
const customTheme = Blockly.Theme.defineTheme('customTheme', {
  /* 기존 Classic 테마를 베이스로 사용 */
  base: Blockly.Themes.Classic,

  /* 카테고리 색상 커스터마이징 ‑ 필요에 맞게 값만 바꾸면 됨 */
  categoryStyles: {
    logic_category:     { colour: '#4C97FF' },  // 로직
    loop_category:      { colour: '#FFAB19' },  // 루프
    math_category:      { colour: '#FF6680' },  // 수학
    text_category:      { colour: '#FFB347' },  // 텍스트
    list_category:      { colour: '#5BA55B' },  // 리스트
    colour_category:    { colour: '#A6745B' },  // 색상
    variable_category:  { colour: '#FF8C1A' },  // 변수
    procedure_category: { colour: '#FF6680' },  // 함수
    /* 사용자 정의: 터미널 */
    terminal_category:  { colour: '#333333' }
  },

  /* 블록 스타일(필요 없으면 그대로 두세요) */
  blockStyles: {
    // 예시: 터미널 블록 계열을 한꺼번에 지정
    terminal_blocks: { colourPrimary: '#333333', colourSecondary: '#222222', colourTertiary: '#111111' }
  }
});


/* ───────── 초기화 ───────── */
window.addEventListener('DOMContentLoaded', () => {
  initPlayground();
  loadProject();
  setTimeout(() => Blockly.svgResize(workspace), 0); // 툴박스 렌더 고정
});

/* ───────── 플레이그라운드 ───────── */
function initPlayground() {
  if (workspace) return;

  /* Blockly */
  workspace = Blockly.inject('blockly-container', {
    toolbox: document.getElementById('toolbox'),  // XML 툴박스
    theme: customTheme,                           // ★ 사용자 정의 테마 적용
    trashcan: true,
    zoom: { controls: true, wheel: true, startScale: 1 },
    grid: { spacing: 20, length: 3, colour: '#ccc', snap: true }
  });

  /* XTerm */
  terminal = new Terminal({ theme: { background: '#1e1e1e', foreground: '#f8f8f8' } });
  terminal.open(document.getElementById('terminal'));

  /* 이벤트 */
  document.getElementById('run-btn')  .addEventListener('click', runCode);
  document.getElementById('save-btn') .addEventListener('click', saveProject);
  document.getElementById('share-btn').addEventListener('click', shareProject);
  document.getElementById('clear-terminal-btn').addEventListener('click', () => terminal.clear());

  /* 리사이즈 핸들 */
  initResizeHandle();
}

/* ───────── 코드 실행 ───────── */
async function runCode() {
  if (isRunning) return;
  isRunning = true;
  const runBtn = document.getElementById('run-btn');
  runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 실행 중';

  terminal.clear();
  const code = Blockly.JavaScript.workspaceToCode(workspace);

  const nativeLog = console.log;
  console.log = (...args) => terminal.writeln(args.join(' '));

  try {
    /* eslint‑disable no-eval */
    await eval(`(async () => { ${code} })()`);
  } catch (err) {
    terminal.writeln(`\u001b[31m[Error] ${err.message}\u001b[0m`);
  } finally {
    console.log = nativeLog;
    runBtn.innerHTML = '<i class="fas fa-play"></i> 실행';
    isRunning = false;
  }
}

/* ───────── 저장/불러오기 ───────── */
function saveProject() {
  const xml = Blockly.serialization.workspaces.save(workspace);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    title: document.getElementById('project-title').value.trim() || '제목 없는 프로젝트',
    blocks: xml
  }));
  document.getElementById('project-status').textContent = '저장됨';
}

function loadProject() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    document.getElementById('project-title').value = data.title || '제목 없는 프로젝트';
    Blockly.serialization.workspaces.load(data.blocks, workspace);
    document.getElementById('project-status').textContent = '로드됨';
  } catch (e) { console.error(e); }
}

/* ───────── 공유 ───────── */
function shareProject() {
  const xml = Blockly.serialization.workspaces.save(workspace);
  const payload = btoa(JSON.stringify({
    title: document.getElementById('project-title').value,
    blocks: xml
  }));
  navigator.clipboard.writeText(payload)
    .then(() => alert('클립보드에 복사했습니다!'))
    .catch(err => alert('복사 실패: ' + err));
}

/* ───────── 리사이즈 핸들 ───────── */
function initResizeHandle() {
  const handle   = document.getElementById('resize-handle');
  const blockDiv = document.getElementById('blockly-container');
  let dragging = false, startX = 0, startWidth = 0;

  handle.addEventListener('mousedown', e => {
    dragging = true; startX = e.clientX; startWidth = blockDiv.offsetWidth;
    handle.classList.add('active'); e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    blockDiv.style.width = `${Math.max(100, startWidth + dx)}px`;
    Blockly.svgResize(workspace);
  });
  window.addEventListener('mouseup', () => {
    dragging = false; handle.classList.remove('active');
  });
}
