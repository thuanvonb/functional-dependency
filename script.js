let fd_inp = []

Set.prototype.subsetOf = function(other) {
  let res = true;
  this.forEach(elem => res &= other.has(elem))
  return res == 1;
}

Set.prototype.supersetOf = function(other) {
  let res = true;
  other.forEach(elem => res &= this.has(elem))
  return res == 1;
}

Set.prototype.union = function(other) {
  let res = new Set(other)
  this.forEach(elem => res.add(elem))
  return res;
}

Set.prototype.subtract = function(other) {
  let res = []
  this.forEach(elem => {
    if (!other.has(elem))
      res.push(elem)
  })
  return new Set(res)
}

function permutation(n) {
  let p = []
  for (let i = 0; i < (1 << n); ++i)
    p.push(i.toString(2)
            .split('').map((a, i, p) => (+a)*(p.length - i))
            .filter(a => a != 0).reverse())
  return p
}

function appendNewLine() {
  id = fd_inp.length;
  let newDiv = d3.select("#func-dpd")
    .append("div")
    .classed('fd', true)
    .datum(id)
  newDiv.append("input")
  newDiv.html(newDiv.html() + " \u2192 ")
  newDiv.append("input")

  newDiv.selectAll('input')
    .attr('type', 'text')
    .data([[id, 0], [id, 1]])
    .on('input', update)
  fd_inp.push(["", ""])
}

function removeLastLine() {
  d3.selectAll('.fd').filter(d => d == fd_inp.length-1).remove()
  fd_inp.pop();
}

function syncValue() {
  d3.select("#func-dpd")
    .selectAll(".fd")
    .selectAll("input")
    .property('value', d => fd_inp[d[0]][d[1]])
}

function update(e, d) {
  let t = d3.select(e.target)
  let v = t.property('value').toUpperCase()
  t.property('value', v)
  fd_inp[d[0]][d[1]] = v
  if (v != "") {
    if (d[0] == fd_inp.length - 1)
      appendNewLine();
  } else {
    if (fd_inp.length > 1 && fd_inp[d[0]][1-d[1]] == "") {
      for (let i = d[0]; i < fd_inp.length-1; ++i) {
        fd_inp[i][0] = fd_inp[i+1][0];
        fd_inp[i][1] = fd_inp[i+1][1];
      }
      syncValue();
      removeLastLine();
    }
  }
  fds.updateFD(fd_inp)

  d3.select("#keys").html(fds.keys.map(a => a.join("")).join(", "))
  findClosure()
  updateNormalForm()
}

function updateNormalForm() {
  d3.selectAll(".NF").classed('satisfied', false)
  d3.selectAll(".NF").filter((d, i) => i < fds.normalForm).classed('satisfied', true)
}

function findClosure() {
  let tag = d3.select("#inp")
  let v = tag.property('value').toUpperCase()
  if (v == "") {
    d3.select("#closure-res").html("")
    return;
  }
  tag.property('value', v)
  let closure = fds.closure(v)
  let out = []
  closure.forEach(elem => out.push(elem))
  out.sort()
  d3.select("#closure-res").html(out.join(""))
}

appendNewLine()

let fds = new FunctionalDepedencies()