/**
 * @author Pearl Chen
 * CS132 Spring 2023
 *
 * Manages character selection screen selection arrows, and post user info
 */

(function () {
  "use strict";

  const SPECIES = ["not eel", "eel"];
  const TYPE = { eel: ["wide", "narrow"], "not eel": ["dog", "krab"] };
  const COLOR = {
    wide: ["green", "orange", "purple"],
    narrow: ["green", "orange", "purple"],
    dog: ["blue", "red", "yellow"],
    krab: ["red", "blue"],
  };
  const IMG_PATH = "media/avatars/";

  // For ease of changing and keeping track of indices
  let properties = [
    { name: "species", array: SPECIES, currIdx: 0 },
    { name: "type", array: TYPE["not eel"], currIdx: 0 },
    { name: "color", array: COLOR.dog, currIdx: 0 },
  ];

  function init() {
    qs("#left-species").addEventListener("click", () => {
      nextPropertyOption(0, -1);
    });
    qs("#right-species").addEventListener("click", () => {
      nextPropertyOption(0, 1);
    });
    qs("#left-type").addEventListener("click", () => {
      nextPropertyOption(1, -1);
    });
    qs("#right-type").addEventListener("click", () => {
      nextPropertyOption(1, 1);
    });
    qs("#left-color").addEventListener("click", () => {
      nextPropertyOption(2, -1);
    });
    qs("#right-color").addEventListener("click", () => {
      nextPropertyOption(2, 1);
    });

    // Register character submit button
    qs("#register").addEventListener("click", () => {
      if (
        !(qs("#reg-username").checkValidity() &&
        qs("#reg-email").checkValidity() &&
        qs("#reg-pw").checkValidity())
      ) {
        qs("#reg-pw").reportValidity();
        qs("#reg-email").reportValidity();
        qs("#reg-username").reportValidity();
      }
    });
  }

  /**
   * Changes the property select output controlled by arrows, and changes the img src of the
   * displayed avatar character.
   * @param {Number} propIdx - the index of property to change in properties
   *                          0 for species, 1 for type, 2 for colors.
   * @param {Number} moveByIdx - the index count we want to shift by on the list
   */
  function nextPropertyOption(propIdx, moveByIdx) {
    console.log(properties[propIdx]);
    const key = properties[propIdx].name;
    const choices = properties[propIdx].array;

    // Update index
    properties[propIdx].currIdx += moveByIdx;
    if (properties[propIdx].currIdx >= choices.length) {
      properties[propIdx].currIdx = 0;
    } else if (properties[propIdx].currIdx < 0) {
      properties[propIdx].currIdx = choices.length - 1;
    }

    // Update HTML output
    qs("#" + key).textContent = choices[properties[propIdx].currIdx];

    // Update downstream properties index, array and HTML output
    for (let i = propIdx + 1; i < properties.length; i++) {
      const currKey = properties[i].name;

      properties[i].currIdx = 0;
      switch (currKey) {
        case "type":
          properties[i].array = TYPE[SPECIES[properties[0].currIdx]];
          break;
        case "color":
          properties[i].array = COLOR[TYPE[SPECIES[properties[0].currIdx]][properties[1].currIdx]];
          break;
      }
      const currChoices = properties[i].array;
      qs("#" + currKey).textContent = currChoices[0];
    }

    // Update avatar image
    let species = SPECIES[properties[0].currIdx];
    let type = TYPE[species][properties[1].currIdx];
    let color = COLOR[type][properties[2].currIdx];
    let imgDescription = [color, type].join("-");

    qsa(".avatar").forEach((img) => {
      img.src = IMG_PATH + imgDescription + ".png";
      img.alt = imgDescription;
    });
  }

  init();
})();
