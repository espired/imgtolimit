import { createCanvas } from 'canvas';
import { Fragment, useCallback, useEffect, useState } from 'react';
import RgbQuant from 'rgbquant';
import { TwitterPicker } from 'react-color';
import usePrevious from './hoc/usePrevious';

function hexToRgb(hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

function componentToHex(c) {
  let hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function ColorBlock({ color , onClick}) {
  return (
    <span style={{ display: 'block', height: 20, width: 20, backgroundColor: color }} onClick={() => onClick(color)} />
  );
}

function App() {
  const [imgData, setImageData] = useState();
  const [he, setHe] = useState([]);
  const prevHe = usePrevious(he);
  const [selectedColor, setSelectedColor] = useState();

  const onFileChange = (e) => {
    const fr = new FileReader();
    fr.onloadend = () => onImageLoad(fr.result);
    fr.readAsDataURL(e.target.files[0]);
  }

  const onImageLoad = (file) => {
    let img = new Image();
    img.src = file;

    img.onload = () => setImageData(img);
  }

  const recolorCanvas = useCallback(() => {
    const canva = document.getElementById("blabla");
    if(!canva || !imgData) return;

    const ctx = canva.getContext("2d");

    const imgWidth = imgData.width;
    const imgHeight = imgData.height;

    let imageData = ctx.getImageData(0, 0, canva.width, canva.height);
    let pixelDataArray = imageData.data;
    const paletteToRgb = he.map(c => hexToRgb(c));
    const prevPaletteToRgb = prevHe.map(c => hexToRgb(c));

    const prevSelectedColor = prevPaletteToRgb[selectedColor];

    if(!prevSelectedColor) return;

    const newSelectedColor = paletteToRgb[selectedColor];

    for (let i = 0; i < pixelDataArray.length; i += 4) {
      if(
        pixelDataArray[i] === prevSelectedColor[0] &&
        pixelDataArray[i+1] === prevSelectedColor[1] &&
        pixelDataArray[i+2] === prevSelectedColor[2] ) {
          pixelDataArray[i] = newSelectedColor[0];
          pixelDataArray[i+1] = newSelectedColor[1];
          pixelDataArray[i+2] = newSelectedColor[2];
      }
    }

    const DAT = new ImageData(pixelDataArray, imgWidth, imgHeight);

    ctx.putImageData(DAT, 0, 0);

  }, [he, imgData, prevHe, selectedColor]);

  const buildCanvasFromImage = useCallback(() => {
    if (!imgData) return;

    let can, ctx, q, out, pal;

    const imgWidth = imgData.width;
    const imgHeight = imgData.height;
    can = createCanvas(imgWidth, imgHeight)
    ctx = can.getContext('2d');
    ctx.drawImage(imgData, 0, 0, imgWidth, imgHeight);

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
  }, [imgData]);

  const onChangeColor = (c) => {
    setHe(prevHe => {
      const newArr = [...prevHe];
      newArr[selectedColor] = c.hex;
      return newArr;
    });
  }

  useEffect(() => {
    buildCanvasFromImage();
  }, [buildCanvasFromImage, imgData]);

  useEffect(() => {
    if(!he) return;

    recolorCanvas();
  }, [he, recolorCanvas]);

  return (
    <div>
      <input type="file" onChange={onFileChange} />
      {selectedColor > -1 && (
        <Fragment>
          <br />
          <TwitterPicker value={he[selectedColor]} onChange={onChangeColor} />
        </Fragment>
      )}
      <br />
      {!!he.length && (
        <Fragment>
          <br />
          <div style={{ display: 'grid', gridAutoFlow: 'column', columnGap: 8, gridAutoColumns: 'max-content' }}>
            {he.map((c, i) => <ColorBlock color={c} onClick={() => setSelectedColor(i)} />)}
          </div>
        </Fragment>
      )}
      <br />
      <canvas id="blabla" />
    </div>
  );
}

export default App;
