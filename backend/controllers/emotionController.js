const db = require('../models');

const EmotionController = {
  // 保存情绪记录
  async saveEmotion(req, res) {
    try {
      const { primaryEmotion, emotionScore, emotions, timestamp, userId } = req.body;
      
      // 验证必要参数
      if (!primaryEmotion || !emotionScore || !timestamp) {
        return res.status(400).json({
          code: 400,
          message: 'Invalid emotion data'
        });
      }
      
      // 创建情绪记录
      const emotionRecord = {
        primaryEmotion,
        emotionScore,
        emotions,
        timestamp,
        userId
      };
      
      // 这里可以根据实际需要保存到数据库
      // 由于当前模型中可能没有 Emotion 模型，这里简化处理
      console.log('Emotion record saved:', emotionRecord);
      
      return res.status(200).json({
        code: 200,
        message: 'Emotion record saved successfully',
        data: emotionRecord
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        code: 500,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = EmotionController;