const express = require('express');
const router = express.Router();
const youtubedl = require('youtube-dl-exec');
const logger = require('progress-estimator')();
const fs = require('fs');
const path = require('path');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/downloadmp3', async (req, res) => {
  const { URL } = req.body;
  console.log(URL);

  try {
    // 獲取影片信息，包括標題
    const info = await youtubedl(URL, { dumpSingleJson: true });

    // 只保留英文字母、數字、空格、下劃線和破折號，保留中文字符
    let title = info.title.replace(/[\/\\?%*:|"<>]/g, '_'); // 替換不允許的字符

    const fileName = `${title}.mp3`;
    const filePath = path.join(__dirname, 'downloads', fileName);

    // 使用 youtube-dl-exec 下載音頻文件
    await youtubedl(URL, {
      format: 'bestaudio',
      audioFormat: 'mp3',
      output: filePath,
    });

    // 使用進度條更新提示
    logger(filePath, `正在下載 ${info.title} 的音樂`).then(() => {
      console.log('下載完成');
    }).catch((error) => {
      console.log(error);
    });

    // 設置 Content-Disposition，指定 UTF-8 編碼的文件名
    res.setHeader('Content-Disposition', `attachment; filename*=${encodeURIComponent(title)}`);
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.log(err);
      }

      // 刪除服務器上的臨時文件
      fs.unlinkSync(filePath);
    });

  } catch (error) {
    console.log(error);
    res.status(500).send('下載失敗');
  }
});

module.exports = router;
