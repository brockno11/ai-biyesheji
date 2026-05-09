import type { PyodideAPI } from 'pyodide';
import type { Exercise } from '../types';
import type { PythonRunResult, PythonRuntimeEvent, PythonRuntimePhase } from './aiTypes';

const PYODIDE_ASSET_URL = '/pyodide/';
const PYODIDE_PACKAGE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/';
const PYTHON_TIMEOUT_MS = 15000;

let pyodidePromise: Promise<PyodideAPI> | null = null;
let packagePromise: Promise<void> | null = null;

type RunOptions = {
  onEvent?: (event: PythonRuntimeEvent) => void;
};

function createEventCollector(onEvent?: (event: PythonRuntimeEvent) => void) {
  const events: PythonRuntimeEvent[] = [];

  return {
    events,
    push(phase: PythonRuntimePhase, message: string, level: PythonRuntimeEvent['level'] = 'info') {
      const event = { phase, message, level, timestamp: Date.now() };
      events.push(event);
      onEvent?.(event);
    },
  };
}

function unsupportedResult(message: string): PythonRunResult {
  return {
    supported: false,
    status: 'unsupported',
    passed: false,
    output: message,
    durationMs: 0,
    tests: [],
    details: [message],
  };
}

async function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = import('pyodide').then(({ loadPyodide }) =>
      loadPyodide({
        indexURL: PYODIDE_ASSET_URL,
        packageBaseUrl: PYODIDE_PACKAGE_URL,
        stdout: () => undefined,
        stderr: () => undefined,
      })
    );
  }
  try {
    return await pyodidePromise;
  } catch (error) {
    pyodidePromise = null;
    throw error;
  }
}

async function ensureMlPackages(pyodide: PyodideAPI, progress?: ReturnType<typeof createEventCollector>) {
  if (!packagePromise) {
    packagePromise = pyodide
      .loadPackage(['numpy', 'scikit-learn'], {
        messageCallback: (message) => {
          console.info('[Pyodide]', message);
          progress?.push('loading-packages', message);
        },
        errorCallback: (message) => {
          console.warn('[Pyodide]', message);
          progress?.push('loading-packages', message, 'warning');
        },
      })
      .then(() => undefined);
  }
  try {
    return await packagePromise;
  } catch (error) {
    packagePromise = null;
    throw error;
  }
}

function linearRegressionTestCode(exerciseId: string) {
  if (exerciseId === 'lr-ex-2') {
    return `

print("\\n--- Pyodide 自动测试 ---")
required_names = ["model", "X_train", "X_test", "y_train", "y_test", "y_pred", "r2"]
missing = [name for name in required_names if name not in globals()]
if missing:
    raise AssertionError("缺少变量: " + ", ".join(missing))
if not hasattr(model, "coef_"):
    raise AssertionError("model 还没有完成 fit 训练")
if len(y_pred) != len(y_test):
    raise AssertionError("y_pred 的长度应当和 y_test 一致")
if len(model.coef_) != 4:
    raise AssertionError("多元线性回归应当保留 4 个特征系数")
if float(r2) < 0.85:
    raise AssertionError(f"R2 偏低，当前为 {float(r2):.3f}，请检查数据划分、训练和预测流程")
print(f"测试通过：特征系数数量={len(model.coef_)}, R2={float(r2):.3f}")
`;
  }

  return `

print("\\n--- Pyodide 自动测试 ---")
required_names = ["model", "X_train", "X_test", "y_train", "y_test", "y_pred", "mse", "r2"]
missing = [name for name in required_names if name not in globals()]
if missing:
    raise AssertionError("缺少变量: " + ", ".join(missing))
if not hasattr(model, "coef_"):
    raise AssertionError("model 还没有完成 fit 训练")
if len(y_pred) != len(y_test):
    raise AssertionError("y_pred 的长度应当和 y_test 一致")
if float(mse) >= 1000:
    raise AssertionError(f"MSE 偏高，当前为 {float(mse):.2f}，请检查训练或预测代码")
if float(r2) <= 0.8:
    raise AssertionError(f"R2 偏低，当前为 {float(r2):.3f}，请检查模型是否正确训练")
print(f"测试通过：预测数量={len(y_pred)}, MSE={float(mse):.2f}, R2={float(r2):.3f}")
`;
}

function buildRuntimeScript(exercise: Exercise, userCode: string) {
  if (exercise.algorithmId !== 'linear-regression') {
    return null;
  }

  return {
    tests: [
      '执行学生 Python 代码',
      '检查关键训练变量是否存在',
      '验证模型已完成 fit 训练',
      '验证预测长度和评估指标是否合理',
    ],
    code: `${userCode}\n${linearRegressionTestCode(exercise.id)}`,
  };
}

function normalizeError(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

function withTimeout<T>(promise: Promise<T>, ms: number) {
  let timeoutId: number | undefined;
  const timeout = new Promise<T>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(`Python 运行超时（${ms / 1000} 秒）`)), ms);
  });

  return Promise.race<T>([promise, timeout]).finally(() => {
    if (timeoutId) window.clearTimeout(timeoutId);
  });
}

export async function runPythonExercise(
  exercise: Exercise,
  userCode: string,
  options: RunOptions = {}
): Promise<PythonRunResult> {
  const progress = createEventCollector(options.onEvent);
  const runtimeScript = buildRuntimeScript(exercise, userCode);
  if (!runtimeScript) {
    progress.push('unsupported', '当前题目暂未接入 Pyodide 固定测试。', 'warning');
    return {
      ...unsupportedResult('当前浏览器端 Python 真运行先覆盖线性回归练习；本题仍使用规则检查和 AI 诊断。'),
      events: progress.events,
    };
  }

  const startedAt = performance.now();
  const stdout: string[] = [];
  const stderr: string[] = [];

  try {
    progress.push('booting', '正在启动浏览器端 Python 运行时。');
    const pyodide = await getPyodide();
    progress.push('loading-packages', '正在加载 numpy 和 scikit-learn。');
    await ensureMlPackages(pyodide, progress);
    progress.push('executing', '正在执行学生代码。');

    pyodide.setStdout({ batched: (message) => stdout.push(message) });
    pyodide.setStderr({ batched: (message) => stderr.push(message) });

    // Note 1: Each run gets a fresh Python globals dictionary so variables from a previous attempt cannot hide mistakes in the current code.
    const globals = pyodide.runPython('dict()');
    try {
      progress.push('testing', '正在运行固定测试用例。');
      await withTimeout(
        pyodide.runPythonAsync(runtimeScript.code, {
          globals,
          filename: `<${exercise.id}.py>`,
        }),
        PYTHON_TIMEOUT_MS
      );
    } finally {
      globals.destroy?.();
    }

    progress.push('complete', 'Python 执行和固定测试均已通过。', 'success');
    return {
      supported: true,
      status: 'success',
      passed: true,
      output: stdout.join('\n').trim() || '代码已运行，未捕获到 print 输出。',
      durationMs: Math.round(performance.now() - startedAt),
      tests: runtimeScript.tests,
      details: ['Pyodide 已完成 Python 代码执行和固定测试。'],
      events: progress.events,
      packageSource: PYODIDE_PACKAGE_URL,
    };
  } catch (error) {
    console.error('[PythonRuntime] Python execution failed:', error);
    progress.push('failed', 'Python 执行或固定测试失败。', 'error');
    return {
      supported: true,
      status: 'error',
      passed: false,
      output: stdout.join('\n').trim(),
      error: [stderr.join('\n').trim(), normalizeError(error)].filter(Boolean).join('\n'),
      durationMs: Math.round(performance.now() - startedAt),
      tests: runtimeScript.tests,
      details: ['Python 执行或自动测试失败，AI 会结合报错给出修改方向。'],
      events: progress.events,
      packageSource: PYODIDE_PACKAGE_URL,
    };
  }
}
