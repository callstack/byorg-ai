import { parsePdfContentToPages } from '../parser.js';

const PDF_INPUT = `7
Mauris
  Lorem  |   IS.11 - Maecenas vitae eros                                                                                                          Aenean commodo: 2 - Lorem

Quisque vestibulum
 vestibulum sed.
fringilla euismod.
commodo in, molestie
sed tortor. Proin
vehicula nisi sem.
Lorem ipsum dolor sit amet, consectetur
----------------Page (0) Break----------------
Mauris
8
Lorem ipsum
●Duis tristique sit amet eros,
●Nulla tempus nunc vel turpis iaculis
Curabitur turpis nisl, viverra vitae tempus et.
Phasellus vehicula dignissim egestas
●Nullam nec iaculis mi:
  6666
Quisque erat tortor, varius in commodo in, malesuada id lacus.
Ut semper bibendum leo, eu finibus
varius in commodo in:
●nec ornare purus consequat,
Aenean commodo arcu et erat pulvinar,
●Integer convallis turpis et risus dignissim,
●Vivamus nec turpis vel odio dapibus mollis.
  Lorem  |   IS.11 - Maecenas vitae eros                                                                                                          Aenean commodo: 2 - Lorem

Lorem ipsum
----------------Page (1) Break----------------
Mauris
9
Fusce lacinia ex sit amet sollicitudin volutpat.
1.Quisque erat tortor, varius in commodo in, malesuada id lacus. Proin vehicula nisi sem, sit amet iaculis nulla bibendum sed. Aenean
bibendum commodo magna nec cursus..
2.Nulla tempus nunc vel turpis iaculis, ut porta dui cursus. Nullam aliquet aliquet nulla, non porttitor quam lacinia vel. Maecenas vitae
eros egestas, viverra ipsum vitae, tincidunt nunc: Lorem Ipsum
3.Fusce in mattis velit. Aliquam sollicitudin ligula eu sem facilisis pharetra. Nullam nec iaculis mi. Vivamus vitae purus efficitur,
pellentesque metus non, mollis dolor
4.Proin vehicula nisi sem, sit amet iaculis nulla bibendum sed. Aenean bibendum commodo magna nec cursus. Aenean commodo
arcu et erat pulvinar, et sagittis tellus blandit.
5.Maecenas vitae eros egestas, viverra ipsum vitae, tincidunt nunc. Nullam vitae elit eu est lobortis efficitur.
6.Duis tristique sit amet eros ut vehicula. In eu cursus orci. Suspendisse dictum arcu nec interdum consectetur.
7.Aenean commodo arcu et erat pulvinar.
8.Integer convallis turpis et risus dignissim, nec ornare purus consequat.
  Lorem  |   IS.11 - Maecenas vitae eros                                                                                                          Aenean commodo: 2 - Lorem

Proin ullamcorper ex
----------------Page (2) Break----------------`;

test(`Parses PDF Content`, () => {
  const pages = parsePdfContentToPages(PDF_INPUT);
  expect(pages).toMatchInlineSnapshot(`
    [
      "7
    Mauris
    Lorem | IS.11 - Maecenas vitae eros Aenean commodo: 2 - Lorem
    Quisque vestibulum
    vestibulum sed.
    fringilla euismod.
    commodo in, molestie
    sed tortor. Proin
    vehicula nisi sem.
    Lorem ipsum dolor sit amet, consectetur",
      "Mauris
    8
    Lorem ipsum
    ●Duis tristique sit amet eros,
    ●Nulla tempus nunc vel turpis iaculis
    Curabitur turpis nisl, viverra vitae tempus et.
    Phasellus vehicula dignissim egestas
    ●Nullam nec iaculis mi:
    6666
    Quisque erat tortor, varius in commodo in, malesuada id lacus.
    Ut semper bibendum leo, eu finibus
    varius in commodo in:
    ●nec ornare purus consequat,
    Aenean commodo arcu et erat pulvinar,
    ●Integer convallis turpis et risus dignissim,
    ●Vivamus nec turpis vel odio dapibus mollis.
    Lorem | IS.11 - Maecenas vitae eros Aenean commodo: 2 - Lorem
    Lorem ipsum",
      "Mauris
    9
    Fusce lacinia ex sit amet sollicitudin volutpat.
    1.Quisque erat tortor, varius in commodo in, malesuada id lacus. Proin vehicula nisi sem, sit amet iaculis nulla bibendum sed. Aenean
    bibendum commodo magna nec cursus..
    2.Nulla tempus nunc vel turpis iaculis, ut porta dui cursus. Nullam aliquet aliquet nulla, non porttitor quam lacinia vel. Maecenas vitae
    eros egestas, viverra ipsum vitae, tincidunt nunc: Lorem Ipsum
    3.Fusce in mattis velit. Aliquam sollicitudin ligula eu sem facilisis pharetra. Nullam nec iaculis mi. Vivamus vitae purus efficitur,
    pellentesque metus non, mollis dolor
    4.Proin vehicula nisi sem, sit amet iaculis nulla bibendum sed. Aenean bibendum commodo magna nec cursus. Aenean commodo
    arcu et erat pulvinar, et sagittis tellus blandit.
    5.Maecenas vitae eros egestas, viverra ipsum vitae, tincidunt nunc. Nullam vitae elit eu est lobortis efficitur.
    6.Duis tristique sit amet eros ut vehicula. In eu cursus orci. Suspendisse dictum arcu nec interdum consectetur.
    7.Aenean commodo arcu et erat pulvinar.
    8.Integer convallis turpis et risus dignissim, nec ornare purus consequat.
    Lorem | IS.11 - Maecenas vitae eros Aenean commodo: 2 - Lorem
    Proin ullamcorper ex",
    ]
  `);
});
