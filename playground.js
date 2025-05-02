/* C‑Terminal Playground ─ 풀‑툴박스 & 커스텀 테마 */

let workspace;
let terminal;
let isRunning = false;
const STORAGE_KEY = 'c‑terminal‑playground‑project';

/* ────────────────────────────────────
   1)  전체 툴박스 JSON (원본 app.js 동일 구성)  :contentReference[oaicite:0]{index=0}
   ──────────────────────────────────── */
const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    /* 로직 */
    { kind: 'category', name: '로직', colour: '#4C97FF', contents: [
      { kind:'block', type:'controls_if' },
      { kind:'block', type:'logic_compare' },
      { kind:'block', type:'logic_operation' },
      { kind:'block', type:'logic_negate' },
      { kind:'block', type:'logic_boolean' },
      { kind:'block', type:'logic_null' },
      { kind:'block', type:'logic_ternary' }
    ]},

    /* 반복 */
    { kind:'category', name:'반복', colour:'#5CA65C', contents:[
      {kind:'block',type:'controls_repeat_ext'},
      {kind:'block',type:'controls_whileUntil'},
      {kind:'block',type:'controls_for'},
      {kind:'block',type:'controls_forEach'},
      {kind:'block',type:'controls_flow_statements'}
    ]},

    /* 수학 */
    { kind:'category', name:'수학', colour:'#5CA65C', contents:[
      {kind:'block',type:'math_number'},
      {kind:'block',type:'math_arithmetic'},
      {kind:'block',type:'math_single'},
      {kind:'block',type:'math_trig'},
      {kind:'block',type:'math_constant'},
      {kind:'block',type:'math_number_property'},
      {kind:'block',type:'math_round'},
      {kind:'block',type:'math_modulo'},
      {kind:'block',type:'math_constrain'},
      {kind:'block',type:'math_random_int'},
      {kind:'block',type:'math_random_float'}
    ]},

    /* 텍스트 */
    { kind:'category', name:'텍스트', colour:'#A65CA6', contents:[
      {kind:'block',type:'text'},
      {kind:'block',type:'text_join'},
      {kind:'block',type:'text_append'},
      {kind:'block',type:'text_length'},
      {kind:'block',type:'text_isEmpty'},
      {kind:'block',type:'text_indexOf'},
      {kind:'block',type:'text_charAt'},
      {kind:'block',type:'text_getSubstring'},
      {kind:'block',type:'text_changeCase'},
      {kind:'block',type:'text_trim'},
      {kind:'block',type:'text_print'}
    ]},

    /* 변수·함수 */
    { kind:'category', name:'변수', colour:'#A6745C', custom:'VARIABLE' },
    { kind:'category', name:'함수', colour:'#745CA6', custom:'PROCEDURE' },

    /* ───────── 커스텀 카테고리 ───────── */
    /* 터미널 기본 */  { kind:'category', name:'터미널', colour:'#333333', contents:[
      {kind:'block',type:'terminal_print'},
      {kind:'block',type:'terminal_print_inline'},
      {kind:'block',type:'terminal_clear'},
      {kind:'block',type:'terminal_input'},
      {kind:'block',type:'terminal_cursor_position'},
      {kind:'block',type:'terminal_wait'}
    ]},

    /* 텍스트 스타일 */ {kind:'category',name:'텍스트 스타일',colour:'#FF9800',contents:[
      {kind:'block',type:'terminal_text_color'},
      {kind:'block',type:'terminal_text_style'}
    ]},

    /* 고급 출력 */ {kind:'category',name:'고급 출력',colour:'#2196F3',contents:[
      {kind:'block',type:'terminal_table'},
      {kind:'block',type:'terminal_box'},
      {kind:'block',type:'terminal_notification_box'},
      {kind:'block',type:'terminal_code_highlight'}
    ]},

    /* 애니메이션 */ {kind:'category',name:'애니메이션',colour:'#E91E63',contents:[
      {kind:'block',type:'terminal_animated_text'},
      {kind:'block',type:'terminal_spinner'},
      {kind:'block',type:'terminal_progress_bar'},
      {kind:'block',type:'terminal_ascii_art'}
    ]},

    /* 차트/그래프 */ {kind:'category',name:'차트/그래프',colour:'#00BCD4',contents:[
      {kind:'block',type:'terminal_histogram'},
      {kind:'block',type:'terminal_ascii_graph'}
    ]},

    /* 화면 제어 */ {kind:'category',name:'화면 제어',colour:'#9C27B0',contents:[
      {kind:'block',type:'terminal_clear_screen'},
      {kind:'block',type:'terminal_split_screen'}
    ]},

    /* 배열 */ {kind:'category',name:'배열',colour:'#A6745C',contents:[
      {kind:'block',type:'array_create'},
      {kind:'block',type:'array_get_item'},
      {kind:'block',type:'array_set_item'},
      {kind:'block',type:'array_length'},
      {kind:'block',type:'array_push'},
      {kind:'block',type:'array_remove_at'}
    ]},

    /* 문자열 */ {kind:'category',name:'문자열',colour:'#A65CA6',contents:[
      {kind:'block',type:'string_concat'},
      {kind:'block',type:'string_substring'},
      {kind:'block',type:'string_split'}
    ]},

    /* 고급 수학 */ {kind:'category',name:'고급 수학',colour:'#5CA65C',contents:[
      {kind:'block',type:'math_random_float_advanced'},
      {kind:'block',type:'math_function'}
    ]},

    /* 시간 */ {kind:'category',name:'시간',colour:'#5C81A6',contents:[
      {kind:'block',type:'time_current'},
      {kind:'block',type:'terminal_wait'}
    ]},

    /* 게임 */ {kind:'category',name:'게임',colour:'#FF5252',contents:[
      {kind:'block',type:'game_difficulty'},
      {kind:'block',type:'game_score'}
    ]},

    /* 알고리즘 */ {kind:'category',name:'알고리즘',colour:'#795548',contents:[
      {kind:'block',type:'algorithm_sort_array'},
      {kind:'block',type:'algorithm_search_array'}
    ]}
  ]
};

/* ───────────────────────────────
   2)  커스텀 테마 (기존 색상 유지)  :contentReference[oaicite:1]{index=1}:contentReference[oaicite:2]{index=2}
   ─────────────────────────────── */
const customTheme = Blockly.Theme.defineTheme('simpleRounded', {
    'base': Blockly.Themes.Classic,
        'blockStyles': {
            // 각 카테고리별 색상 조정 - 더 밝고 선명하게
            'logic_blocks': { 'colourPrimary': '#6b96c1' },
            'loop_blocks': { 'colourPrimary': '#6bc16b' },
            'math_blocks': { 'colourPrimary': '#5cd65c' },
            'text_blocks': { 'colourPrimary': '#c16bc1' },
            'variable_blocks': { 'colourPrimary': '#c18b6b' },
            'procedure_blocks': { 'colourPrimary': '#8b6bc1' },
            'terminal_blocks': { 'colourPrimary': '#5a5a5a' },
            'styling_blocks': { 'colourPrimary': '#ffad33' },
            'output_blocks': { 'colourPrimary': '#33adff' },
            'animation_blocks': { 'colourPrimary': '#ff3377' },
            'chart_blocks': { 'colourPrimary': '#33ddff' },
            'ui_blocks': { 'colourPrimary': '#b333ff' },
            'list_blocks': { 'colourPrimary': '#c18b6b' },
            'array_blocks': { 'colourPrimary': '#c18b6b' },
            'string_blocks': { 'colourPrimary': '#c16bc1' },
            'time_blocks': { 'colourPrimary': '#6b96c1' },
            'game_blocks': { 'colourPrimary': '#ff6b6b' },
            'algorithm_blocks': { 'colourPrimary': '#8d6e63' }
        },
        'componentStyles': {
            'workspaceBackgroundColour': '#f5f5f5',
            'toolboxBackgroundColour': '#fafafa',
            'toolboxForegroundColour': '#333',
            'flyoutBackgroundColour': '#f0f0f0',
            'flyoutForegroundColour': '#333',
            'flyoutOpacity': 0.9,
            'scrollbarColour': '#bbb',
            'scrollbarOpacity': 0.5
        },
        'fontStyle': {
            'family': 'Arial, sans-serif',
            'weight': 'bold', // 전체 텍스트 볼드 처리
            'size': 11 // 전체 텍스트 크기 조정
          }
        });

/* ───────────────────────────────
   3)  초기화
   ─────────────────────────────── */
window.addEventListener('DOMContentLoaded',() =>{
  initPlayground();
  loadProject();
  setTimeout(()=>Blockly.svgResize(workspace),0);
});

function initPlayground(){
  if(workspace) return;

  /* ► Blockly */
  workspace = Blockly.inject('blockly-container',{
    toolbox,
    theme: customTheme,
    renderer: 'geras',     // 기본 렌더러 (둥근 코너 적용됨)
    trashcan:true,
    scrollbars:true,
    zoom:{controls:true,wheel:true,startScale:1,minScale:0.3,maxScale:3,scaleSpeed:1.2},
    grid:{spacing:20,length:3,colour:'#ccc',snap:true}
  });

  /* ► XTerm */
  terminal = new Terminal({theme:{background:'#1e1e1e',foreground:'#f8f8f8'}});
  terminal.open(document.getElementById('terminal'));

  /* 버튼 이벤트 */
  document.getElementById('run-btn')  .addEventListener('click',runCode);
  document.getElementById('save-btn') .addEventListener('click',saveProject);
  document.getElementById('share-btn').addEventListener('click',shareProject);
  document.getElementById('clear-terminal-btn').addEventListener('click',()=>terminal.clear());

  initResizeHandle();
}

/* ───────────────────────────────
   4)  코드 실행
   ─────────────────────────────── */
async function runCode(){
  if(isRunning) return;
  isRunning = true;
  const runBtn = document.getElementById('run-btn');
  runBtn.innerHTML='<i class="fas fa-spinner fa-spin"></i> 실행 중';

  terminal.clear();
  const code = Blockly.JavaScript.workspaceToCode(workspace);

  const nativeLog = console.log;
  console.log = (...args)=>terminal.writeln(args.join(' '));

  try{ await eval(`(async () => { ${code} })()`); }
  catch(err){ terminal.writeln(`\u001b[31m[Error] ${err.message}\u001b[0m`); }
  finally{
    console.log = nativeLog;
    runBtn.innerHTML='<i class="fas fa-play"></i> 실행';
    isRunning = false;
  }
}

/* ───────────────────────────────
   5)  저장 / 불러오기
   ─────────────────────────────── */
function saveProject(){
  const xml = Blockly.serialization.workspaces.save(workspace);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    title: document.getElementById('project-title').value.trim()||'제목 없는 프로젝트',
    blocks: xml
  }));
  document.getElementById('project-status').textContent='저장됨';
}

function loadProject(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return;
  try{
    const data = JSON.parse(raw);
    document.getElementById('project-title').value = data.title||'제목 없는 프로젝트';
    Blockly.serialization.workspaces.load(data.blocks,workspace);
    document.getElementById('project-status').textContent='로드됨';
  }catch(e){console.error(e);}
}

/* ───────────────────────────────
   6)  공유
   ─────────────────────────────── */
function shareProject(){
  const xml = Blockly.serialization.workspaces.save(workspace);
  const payload = btoa(JSON.stringify({title:document.getElementById('project-title').value,blocks:xml}));
  navigator.clipboard.writeText(payload)
    .then(()=>alert('클립보드에 복사했습니다!'))
    .catch(err=>alert('복사 실패: '+err));
}

/* ───────────────────────────────
   7)  리사이즈 핸들
   ─────────────────────────────── */
function initResizeHandle(){
  const handle=document.getElementById('resize-handle');
  const blockDiv=document.getElementById('blockly-container');
  let dragging=false,startX=0,startWidth=0;

  handle.addEventListener('mousedown',e=>{
    dragging=true;startX=e.clientX;startWidth=blockDiv.offsetWidth;
    handle.classList.add('active');e.preventDefault();
  });
  window.addEventListener('mousemove',e=>{
    if(!dragging)return;
    const dx=e.clientX-startX;
    blockDiv.style.width=`${Math.max(100,startWidth+dx)}px`;
    Blockly.svgResize(workspace);
  });
  window.addEventListener('mouseup',()=>{dragging=false;handle.classList.remove('active');});
}
