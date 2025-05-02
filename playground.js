/* C‑Terminal Playground 전용 JS  */
let workspace;
let terminal;
let isRunning = false;
const STORAGE_KEY = 'c‑terminal‑playground‑project';

/* ---------- 초기화 ---------- */
window.addEventListener('DOMContentLoaded', () => {
  initPlayground();
  loadProject();
  // DOM이 완전히 그려진 다음 한 번 더 리사이즈 → 툴박스 안 보이는 현상 방지
  setTimeout(() => Blockly.svgResize(workspace), 0);
});

/* ---------- 플레이그라운드 ---------- */
function initPlayground() {
  if (workspace) return;

  /* Blockly */
  workspace = Blockly.inject('blockly-container', {
    toolbox: document.getElementById('toolbox'),  // XML 툴박스
    trashcan: true,
    zoom: { controls:true, wheel:true, startScale:1 },
    grid:  { spacing:20, length:3, colour:'#ccc', snap:true }
  });

  /* XTerm */
  terminal = new Terminal({ theme:{ background:'#1e1e1e', foreground:'#f8f8f8' } });
  terminal.open(document.getElementById('terminal'));

  /* 이벤트 */
  document.getElementById('run-btn')  .addEventListener('click', runCode);
  document.getElementById('save-btn') .addEventListener('click', saveProject);
  document.getElementById('share-btn').addEventListener('click', shareProject);
  document.getElementById('clear-terminal-btn').addEventListener('click', () => terminal.clear());

  /* 리사이즈 핸들 */
  initResizeHandle();
}

/* ---------- 코드 실행 ---------- */
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

/* ---------- 저장/불러오기 ---------- */
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

/* ---------- 공유 ---------- */
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

/* ---------- 리사이즈 핸들 ---------- */
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
