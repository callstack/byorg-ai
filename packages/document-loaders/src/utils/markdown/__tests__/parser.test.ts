import { normalizeMarkdown } from '../normalizer.js';

const MARKDOWN_INPUT = `Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
architecto beatae vitae dicta sunt explicabo.
![][image1]Nemo enim ipsam voluptatem quia voluptas sit
aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem
sequi nesciunt.
\\- Neque porro quisquam est
\\- Qui dolorem ipsum quia dolor sit amet
\\- Consectetur
adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam
aliquam quaerat voluptatem.
● Ut enim ad minima veniam.● quis nostrum exercitationem.● ullam corporis
suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?
![][image2]Quis autem vel eum iure
reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum
qui dolorem eum fugiat quo voluptas nulla pariatur?
[image2]:
<data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAuUAAAE9CAYAAACsvxwhAACAAEl>`;

test(`Parses Markdown Content`, async () => {
  const pages = await normalizeMarkdown(MARKDOWN_INPUT);
  expect(pages).toMatchInlineSnapshot(`
    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
    doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
    architecto beatae vitae dicta sunt explicabo.
    Nemo enim ipsam voluptatem quia voluptas sit
    aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem
    sequi nesciunt.
    - Neque porro quisquam est
    - Qui dolorem ipsum quia dolor sit amet
    - Consectetur
    adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam
    aliquam quaerat voluptatem.
    - Ut enim ad minima veniam.
    - quis nostrum exercitationem.
    - ullam corporis
    suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?
    Quis autem vel eum iure
    reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum
    qui dolorem eum fugiat quo voluptas nulla pariatur?"
  `);
});
