/**
 * BingEnhancer - Main content script
 * Adds search buttons and bang support to Bing and Ecosia
 */

console.log("[BingEnhancer] Script loaded");

/**
 * Initialize the bang parser with available bangs
 * BANGS is defined in bangs.js which is loaded before this script
 */
let bangParser = null;
if (typeof window !== "undefined" && window.BANGS) {
  console.log("[BingEnhancer] BANGS found, initializing parser");
  try {
    bangParser = new BangParser(window.BANGS);
    console.log("[BingEnhancer] BangParser initialized successfully");
  } catch (error) {
    console.error("[BingEnhancer] Error initializing BangParser:", error);
  }
} else {
  console.warn("[BingEnhancer] BANGS not found - bangs.js may not have loaded");
}

/**
 * Detect which search engine we're on
 */
function detectSite() {
  const hostname = window.location.hostname;
  if (hostname.includes("bing.com")) {
    return "bing";
  } else if (hostname.includes("ecosia.org")) {
    return "ecosia";
  }
  return null;
}

const CURRENT_SITE = detectSite();

/**
 * Track initialization state
 */
const INIT_STATE = {
  bingInitialized: false,
  ecosiaInitialized: false,
};

/**
 * SVG icons (from react-icons)
 */
const ICONS = {
  google:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M564 325.8C564 467.3 467.1 568 324 568C186.8 568 76 457.2 76 320C76 182.8 186.8 72 324 72C390.8 72 447 96.5 490.3 136.9L422.8 201.8C334.5 116.6 170.3 180.6 170.3 320C170.3 406.5 239.4 476.6 324 476.6C422.2 476.6 459 406.2 464.8 369.7L324 369.7L324 284.4L560.1 284.4C562.4 297.1 564 309.3 564 325.8z"/></svg>',
  brave:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M241.6 64L398.6 64L443.3 114.8C443.3 114.8 482.6 103.9 501.1 122.4C519.6 140.9 534.9 157.3 534.9 157.3L522.9 186.8L538.2 230.5C538.2 230.5 493.3 400.7 488.1 421.5C477.7 462.4 470.7 478.3 441.2 499C411.7 519.7 358.3 555.8 349.6 561.2C347.7 562.4 345.7 563.7 343.7 565.1C336.2 570.2 327.9 575.9 320.2 575.9C312.5 575.9 304.1 570.2 296.7 565.1C294.7 563.7 292.7 562.3 290.8 561.2C282.1 555.7 228.7 519.7 199.2 499C169.7 478.3 162.7 462.4 152.3 421.5C147 400.7 102.2 230.5 102.2 230.5L117.5 186.8L105.3 157.3C105.3 157.3 120.6 140.9 139.1 122.4C157.6 103.9 196.9 114.8 196.9 114.8L241.6 64zM320.1 471.6C323.8 471.6 329 466.9 333.1 463.2C333.7 462.7 334.3 462.1 334.8 461.7C339 458 382.6 424.2 385.8 421.9C389 419.6 391.2 415.4 387.7 413.2C384.9 411.5 377.7 407.7 367.4 402.4C364.4 400.8 361.1 399.2 357.7 397.4C342.3 389.4 323.2 382.7 320.2 382.7C317.2 382.7 298.1 389.5 282.7 397.4C279.2 399.2 276 400.9 273 402.4C262.7 407.7 255.4 411.5 252.7 413.2C249.1 415.4 251.3 419.6 254.6 421.9C257.9 424.2 301.4 458 305.6 461.7C306.1 462.2 306.7 462.7 307.3 463.2C311.4 466.9 316.6 471.6 320.3 471.6L320.1 471.6zM320.1 305.9C324.8 305.9 337.7 302.9 346.5 300.9L348.5 300.4C356.3 298.6 355.8 294.1 354.9 287.4C354.8 286.6 354.7 285.8 354.6 285C354 278.9 348.8 251.9 345.5 234.7C344.4 228.9 343.5 224.2 343.1 221.8C341.6 213.7 342.5 212.4 343.8 210.5C344 210.2 344.3 209.8 344.5 209.4C345.9 207.1 360.5 203.2 372.4 199.9C374.9 199.2 377.2 198.6 379.3 198C389.9 195 411.7 197.4 423.5 198.6C425.3 198.8 426.9 199 428.2 199.1C437.8 200 438.6 201.4 435.4 202.9C433.1 204 419.2 209.2 406.7 213.8C402 215.6 397.5 217.3 393.9 218.6C392.4 219.1 390.9 219.7 389.4 220.3C376.9 224.9 362.2 230.3 360.5 239.7C359 248 365.7 259.6 371.8 270C373.4 272.8 375 275.5 376.4 278.1C382.7 290 382.9 291.4 382.5 296.2C382.1 300.1 368 308.9 360.1 313.8C358.3 314.9 356.8 315.9 355.9 316.5C355.1 317 353.8 317.9 352.1 318.9C343.5 324.1 325.8 334.9 325.8 341.4C325.8 349.2 350.4 369.5 358.2 374.6C366 379.7 387.1 390.7 396.1 392.4C405.1 394.1 419.1 383.9 427.3 368.6C435 354.2 429 340.1 424.1 328.6L423.2 326.4C418.7 315.8 425.1 309.4 429.4 305.1C429.9 304.6 430.4 304.1 430.8 303.7L473.8 258C475.1 256.7 476.3 255.4 477.5 254.2C483.3 248.5 488.3 243.7 488.3 231.4C488.3 216.5 430.8 146.9 430.8 146.9C430.8 146.9 382.3 156.2 375.7 156.2C370.5 156.2 360.4 152.7 349.9 149.1C347.2 148.2 344.5 147.2 341.9 146.4C328.9 142.1 320.1 142 320.1 142C320.1 142 311.4 142 298.3 146.4C295.6 147.3 292.9 148.2 290.3 149.1C279.8 152.7 269.7 156.2 264.5 156.2C258 156.2 209.4 146.9 209.4 146.9C209.4 146.9 151.9 216.5 151.9 231.4C151.9 243.7 156.8 248.5 162.7 254.2C163.9 255.4 165.2 256.6 166.4 258L209.5 303.8C209.9 304.3 210.4 304.7 210.9 305.2C215.2 309.5 221.5 315.9 217.1 326.5L216.2 328.7C211.3 340.2 205.2 354.3 213 368.7C221.2 384 235.2 394.2 244.2 392.5C253.2 390.8 274.3 379.8 282.1 374.7C289.9 369.6 314.5 349.3 314.5 341.5C314.5 335 296.8 324.2 288.2 319C286.5 318 285.1 317.1 284.4 316.6C283.5 316 282 315.1 280.2 313.9C272.3 309 258.2 300.2 257.8 296.3C257.4 291.5 257.5 290.1 263.9 278.2C265.2 275.7 266.8 272.9 268.5 270.1C274.5 259.7 281.3 248.1 279.8 239.8C278.1 230.4 263.4 225 250.9 220.4C249.3 219.8 247.8 219.3 246.4 218.7C242.8 217.3 238.3 215.6 233.6 213.9L233.5 213.9C221 209.2 207.1 204 204.8 203C201.6 201.5 202.5 200.2 212 199.2C213.3 199.1 214.9 198.9 216.7 198.7C228.5 197.4 250.3 195.1 260.9 198.1C263 198.7 265.3 199.3 267.8 200C279.7 203.2 294.3 207.2 295.7 209.5C295.9 209.9 296.2 210.2 296.4 210.6C297.7 212.5 298.6 213.8 297.1 221.9C296.7 224.3 295.8 229 294.7 234.8C291.4 252 286.2 279 285.6 285.1C285.5 285.9 285.4 286.8 285.3 287.5C284.5 294.2 283.9 298.7 291.7 300.5L293.7 301C302.5 303 315.5 306 320.1 306L320.1 305.9z"/></svg>',
  mojeek:
    '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24" fill="#000000"><path fill="#000000" d="M22.141 16.488c-.53 0-.824-.353-.824-1.147c0-.795.49-4.182.68-5.736c.35-2.885-1.313-4.976-3.725-4.976c-1.912 0-3.37.756-4.514 1.973c-.776-1.173-1.648-1.973-3.343-1.973c-1.652 0-2.676.605-3.684 1.574C6.189 5.138 5.222 4.63 3.777 4.63C2.578 4.629.967 5.23 0 5.825l1.077 2.44c.734-.409 1.336-.718 1.853-.718c.566 0 .902.408.808 1.262c-.09.824-1.09 10.268-1.09 10.268H5.9s.638-6.061.863-7.885c.264-2.137 1.299-3.49 2.774-3.49c1.294 0 1.735 1.018 1.642 2.21c-.08 1.037-1.025 9.165-1.025 9.165h3.27s.72-6.738.946-8.408c.293-2.17 1.692-2.967 2.57-2.967c1.443 0 1.882 1.18 1.747 2.299c-.11.91-.5 4.118-.62 5.782c-.147 2.058.824 3.589 2.663 3.589c1.206 0 2.412-.344 3.27-.835l-.703-2.413c-.41.177-.797.364-1.155.364"/></svg>',
  searXNG:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z"/></svg>',
  wolframAlpha:
    '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 48 48" fill="#000000"><path fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" d="m24 3.5l6.15 12.458l13.751 1.997l-9.945 9.704L36.3 41.357L24 34.891l-12.3 6.466l2.355-13.698l-9.956-9.704l13.751-1.997L24 3.5z"/><path fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" d="m24 44.5l6.15-12.458l13.751-1.997l-9.945-9.704L36.3 6.643L24 13.109L11.7 6.643l2.355 13.698l-9.956 9.704l13.751 1.997L24 44.5z"/></svg>',
  perplexity:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.785 0v7.272H22.5V17.62h-2.935V24l-7.037-6.194v6.145h-1.091v-6.152L4.392 24v-6.465H1.5V7.188h2.884V0l7.053 6.494V.19h1.09v6.49L19.786 0zm-7.257 9.044v7.319l5.946 5.234V14.44l-5.946-5.397zm-1.099-.08l-5.946 5.398v7.235l5.946-5.234V8.965zm8.136 7.58h1.844V8.349H13.46l6.105 5.54v2.655zm-8.982-8.28H2.59v8.195h1.8v-2.576l6.192-5.62zM5.475 2.476v4.71h5.115l-5.115-4.71zm13.219 0l-5.115 4.71h5.115v-4.71z"></path></svg>',
  claude:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M164.4 404.5L265.1 348L266.8 343.1L265.1 340.4L260.2 340.4L243.4 339.4L185.9 337.8L136 335.7L87.7 333.1L75.5 330.5L64.1 315.5L65.3 308L75.5 301.1L90.2 302.4C109.1 303.7 136.1 305.5 171.2 308L206.4 310.1L258.6 315.5L266.9 315.5L268.1 312.1L265.3 310L263.1 307.9L212.8 273.8L158.4 237.8L129.9 217.1L114.5 206.6L106.7 196.8L103.3 175.3L117.3 159.9L136.1 161.2L140.9 162.5L159.9 177.2L200.6 208.7L253.7 247.8L261.5 254.3L264.6 252.1L265 250.5L261.5 244.7L232.6 192.5L201.8 139.4L188.1 117.4L184.5 104.2C183.2 98.8 182.3 94.2 182.3 88.7L198.2 67.1L207 64.3L228.2 67.1L237.1 74.9L250.3 105.1L271.7 152.6L304.9 217.2L314.6 236.4L319.8 254.2L321.7 259.6L325.1 259.6L325.1 256.5L327.8 220.1L332.8 175.4L337.7 117.9L339.4 101.7L347.4 82.3L363.3 71.8L375.7 77.7L385.9 92.4L384.5 101.9L378.4 141.4L366.5 203.3L358.7 244.8L363.2 244.8L368.4 239.6L389.4 211.8L424.6 167.7L440.1 150.2L458.2 130.9L469.8 121.7L491.8 121.7L508 145.8L500.7 170.7L478 199.4L459.2 223.8L432.2 260.1L415.4 289.1L417 291.4L421 291L481.9 278L514.8 272.1L554.1 265.4L571.9 273.7L573.8 282.1L566.8 299.3L524.8 309.7L475.6 319.5L402.3 336.8L401.4 337.5L402.4 338.8L435.4 341.9L449.5 342.7L484.1 342.7L548.5 347.5L565.3 358.6L575.4 372.2L573.7 382.6L547.8 395.8C532.3 392.1 493.4 382.9 431.2 368.1L403.2 361.1L399.3 361.1L399.3 363.4L422.6 386.2L465.3 424.8L518.8 474.6L521.5 486.9L514.6 496.6L507.3 495.6L460.3 460.2L442.2 444.3L401.1 409.7L398.4 409.7L398.4 413.3L407.9 427.2L457.9 502.4L460.5 525.4L456.9 532.9L443.9 537.4L429.7 534.8L400.4 493.7L370.2 447.4L345.8 405.9L342.8 407.6L328.4 562.4L321.7 570.3L306.2 576.2L293.2 566.4L286.3 550.5L293.2 519L301.5 477.9L308.2 445.2L314.3 404.6L317.9 391.1L317.7 390.2L314.7 390.6L284.1 432.6L237.6 495.5L200.8 534.9L192 538.4L176.7 530.5L178.1 516.4L186.6 503.8L237.5 439L268.2 398.8L288 375.6L287.9 372.2L286.7 372.2L151.4 460L127.3 463.1L116.9 453.4L118.2 437.5L123.1 432.3L163.8 404.3L163.7 404.4L163.7 404.5z"/></svg>',
  chatgpt:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M260.4 249.8L260.4 201.2C260.4 197.1 261.9 194 265.5 192L363.3 135.7C376.6 128 392.5 124.4 408.9 124.4C470.3 124.4 509.3 172 509.3 222.7C509.3 226.3 509.3 230.4 508.8 234.5L407.3 175.1C401.2 171.5 395 171.5 388.9 175.1L260.4 249.8zM488.7 439.2L488.7 323C488.7 315.8 485.6 310.7 479.5 307.1L351 232.4L393 208.3C396.6 206.3 399.7 206.3 403.2 208.3L501 264.7C529.2 281.1 548.1 315.9 548.1 349.7C548.1 388.6 525.1 424.5 488.7 439.3L488.7 439.3zM230.2 336.8L188.2 312.2C184.6 310.2 183.1 307.1 183.1 303L183.1 190.4C183.1 135.6 225.1 94.1 281.9 94.1C303.4 94.1 323.4 101.3 340.3 114.1L239.4 172.5C233.3 176.1 230.2 181.2 230.2 188.4L230.2 336.9L230.2 336.9zM320.6 389L260.4 355.2L260.4 283.5L320.6 249.7L380.8 283.5L380.8 355.2L320.6 389zM359.3 544.7C337.8 544.7 317.8 537.5 300.9 524.7L401.8 466.3C407.9 462.7 411 457.6 411 450.4L411 301.9L453.5 326.5C457.1 328.5 458.6 331.6 458.6 335.7L458.6 448.3C458.6 503.1 416.1 544.6 359.3 544.6L359.3 544.6zM237.8 430.5L140.1 374.2C111.9 357.8 93 323 93 289.2C93 249.8 116.6 214.4 152.9 199.6L152.9 316.3C152.9 323.5 156 328.6 162.1 332.2L290.1 406.4L248.1 430.5C244.5 432.5 241.4 432.5 237.9 430.5zM232.2 514.5C174.3 514.5 131.8 471 131.8 417.2C131.8 413.1 132.3 409 132.8 404.9L233.7 463.3C239.8 466.9 246 466.9 252.1 463.3L380.6 389.1L380.6 437.7C380.6 441.8 379.1 444.9 375.5 446.9L277.7 503.2C264.4 510.9 248.5 514.5 232.1 514.5L232.1 514.5zM359.2 575.4C421.2 575.4 472.9 531.4 484.6 473C541.9 458.1 578.8 404.4 578.8 349.6C578.8 313.8 563.4 278.9 535.8 253.9C538.4 243.1 539.9 232.4 539.9 221.6C539.9 148.4 480.5 93.6 411.9 93.6C398.1 93.6 384.8 95.6 371.5 100.3C348.5 77.8 316.7 63.4 281.9 63.4C219.9 63.4 168.2 107.4 156.5 165.8C99.2 180.6 62.3 234.4 62.3 289.2C62.3 325 77.7 359.9 105.3 384.9C102.7 395.7 101.2 406.4 101.2 417.2C101.2 490.4 160.6 545.2 229.2 545.2C243 545.2 256.3 543.2 269.6 538.5C292.6 561 324.4 575.4 359.2 575.4z"/></svg>',
  baidu:
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" ><path d="M8.859 11.735c1.017-1.71 4.059-3.083 6.202.286 1.579 2.284 4.284 4.397 4.284 4.397s2.027 1.601.73 4.684c-1.24 2.956-5.64 1.607-6.005 1.49l-.024-.009s-1.746-.568-3.776-.112c-2.026.458-3.773.286-3.773.286l-.045-.001c-.328-.01-2.38-.187-3.001-2.968-.675-3.028 2.365-4.687 2.592-4.968.226-.288 1.802-1.37 2.816-3.085zm.986 1.738v2.032h-1.64s-1.64.138-2.213 2.014c-.2 1.252.177 1.99.242 2.148.067.157.596 1.073 1.927 1.342h3.078v-7.514l-1.394-.022zm3.588 2.191l-1.44.024v3.956s.064.985 1.44 1.344h3.541v-5.3h-1.528v3.979h-1.46s-.466-.068-.553-.447v-3.556zM9.82 16.715v3.06H8.58s-.863-.045-1.126-1.049c-.136-.445.02-.959.088-1.16.063-.203.353-.671.951-.85H9.82zm9.525-9.036c2.086 0 2.646 2.06 2.646 2.742 0 .688.284 3.597-2.309 3.655-2.595.057-2.704-1.77-2.704-3.08 0-1.374.277-3.317 2.367-3.317zM4.24 6.08c1.523-.135 2.645 1.55 2.762 2.513.07.625.393 3.486-1.975 4-2.364.515-3.244-2.249-2.984-3.544 0 0 .28-2.797 2.197-2.969zm8.847-1.483c.14-1.31 1.69-3.316 2.931-3.028 1.236.285 2.367 1.944 2.137 3.37-.224 1.428-1.345 3.313-3.095 3.082-1.748-.226-2.143-1.823-1.973-3.424zM9.425 1c1.307 0 2.364 1.519 2.364 3.398 0 1.879-1.057 3.4-2.364 3.4s-2.367-1.521-2.367-3.4C7.058 2.518 8.118 1 9.425 1z"></path></svg>',
  yandex:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M289.5 576L289.5 409.9L178.5 112L234.3 112L316.1 341.7L410.2 64L461.5 64L340.8 411.8L340.8 576L289.5 576z"/></svg>',
};

/**
 * Site-specific configurations
 */
const SITE_CONFIG = {
  bing: {
    inputId: "sb_form_q",
    buttonContainerSelector: ".b_scopebar ul, nav ul, ul[role='navigation']",
    buttonClass: "",
  },
  ecosia: {
    // Try multiple selectors for Ecosia's input (it may vary)
    inputSelectors: [
      'input[name="q"]',
      'input[type="search"]',
      ".search-input",
      'input[placeholder*="search" i]',
    ],
    buttonContainerSelector: ".search-navigation__list",
    buttonClass: "bingenhancer-button-ecosia",
  },
};

/**
 * Search button definitions
 */
const SEARCH_BUTTONS = [
  { id: "google", name: "Google", base: "https://www.google.com/search?q=" },
  { id: "brave", name: "Brave", base: "https://search.brave.com/search?q=" },
  { id: "mojeek", name: "Mojeek", base: "https://www.mojeek.com/search?q=" },
  {
    id: "searXNG",
    name: "searXNG",
    base: "https://searxng.world/search?q=",
    params: "&language=auto&safesearch=2&categories=general",
  },
  {
    id: "wolframAlpha",
    name: "Wolfram Alpha",
    base: "https://www.wolframalpha.com/input?i=",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    base: "https://www.perplexity.ai/search/new?q=",
  },
  { id: "claude", name: "Claude", base: "https://claude.ai/new?q=" },
  { id: "chatgpt", name: "ChatGPT", base: "https://chatgpt.com/?q=" },
  {
    id: "baidu",
    name: "Baidu",
    base: "https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&rsv_idx=1&tn=baidu&wd=",
    params: "&fenlei=256",
  },
  { id: "yandex", name: "Yandex", base: "https://yandex.com/search/?text=" },
];

/**
 * Create dropdown menu for search engines
 */
function createSearchDropdown(buttonContainer, siteType) {
  if (!buttonContainer) return false;

  // Check if dropdown already exists
  if (document.getElementById("bingenhancer-dropdown")) return false;

  // Force parent container to allow overflow (important for Bing)
  buttonContainer.style.overflow = "visible";
  buttonContainer.style.position = "relative";

  // Detect dark mode
  const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Define colors based on site and theme
  let colors = {};
  if (siteType === "bing") {
    colors = isDarkMode
      ? {
          btnText: "#f2f2f2",
          btnHover: "rgba(255, 255, 255, 0.7)",
          dropBg: "#1f1f1f",
          dropBorder: "#404040",
          itemText: "#f2f2f2",
          itemHover: "#2d2d2d",
          itemBorder: "#333333",
          iconColor: "#f2f2f2",
        }
      : {
          btnText: "inherit",
          btnHover: "rgba(0, 0, 0, 0.7)",
          dropBg: "#ffffff",
          dropBorder: "#e8e8e8",
          itemText: "#333",
          itemHover: "#f5f5f5",
          itemBorder: "#f0f0f0",
          iconColor: "#333",
        };
  } else {
    // ecosia
    colors = isDarkMode
      ? {
          btnText: "#f2f2f2",
          btnHoverBg: "#2d3a2d",
          btnHoverText: "#4ade80",
          dropBg: "#1f1f1f",
          dropBorder: "#404040",
          itemText: "#f2f2f2",
          itemHover: "#2d3a2d",
          itemBorder: "#333333",
          accentColor: "#4ade80",
          iconColor: "#f2f2f2",
        }
      : {
          btnText: "inherit",
          btnHoverBg: "#f0f0f0",
          btnHoverText: "#30a86f",
          dropBg: "#ffffff",
          dropBorder: "#e8e8e8",
          itemText: "#333",
          itemHover: "#f5f5f5",
          itemBorder: "#f0f0f0",
          accentColor: "#30a86f",
          iconColor: "#333",
        };
  }

  const li = document.createElement("li");
  li.className = "search-navigation__item";
  li.id = "bingenhancer-dropdown-item";
  li.style.position = "relative";
  li.style.display = "inline-block";
  li.style.overflow = "visible";

  // Main toggle button with separate arrow
  const toggleBtn = document.createElement("a");
  toggleBtn.id = "bingenhancer-dropdown-toggle";
  toggleBtn.style.display = "inline-flex";
  toggleBtn.style.alignItems = "center";
  toggleBtn.style.whiteSpace = "nowrap";
  toggleBtn.style.cursor = "pointer";
  toggleBtn.style.userSelect = "none";
  toggleBtn.style.gap = "4px";

  // Create text and arrow separately
  const textSpan = document.createElement("span");
  textSpan.textContent = "Search with";

  const arrowSpan = document.createElement("span");
  arrowSpan.id = "bingenhancer-arrow";
  arrowSpan.textContent = "▼";
  arrowSpan.style.display = "inline-block";
  arrowSpan.style.transition = "transform 0.2s ease";
  arrowSpan.style.fontSize = "10px";

  if (siteType === "bing") {
    toggleBtn.style.color = colors.btnText;
    toggleBtn.style.transition = "opacity 0.2s ease";
    toggleBtn.addEventListener("mouseenter", () => {
      toggleBtn.style.opacity = "0.7";
    });
    toggleBtn.addEventListener("mouseleave", () => {
      toggleBtn.style.opacity = "1";
    });
  } else if (siteType === "ecosia") {
    toggleBtn.style.fontSize = "14px";
    toggleBtn.style.padding = "8px 12px";
    toggleBtn.style.borderRadius = "4px";
    toggleBtn.style.transition = "all 0.2s ease";
    toggleBtn.style.color = colors.btnText;
    toggleBtn.addEventListener("mouseenter", () => {
      toggleBtn.style.backgroundColor = colors.btnHoverBg;
      toggleBtn.style.color = colors.btnHoverText;
    });
    toggleBtn.addEventListener("mouseleave", () => {
      toggleBtn.style.backgroundColor = "transparent";
      toggleBtn.style.color = colors.btnText;
    });
  }

  toggleBtn.appendChild(textSpan);
  toggleBtn.appendChild(arrowSpan);

  // Dropdown menu
  const dropdown = document.createElement("div");
  dropdown.id = "bingenhancer-dropdown";
  dropdown.style.display = "none";
  dropdown.style.position = "absolute";
  dropdown.style.top = "calc(100% + 4px)";
  dropdown.style.left = "0";
  dropdown.style.width = "220px";
  dropdown.style.zIndex = "10000";
  dropdown.style.backgroundColor = colors.dropBg;
  dropdown.style.borderRadius = "4px";
  dropdown.style.boxShadow = isDarkMode
    ? "0 2px 10px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 0, 0, 0.3)"
    : "0 2px 10px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)";
  dropdown.style.border = `1px solid ${colors.dropBorder}`;

  // Create dropdown items
  SEARCH_BUTTONS.forEach((button, index) => {
    const item = document.createElement("a");
    item.href = "#";
    item.target = "_blank";
    item.rel = "noopener noreferrer";
    item.className = "bingenhancer-dropdown-item";
    item.id = `dropdown-${button.id}`;
    item.style.display = "flex";
    item.style.alignItems = "center";
    item.style.padding = "12px 12px";
    item.style.textDecoration = "none";
    item.style.fontSize = "13px";
    item.style.cursor = "pointer";
    item.style.transition = "background-color 0.15s ease";
    item.style.color = colors.itemText;
    item.style.whiteSpace = "nowrap";
    item.style.minWidth = "0";

    // Add border between items (not after the last one)
    if (index < SEARCH_BUTTONS.length - 1) {
      item.style.borderBottom = `1px solid ${colors.itemBorder}`;
    }

    // Create icon element
    const iconSpan = document.createElement("span");
    iconSpan.innerHTML = ICONS[button.id];
    iconSpan.style.cssText = `
      width: 16px;
      height: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
      flex-shrink: 0;
    `;

    // Set SVG color
    const svg = iconSpan.querySelector("svg");
    if (svg) {
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.style.color = colors.iconColor;
      svg.setAttribute("fill", colors.iconColor);
      svg.querySelectorAll("path").forEach((path) => {
        path.setAttribute("fill", colors.iconColor);
      });
    }

    item.appendChild(iconSpan);

    // Create text span with overflow handling
    const itemTextSpan = document.createElement("span");
    itemTextSpan.textContent = button.name;
    itemTextSpan.style.overflow = "hidden";
    itemTextSpan.style.textOverflow = "ellipsis";
    itemTextSpan.style.flexShrink = "1";
    item.appendChild(itemTextSpan);

    // Add hover effect for dropdown items
    item.addEventListener("mouseenter", () => {
      item.style.backgroundColor = colors.itemHover;
      if (siteType === "ecosia") {
        iconSpan.querySelectorAll("svg *").forEach((el) => {
          el.style.color = colors.accentColor;
          el.setAttribute("fill", colors.accentColor);
        });
      }
    });

    item.addEventListener("mouseleave", () => {
      item.style.backgroundColor = "transparent";
      iconSpan.querySelectorAll("svg *").forEach((el) => {
        el.style.color = colors.iconColor;
        el.setAttribute("fill", colors.iconColor);
      });
    });

    // Click handler - close dropdown and let link navigation happen naturally
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      // Close dropdown
      dropdown.style.display = "none";
      arrowSpan.style.transform = "rotate(0deg)";
    });

    dropdown.appendChild(item);
  });

  // Toggle handler - prevent default link behavior
  toggleBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isOpen = dropdown.style.display !== "none";
    dropdown.style.display = isOpen ? "none" : "block";
    arrowSpan.style.transform = isOpen ? "rotate(0deg)" : "rotate(180deg)";
  });

  // Close dropdown when clicking outside
  const closeDropdown = (e) => {
    if (!li.contains(e.target)) {
      dropdown.style.display = "none";
      arrowSpan.style.transform = "rotate(0deg)";
    }
  };

  document.addEventListener("click", closeDropdown);

  li.appendChild(toggleBtn);
  li.appendChild(dropdown);
  buttonContainer.appendChild(li);

  return true;
}

/**
 * Update search button URLs (for dropdown item data)
 */
function updateSearchButtonURLs(searchString) {
  if (!searchString) return;

  const encodedQuery = encodeURIComponent(searchString);

  SEARCH_BUTTONS.forEach((button) => {
    const dropdownItem = document.getElementById(`dropdown-${button.id}`);
    if (dropdownItem) {
      const params = button.params || "";
      dropdownItem.href = `${button.base}${encodedQuery}${params}`;
    }
  });
}

/**
 * Handle bang redirect
 */
function handleBangRedirect(searchString) {
  if (!bangParser) return false;

  const bangResult = bangParser.parse(searchString);
  if (bangResult.bang && bangResult.url) {
    console.log(
      `[BingEnhancer] Bang detected: !${bangResult.bang}`,
      bangResult,
    );
    window.location.href = bangResult.url;
    return true;
  }

  return false;
}

/**
 * Main update function for Bing
 */
function updateBing() {
  const inputElement = document.getElementById(SITE_CONFIG.bing.inputId);
  const buttonContainer = document.querySelector(
    SITE_CONFIG.bing.buttonContainerSelector,
  );

  if (!inputElement) {
    console.warn(
      `[BingEnhancer] Bing input element not found (${SITE_CONFIG.bing.inputId})`,
    );
    return;
  }

  if (!buttonContainer) {
    console.warn("[BingEnhancer] Bing button container not found");
    return;
  }

  console.log("[BingEnhancer] Bing elements found, initializing");

  // Create dropdown on first run only
  if (!INIT_STATE.bingInitialized) {
    createSearchDropdown(buttonContainer, "bing");
    INIT_STATE.bingInitialized = true;
    console.log("[BingEnhancer] Bing dropdown created");
  }

  function updateURL() {
    const searchString = inputElement.value.trim();

    // Check for bangs
    if (handleBangRedirect(searchString)) {
      return;
    }

    // Update dropdown item URLs
    updateSearchButtonURLs(searchString);
  }

  // Add event listeners only once
  if (!inputElement.dataset.bingEnhancerInitialized) {
    inputElement.addEventListener("keyup", updateURL);
    inputElement.addEventListener("blur", updateURL);
    inputElement.addEventListener("input", updateURL);
    inputElement.dataset.bingEnhancerInitialized = "true";
    console.log("[BingEnhancer] Bing event listeners attached");
  }

  // Initial URL update if there's a value
  if (inputElement.value) {
    updateURL();
  }
}

/**
 * Main update function for Ecosia
 */
function updateEcosia() {
  // Try to find input with multiple selectors
  let inputElement = null;
  for (const selector of SITE_CONFIG.ecosia.inputSelectors) {
    inputElement = document.querySelector(selector);
    if (inputElement) {
      console.log(
        `[BingEnhancer] Found Ecosia input with selector: ${selector}`,
      );
      break;
    }
  }

  if (!inputElement) {
    console.warn(
      "[BingEnhancer] Ecosia input element not found. Tried selectors:",
      SITE_CONFIG.ecosia.inputSelectors,
    );
    return;
  }

  // Find button container for Ecosia
  let buttonContainer = document.querySelector(
    SITE_CONFIG.ecosia.buttonContainerSelector,
  );

  if (!buttonContainer) {
    console.warn(
      `[BingEnhancer] Ecosia button container not found: ${SITE_CONFIG.ecosia.buttonContainerSelector}`,
    );
    return;
  }

  // Create dropdown on first run only
  if (!INIT_STATE.ecosiaInitialized) {
    createSearchDropdown(buttonContainer, "ecosia");
    INIT_STATE.ecosiaInitialized = true;
    console.log("[BingEnhancer] Ecosia dropdown created");
  }

  function updateURL() {
    const searchString = inputElement.value.trim();

    // Check for bangs
    if (handleBangRedirect(searchString)) {
      return;
    }

    // Update dropdown item URLs
    updateSearchButtonURLs(searchString);
  }

  // Add event listeners only once
  if (!inputElement.dataset.bingEnhancerInitialized) {
    inputElement.addEventListener("keyup", updateURL);
    inputElement.addEventListener("blur", updateURL);
    inputElement.addEventListener("input", updateURL);
    inputElement.dataset.bingEnhancerInitialized = "true";
    console.log("[BingEnhancer] Ecosia event listeners attached");
  }

  // Initial URL update if there's a value
  if (inputElement.value) {
    updateURL();
  }
}

/**
 * Wait for page to fully load before initializing Ecosia
 */
function waitForEcosiaLoad() {
  if (document.readyState === "complete") {
    console.log("[BingEnhancer] Page fully loaded, initializing Ecosia");
    updateEcosia();
  } else {
    console.log("[BingEnhancer] Waiting for page to fully load...");
    window.addEventListener("load", () => {
      console.log("[BingEnhancer] Page load event fired, initializing Ecosia");
      updateEcosia();
    });
  }
}

/**
 * Initialize based on detected site
 */
function init() {
  console.log(
    `[BingEnhancer] Initializing for site: ${CURRENT_SITE || "unknown"}`,
  );

  if (CURRENT_SITE === "bing") {
    updateBing();
  } else if (CURRENT_SITE === "ecosia") {
    waitForEcosiaLoad();
  } else {
    console.warn("[BingEnhancer] Unknown site, no features will be loaded");
  }
}

// Run initialization
init();

// Handle runtime messages
chrome.runtime.onMessage.addListener(function (request) {
  if (request.message === "bingEnhancer") {
    if (CURRENT_SITE === "bing") {
      updateBing();
    } else if (CURRENT_SITE === "ecosia") {
      waitForEcosiaLoad();
    }
  }
});
