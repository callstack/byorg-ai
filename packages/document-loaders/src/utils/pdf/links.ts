import type { PDFPageProxy } from 'pdfjs-dist';
import { uniqWith } from 'lodash';
import { BoundingBox, boundingBoxesOverlap } from './bounding-box.js';

export type PdfLinkBoundingBox = {
  url: string;
  bbox: BoundingBox;
};

export async function getLinkBoundingBoxes(page: PDFPageProxy): Promise<PdfLinkBoundingBox[]> {
  const annotations = await page.getAnnotations({ intent: 'display' });
  const bboxes = annotations
    .filter((annot) => annot.subtype === 'Link' && annot.rect && annot.url)
    .map((annot) => ({
      url: annot.url,
      bbox: {
        x: annot.rect[0],
        y: annot.rect[1],
        width: annot.rect[2] - annot.rect[0],
        height: annot.rect[3] - annot.rect[1],
      },
    }));

  // Remove duplicates
  return uniqWith(bboxes, (a, b) => boundingBoxesOverlap(a.bbox, b.bbox) && a.url === b.url);
}
