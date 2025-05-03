/* ─────────────────────────────────────────────────────────
 *  C‑Terminal Playground  —  Full Version
 *      · process 폴리필
 *      · CustomRenderer(둥근 모서리 + 4px 테두리)
 *      · ConstantProvider 오버라이드
 *      · 원본 app.js 전체 툴박스 JSON
 *      · 실행 / 저장 / 불러오기 / 공유 / 리사이즈
 *      · alert/prompt/console 터미널 리다이렉션 추가
 * ───────────────────────────────────────────────────────── */

let workspace;
let terminal;
let isRunning = false;
const STORAGE_KEY = 'c‑terminal‑playground‑project';

/* 0) 브라우저용 process 폴리필 ─────────────────────────── */
(function polyfillProcess () {
  if (typeof globalThis.process !== 'undefined') return;
  globalThis.process = {
    env     : {},
    nextTick: cb => Promise.resolve().then(cb),
    stdout  : { write: txt => terminal ? terminal.write(String(txt)) : console.log(String(txt)) },
    stderr  : { write: txt => terminal ? terminal.write(String(txt)) : console.error(String(txt)) }
  };
})();

/* 1) ConstantProvider – 모서리/탭/노치 원본 값 */
const CP = Blockly.blockRendering.ConstantProvider.prototype;
CP.CORNER_RADIUS          = 25;
CP.OUTSIDE_CORNER_RADIUS  = 25;
CP.NO_PADDING             = 0;
CP.SHADOW_OFFSET          = 0;
CP.NOTCH_WIDTH            = 20;
CP.NOTCH_HEIGHT           = 15;
CP.TAB_HEIGHT             = 20;
CP.TAB_RADIUS             = 20;

/* 2) CustomRenderer – 4 px 테두리 */
const BORDER_WIDTH = 4;
class CustomRenderer extends Blockly.blockRendering.Renderer {
  makePathObject (constants) {
    const obj = super.makePathObject(constants);
    const orig = obj.drawSolidHighlighted;
    obj.drawSolidHighlighted = function (pattern, colour) {
      orig.call(this, pattern, colour);
      const darker = Blockly.utils.colour.blend('#000000', colour, 0.3);
      this.ctx_.save();
      this.ctx_.strokeStyle = darker;
      this.ctx_.lineWidth   = BORDER_WIDTH;
      this.ctx_.lineJoin    = 'round';
      this.ctx_.lineCap     = 'round';
      this.ctx_.stroke();
      this.ctx_.restore();
    };
    return obj;
  }
}
Blockly.blockRendering.register('custom_renderer', CustomRenderer);

/* 3) Custom Theme – 원본 색상 */
const customTheme = Blockly.Theme.defineTheme('simpleRounded', {
  base: Blockly.Themes.Classic,
  blockStyles: {
    logic_blocks:     { colourPrimary:'#6b96c1' },
    loop_blocks:      { colourPrimary:'#6bc16b' },
    math_blocks:      { colourPrimary:'#5cd65c' },
    text_blocks:      { colourPrimary:'#c16bc1' },
    variable_blocks:  { colourPrimary:'#c18b6b' },
    procedure_blocks: { colourPrimary:'#8b6bc1' },
    terminal_blocks:  { colourPrimary:'#5a5a5a' },
    styling_blocks:   { colourPrimary:'#ffad33' },
    output_blocks:    { colourPrimary:'#33adff' },
    animation_blocks: { colourPrimary:'#ff3377' },
    chart_blocks:     { colourPrimary:'#33ddff' },
    ui_blocks:        { colourPrimary:'#b333ff' },
    list_blocks:      { colourPrimary:'#c18b6b' },
    array_blocks:     { colourPrimary:'#c18b6b' },
    string_blocks:    { colourPrimary:'#c16bc1' },
    time_blocks:      { colourPrimary:'#6b96c1' },
    game_blocks:      { colourPrimary:'#ff6b6b' },
    algorithm_blocks: { colourPrimary:'#8d6e63' }
  },
  componentStyles: {
    workspaceBackgroundColour : '#f5f5f5',
    toolboxBackgroundColour   : '#fafafa',
    toolboxForegroundColour   : '#333',
    flyoutBackgroundColour    : '#f0f0f0',
    flyoutForegroundColour    : '#333',
    flyoutOpacity             : 0.9,
    scrollbarColour           : '#bbb',
    scrollbarOpacity          : 0.5
  },
  fontStyle: { family:'Arial, sans-serif', weight:'bold', size:11 }
});

/* 4) Full Toolbox JSON (원본 app.js 전체) */
const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    /* ─ 기본 카테고리 ─ */
    { kind:'category', name:'로직', colour:'#6b96c1', contents:[
      {kind:'block',type:'controls_if'},
      {kind:'block',type:'logic_compare'},
      {kind:'block',type:'logic_operation'},
      {kind:'block',type:'logic_negate'},
      {kind:'block',type:'logic_boolean'},
      {kind:'block',type:'logic_null'},
      {kind:'block',type:'logic_ternary'}
    ]},
    { kind:'category', name:'반복', colour:'#6bc16b', contents:[
      {kind:'block',type:'controls_repeat_ext',
        inputs:{TIMES:{shadow:{type:'math_number',fields:{NUM:10}}}}},
      {kind:'block',type:'controls_whileUntil'},
      {kind:'block',type:'controls_for',
        inputs:{
          FROM:{shadow:{type:'math_number',fields:{NUM:1}}},
          TO  :{shadow:{type:'math_number',fields:{NUM:10}}},
          BY  :{shadow:{type:'math_number',fields:{NUM:1}}}
        }},
      {kind:'block',type:'controls_forEach'},
      {kind:'block',type:'controls_flow_statements'}
    ]},
    { kind:'category', name:'수학', colour:'#5cd65c', contents:[
      {kind:'block',type:'math_number',fields:{NUM:0}},
      {kind:'block',type:'math_arithmetic'},
      {kind:'block',type:'math_single'},
      {kind:'block',type:'math_trig'},
      {kind:'block',type:'math_constant'},
      {kind:'block',type:'math_number_property'},
      {kind:'block',type:'math_round'},
      {kind:'block',type:'math_modulo'},
      {kind:'block',type:'math_constrain',
        inputs:{
          LOW :{shadow:{type:'math_number',fields:{NUM:1}}},
          HIGH:{shadow:{type:'math_number',fields:{NUM:100}}}
        }},
      {kind:'block',type:'math_random_int',
        inputs:{
          FROM:{shadow:{type:'math_number',fields:{NUM:1}}},
          TO  :{shadow:{type:'math_number',fields:{NUM:100}}}
        }},
      {kind:'block',type:'math_random_float'}
    ]},
    { kind:'category', name:'텍스트', colour:'#c16bc1', contents:[
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
    { kind:'category', name:'목록', colour:'#c18b6b', contents:[
      {kind:'block',type:'lists_create_with'},
      {kind:'block',type:'lists_repeat',
        inputs:{NUM:{shadow:{type:'math_number',fields:{NUM:5}}}}},
      {kind:'block',type:'lists_length'},
      {kind:'block',type:'lists_isEmpty'},
      {kind:'block',type:'lists_indexOf'},
      {kind:'block',type:'lists_getIndex'},
      {kind:'block',type:'lists_setIndex'},
      {kind:'block',type:'lists_split'}
    ]},
    { kind:'category', name:'색상', colour:'#a6745b', contents:[
      {kind:'block',type:'colour_picker'},
      {kind:'block',type:'colour_random'},
      {kind:'block',type:'colour_rgb',
        inputs:{
          RED  :{shadow:{type:'math_number',fields:{NUM:255}}},
          GREEN:{shadow:{type:'math_number',fields:{NUM:0}}},
          BLUE :{shadow:{type:'math_number',fields:{NUM:0}}}
        }},
      {kind:'block',type:'colour_blend',
        inputs:{
          RATIO:{shadow:{type:'math_number',fields:{NUM:0.5}}}
        }}
    ]},
    { kind:'sep' },
    { kind:'category', name:'변수', colour:'#c18b6b', custom:'VARIABLE' },
    { kind:'category', name:'함수', colour:'#8b6bc1', custom:'PROCEDURE' },
    /* ─ 커스텀 카테고리 ─ */
    { kind:'sep' },
    { kind:'category', name:'터미널', colour:'#5a5a5a', contents:[
      {kind:'block',type:'terminal_print'},
      {kind:'block',type:'terminal_print_inline'},
      {kind:'block',type:'terminal_clear'},
      {kind:'block',type:'terminal_input'},
      {kind:'block',type:'terminal_cursor_position'},
      {kind:'block',type:'terminal_wait'}
    ]},
    { kind:'category', name:'텍스트 스타일', colour:'#ffad33', contents:[
      {kind:'block',type:'terminal_text_color'},
      {kind:'block',type:'terminal_text_style'}
    ]},
    { kind:'category', name:'고급 출력', colour:'#33adff', contents:[
      {kind:'block',type:'terminal_table'},
      {kind:'block',type:'terminal_box'},
      {kind:'block',type:'terminal_notification_box'},
      {kind:'block',type:'terminal_code_highlight'}
    ]},
    { kind:'category', name:'애니메이션', colour:'#ff3377', contents:[
      {kind:'block',type:'terminal_animated_text'},
      {kind:'block',type:'terminal_spinner'},
      {kind:'block',type:'terminal_progress_bar'},
      {kind:'block',type:'terminal_ascii_art'}
    ]},
    { kind:'category', name:'차트/그래프', colour:'#33ddff', contents:[
      {kind:'block',type:'terminal_histogram'},
      {kind:'block',type:'terminal_ascii_graph'}
    ]},
    { kind:'category', name:'화면 제어', colour:'#b333ff', contents:[
      {kind:'block',type:'terminal_clear_screen'},
      {kind:'block',type:'terminal_split_screen'}
    ]},
    { kind:'category', name:'배열', colour:'#c18b6b', contents:[
      {kind:'block',type:'array_create'},
      {kind:'block',type:'array_get_item'},
      {kind:'block',type:'array_set_item'},
      {kind:'block',type:'array_length'},
      {kind:'block',type:'array_push'},
      {kind:'block',type:'array_remove_at'}
    ]},
    { kind:'category', name:'문자열', colour:'#c16bc1', contents:[
      {kind:'block',type:'string_concat'},
      {kind:'block',type:'string_substring'},
      {kind:'block',type:'string_split'}
    ]},
    { kind:'category', name:'고급 수학', colour:'#5cd65c', contents:[
      {kind:'block',type:'math_random_float_advanced'},
      {kind:'block',type:'math_function'}
    ]},
    { kind:'category', name:'시간', colour:'#6b96c1', contents:[
      {kind:'block',type:'time_current'},
      {kind:'block',type:'terminal_wait'}
    ]},
    { kind:'category', name:'게임', colour:'#ff6b6b', contents:[
      {kind:'block',type:'game_difficulty'},
      {kind:'block',type:'game_score'}
    ]},
    { kind:'category', name:'알고리즘', colour:'#8d6e63', contents:[
      {kind:'block',type:'algorithm_sort_array'},
      {kind:'block',type:'algorithm_search_array'}
    ]}
  ]
};

/* 5) 브라우저 함수 터미널 리다이렉션 */
function initTerminalRedirection() {
  if (!terminal) return;
  
  // 원본 함수 저장
  const originalAlert = window.alert;
  const originalPrompt = window.prompt;
  const originalConfirm = window.confirm;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleInfo = console.info;
  
  // 1. alert() → 터미널에 출력
  window.alert = function(message) {
    const formattedMessage = `\u001b[31m[알림] ${message}\u001b[0m`;
    terminal.writeln(formattedMessage);
    
    // 알림 경계선 추가
    const width = Math.min(message.toString().length + 8, 60);
    terminal.writeln(`\u001b[31m${'─'.repeat(width)}\u001b[0m`);
    
    // 사용자 확인을 기다리기
    terminal.writeln("\u001b[33m[Enter 키를 눌러 계속하세요...]\u001b[0m");
    
    // 실제 사용자 상호작용없이 진행하기 위해 Promise 반환
    return new Promise(resolve => {
      const disposable = terminal.onKey(key => {
        if (key.domEvent.key === 'Enter') {
          disposable.dispose();
          terminal.writeln('');
          resolve();
        }
      });
    });
  };
  
  // 2. prompt() → 터미널에서 입력 받기
  window.prompt = function(message, defaultValue = '') {
    return new Promise(resolve => {
      // 프롬프트 메시지 출력
      terminal.writeln(`\u001b[34m[입력] ${message}\u001b[0m`);
      
      // 기본값과 함께 입력란 표시
      terminal.write(`\u001b[33m> \u001b[0m`);
      
      let inputBuffer = defaultValue;
      terminal.write(inputBuffer);
      
      // 커서 위치 (입력값의 끝)
      let cursorPosition = inputBuffer.length;
      
      // 입력 처리 핸들러
      const disposable = terminal.onKey(key => {
        const ev = key.domEvent;
        
        // Enter 키: 입력 완료
        if (ev.key === 'Enter') {
          disposable.dispose();
          terminal.writeln('');
          resolve(inputBuffer);
        } 
        // 백스페이스 키: 문자 삭제
        else if (ev.key === 'Backspace') {
          if (cursorPosition > 0) {
            inputBuffer = inputBuffer.substring(0, cursorPosition - 1) + 
                        inputBuffer.substring(cursorPosition);
            cursorPosition--;
            
            // 현재 라인 지우기 및 다시 표시
            terminal.write('\r\u001b[K');
            terminal.write(`\u001b[33m> \u001b[0m${inputBuffer}`);
            
            // 커서 위치 조정
            if (cursorPosition < inputBuffer.length) {
              terminal.write(`\u001b[${inputBuffer.length - cursorPosition}D`);
            }
          }
        }
        // 일반 문자: 입력에 추가
        else if (ev.key.length === 1) {
          // 커서 위치에 문자 삽입
          inputBuffer = inputBuffer.substring(0, cursorPosition) + 
                       ev.key + 
                       inputBuffer.substring(cursorPosition);
          cursorPosition++;
          
          // 현재 라인 지우기 및 다시 표시
          terminal.write('\r\u001b[K');
          terminal.write(`\u001b[33m> \u001b[0m${inputBuffer}`);
          
          // 커서 위치 조정
          if (cursorPosition < inputBuffer.length) {
            terminal.write(`\u001b[${inputBuffer.length - cursorPosition}D`);
          }
        }
        // 좌우 화살표 키: 커서 이동
        else if (ev.key === 'ArrowLeft' && cursorPosition > 0) {
          cursorPosition--;
          terminal.write('\u001b[D');
        }
        else if (ev.key === 'ArrowRight' && cursorPosition < inputBuffer.length) {
          cursorPosition++;
          terminal.write('\u001b[C');
        }
      });
    });
  };
  
  // 3. confirm() → 터미널에서 예/아니오 선택
  window.confirm = function(message) {
    return new Promise(resolve => {
      // 확인 메시지 출력
      terminal.writeln(`\u001b[35m[확인] ${message}\u001b[0m`);
      terminal.writeln(`\u001b[33m[Y/N 키를 눌러 응답하세요]\u001b[0m`);
      
      // 키 입력 처리
      const disposable = terminal.onKey(key => {
        const keyPressed = key.domEvent.key.toLowerCase();
        
        if (keyPressed === 'y') {
          disposable.dispose();
          terminal.writeln('\u001b[32m[예]\u001b[0m');
          resolve(true);
        } 
        else if (keyPressed === 'n') {
          disposable.dispose();
          terminal.writeln('\u001b[31m[아니오]\u001b[0m');
          resolve(false);
        }
        // 다른 키는 무시
      });
    });
  };
  
  // 4. console 메소드 리다이렉션
  console.log = function(...args) {
    terminal.writeln(args.join(' '));
    // 원래 콘솔에도 출력 (디버깅 목적)
    // originalConsoleLog.apply(console, args);
  };
  
  console.error = function(...args) {
    terminal.writeln(`\u001b[31m[오류] ${args.join(' ')}\u001b[0m`);
    // 원래 콘솔에도 출력 (디버깅 목적)
    // originalConsoleError.apply(console, args);
  };
  
  console.warn = function(...args) {
    terminal.writeln(`\u001b[33m[경고] ${args.join(' ')}\u001b[0m`);
    // 원래 콘솔에도 출력 (디버깅 목적)
    // originalConsoleWarn.apply(console, args);
  };
  
  console.info = function(...args) {
    terminal.writeln(`\u001b[36m[정보] ${args.join(' ')}\u001b[0m`);
    // 원래 콘솔에도 출력 (디버깅 목적)
    // originalConsoleInfo.apply(console, args);
  };
  
  // 5. 터미널 초기화 메시지
  terminal.writeln('\u001b[32mC-Terminal이 시작되었습니다. 브라우저 기능이 모두 터미널로 리다이렉션됩니다.\u001b[0m');
  terminal.writeln('alert(), prompt(), confirm(), console.log()가 이제 터미널 내부에서 동작합니다.');
  terminal.writeln('-'.repeat(60));
}

/* 6) 초기화 */
window.addEventListener('DOMContentLoaded', () => {
  initPlayground();
  loadProject();
  setTimeout(() => {
    Blockly.svgResize(workspace);
    initTerminalRedirection(); // 터미널 리다이렉션 초기화
  }, 100);
});

function initPlayground () {
  if (workspace) return;

  workspace = Blockly.inject('blockly-container', {
    toolbox,
    theme     : customTheme,
    renderer  : 'custom_renderer',
    trashcan  : true,
    scrollbars: true,
    zoom      : { controls:true, wheel:true, startScale:1, minScale:0.3, maxScale:3, scaleSpeed:1.2 },
    grid      : { spacing:20, length:3, colour:'#ccc', snap:true }
  });

  terminal = new Terminal({ theme:{ background:'#1e1e1e', foreground:'#f8f8f8' } });
  terminal.open(document.getElementById('terminal'));

  document.getElementById('run-btn')  .addEventListener('click', runCode);
  document.getElementById('save-btn') .addEventListener('click', saveProject);
  document.getElementById('share-btn').addEventListener('click', shareProject);
  document.getElementById('clear-terminal-btn').addEventListener('click', () => terminal.clear());

  initResizeHandle();
}

/* 7) 코드 실행 - 수정된 버전 */
function runCode() {
  if (isRunning) return;
  isRunning = true;
  const runBtn = document.getElementById('run-btn');
  runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 실행 중';

  terminal.clear();
  const code = Blockly.JavaScript.workspaceToCode(workspace);

  try {
    /* eslint-disable no-eval */
    eval(`(async () => { ${code} })()`);
  } catch (err) {
    terminal.writeln(`\u001b[31m[Error] ${err.message}\u001b[0m`);
  } finally {
    runBtn.innerHTML = '<i class="fas fa-play"></i> 실행';
    isRunning = false;
  }
}

/* 8) 저장 / 불러오기 */
function saveProject() {
  const xml = Blockly.serialization.workspaces.save(workspace);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    title: document.getElementById('project-title').value.trim() || '제목 없는 프로젝트',
    blocks: xml
  }));
  document.getElementById('project-status').textContent = '저장됨';
  
  // 터미널에도 저장 메시지 출력
  terminal.writeln('\u001b[32m[성공] 프로젝트가 저장되었습니다.\u001b[0m');
}

function loadProject() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    document.getElementById('project-title').value = data.title || '제목 없는 프로젝트';
    Blockly.serialization.workspaces.load(data.blocks, workspace);
    document.getElementById('project-status').textContent = '로드됨';
    
    // 터미널에 로드 메시지 표시 (초기화 후에만)
    if (terminal) {
      terminal.writeln('\u001b[32m[정보] 저장된 프로젝트를 불러왔습니다.\u001b[0m');
    }
  } catch (e) { 
    console.error(e);
    if (terminal) {
      terminal.writeln(`\u001b[31m[오류] 프로젝트 로드 실패: ${e.message}\u001b[0m`);
    }
  }
}

/* 9) 공유 - 수정된 버전 */
function shareProject() {
  const xml = Blockly.serialization.workspaces.save(workspace);
  const payload = btoa(JSON.stringify({
    title: document.getElementById('project-title').value,
    blocks: xml
  }));
  
  navigator.clipboard.writeText(payload)
    .then(() => {
      // 터미널에 메시지 표시
      terminal.writeln('\u001b[32m[성공] 프로젝트 공유 코드가 클립보드에 복사되었습니다!\u001b[0m');
    })
    .catch(err => {
      terminal.writeln(`\u001b[31m[오류] 복사 실패: ${err}\u001b[0m`);
    });
}

/* 10) 리사이즈 핸들 */
function initResizeHandle() {
  const handle   = document.getElementById('resize-handle');
  const blockDiv = document.getElementById('blockly-container');
  let dragging = false, startX = 0, startWidth = 0;

  handle.addEventListener('mousedown', e => {
    dragging   = true;
    startX     = e.clientX;
    startWidth = blockDiv.offsetWidth;
    handle.classList.add('active');
    e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    blockDiv.style.width = `${Math.max(100, startWidth + dx)}px`;
    Blockly.svgResize(workspace);
  });
  window.addEventListener('mouseup', () => {
    dragging = false;
    handle.classList.remove('active');
  });
}