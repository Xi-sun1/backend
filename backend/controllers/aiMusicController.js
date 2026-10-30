const axios = require('axios');
const https = require('https');

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';

// MusicGen model version on Replicate
const MUSICGEN_VERSION = '671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb';

const AiMusicController = {
  /**
   * POST /api/ai-music/generate
   * 提交 AI 音乐生成任务 (Replicate MusicGen)
   */
  async generate(req, res) {
    try {
      if (!REPLICATE_API_TOKEN) {
        return res.status(500).json({
          code: 500,
          message: '服务器未配置 AI 生成服务 (REPLICATE_API_TOKEN)'
        });
      }

      const { mood, style, prompt } = req.body;

      // 构建 prompt
      const tags = [];
      if (mood) tags.push(mood);
      if (style) tags.push(style);
      let fullPrompt = tags.join(', ');
      if (prompt) fullPrompt = fullPrompt ? `${fullPrompt}: ${prompt}` : prompt;
      if (!fullPrompt.trim()) fullPrompt = 'calm, peaceful music';
      if (fullPrompt.length > 500) fullPrompt = fullPrompt.substring(0, 500);

      console.log('[AI Music] 生成请求:', { mood, style, prompt, fullPrompt });

      const response = await axios.post(
        REPLICATE_API_URL,
        {
          version: MUSICGEN_VERSION,
          input: {
            prompt: fullPrompt,
            duration: 8,
            model_version: 'stereo-large',
            output_format: 'mp3',
            normalization_strategy: 'loudness'
          }
        },
        {
          headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000,
          httpsAgent: new https.Agent({ family: 4 })
        }
      );

      const { id, status } = response.data;
      console.log('[AI Music] 任务已创建:', id, status);

      return res.status(200).json({
        code: 200,
        message: '任务已提交',
        data: { predictionId: id, status }
      });

    } catch (err) {
      const errData = err.response?.data;
      console.error('[AI Music] 提交失败:', errData || err.message);
      return res.status(500).json({
        code: 500,
        message: '生成任务提交失败',
        data: errData || err.message
      });
    }
  },

  /**
   * GET /api/ai-music/status/:predictionId
   * 查询任务状态，完成后返回音频 URL
   */
  async status(req, res) {
    try {
      if (!REPLICATE_API_TOKEN) {
        return res.status(500).json({
          code: 500,
          message: '服务器未配置 AI 生成服务'
        });
      }

      const { predictionId } = req.params;

      const response = await axios.get(
        `${REPLICATE_API_URL}/${predictionId}`,
        {
          headers: {
            'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000,
          httpsAgent: new https.Agent({ family: 4 })
        }
      );

      const { status, output, error, logs } = response.data;

      return res.status(200).json({
        code: 200,
        message: '查询成功',
        data: { status, output, error, logs }
      });

    } catch (err) {
      console.error('[AI Music] 查询失败:', err.response?.data || err.message);
      return res.status(500).json({
        code: 500,
        message: '查询任务状态失败',
        data: err.response?.data || err.message
      });
    }
  }
};

module.exports = AiMusicController;
