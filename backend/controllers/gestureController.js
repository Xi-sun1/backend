const fs = require('fs');
const path = require('path');

// 简单占位实现：根据文件大小做粗略判断
// 文件越大（含更多细节）我们假定更可能是张开的手；这是临时逻辑，
// 可替换为真正的模型推理（MediaPipe / TFJS）。
exports.recognize = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 400, message: 'no image uploaded' });
    }

    const imagePath = req.file.path;
    const stats = fs.statSync(imagePath);
    const fileSize = stats.size; // bytes

    // 可通过 env 控制阈值
    const threshold = parseInt(process.env.GESTURE_FILESIZE_THRESHOLD || '60000', 10);

    let gesture = 'unknown';
    if (fileSize >= threshold) {
      gesture = 'open_hand';
    } else {
      gesture = 'fist';
    }

    // 删除临时文件
    fs.unlink(imagePath, err => {
      if (err) console.warn('failed to delete temp image', err);
    });

    return res.json({ code: 200, message: 'success', data: { gesture } });
  } catch (err) {
    console.error('gesture recognition error:', err);
    return res.status(500).json({ code: 500, message: 'internal error', error: err.message });
  }
};
