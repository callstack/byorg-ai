export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function boundingBoxesOverlap(box1: BoundingBox, box2: BoundingBox) {
  return (
    box2.x <= box1.x + box1.width &&
    box2.x + box2.width >= box1.x &&
    box2.y <= box1.y + box1.height &&
    box2.y + box2.height >= box1.y
  );
}

export function expandBoundingBox(box1: BoundingBox, box2: BoundingBox): BoundingBox {
  const xMin = Math.min(box1.x, box2.x);
  const yMin = Math.min(box1.y, box2.y);

  const xMax = Math.max(box1.x + box1.width, box2.x + box2.width);
  const yMax = Math.max(box1.y + box1.height, box2.y + box2.height);

  const newWidth = xMax - xMin;
  const newHeight = yMax - yMin;

  return {
    x: xMin,
    y: yMin,
    width: newWidth,
    height: newHeight,
  };
}
