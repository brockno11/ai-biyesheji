/**
 * Python Runtime Service
 *
 * Manages a Pyodide Web Worker to run Python exercises off the main thread.
 * Falls back to unsupported-result when an exercise has no runtimeSpec.
 */

import type { Exercise } from '../types';
import type { PythonRunResult, PythonRuntimeEvent } from './aiTypes';

// ── Constants ──

const DEFAULT_TIMEOUT_MS = 15000;
let nextRequestId = 0;

// ── Worker Management ──

let worker: Worker | null = null;
let workerReady = false;
// Store the resolve function for the ready promise so multiple callers can await it
let workerReadyResolvers: Array<() => void> = [];

function createWorker(): Worker {
  const w = new Worker(
    new URL('../workers/pyodideWorker.ts', import.meta.url),
    { type: 'classic' }
  );

  w.onmessage = (event: MessageEvent) => {
    if (event.data?.type === 'ready') {
      workerReady = true;
      const resolvers = workerReadyResolvers;
      workerReadyResolvers = [];
      resolvers.forEach((resolve) => resolve());
    }
    // Other messages are handled per-request via dedicated listeners
  };

  w.onerror = (err) => {
    console.error('[PythonRuntime] Worker error:', err);
    workerReady = false;
  };

  return w;
}

function getWorker(): Worker {
  if (!worker) {
    worker = createWorker();
  }
  return worker;
}

async function ensureWorkerReady(): Promise<Worker> {
  const w = getWorker();
  if (workerReady) return w;

  return new Promise<Worker>((resolve) => {
    workerReadyResolvers.push(() => resolve(w));
    // Timeout: if worker never signals ready, resolve anyway after 5s
    setTimeout(() => {
      if (!workerReady) {
        console.warn('[PythonRuntime] Worker ready signal timed out, proceeding anyway');
        workerReady = true;
        const resolvers = workerReadyResolvers;
        workerReadyResolvers = [];
        resolvers.forEach((r) => r());
      }
    }, 5000);
  });
}

function terminateWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
    workerReady = false;
    workerReadyResolvers = [];
  }
}

// ── Event Collector ──

type RunOptions = {
  onEvent?: (event: PythonRuntimeEvent) => void;
};

function createEventCollector(onEvent?: (event: PythonRuntimeEvent) => void) {
  const events: PythonRuntimeEvent[] = [];

  return {
    events,
    push(
      phase: PythonRuntimeEvent['phase'],
      message: string,
      level: PythonRuntimeEvent['level'] = 'info'
    ) {
      const event: PythonRuntimeEvent = { phase, message, level, timestamp: Date.now() };
      events.push(event);
      onEvent?.(event);
    },
  };
}

// ── Unsupported Result Helper ──

function unsupportedResult(
  message: string,
  events?: PythonRuntimeEvent[]
): PythonRunResult {
  return {
    supported: false,
    status: 'unsupported',
    passed: false,
    output: message,
    durationMs: 0,
    tests: [],
    details: [message],
    events,
  };
}

// ── Main API ──

export async function runPythonExercise(
  exercise: Exercise,
  userCode: string,
  options: RunOptions = {}
): Promise<PythonRunResult> {
  const progress = createEventCollector(options.onEvent);
  const runtimeSpec = exercise.runtimeSpec;
  const requestId = nextRequestId++;

  // If no runtimeSpec, fall back to unsupported (keep existing behavior)
  if (!runtimeSpec) {
    progress.push(
      'unsupported',
      '当前题目暂未开启真运行，仍可使用规则检查和 AI 诊断。',
      'warning'
    );
    return unsupportedResult(
      '当前题目暂未开启真运行，仍可使用规则检查和 AI 诊断。',
      progress.events
    );
  }

  progress.push('booting', '正在准备 Python 运行环境...');

  const startedAt = performance.now();
  const timeoutMs = runtimeSpec.timeoutMs || DEFAULT_TIMEOUT_MS;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let settled = false;

  return new Promise<PythonRunResult>((resolve) => {
    // ── Timeout ──
    timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      terminateWorker();
      progress.push('failed', `Python 运行超时（${timeoutMs / 1000} 秒）`, 'error');
      resolve({
        supported: true,
        status: 'error',
        passed: false,
        output: '',
        error: `运行超时（${timeoutMs / 1000} 秒），Worker 已被终止。请检查代码是否有死循环或处理的数据量是否过大。`,
        durationMs: Math.round(performance.now() - startedAt),
        tests: ['运行超时'],
        details: ['代码执行超过时间限制，Worker 已终止。'],
        events: progress.events,
      });
    }, timeoutMs);

    // ── Send execute message to Worker ──
    ensureWorkerReady()
      .then((w) => {
        if (settled) return; // Already timed out

        const resultHandler = (event: MessageEvent) => {
          const data = event.data;
          if (!data || data.requestId !== requestId) return; // Not our response

          if (data.type === 'progress') {
            progress.push(
              data.phase,
              data.message,
              data.phase === 'failed' ? 'error' : 'info'
            );
            return;
          }

          if (data.type === 'result') {
            if (settled) return;
            settled = true;
            if (timeoutId) clearTimeout(timeoutId);
            w.removeEventListener('message', resultHandler);

            const durationMs = data.durationMs || Math.round(performance.now() - startedAt);
            const hasError = !!data.error;
            const wasCancelled =
              hasError && data.error.includes('Execution cancelled');

            if (hasError && !wasCancelled) {
              progress.push('failed', 'Python 执行或测试失败', 'error');
            } else if (!hasError) {
              progress.push('complete', 'Python 执行和测试完成', 'success');
            }

            resolve({
              supported: true,
              status: hasError && !wasCancelled ? 'error' : 'success',
              passed: !hasError,
              output: data.output || '',
              error: data.error,
              durationMs,
              tests: data.tests || [],
              details: [
                hasError
                  ? 'Python 执行或自动测试失败，AI 会结合报错给出修改方向。'
                  : 'Python 代码已成功执行并通过自动测试。',
                ...(data.packagesLoaded?.length
                  ? [`已加载 Python 包: ${data.packagesLoaded.join(', ')}`]
                  : []),
              ],
              events: progress.events,
              packageSource: 'Pyodide Web Worker',
            });
          }
        };

        w.addEventListener('message', resultHandler);

        // If already settled (edge case), clean up
        if (settled) {
          w.removeEventListener('message', resultHandler);
          return;
        }

        w.postMessage({
          type: 'execute',
          code: userCode,
          runtimeSpec,
          requestId,
        });
      })
      .catch((err) => {
        if (settled) return;
        settled = true;
        if (timeoutId) clearTimeout(timeoutId);
        progress.push('failed', 'Worker 创建失败', 'error');
        resolve({
          supported: true,
          status: 'error',
          passed: false,
          output: '',
          error: `Worker 创建失败: ${err instanceof Error ? err.message : String(err)}`,
          durationMs: Math.round(performance.now() - startedAt),
          tests: [],
          details: ['Web Worker 初始化失败，请刷新页面后重试。'],
          events: progress.events,
        });
      });
  });
}
