import { createCanvas } from 'canvas';
import { Fragment, useState } from 'react';
import RgbQuant from 'rgbquant';

function componentToHex(c) {
  let hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function App() {
  const [he, setHe] = useState([]);
  const onFileChange = (e) => {
    const fr = new FileReader();
    fr.onloadend = () => buildCanvasFromImage(fr.result);
    fr.readAsDataURL(e.target.files[0]);
  }

  const buildCanvasFromImage = (file) => {
    let img, can, ctx, q, out, pal;

    img = new Image();
    img.src = file;

    img.onload = () => {
      const imgWidth = img.width;
      const imgHeight = img.height;
      can = createCanvas(imgWidth, imgHeight)
      ctx = can.getContext('2d');
      ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

      q = new RgbQuant({
        colors: 5,
        retType: 1
      });
      q.sample(can);
      pal = q.palette(true);
      out = q.reduce(can);

      setHe(pal.map(p => rgbToHex(p[0], p[1], p[2])));

      let canva = document.getElementById("blabla");

      canva.width = imgWidth;
      canva.height = imgHeight;

      const ctxa = canva.getContext("2d");
      const UAC = new Uint8ClampedArray(out, imgWidth, imgHeight);
      const DAT = new ImageData(UAC, imgWidth, imgHeight);
      ctxa.putImageData(DAT, 0, 0);
    }
  };

  return (
    <div>
      <input type="file" onChange={onFileChange} />
      <br />
      {!!he.length && (
        <Fragment>
          <br />
          <div style={{ display: 'flex' }}>
            {he.map(c => <span style={{ display: 'block', height: 20, width: 20, backgroundColor: c }} />)}
          </div>
        </Fragment>
      )}
      <br />
      <canvas id="blabla" />
    </div>
  );
}

export default App;
