/**
 * @module Environment
 * @submodule Environment
 * @for p5
 * @requires core
 */

import p5 from '../core/main';
const descContainer = '_Description'; //Fallback container
const fallbackDescId = '_fallbackDesc'; //Fallback description
const fallbackTableId = '_fallbackTable'; //Fallback Table
const fallbackTableElId = '_fte_'; //Fallback Table Element
const labelContainer = '_Label'; //Label container
const labelDescId = '_labelDesc'; //Label description
const labelTableId = '_labelTable'; //Label Table
const labelTableElId = '_lte_'; //Label Table Element
let dummy = { fallbackElements: {}, labelElements: {} };

/**
 * Creates a screen-reader accessible description for the canvas.
 * The first parameter should be a string with a description of the canvas.
 * The second parameter is optional. If specified, it determines how the
 * description is displayed.
 *
 * <code class="language-javascript">describe(text, LABEL)</code> displays
 * the description to all users as a <a
 * href="https://en.wikipedia.org/wiki/Museum_label" target="_blank">
 * tombstone or exhibit label/caption</a> in a
 * <code class="language-javascript">&lt;div class="p5Label"&gt;&lt;/div&gt;</code>
 * adjacent to the canvas. You can style it as you wish in your CSS.
 *
 * <code class="language-javascript">describe(text, FALLBACK)</code> makes the
 * description accessible to screen-reader users only, in
 * <a href="https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Hit_regions_and_accessibility" target="_blank">
 * a sub DOM inside the canvas element</a>. If a second parameter is not
 * specified, by default, the description will only be available to
 * screen-reader users.
 *
 * @method describe
 * @param  {String} text      description of the canvas
 * @param  {Constant} [display] either LABEL or FALLBACK (Optional)
 *
 * @example
 * <div>
 * <code>
 * describe('pink square with red heart in the bottom right corner', LABEL);
 * background('pink');
 * fill('red');
 * noStroke();
 * ellipse(67, 67, 20, 20);
 * ellipse(83, 67, 20, 20);
 * triangle(91, 73, 75, 95, 59, 73);
 * </code>
 * </div>
 *
 * <div>
 * <code>
 * let x = 0;
 * function draw() {
 *   if (x > 100) {
 *     x = 0;
 *   }
 *   background(220);
 *   fill(0, 255, 0);
 *   ellipse(x, 50, 40, 40);
 *   x = x + 0.1;
 *   describe('green circle at x pos ' + round(x) + ' moving to the right');
 * }
 * </code>
 * </div>
 *
 */

p5.prototype.describe = function(text, display) {
  p5._validateParameters('describe', arguments);
  if (typeof text !== 'string') {
    return;
  }
  const cnvId = this.canvas.id;
  text = _descriptionText(text);
  if (!dummy[cnvId + 'fallbackDesc'] || !dummy[cnvId + 'labelDesc']) {
    _populateDummyDOM(cnvId);
  }

  //check if text is different
  if (dummy[cnvId + 'fallbackDesc'] !== text) {
    //if html structure is not there yet
    if (dummy[cnvId + 'updateFallbackDesc']) {
      dummy[cnvId + 'DOM'].querySelector(
        '#' + cnvId + fallbackDescId
      ).innerHTML = text;
      dummy[cnvId + 'fallbackDesc'] = text;
    } else {
      _describeFallbackHTML(cnvId, text);
    }
  }
  //If display is LABEL create a div adjacent to the canvas element with
  //description text.
  //check if text is different
  if (display === this.LABEL && dummy[cnvId + 'labelDesc'] !== text) {
    //reassign value of dummy.describeText
    if (dummy[cnvId + labelDescId]) {
      dummy[cnvId + 'DOM'].querySelector(
        '#' + cnvId + labelDescId
      ).innerHTML = text;
      dummy[cnvId + 'labelDesc'] = text;
    } else {
      _describeLabelHTML(cnvId, text);
    }
  }
};

p5.prototype._clearDummy = function() {
  dummy = { fallbackElements: {}, labelElements: {} };
};

function _populateDummyDOM(cnvId) {
  dummy[cnvId + 'DOM'] = document.getElementsByTagName('body')[0];
}

/**
 * Helper function for describe() and describeElement().
 */
function _describeLabelHTML(cnvId, text) {
  if (!dummy[cnvId + labelContainer]) {
    dummy[cnvId + 'DOM']
      .querySelector('#' + cnvId)
      .insertAdjacentHTML(
        'afterend',
        `<div id="${cnvId + labelContainer}" class="p5Label"><p id="${cnvId +
          labelDescId}"></p></div>`
      );
    dummy[cnvId + labelContainer] = true;
    dummy[cnvId + labelDescId] = true;
  } else if (!dummy[cnvId + labelDescId] && dummy[cnvId + labelTableId]) {
    dummy[cnvId + 'DOM']
      .querySelector('#' + cnvId + labelTableId)
      .insertAdjacentHTML('beforebegin', `<p id="${cnvId}${labelDescId}"></p>`);
    dummy[cnvId + labelDescId] = true;
  }
  dummy[cnvId + 'DOM'].querySelector(
    '#' + cnvId + labelDescId
  ).innerHTML = text;
  dummy[cnvId + 'labelDesc'] = text;
}

function _describeFallbackHTML(cnvId, text) {
  if (!dummy[cnvId + descContainer]) {
    dummy[cnvId + 'DOM'].querySelector(
      '#' + cnvId
    ).innerHTML = `<div id="${cnvId +
      descContainer}" role="region" aria-label="Canvas Description"><p id="${cnvId +
      fallbackDescId}"></p></div>`;
    dummy[cnvId + descContainer] = true;
    dummy[cnvId + fallbackDescId] = true;
  } else if (dummy[cnvId + fallbackTableId]) {
    dummy[cnvId + 'DOM']
      .querySelector('#' + cnvId + fallbackTableId)
      .insertAdjacentHTML(
        'beforebegin',
        `<p id="${cnvId + fallbackDescId}"></p>`
      );
    dummy[cnvId + fallbackDescId] = true;
  }
  if (dummy[cnvId + 'DOM'].querySelector('#' + cnvId + fallbackDescId)) {
    dummy[cnvId + 'DOM'].querySelector(
      '#' + cnvId + fallbackDescId
    ).innerHTML = text;
    dummy[cnvId + 'fallbackDesc'] = text;
    dummy[cnvId + 'updateFallbackDesc'] === true;
  }
  return;
}

function _descriptionText(text) {
  if (text === 'label' || text === 'fallback') {
    throw new Error('description should not be LABEL or FALLBACK');
  }
  //if string does not end with '.'
  if (!text.endsWith('.') && !text.endsWith('?') && !text.endsWith('!')) {
    //add '.' to the end of string
    text = text + '.';
  }
  return text;
}

/**
 * This function creates a screen-reader accessible
 * description for elements —shapes or groups of shapes that create
 * meaning together— in the canvas. The first paramater should
 * be the name of the element. The second parameter should be a string
 * with a description of the element. The third parameter is optional.
 * If specified, it determines how the element description is displayed.
 *
 * <code class="language-javascript">describeElement(name, text, LABEL)</code>
 * displays the element description to all users as a
 * <a href="https://en.wikipedia.org/wiki/Museum_label" target="_blank">
 * tombstone or exhibit label/caption</a> in a
 * <code class="language-javascript">&lt;div class="p5Label"&gt;&lt;/div&gt;</code>
 * adjacent to the canvas. You can style it as you wish in your CSS.
 *
 * <code class="language-javascript">describeElement(name, text, FALLBACK)</code>
 * makes the element description accessible to screen-reader users
 * only, in <a href="https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Hit_regions_and_accessibility" target="_blank">
 * a sub DOM inside the canvas element</a>. If a second parameter is not
 * specified, by default, the element description will only be available
 * to screen-reader users.
 *
 * @method describeElement
 * @param  {String} name      name of the element
 * @param  {String} text      description of the element
 * @param  {Constant} [display] either LABEL or FALLBACK (Optional)
 *
 * @example
 * <div>
 * <code>
 * describe('Heart and yellow circle over pink background', LABEL);
 * noStroke();
 * background('pink');
 * describeElement('Circle', 'Yellow circle in the top left corner', LABEL);
 * fill('yellow');
 * ellipse(25, 25, 40, 40);
 * describeElement('Heart', 'red heart in the bottom right corner', LABEL);
 * fill('red');
 * ellipse(66.6, 66.6, 20, 20);
 * ellipse(83.2, 66.6, 20, 20);
 * triangle(91.2, 72.6, 75, 95, 58.6, 72.6);
 * </code>
 * </div>
 */

p5.prototype.describeElement = function(name, text, display) {
  p5._validateParameters('describeElement', arguments);
  if (typeof text !== 'string' || typeof name !== 'string') {
    return;
  }
  const cnvId = this.canvas.id;
  text = _descriptionText(text);
  let elementName = _elementName(name);
  name = _nameForID(name);
  let inner = `<th scope="row">${elementName}</th><td>${text}</td>`;

  if (
    !dummy.fallbackElements[cnvId + name] ||
    !dummy.labelElements[cnvId + name]
  ) {
    _populateDummyDOM(cnvId);
  }

  if (dummy.fallbackElements[cnvId + name] !== inner) {
    if (!dummy.fallbackElements[cnvId + name]) {
      _descElementFallbackHTML(cnvId, name, inner);
    } else {
      dummy.fallbackElements[cnvId + name] = inner;
      dummy[cnvId + 'DOM'].querySelector(
        '#' + cnvId + fallbackTableElId + name
      ).innerHTML = inner;
    }
  }
  //If display is LABEL creates a div adjacent to the canvas element with
  //a table, a row header cell with the name of the elements,
  //and adds the description of the element in adjecent cell.
  if (display === this.LABEL && dummy.labelElements[cnvId + name] !== inner) {
    if (!dummy.labelElements[cnvId + name]) {
      _descElementLabelHTML(cnvId, name, inner);
    } else {
      dummy.labelElements[cnvId + name] = inner;
      dummy[cnvId + 'DOM'].querySelector(
        '#' + cnvId + labelTableElId + name
      ).innerHTML = inner;
    }
  }
};
/**
 * Helper functions for describeElement().
 */
function _descElementLabelHTML(cnvId, name, inner) {
  if (!dummy[cnvId + labelContainer]) {
    dummy[cnvId + 'DOM']
      .querySelector('#' + cnvId)
      .insertAdjacentHTML(
        'afterend',
        `<div id="${cnvId +
          labelContainer}" class="p5Label"><table id="${cnvId +
          labelTableId}"></table></div>`
      );
    dummy[cnvId + labelContainer] = true;
    dummy[cnvId + labelTableId] = true;
  } else if (dummy[cnvId + 'DOM'].querySelector('#' + cnvId + labelDescId)) {
    dummy[cnvId + 'DOM']
      .querySelector('#' + cnvId + labelDescId)
      .insertAdjacentHTML(
        'afterend',
        `<table id="${cnvId + labelTableId}"></table>`
      );
    dummy[cnvId + labelTableId] = true;
  }
  if (!dummy.labelElements[cnvId + name] && dummy[cnvId + labelTableId]) {
    let tableRow = document.createElement('tr');
    tableRow.id = cnvId + labelTableElId + name;
    dummy[cnvId + 'DOM']
      .querySelector('#' + cnvId + labelTableId)
      .appendChild(tableRow);
    dummy.labelElements[cnvId + name] = inner;
    dummy[cnvId + 'DOM'].querySelector(
      '#' + cnvId + labelTableElId + name
    ).innerHTML = inner;
  }
}

function _descElementFallbackHTML(cnvId, name, inner) {
  if (!dummy[cnvId + descContainer]) {
    dummy[cnvId + 'DOM'].querySelector(
      '#' + cnvId
    ).innerHTML = `<div id="${cnvId +
      descContainer}" role="region" aria-label="Canvas Description"><table id="${cnvId +
      fallbackTableId}"><caption>Canvas elements and their descriptions</caption></table></div>`;
    dummy[cnvId + descContainer] = true;
    dummy[cnvId + fallbackTableId] = true;
  } else if (document.getElementById(cnvId + fallbackDescId)) {
    dummy[cnvId + 'DOM']
      .querySelector('#' + cnvId + fallbackDescId)
      .insertAdjacentHTML(
        'afterend',
        `<table id="${cnvId +
          fallbackTableId}"><caption>Canvas elements and their descriptions</caption></table>`
      );
    dummy[cnvId + fallbackTableId] = true;
  }
  if (!dummy.fallbackElements[cnvId + name] && dummy[cnvId + fallbackTableId]) {
    let tableRow = document.createElement('tr');
    tableRow.id = cnvId + fallbackTableElId + name;
    dummy[cnvId + 'DOM']
      .querySelector('#' + cnvId + fallbackTableId)
      .appendChild(tableRow);
    dummy.fallbackElements[cnvId + name] = inner;
    dummy[cnvId + 'DOM'].querySelector(
      '#' + cnvId + fallbackTableElId + name
    ).innerHTML = inner;
  }
}

function _nameForID(name) {
  //remove any punctuation at the end of name
  if (
    name.endsWith('.') ||
    name.endsWith(';') ||
    name.endsWith(',') ||
    name.endsWith(':')
  ) {
    name = name.replace(/.$/, '');
  }
  return name;
}

function _elementName(name) {
  if (name === 'label' || name === 'fallback') {
    throw new Error('element name should not be LABEL or FALLBACK');
  }
  //check if last character of string n is '.', ';', or ','
  if (name.endsWith('.') || name.endsWith(';') || name.endsWith(',')) {
    //replace last character with ':'
    name = name.replace(/.$/, ':');
    //if string n does not end with ':'
  } else if (!name.endsWith(':')) {
    //add ':'' at the end of string
    name = name + ':';
  }
  return name;
}

export default p5;
