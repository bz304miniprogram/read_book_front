function longTextPainter(ctx, text, fontsize, width, x, y, rows = 1) { // return the new y
  var row_length = parseInt(width / fontsize);
  var i = 0
  var row_count = 0;
  while (i < text.length && row_count < rows) {
    var temp = "";
    for (var j = 0; j < row_length && i < text.length; i++, j++)
      temp += text[i]
    row_count++;
    if (row_count == rows && i < text.length)
      temp = temp.substring(0, temp.length - 1) + "..."
    ctx.fillText(temp, x, y + fontsize * (parseInt((i - 1) / row_length)))
  }
  return y + fontsize * (parseInt((i - 1) / row_length))
}

function blockPainter(ctx, textList, fontsize, width, x, y, gap, rows = 1) {
  let n_y = y
  for (var i = 0; i < textList.length; i++) {
    n_y = longTextPainter(ctx, textList[i], fontsize, width, x, n_y, rows) + gap
  }
}

module.exports = {
  longTextPainter: longTextPainter,
  blockPainter: blockPainter,

}