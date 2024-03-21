// import { sub } from 'vec-la';
import { sub } from "https://cdn.jsdelivr.net/npm/vec-la/+esm";

let isDebug = false;
const boardOrigin = { x: 0, y: 0 };

export const setBoardOrigin = ([x, y]) => {
  boardOrigin.x = x;
  boardOrigin.y = y;
};

export const getValueByScale = (value, scaleFactor) => {
  if (scaleFactor < 1) {
    return value * (1 / scaleFactor);
  }

  return value / scaleFactor;
};

export const checkCollisionFrom2Positions = (
  startPosition = [0, 0],
  endPosition = [0, 0],
  data = [],
  scaleFactor = 1
) => {
  const { x, y, width, height } = positionningRect2Dom(
    startPosition,
    endPosition
  );
  const xScale = x;
  const yScale = y;
  const widthScale = width;
  const heightScale = height;

  return checkCollisionFrom2Size(
    [xScale, yScale],
    [widthScale, heightScale],
    data,
    scaleFactor
  );
};

export const checkCollisionFrom2Size = (
  startPosition = [0, 0],
  size = [0, 0],
  data,
  scaleFactor = 1
) => {
  const [x, y] = startPosition;
  const [width, height] = size;
  return checkCollision(
    {
      x,
      y,
      width,
      height,
    },
    data,
    scaleFactor
  );
};

export const checkCollision = (bound, data, scaleFactor = 1) => {
  // console.log('data', data.length, data);
  return data.filter(({ x, y, id, size }) => {
    const [width, height] = size;

    const xScale = x * scaleFactor + (boardOrigin.x || 0);
    const yScale = y * scaleFactor + (boardOrigin.y || 0);
    const widthScale = width * scaleFactor;
    const heightScale = height * scaleFactor;

    // console.log('--->', xScale, yScale);
    // console.log('>>', window.boardOrigin);

    return (
      bound.x < xScale + widthScale &&
      bound.x + bound.width > xScale &&
      bound.y < yScale + heightScale &&
      bound.y + bound.height > yScale
    );
  });
};

export const positionningRect2Dom = (
  startPosition = [0, 0],
  endPosition = [0, 0],
  offset = [0, 0]
) => {
  const [width, height] = sub(endPosition, startPosition);
  const [xStart, yStart] = startPosition;
  const [xEnd, yEnd] = endPosition;

  const x = xEnd < xStart ? xEnd : xStart;
  const y = yEnd < yStart ? yEnd : yStart;

  return positionningRectFromSize(
    [x, y],
    [Math.abs(width), Math.abs(height)],
    offset
  );
};

export const positionningRectFromSize = (
  startPosition = [0, 0],
  size = [0, 0],
  offset = [0, 0]
) => {
  const [xStart, yStart] = startPosition;
  const [xOffset, yOffset] = offset;
  const [width, height] = size;

  const [x, y] = [xStart, yStart];
  const x2 = x + width;
  const y2 = y + height;

  return {
    x: x + xOffset,
    y: y + yOffset,
    x2: x2 + xOffset,
    y2: y2 + yOffset,
    width,
    height,
    start: {
      x: xStart + xOffset,
      y: yStart + yOffset,
    },
    end: {
      x: x2 + xOffset,
      y: y2 + yOffset,
    },
  };
};

export const positionToCSSTranslate = (x, y) => ({
  transform: `translate3d(${x}px, ${y}px, 0)`,
});

export const rectPositionToCSSProperties = ({ x, y, width, height }) => {
  let display = "";
  if (width === 0 && height === 0) {
    display = "none";
  }
  return {
    ...positionToCSSTranslate(x, y),
    width: `${width}px`,
    height: `${height}px`,
    display,
  };
};
