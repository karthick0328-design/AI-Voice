import { puppeteerService } from '../services/browser/PuppeteerService.js';

/**
 * Google Controller - Handles real Google browser automation
 */
export async function openGoogle(req, res) {
  try {
    const result = await puppeteerService.openGoogle();
    return res.json(result);
  } catch (error) {
    console.error('[GoogleController] openGoogle error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function searchGoogle(req, res) {
  try {
    const query = req.body?.query || req.query?.q || '';
    const result = await puppeteerService.searchGoogle(query);
    return res.json(result);
  } catch (error) {
    console.error('[GoogleController] searchGoogle error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function executeGoogleAction(req, res) {
  try {
    const { action, query } = req.body;
    if (action === 'open') {
      const result = await puppeteerService.openGoogle();
      return res.json(result);
    }
    const result = await puppeteerService.searchGoogle(query);
    return res.json(result);
  } catch (error) {
    console.error('[GoogleController] executeGoogleAction error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
