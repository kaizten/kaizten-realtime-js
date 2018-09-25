export function appendNewChild(reference, type, text, id) {
  var li = document.createElement(type);
  if (typeof id !== 'undefined') {
    li.setAttribute('id', id);
  }
  if (typeof text !== 'undefined') {
    li.appendChild(document.createTextNode(text));
  }
  reference.appendChild(li);
  return li;
}
