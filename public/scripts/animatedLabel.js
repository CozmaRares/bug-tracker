/*
  props must have:
    input: number - set data-input="{number}" to create the input inside the element
    id:    string - input id
    label: string - label's text
    type:  string - type of input
    icon:  string - font awesome icon
*/
function createAnimatedInput(props) {
  console.log(JSON.stringify(props, null, 2));

  const div = document.querySelector(`[data-input="${props.input}"]`);

  div.innerHTML = `
    <input
      type="${props.type}"
      id="${props.id}" "
      value=""
      onchange="this.setAttribute('value', this.value);"
      required
    />
  `;

  const label = document.createElement("label");

  label.htmlFor = props.id;

  label.innerHTML = props.label
    .split("")
    .map(
      (char, idx) =>
        `<span class="animated" style="transition-delay: ${idx * 50}ms">${
          idx == 0 ? char.toUpperCase() : char.toLowerCase()
        }</span>`
    )
    .join("");

  const span = document.createElement("span");
  span.style = "margin-left: auto; display: inline-block";

  const i = document.createElement("i");
  i.className = props.icon;

  span.appendChild(i);
  label.appendChild(span);
  div.appendChild(label);
}
