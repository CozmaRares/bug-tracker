function toggleSelect(select) {
  if (select.classList.contains("active")) return;

  select.classList.add("active");

  const listener = () => {
    select.classList.remove("active");

    document.removeEventListener("mousedown", listener);
  };

  setTimeout(() => document.addEventListener("mousedown", listener), 1);
}

function selectOption(select, option) {
  select.querySelector(".value").innerText = option;
}

/**
 *
 * @param {string} query - will be used in document.querySelector to select the container
 * @param {any} defaultValue
 * @param {string[]} options
 * @param {function(string)} cb - callback function that receives the selected option
 */
function createSelect(query, defaultValue, options, cb) {
  const select = document.querySelector(query);

  select.classList.add("select");

  select.addEventListener("mousedown", () => toggleSelect(select));

  setTimeout(() => {
    select.style.setProperty(
      "--select-width",
      window.getComputedStyle(select.querySelector(".options")).width
    );

    select
      .querySelector(".options")
      .style.setProperty(
        "width",
        window.getComputedStyle(select.querySelector(":scope > p")).width
      );
  }, 1);

  const defaultContainer = document.createElement("p");

  defaultContainer.innerHTML = `
    <div class="value">${defaultValue}</div>
    <i class="fa-solid fa-caret-down"></i>
  `;

  const optionsContainer = document.createElement("div");

  optionsContainer.classList.add("options");

  options.forEach(option => {
    const p = document.createElement("p");
    p.innerText = option;

    p.addEventListener("mousedown", () => {
      selectOption(select, option);

      if (cb) cb(option);
    });

    optionsContainer.appendChild(p);
  });

  select.appendChild(defaultContainer);
  select.appendChild(optionsContainer);
}
