/**
 * Pyodide Web Worker
 *
 * Runs Python code in a dedicated worker thread using Pyodide.
 * Communicates via postMessage: receives { type: 'execute', ... } and posts
 * back { type: 'progress', ... } and { type: 'result', ... } messages.
 *
 * This is compiled by Vite as a classic worker script so importScripts is available.
 */

declare function importScripts(...urls: string[]): void;

// ── Types (mirrored from aiTypes to keep the worker self-contained) ──

type WorkerMessage =
  | { type: 'execute'; code: string; runtimeSpec: RuntimeSpec; requestId: number }
  | { type: 'terminate' };

type RuntimeSpec = {
  packages?: string[];
  setupCode?: string;
  testCode?: string;
  expectedVariables?: string[];
  timeoutMs?: number;
};

type ProgressMessage = {
  type: 'progress';
  phase: 'booting' | 'loading-packages' | 'executing' | 'testing' | 'complete' | 'failed';
  message: string;
  requestId: number;
};

type ResultMessage = {
  type: 'result';
  requestId: number;
  output: string;
  error?: string;
  variables?: Record<string, unknown>;
  durationMs: number;
  packagesLoaded: string[];
  tests: string[];
};

// ── State ──

const PYODIDE_URL = '/pyodide/pyodide.js';
const PYODIDE_INDEX_URL = '/pyodide/';
const PYODIDE_PACKAGE_BASE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodide: any = null;
let pyodideLoading: Promise<void> | null = null;
const loadedPackages = new Set<string>();

// ── Helpers ──

function postProgress(
  phase: ProgressMessage['phase'],
  message: string,
  requestId: number
) {
  self.postMessage({ type: 'progress', phase, message, requestId } satisfies ProgressMessage);
}

function postResult(data: Omit<ResultMessage, 'type'>) {
  self.postMessage({ type: 'result', ...data } satisfies ResultMessage);
}

function safeStringify(value: unknown, maxLen = 512): string {
  try {
    if (value === undefined || value === null) return String(value);
    if (typeof value === 'string') return value.slice(0, maxLen);
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    const s = JSON.stringify(value);
    return s.length <= maxLen ? s : s.slice(0, maxLen) + '...';
  } catch {
    return '<unserializable>';
  }
}

// ── Pyodide Initialization ──

async function ensurePyodide(): Promise<void> {
  if (pyodide) return;

  if (!pyodideLoading) {
    pyodideLoading = (async () => {
      postProgress('booting', '正在下载 Pyodide 运行时（首次加载约 10-30 秒）...', 0);
      importScripts(PYODIDE_URL);

      // loadPyodide is defined on self by the imported script
      const loadPyodideFn = (self as unknown as Record<string, unknown>).loadPyodide as
        | ((opts: Record<string, string>) => Promise<unknown>)
        | undefined;
      if (!loadPyodideFn) {
        throw new Error('Pyodide 加载失败：loadPyodide 未定义。请检查 pyodide.js 是否能正常访问。');
      }

      pyodide = await loadPyodideFn({
        indexURL: PYODIDE_INDEX_URL,
        packageBaseUrl: PYODIDE_PACKAGE_BASE_URL,
      });
      postProgress('booting', 'Pyodide 运行时已就绪', 0);
    })();
  }

  await pyodideLoading;
}

async function installPackages(packages: string[], requestId: number): Promise<void> {
  const uniquePackages = [...new Set(packages)];
  if (uniquePackages.length === 0) return;
  const toInstall = uniquePackages;

  postProgress(
    'loading-packages',
    `正在安装 Python 包: ${toInstall.join(', ')}...`,
    requestId
  );

  try {
    await pyodide.loadPackage(uniquePackages, {
      messageCallback: (msg: string) => {
        postProgress('loading-packages', msg, requestId);
      },
      errorCallback: (msg: string) => {
        postProgress('loading-packages', `⚠ ${msg}`, requestId);
      },
    });
    uniquePackages.forEach((pkg) => loadedPackages.add(pkg));
    postProgress('loading-packages', `包安装完成: ${toInstall.join(', ')}`, requestId);
  } catch (err) {
    // Reset so failed packages can be retried next time
    uniquePackages.forEach((pkg) => loadedPackages.delete(pkg));
    throw new Error(
      `包安装失败 (${toInstall.join(', ')}): ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

function setupStdio(stdoutLines: string[], stderrLines: string[]) {
  if (!pyodide) {
    throw new Error('Pyodide 尚未初始化，无法捕获输出');
  }

  pyodide.setStdout({
    batched: (text: string) => {
      stdoutLines.push(text);
    },
  });
  pyodide.setStderr({
    batched: (text: string) => {
      stderrLines.push(text);
    },
  });
}

function extractVariables(
  globals: { get: (key: string) => unknown; destroy?: () => void },
  varNames: string[]
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const name of varNames) {
    const value = globals.get(name);
    result[name] = safeStringify(value);
  }
  return result;
}

// ── Main Execution ──

async function executePython(
  code: string,
  spec: RuntimeSpec,
  requestId: number
): Promise<void> {
  const startedAt = performance.now();
  const stdoutLines: string[] = [];
  const stderrLines: string[] = [];
  const tests: string[] = [];
  let executedSetup = false;
  let executedUser = false;
  let executedTests = false;

  try {
    // 1. Load Pyodide if not already loaded
    await ensurePyodide();
    setupStdio(stdoutLines, stderrLines);

    // 2. Install required packages
    const packages = spec.packages || ['numpy', 'scikit-learn'];
    await installPackages(packages, requestId);

    // 3. Create a fresh globals dictionary for this run
    const globals = pyodide.runPython('dict()');

    try {
      // 4. Run setup code (if provided)
      if (spec.setupCode) {
        postProgress('executing', '正在运行环境准备代码...', requestId);
        await pyodide.runPythonAsync(spec.setupCode, { globals });
        executedSetup = true;
      }

      // 5. Run user code
      postProgress('executing', '正在执行你的 Python 代码...', requestId);
      await pyodide.runPythonAsync(code, {
        globals,
        filename: '<user_code.py>',
      });
      executedUser = true;
      tests.push('Python 代码语法和执行通过');

      // 6. Run test code (if provided)
      if (spec.testCode) {
        postProgress('testing', '正在运行自动测试...', requestId);
        try {
          await pyodide.runPythonAsync(spec.testCode, { globals });
          executedTests = true;
          tests.push('自动测试通过');
        } catch (testErr) {
          const testMsg =
            testErr instanceof Error ? testErr.message : String(testErr);
          throw new Error(`自动测试失败: ${testMsg}`);
        }
      }

      // 7. Extract expected variables
      const variables = spec.expectedVariables
        ? extractVariables(globals, spec.expectedVariables)
        : {};

      const durationMs = Math.round(performance.now() - startedAt);
      const output = stdoutLines.join('\n').trim() || '代码已执行，无 print 输出。';
      const error = stderrLines.join('\n').trim() || undefined;

      postProgress('complete', 'Python 执行和测试完成', requestId);
      postResult({
        requestId,
        output,
        error,
        variables,
        durationMs,
        packagesLoaded: Array.from(loadedPackages),
        tests,
      });
    } finally {
      // Clean up the globals dict to free memory
      globals.destroy?.();
    }
  } catch (err) {
    const durationMs = Math.round(performance.now() - startedAt);
    const error = [
      stderrLines.join('\n').trim(),
      err instanceof Error ? err.message : String(err),
    ]
      .filter(Boolean)
      .join('\n');
    const output = stdoutLines.join('\n').trim();

    // Determine which phase failed
    if (!executedSetup) {
      tests.push('环境准备代码未执行');
    } else if (!executedUser) {
      tests.push('Python 代码包含语法或运行时错误');
    } else if (!executedTests) {
      tests.push('自动测试未通过');
    }

    postProgress('failed', 'Python 执行或测试失败', requestId);
    postResult({
      requestId,
      output,
      error,
      durationMs,
      packagesLoaded: Array.from(loadedPackages),
      tests,
    });
  }
}

// ── Message Handler ──

// Track if we should reject stale requests after termination
let activeRequestId = -1;

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const msg = event.data;

  if (msg.type === 'terminate') {
    // Terminate current execution gracefully
    activeRequestId = -1;
    return;
  }

  if (msg.type === 'execute') {
    activeRequestId = msg.requestId;
    executePython(msg.code, msg.runtimeSpec, msg.requestId).catch((err) => {
      // Final safety net — should not normally reach here
      postResult({
        requestId: msg.requestId,
        output: '',
        error: `Worker 内部错误: ${err instanceof Error ? err.message : String(err)}`,
        durationMs: 0,
        packagesLoaded: Array.from(loadedPackages),
        tests: ['Worker 执行流程异常中断'],
      });
    });
  }
};

// Signal that the worker is ready to receive messages
self.postMessage({ type: 'ready' });
