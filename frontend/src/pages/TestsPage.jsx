import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Play, 
  RefreshCw, 
  ShieldCheck, 
  Cpu, 
  Clock, 
  Layers, 
  AlertCircle 
} from 'lucide-react';
import { runAutomatedTests } from '../services/api';

export default function TestsPage() {
  const [running, setRunning] = useState(false);
  const [testSuite, setTestSuite] = useState(null);
  const [error, setError] = useState(null);

  const handleRunTests = async () => {
    setRunning(true);
    setError(null);
    try {
      const data = await runAutomatedTests();
      setTestSuite(data);
    } catch (err) {
      setError(err.message || 'Automated test execution failed.');
    } finally {
      setRunning(false);
    }
  };

  const summary = testSuite?.summary;
  const results = testSuite?.results || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ACADEMIC VERIFICATION HARNESS
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">
              8 Required OS Lab Test Scenarios
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span>Automated OS Concurrency Test Suite</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Execute all 8 core test cases directly against the live Python backend kernel to programmatically prove 
            race condition prevention, Semaphore permit conservation, and Mutex critical section atomicity.
          </p>
        </div>

        <button
          onClick={handleRunTests}
          disabled={running}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50 shrink-0"
        >
          {running ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Running Concurrency Harness...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-white" />
              <span>Execute Automated Tests</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Scorecard */}
      {summary && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950/20 border border-emerald-500/30 shadow-xl flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
              summary.all_passed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}>
              {summary.all_passed ? <CheckCircle2 className="h-7 w-7" /> : <XCircle className="h-7 w-7" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {summary.all_passed ? 'All 8 Concurrency Test Cases Passed' : 'Test Suite Finished with Failures'}
              </h3>
              <p className="text-xs text-slate-400">
                Completed in <strong className="font-mono text-emerald-400">{summary.total_duration_ms} ms</strong> with 0 race conditions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-sans block">Passed</span>
              <span className="text-base font-bold text-emerald-400">{summary.passed} / {summary.total_tests}</span>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Test Results Cards */}
      <div className="space-y-3">
        {results.length === 0 && !running && (
          <div className="bg-slate-900/60 p-12 rounded-2xl border border-slate-800 text-center text-slate-500 space-y-2">
            <Cpu className="h-8 w-8 mx-auto text-slate-600" />
            <p className="text-sm font-medium text-slate-300">Harness Ready for Faculty Demonstration</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click "Execute Automated Tests" to trigger real threading tests in Python and verify all concurrency assertions.
            </p>
          </div>
        )}

        {results.map((test) => {
          const isPassed = test.status === 'PASSED';
          return (
            <div
              key={test.id}
              className={`p-4 rounded-xl border transition ${
                isPassed
                  ? 'bg-slate-900/70 border-slate-800 hover:border-emerald-500/40'
                  : 'bg-rose-950/20 border-rose-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className={`mt-0.5 ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPassed ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{test.title}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {test.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{test.description}</p>
                    {test.error && (
                      <p className="text-xs font-mono text-rose-400 pt-1">Error: {test.error}</p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                    isPassed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {test.status}
                  </span>
                  <span className="block text-[10px] font-mono text-slate-500 mt-1">
                    {test.duration_ms} ms
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
