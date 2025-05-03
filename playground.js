/* ─────────────────────────────────────────────────────────
 *  C‑Terminal Playground  —  Full Version
 *      · process 폴리필
 *      · CustomRenderer(둥근 모서리 + 4 px 테두리)
 *      · ConstantProvider 오버라이드
 *      · Full Toolbox JSON
 *      · 실행 / 저장 / 불러오기 / 공유 / 리사이즈
 *      · ★ 모든 브라우저 I/O를 XTerm 터미널 내부로 리다이렉트
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

/* === 0‑2) 터미널 I/O 리다이렉션 ========================================= */
function setupTerminalIO () {
  // 1) console 계열
  const writeLn = (...args) => terminal.writeln(args.join(' '));
  console.log    = writeLn;
  console.info   = writeLn;
  console.warn   = (...a) => terminal.writeln('\u001b[33m[Warn]\u001b[0m '  + a.join(' '));
  console.error  = (...a) => terminal.writeln('\u001b[31m[Error]\u001b[0m ' + a.join(' '));

  // 2) alert → 단순 출력
  globalThis.alert = msg => terminal.writeln(String(msg));

  // 3) 프롬프트 입력 util
  async function terminalPrompt (message = '') {
    return new Promise(resolve => {
      let buffer = '';
      terminal.write(`${message} `);

      const onData = data => {
        const code = data.charCodeAt(0);
        // Enter
        if (code === 13) {
          terminal.writeln('');
          terminal.offData(onData);
          resolve(buffer);
          return;
        }
        // backspace
        if (code === 127 || code === 8) {
          if (buffer.length) {
            buffer = buffer.slice(0, -1);
            terminal.write('\b \b');
          }
          return;
        }
        buffer += data;
        terminal.write(data);
      };

      terminal.onData(onData);
    });
  }

  // 4) prompt / confirm 대체
  globalThis.prompt  = terminalPrompt;
  globalThis.confirm = async msg => {
    const ans = await terminalPrompt(`${msg} (y/n)`);
    return ans.trim().toLowerCase().startsWith('y');
  };
}
/* === 터미널 I/O 리다이렉션 끝 ========================================= */

/* 1) ConstantProvider – 모서리/탭/노치 원본 값 -------------------------- */
const CP = Blockly.blockRendering.ConstantProvider.prototype;
CP.CORNER_RADIUS          = 25;
CP.OUTSIDE_CORNER_RADIUS  = 25;
CP.NO_PADDING             = 0;
CP.SHADOW_OFFSET          = 0;
CP.NOTCH_WIDTH            = 20;
CP.NOTCH_HEIGHT           = 15;
CP.TAB_HEIGHT             = 20;
CP.TAB_RADIUS             = 20;

/* 2) CustomRenderer – 4 px 테두리 -------------------------------------- */
const BORDER_WIDTH = 4;
class CustomRenderer extends Blockly.blockRendering.Renderer {
  makePathObject (constants) {
    const obj  = super.makePathObject(constants);
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

/* 3) Custom Theme – 원본 색상 ------------------------------------------ */
const customTheme = Blockly.Theme.defineTheme('simpleRounded', {
  base: Blockly.Themes.Classic,
  blockStyles: {
    logic_blocks     : { colourPrimary:'#6b96c1' },
    loop_blocks      : { colourPrimary:'#6bc16b' },
    math_blocks      : { colourPrimary:'#5cd65c' },
    text_blocks      : { colourPrimary:'#c16bc1' },
    variable_blocks  : { colourPrimary:'#c18b6b' },
    procedure_blocks : { colourPrimary:'#8b6bc1' },
    terminal_blocks  : { colourPrimary:'#5a5a5a' },
    styling_blocks   : { colourPrimary:'#ffad33' },
    output_blocks    : { colourPrimary:'#33adff' },
    animation_blocks : { colourPrimary:'#ff3377' },
    chart_blocks     : { colourPrimary:'#33ddff' },
    ui_blocks        : { colourPrimary:'#b333ff' },
    list_blocks      : { colourPrimary:'#c18b6b' },
    array_blocks     : { colourPrimary:'#c18b6b' },
    string_blocks    : { colourPrimary:'#c16bc1' },
    time_blocks      : { colourPrimary:'#6b96c1' },
    game_blocks      : { colourPrimary:'#ff6b6b' },
    algorithm_blocks : { colourPrimary:'#8d6e63' }
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

/* 4) Full Toolbox JSON -------------------------------------------------- */
const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    /* ──────────────── 기본 카테고리 ──────────────── */
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
      {kind:'block',type:'controls_repeat_ext',inputs:{TIMES:{shadow:{type:'math_number',fields:{NUM:10}}}}},
      {kind:'block',type:'controls_whileUntil'},
      {kind:'block',type:'controls_for',inputs:{FROM:{shadow:{type:'math_number',fields:{NUM:1}}},
                                               TO  :{shadow:{type:'math_number',fields:{NUM:10}}},
                                               BY  :{shadow:{type:'math_number',fields:{NUM:1}}}}},
      {kind:'block',type:'controls_forEach'},
      {kind:'block',type:'controls_flow_statements'}
    ]},
    { kind:'category', name:'수학', colour:'#5cd65c', contents:[
      {kind:'block',type:'math_number',fields:{NUM:0}},
      {kind:'block',type:'math_arithmetic',inputs:{A:{shadow:{type:'math_number',fields:{NUM:1}}},
                                                   B:{shadow:{type:'math_number',fields:{NUM:1}}}}},
      {kind:'block',type:'math_single',inputs:{NUM:{shadow:{type:'math_number',fields:{NUM:9}}}}},
      {kind:'block',type:'math_trig',inputs:{NUM:{shadow:{type:'math_number',fields:{NUM:45}}}}},
      {kind:'block',type:'math_constant'},
      {kind:'block',type:'math_number_property',inputs:{NUMBER_TO_CHECK:{shadow:{type:'math_number',fields:{NUM:0}}}}},
      {kind:'block',type:'math_round',inputs:{NUM:{shadow:{type:'math_number',fields:{NUM:3.1}}}}},
      {kind:'block',type:'math_on_list'},
      {kind:'block',type:'math_modulo',inputs:{DIVIDEND:{shadow:{type:'math_number',fields:{NUM:64}}},
                                               DIVISOR :{shadow:{type:'math_number',fields:{NUM:10}}}}},
      {kind:'block',type:'math_constrain',inputs:{VALUE:{shadow:{type:'math_number',fields:{NUM:50}}},
                                                  LOW  :{shadow:{type:'math_number',fields:{NUM:1}}},
                                                  HIGH :{shadow:{type:'math_number',fields:{NUM:100}}}}},
      {kind:'block',type:'math_random_int',inputs:{FROM:{shadow:{type:'math_number',fields:{NUM:1}}},
                                                   TO  :{shadow:{type:'math_number',fields:{NUM:100}}}}},
      {kind:'block',type:'math_random_float'}
    ]},
    { kind:'category', name:'텍스트', colour:'#c16bc1', contents:[
      {kind:'block',type:'text'},
      {kind:'block',type:'text_join'},
      {kind:'block',type:'text_append',inputs:{TEXT:{shadow:{type:'text'}}}},
      {kind:'block',type:'text_length',inputs:{VALUE:{shadow:{type:'text'}}}},
      {kind:'block',type:'text_isEmpty',inputs:{VALUE:{shadow:{type:'text'}}}},
      {kind:'block',type:'text_indexOf',inputs:{VALUE:{shadow:{type:'variables_get',fields:{VAR:'item'}}},
                                                FIND :{shadow:{type:'text'}}}},
      {kind:'block',type:'text_charAt',inputs:{VALUE:{shadow:{type:'text'}}}},
      {kind:'block',type:'text_getSubstring',inputs:{STRING:{shadow:{type:'text'}}}},
      {kind:'block',type:'text_changeCase',inputs:{TEXT:{shadow:{type:'text'}}}},
      {kind:'block',type:'text_trim',inputs:{TEXT:{shadow:{type:'text'}}}},
      {kind:'block',type:'text_print',inputs:{TEXT:{shadow:{type:'text'}}}},
      {kind:'block',type:'text_prompt_ext',inputs:{TEXT:{shadow:{type:'text'}}}}
    ]},
    { kind:'category', name:'리스트', colour:'#c18b6b', contents:[
      {kind:'block',type:'lists_create_with',extraState:{itemCount:3}},
      {kind:'block',type:'lists_repeat',inputs:{NUM:{shadow:{type:'math_number',fields:{NUM:5}}}}},
      {kind:'block',type:'lists_length'},
      {kind:'block',type:'lists_isEmpty'},
      {kind:'block',type:'lists_indexOf',inputs:{VALUE:{shadow:{type:'variables_get',fields:{VAR:'list'}}}}},
      {kind:'block',type:'lists_getIndex',inputs:{VALUE:{shadow:{type:'variables_get',fields:{VAR:'list'}}}}},
      {kind:'block',type:'lists_setIndex',inputs:{LIST:{shadow:{type:'variables_get',fields:{VAR:'list'}}}}},
      {kind:'block',type:'lists_getSublist',inputs:{LIST:{shadow:{type:'variables_get',fields:{VAR:'list'}}}}},
      {kind:'block',type:'lists_split',inputs:{DELIM:{shadow:{type:'text',fields:{TEXT:','}}}}},
      {kind:'block',type:'lists_sort'}
    ]},
    { kind:'sep' },
    /* ───────────── 사용자 변수 / 함수 ───────────── */
    { kind:'category', name:'변수', custom:'VARIABLE', colour:'#c18b6b' },
    { kind:'category', name:'함수', custom:'PROCEDURE', colour:'#8b6bc1' }
  ]
};

/* 5) 초기화 -------------------------------------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
  initPlayground();
  loadProject();
  setTimeout(() => Blockly.svgResize(workspace), 0);
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

  /* ★ 브라우저 I/O -> 터미널로 리다이렉션 */
  setupTerminalIO();

  document.getElementById('run-btn')  .addEventListener('click', runCode);
  document.getElementById('save-btn') .addEventListener('click', saveProject);
  document.getElementById('share-btn').addEventListener('click', shareProject);
  document.getElementById('clear-terminal-btn').addEventListener('click', () => terminal.clear());

  initResizeHandle();
}

/* 6) 코드 실행 ----------------------------------------------------------- */
async function runCode () {
  if (isRunning) return;
  isRunning = true;
  const runBtn = document.getElementById('run-btn');
  runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 실행 중';

  terminal.clear();
  const code = Blockly.JavaScript.workspaceToCode(workspace);

  const nativeLog = console.log;
  console.log = (...args) => terminal.writeln(args.join(' '));

  try {
    /* eslint-disable no-eval */
    await eval(`(async () => { ${code} })()`);
  } catch (err) {
    terminal.writeln(`\u001b[31m[Error] ${err.message}\u001b[0m`);
  } finally {
    console.log = nativeLog;
    runBtn.innerHTML = '<i class="fas fa-play"></i> 실행';
    isRunning = false;
  }
}

/* 7) 저장 / 불러오기 ----------------------------------------------------- */
function saveProject () {
  const xml = Blockly.serialization.workspaces.save(workspace);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    title : document.getElementById('project-title').value.trim() || '제목 없는 프로젝트',
    blocks: xml
  }));
  document.getElementById('project-status').textContent = '저장됨';
}
function loadProject () {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    document.getElementById('project-title').value = data.title || '제목 없는 프로젝트';
    Blockly.serialization.workspaces.load(data.blocks, workspace);
    document.getElementById('project-status').textContent = '로드됨';
  } catch (e) { console.error(e); }
}

/* 8) 공유 --------------------------------------------------------------- */
function shareProject () {
  const xml = Blockly.serialization.workspaces.save(workspace);
  const payload = btoa(JSON.stringify({
    title : document.getElementById('project-title').value,
    blocks: xml
  }));
  navigator.clipboard.writeText(payload)
    .then(() => alert('클립보드에 복사했습니다!'))
    .catch(err => alert('복사 실패: ' + err));
}

/* 9) 에디터‑터미널 리사이즈 핸들 --------------------------------------- */
function initResizeHandle () {
  const handle   = document.getElementById('resize-handle');
  const leftPane = document.getElementById('blockly-container');
  let   startX, startWidth;

  const onMouseMove = e => {
    const delta = e.clientX - startX;
    leftPane.style.flex = `0 0 ${Math.max(100, startWidth + delta)}px`;
    Blockly.svgResize(workspace);
  };
  const onMouseUp = () => {
    handle.classList.remove('active');
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup',   onMouseUp);
  };

  handle.addEventListener('mousedown', e => {
    startX      = e.clientX;
    startWidth  = leftPane.getBoundingClientRect().width;
    handle.classList.add('active');
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);
  });
}
