import * as pdfjs from 'pdfjs-dist';
import type { TextContent, TextItem } from 'pdfjs-dist/types/src/display/api.js';
import { orderBy } from 'lodash';
import { getLinkBoundingBoxes, PdfLinkBoundingBox } from './links.js';
import { boundingBoxesOverlap, expandBoundingBox } from './bounding-box.js';

// Makes parser available in bundle when document-loaders are used as dependency
pdfjs.GlobalWorkerOptions.workerSrc = require.resolve('pdfjs-dist/build/pdf.worker.min.js');

export async function loadPdfContentFromBuffer(buffer: ArrayBuffer): Promise<string> {
  const document = await pdfjs.getDocument(buffer).promise;
  let text = '';

  // pdf.js counts pages from 1 to N
  for (let pageNum = 1; pageNum <= document.numPages; pageNum++) {
    const page = await document.getPage(pageNum);
    const textContent = await page.getTextContent();
    const links = await getLinkBoundingBoxes(page);

    const textItems = normalize(textContent);
    const textBlocks = joinAdjacentPdfTexts(textItems);

    // The top-left corner is at (0, N), where N > 0.
    // Therefore, we need to sort Y in descending order and X in ascending order.
    const orderedTextBlocks = orderBy(textBlocks, ['y', 'x'], ['desc', 'asc']);
    applyLinks(orderedTextBlocks, links);

    text += orderedTextBlocks.map((block) => block.text).join('\n');
    text += `-Page (${pageNum}) Break-\n`;
  }

  return text;
}

type PdfTextBlock = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  // EOL -> end of line
  hasEOL: boolean;
};

function normalize(textContent: TextContent): PdfTextBlock[] {
  return textContent.items
    .filter((item): item is TextItem => !('id' in item))
    .map((textItem) => ({
      text: textItem.str,
      x: textItem.transform[4],
      y: textItem.transform[5],
      width: textItem.width,
      height: textItem.height,
      hasEOL: textItem.hasEOL,
    }));
}

/**
 * Combines text lines into cohesive multi-line text blocks.
 */
function joinAdjacentPdfTexts(texts: PdfTextBlock[]): PdfTextBlock[] {
  const joinedTexts: PdfTextBlock[] = [];
  let currentTextItem: PdfTextBlock | null = null;

  for (const textItem of texts) {
    if (!currentTextItem) {
      currentTextItem = textItem;
    } else {
      // Empty texts appear in odd locations; we need to ignore them while expanding the bounding box.
      if (textItem.text !== '') {
        currentTextItem = {
          ...(currentTextItem as PdfTextBlock),
          ...expandBoundingBox(currentTextItem, textItem),
        };
      }

      currentTextItem.text += textItem.text;
    }

    // The following rules were identified during the analysis of the pdf.js output. They might not be accurate in all cases.
    if (textItem.hasEOL) {
      if (textItem.text === '') {
        // No text, but hasEOL -> should start a new block
        joinedTexts.push(currentTextItem);
        currentTextItem = null;
      } else {
        // Text with EOL -> should add space and continue building
        currentTextItem.text += ' ';
      }
    }
  }

  // Edge case: last element on the page without an EOL.
  if (currentTextItem) {
    joinedTexts.push(currentTextItem);
  }

  return joinedTexts;
}

function applyLinks(textBlocks: PdfTextBlock[], links: PdfLinkBoundingBox[]): void {
  // In PDFs, links are annotations that hover over the document.
  // We need to repeatedly iterate over all the links to find those overlapping specific text blocks.
  textBlocks.forEach((block) => {
    links
      .filter((link) => boundingBoxesOverlap(link.bbox, block))
      .forEach((link) => {
        block.text += ` [link](${link.url})`;
      });
  });
}
