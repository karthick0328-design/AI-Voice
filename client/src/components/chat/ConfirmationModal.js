import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

export function ConfirmationModal({ confirmation, onApprove, onReject }) {
  if (!confirmation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-dark-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center space-x-3 text-amber-400">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">Action Approval Required</h3>
            <p className="text-xs font-mono text-amber-400/80">Permission: REQUIRES_CONFIRMATION</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-dark-950/70 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Tool:</span>
            <span className="text-cyan-400 font-semibold">{confirmation.toolName}</span>
          </div>
          {confirmation.input && (
            <div>
              <span className="text-slate-400 text-xs font-mono">Parameters:</span>
              <pre className="mt-1 p-2 rounded bg-dark-900 text-xs font-mono text-slate-300 overflow-x-auto max-h-32">
                {JSON.stringify(confirmation.input, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          This operation interacts with external state or performs automation. Do you wish to approve this action?
        </p>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onReject}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
            <span>Reject / Cancel</span>
          </button>
          <button
            onClick={onApprove}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Approve & Execute</span>
          </button>
        </div>
      </div>
    </div>
  );
}
