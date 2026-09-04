import { Automation } from '../models/Automation.js';
import { automationEngine } from '../services/automation/AutomationEngine.js';

export const getAutomations = async (req, res) => {
  try {
    const automations = await Automation.find({ userId: 'default-user' }).sort({ createdAt: -1 });
    res.json(automations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createAutomation = async (req, res) => {
  try {
    const { name, description, trigger, actions } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const automation = await Automation.create({
      userId: 'default-user',
      name,
      description: description || '',
      trigger: trigger || { type: 'SCHEDULE', cronExpression: '0 9 * * 1', humanSchedule: 'Every Monday at 9:00 AM' },
      actions: actions || []
    });

    if (automation.status === 'ACTIVE') {
      automationEngine.scheduleAutomation(automation);
    }

    res.status(201).json(automation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const runAutomationNow = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await automationEngine.runAutomation(id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleAutomationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const auto = await Automation.findById(id);
    if (!auto) return res.status(404).json({ error: 'Not found' });

    auto.status = auto.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    await auto.save();

    if (auto.status === 'ACTIVE') {
      automationEngine.scheduleAutomation(auto);
    } else {
      automationEngine.stopAutomation(auto._id);
    }

    res.json(auto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteAutomation = async (req, res) => {
  try {
    const { id } = req.params;
    automationEngine.stopAutomation(id);
    await Automation.findByIdAndDelete(id);
    res.json({ success: true, message: 'Automation deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
