const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

module.exports.imgUrlDownload = async ({ m_url, imgUrl, name }) => {
  const urlSlicer = new RegExp('(ico|png|jpg|jpeg)');
  const _ = urlSlicer.exec(imgUrl);
  const exr =
    _ === null && imgUrl.indexOf('githubusercontent') > -1 ? 'png' : _[1];

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  const viewSource = await page.goto(imgUrl);

  // 디렉토리 있는지 체크 없으면 만들기
  // url 16진수로 변환 파일네임 생성
  const isDir = ({ m_url }) =>
    encodeURI(m_url)
      .replace(new RegExp('/', 'g'), '%2F')
      .replace(new RegExp(':', 'g'), '%3A');
  const createImg = async (dir) => {
    const fileDir = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'static',
      dir,
    );
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir);
      createImg(dir);
    } else {
      const filePath = path.resolve(fileDir, `${name}.${exr}`);
      const writeStream = fs.createWriteStream(filePath);
      writeStream.write(await viewSource.buffer(), (err) => {
        if (err) console.error(err);
      });
    }
  };
  createImg(isDir({ m_url }));
  return [encodeURI(isDir({ m_url })), `${name}.${exr}`].join('/');
};
