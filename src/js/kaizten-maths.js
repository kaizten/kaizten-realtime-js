export function isNumeric(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

export function isDecimal(value) {
	if (isNumeric(value)) {
		return true;
	} else {
		return false;
	}
}

export function randomInterval(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

export function randomPoint(minX, maxX, minY, maxY) {
  var randomX = randomInterval(minX, maxX);
  var randomY = randomInterval(minY, maxY);
  return {x:randomX, y:randomY};
}

export function randomPointInt(maxX, maxY) {
  var randomX = randomInterval(0, maxX);
  var randomY = randomInterval(0, maxY);
  return {x:randomX, y:randomY};
}

export function randomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
