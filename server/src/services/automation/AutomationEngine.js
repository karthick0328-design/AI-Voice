import cron from 'node-cron';
import { Automation } from '../../models/Automation.js';
import { toolRegistry } from '../tools/ToolRegistry.js';

class AutomationEngine {
  constructor() {
    this.scheduledTasks = new Map();
  }

  async init() {
    console.log('[AutomationEngine] Initializing active scheduled automations...');
    try {
      const activeAutomations = await Automation.find({ status: 'ACTIVE' });
      for (const auto of activeAutomations) {
        this.scheduleAutomation(auto);
      }
      console.log(`[AutomationEngine] Scheduled ${activeAutomations.length} active automations`);
    } catch (err) {
      console.error('[AutomationEngine] Error initializing automations:', err.message);
    }
  }

  scheduleAutomation(automation) {
    // If existing task is running, stop it
    if (this.scheduledTasks.has(automation._id.toString())) {
      this.scheduledTasks.get(automation._id.toString()).stop();
      this.scheduledTasks.delete(automation._id.toString());
    }

    const cronExpr = automation.trigger?.cronExpression;
    if (!cronExpr || !cron.validate(cronExpr)) {
      console.warn(`[AutomationEngine] Invalid cron expression '${cronExpr}' for automation ${automation.name}`);
      return;
    }

    const task = cron.schedule(cronExpr, async () => {
      console.log(`[AutomationEngine] Executing automation: "${automation.name}"`);
      await this.runAutomation(automation._id);
    });

    this.scheduledTasks.set(automation._id.toString(), task);
  }

  async runAutomation(automationId) {
    const automation = await Automation.findById(automationId);
    if (!automation) return { success: false, error: 'Automation not found' };

    const startTime = Date.now();
    let overallStatus = 'SUCCESS';
    let outputLog = [];
    let previousOutput = null;

    try {
      const sortedActions = (automation.actions || []).sort((a, b) => a.order - b.order);

      for (const action of sortedActions) {
        console.log(`[AutomationEngine] Running action: ${action.type}`);
        // Interpolate previous output if needed
        const params = { ...action.params };
        if (params.text === '$PREVIOUS_OUTPUT' && previousOutput) {
          params.text = typeof previousOutput === 'string' ? previousOutput : JSON.stringify(previousOutput);
        }

        const toolRes = await toolRegistry.executeTool(action.type, params);
        if (!toolRes.success) {
          overallStatus = 'PARTIAL';
          outputLog.push(`Action ${action.type} failed: ${toolRes.error}`);
        } else {
          outputLog.push(`Action ${action.type} completed successfully`);
          previousOutput = toolRes.data;
        }
      }
    } catch (err) {
      overallStatus = 'FAILED';
      outputLog.push(`Critical failure: ${err.message}`);
    }

    const duration = Date.now() - startTime;
    automation.lastExecutedAt = new Date();
    automation.executionHistory.unshift({
      executedAt: new Date(),
      status: overallStatus,
      outputSummary: outputLog.join(' -> ') + ` (${duration}ms)`,
      error: overallStatus === 'FAILED' ? outputLog[outputLog.length - 1] : null
    });

    // Keep history capped at 25 entries
    if (automation.executionHistory.length > 25) {
      automation.executionHistory = automation.executionHistory.slice(0, 25);
    }

    await automation.save();
    return { success: overallStatus !== 'FAILED', history: automation.executionHistory[0] };
  }

  stopAutomation(automationId) {
    const idStr = automationId.toString();
    if (this.scheduledTasks.has(idStr)) {
      this.scheduledTasks.get(idStr).stop();
      this.scheduledTasks.delete(idStr);
      return true;
    }
    return false;
  }
}

export const automationEngine = new AutomationEngine();
