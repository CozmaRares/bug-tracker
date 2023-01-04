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
  select.querySelector("p > span").innerText = option;
}

function setupSelect() {
  document.querySelectorAll(".select").forEach(select => {
    select.style.setProperty(
      "--select-width",
      window.getComputedStyle(select.querySelector(".options")).width
    );

    setTimeout(() => {
      select
        .querySelector(".options")
        .style.setProperty(
          "width",
          window.getComputedStyle(select.querySelector(":scope > p")).width
        );
    }, 1);

    select.addEventListener("mousedown", () => toggleSelect(select));

    select.querySelectorAll(".options p").forEach(option => {
      option.addEventListener("mousedown", () =>
        selectOption(select, option.innerText)
      );
    });
  });
}
