# Remote Markdown Image Inventory

This inventory tracks legacy Markdown images that still use `http://` URLs.
They bypass Astro image optimization, may trigger mixed-content failures, and
do not provide local intrinsic dimensions.

- Total remote `http://` Markdown images: 547
- Affected blog files: 44
- Raw HTML `http://` image tags: 2
- Current decision: do not batch migrate automatically; migrate high-value posts manually.

## Affected Files

| File | Count | Sample URLs |
| --- | ---: | --- |
| `cs229-machine-learning-notes-lecture-1-4-1e9df2.md` | 10 | `photo-1468956332313-2dcf1542828f.jpg`, `screenshot_719.png`, `screenshot_720.png` |
| `cs229-machine-learning-notes-lecture-1-4-a58908.md` | 25 | `luxury-silver-pen-with-a-business-diary-picjumbo-com.jpg`, `screenshot_665.png`, `screenshot_666.png` |
| `cs229-machine-learning-notes-lecture-1-4-fd0d49.md` | 22 | `creative-designer-photographer-workspace-picjumbo-com.jpg`, `screenshot_688.png`, `screenshot_690.png` |
| `cs229-machine-learning-notes-lecture-5-6-292071.md` | 16 | `c5928e75-429e-44ff-9315-c4aa81351ed3.jpg`, `logisticregression1.jpg`, `screenshot_728.png` |
| `cs229-machine-learning-notes-lecture-6-840d8f.md` | 5 | `photo-1414115880398-afebc3d95efc.jpg`, `screenshot_690.png`, `screenshot_747.png` |
| `cs229-machine-learning-notes-lecture-7-76e6e9.md` | 5 | `photo-1420768255295-e871cbf6eb81.jpg`, `screenshot_751.png`, `screenshot_752.png` |
| `cs229-machine-learning-notes-lecture-8-1-1b0e33.md` | 7 | `s2du5grogtc-martin-ezequiel-sanchez.jpg`, `screenshot_759.png`, `screenshot_760.png` |
| `cs229-machine-learning-notes-lecture-8-2-30624c.md` | 5 | `lo_llbs1rs0-jan-senderek.jpg?imageMogr2/thumbnail/!50p`, `screenshot_765.png`, `screenshot_766.png` |
| `cs229-machine-learning-notes-lecture-8-a0e24e.md` | 6 | `wazehlrp98s-jamison-mcandie.jpg`, `screenshot_897.png`, `screenshot_755.png` |
| `cs229-machine-learning-notes-lecture-9-dc201e.md` | 1 | `lo_llbs1rs0-jan-senderek.jpg?imageMogr2/thumbnail/!50p` |
| `cs229-machine-learning-notes-toc-5106bd.md` | 1 | `andrewng2.jpg` |
| `deeplearning-ai-improving-deep-neural-networks-week1-2fb66b.md` | 18 | `screenshot_1325.png`, `screenshot_1329.png?imageMogr/v2/thumbnail/!35p`, `screenshot_1330.png?imageMogr/v2/thumbnail/!35p` |
| `deeplearning-ai-improving-deep-neural-networks-week2-db69b9.md` | 1 | `screenshot_1326.png` |
| `deeplearning-ai-improving-deep-neural-networks-week3-6dd73f.md` | 1 | `screenshot_1327.png` |
| `deeplearning-ai-neural-networks-and-deep-learning-week1-3ec8b9.md` | 1 | `andrewng-deeplearningai.jpeg` |
| `deeplearning-ai-neural-networks-and-deep-learning-week2-b880d1.md` | 17 | `screenshot_1266.png`, `screenshot_1270.png?imageMogr/v2/thumbnail/!35p`, `screenshot_1265.png?imageMogr/v2/thumbnail/!35p` |
| `deeplearning-ai-neural-networks-and-deep-learning-week3-462014.md` | 16 | `screenshot_1286.png`, `screenshot_1287.png?imageMogr/v2/thumbnail/!35p`, `screenshot_1288.png?imageMogr/v2/thumbnail/!35p` |
| `deeplearning-ai-neural-networks-and-deep-learning-week4-260b02.md` | 9 | `screenshot_1305.png`, `screenshot_1306.png?imageMogr/v2/thumbnail/!20p`, `screenshot_1308.png?imageMogr/v2/thumbnail/!20p` |
| `deeplearning-ai-toc-60d1e9.md` | 1 | `screenshot_1263.png` |
| `gaussian-mixture-model-and-expectation-maximun-algorithm-33a0f7.md` | 22 | `luxury-silver-pen-with-a-business-diary-picjumbo-com.jpg`, `gmm1.png`, `gmm2.png` |
| `machine-learning-andrew-ng-my-notes-ceed8d.md` | 1 | `AndrewHallway2.jpg` |
| `machine-learning-andrew-ng-my-notes-week-1-introduction-3a4f3b.md` | 9 | `screenshot_03.png`, `img_1.jpg?imageMogr/v2/thumbnail/!45p`, `img_1022aa.jpg?imageMogr/v2/thumbnail/!45p` |
| `machine-learning-andrew-ng-my-notes-week-1-linear-regression-with-one-variable-bf510c.md` | 36 | `screenshot_02.png`, `screenshot_05.png?imageMogr/v2/thumbnail/!45p`, `screenshot_583.png?imageMogr/v2/thumbnail/!55p` |
| `machine-learning-andrew-ng-my-notes-week-10-large-scale-machine-learning-8062a3.md` | 17 | `screenshot_346.png`, `screenshot_348.png`, `screenshot_349.png` |
| `machine-learning-andrew-ng-my-notes-week-11-application-example-photo-ocr-7e5373.md` | 26 | `screenshot_365.png`, `screenshot_366.png?imageMogr2/thumbnail/!75p`, `screenshot_367.png?imageMogr2/thumbnail/!75p` |
| `machine-learning-andrew-ng-my-notes-week-2-linear-regression-with-multiple-variables-cd5a20.md` | 19 | `screenshot_35.png`, `screenshot_36.png?imageMogr/v2/thumbnail/!55p`, `screenshot_37.png?imageMogr/v2/thumbnail/!55p` |
| `machine-learning-andrew-ng-my-notes-week-2-octave-tutorial-d87004.md` | 18 | `screenshot_63.png`, `screenshot_598.png?imageMogr/v2/thumbnail/!45p`, `GaussianDistribution.png` |
| `machine-learning-andrew-ng-my-notes-week-3-chicken-soup-7d6784.md` | 2 | `andrewngandhiswift.jpg?imageMogr2/thumbnail/!60p`, `screenshot_115.png` |
| `machine-learning-andrew-ng-my-notes-week-3-logistic-regression-d6759b.md` | 29 | `screenshot_67.png`, `screenshot_68.png`, `screenshot_615.png` |
| `machine-learning-andrew-ng-my-notes-week-3-regularization-186a2e.md` | 14 | `screenshot_100.png`, `screenshot_101.png`, `screenshot_102.png` |
| `machine-learning-andrew-ng-my-notes-week-4-neural-networks-representation-32b920.md` | 16 | `screenshot_119.png`, `screenshot_120.png`, `screenshot_121.png` |
| `machine-learning-andrew-ng-my-notes-week-5-neural-networks-learning-2f45f7.md` | 20 | `screenshot_150.png`, `screenshot_151.png`, `screenshot_152.png` |
| `machine-learning-andrew-ng-my-notes-week-6-advice-for-applying-machine-learning-6dadbc.md` | 22 | `screenshot_177.png`, `screenshot_178.png`, `screenshot_181.png` |
| `machine-learning-andrew-ng-my-notes-week-6machine-learning-system-design-8d1d9c.md` | 15 | `screenshot_201.png`, `screenshot_202.png`, `screenshot_203.png` |
| `machine-learning-andrew-ng-my-notes-week-7-support-vector-machines-3a44b7.md` | 30 | `screenshot_217.png`, `screenshot_218.png`, `screenshot_219.png` |
| `machine-learning-andrew-ng-my-notes-week-8-dimensionality-reduction-1eb48c.md` | 25 | `screenshot_276.png`, `screenshot_278.png`, `screenshot_279.png` |
| `machine-learning-andrew-ng-my-notes-week-8-unsupervised-learning-f2d90d.md` | 17 | `screenshot_259.png`, `screenshot_260.png`, `screenshot_261.png` |
| `machine-learning-andrew-ng-my-notes-week-9-anomaly-detection-c94b60.md` | 18 | `screenshot_303.png`, `screenshot_304.png`, `screenshot_305.png` |
| `machine-learning-andrew-ng-my-notes-week-9-recommender-systems-0a92a5.md` | 16 | `screenshot_326.png`, `screenshot_327.png`, `screenshot_345.png` |
| `machine-learning-resources-04f643.md` | 1 | `aa1e0f20-7d7b-48d9-8fbf-2240133628cb.jpg` |
| `mathmatical-formula-within-markdown-68c897.md` | 3 | `Snip20160402_3.png`, `Snip20160402_4.png`, `Snip20160402_5.png` |
| `sort-algorithm-part1-be53f7.md` | 1 | `luxury-silver-pen-with-a-business-diary-picjumbo-com.jpg` |
| `sort-algorithm-part2-7e4858.md` | 1 | `luxury-silver-pen-with-a-business-diary-picjumbo-com.jpg` |
| `support-vector-machines-sumup-eeb873.md` | 2 | `lo_llbs1rs0-jan-senderek.jpg?imageMogr2/thumbnail/!50p`, `screenshot_746.png` |

## Migration Guidance

1. Start with high-traffic posts or posts with 20+ remote images.
2. Save reviewed images under `public/images/posts/<slug>/`.
3. Replace `http://` Markdown URLs with local paths.
4. Add dimensions or use Astro image handling if the image is moved into the asset pipeline later.

## Raw HTML Image Tags

These images are not counted in the Markdown image total above because they are
embedded as raw HTML.

| File | URL |
| --- | --- |
| `machine-learning-andrew-ng-my-notes-week-2-linear-regression-with-multiple-variables-cd5a20.md` | `http://7xrrje.com1.z0.glb.clouddn.com/screenshot_47.png?imageMogr/v2/thumbnail/!55p` |
| `cs229-machine-learning-notes-lecture-1-4-fd0d49.md` | `http://7xrrje.com1.z0.glb.clouddn.com/screenshot_689.png` |
