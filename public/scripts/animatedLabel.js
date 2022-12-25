/*
  props must have:
    input:  number        - set data-input="{number}" to create the input inside the element
    id:     string        - input id
    label:  string        - label's text
    type:   string        - type of input
    icon:   string        - font awesome icon
    error?: boolean       - take a guess 
    errorText?: string    - take a guess part 2
    initialValue?: string - take a guess part 3
*/
function createAnimatedInput(props) {
  const div = document.querySelector(`[data-input="${props.input}"]`);
  div.innerHTML = `
    <input
      type="${props.type}"
      id="${props.id}"
      name="${props.id}"
      ${props.error ? 'class="error"' : ""}
      value="${props.initialValue ? props.initialValue : ""}"
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

  if (props.error) {
    span.className = "error";
    i.className = "fa-solid fa-triangle-exclamation";

    const h4 = document.createElement("h4");
    h4.innerText = props.errorText;
    span.appendChild(h4);
  } else i.className = props.icon;

  span.appendChild(i);
  label.appendChild(span);
  div.appendChild(label);
}
