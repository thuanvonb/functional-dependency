function FunctionalDepedency() {
  this.domain = new Set()
  this.range = new Set()
}

FunctionalDepedency.prototype.update = function(fd) {
  this.domain = new Set(fd[0].split(""))
  this.range = new Set(fd[1].split(""))
}

function FunctionalDepedencies() {
  this.fds = []
  this.keys = []
  this.normalForm = 0
}

FunctionalDepedencies.prototype.updateFD = function(fds) {
  let actual = fds.reduce((a, b) => a + (b[0] == "" || b[1] == "" ? 0 : 1), 0);
  while (this.fds.length > actual)
    this.fds.pop()
  while (this.fds.length < actual)
    this.fds.push(new FunctionalDepedency())

  let l = 0;
  for (let i = 0; i < fds.length-1; ++i) if (fds[i][0] != "" && fds[i][1] != "")
    this.fds[l++].update(fds[i])

  this.computeKeys();
  this.computeNF();
}

FunctionalDepedencies.prototype.computeKeys = function() {
  if (this.fds.length == 0) {
    this.keys = []
    return;
  }

  let attrs = {}
  this.fds.forEach(fd => {
    fd.domain.forEach(a => {
      if (!attrs.hasOwnProperty(a))
        attrs[a] = 0;
      attrs[a] |= 1;
    })
    fd.range.forEach(a => {
      if (!attrs.hasOwnProperty(a))
        attrs[a] = 0;
      attrs[a] |= 2;
    })
  })

  let source = []
  let interm = []
  let attrCount = 0
  for (key in attrs) {
    if (attrs[key] == 1)
      source.push(key)
    if (attrs[key] == 3)
      interm.push(key)
    attrCount += 1;
  }

  let sourceClosure = this.closure(source)
  // console.log(source)
  if (sourceClosure.size == attrCount) {
    source.sort()
    this.keys = [source]
    return;
  }

  this.keys = []
  let prmt = permutation(interm.length)
  prmt.shift()
  while (prmt.length > 0) {
    let included = prmt[0].map(a => interm[a-1])
    let src = source.concat(included)
    let clsr = this.closure(src)

    if (clsr.size != attrCount)
      prmt.shift()
    else {
      src.sort()
      this.keys.push(src)
      let exclude = new Set(prmt[0])
      prmt = prmt.filter(a => !exclude.subsetOf(new Set(a)))
    }
    // break;
  }
}

FunctionalDepedencies.prototype.verifyBCNF = function() {
  return this.fds.every(fd => this.keysSet.some(key => key.subsetOf(fd.domain)));
}

FunctionalDepedencies.prototype.verify3NF = function() {
  let totalKeySet = this.keysSet.reduce((a, b) => a.union(b), new Set());
  return this.fds.every(
    fd => this.keysSet.some(key => key.subsetOf(fd.domain) || fd.range.subsetOf(totalKeySet))
  );
}

FunctionalDepedencies.prototype.verify2NF = function() {
  let totalKeySet = this.keysSet.reduce((a, b) => a.union(b), new Set());
  return this.keys.every(key => {
    let prmt = permutation(key.length)
    prmt.shift()
    prmt.pop()
    return prmt.every(perm => 
      this.closure(perm.map(a => key[a-1])).subtract(totalKeySet).size == 0)
  })
}

FunctionalDepedencies.prototype.computeNF = function() {
  if (this.fds.length == 0) {
    this.normalForm = 0;
    return 0;
  }
  this.keysSet = this.keys.map(a => new Set(a))
  this.normalForm = 4;
  if (this.verifyBCNF())
    return;
  this.normalForm = 3;
  if (this.verify3NF())
    return;
  this.normalForm = 2;
  if (this.verify2NF())
    return;
  this.normalForm = 1;
}

FunctionalDepedencies.prototype.closure = function(inp) {
  let closure;
  if (inp instanceof Set || inp instanceof Array)
    closure = new Set(inp)
  else
    closure = new Set(inp.split(""))
  let newAttr = true;
  let added = new Array(this.fds.length).fill(false)

  while (newAttr) {
    newAttr = false;
    for (let i = 0; i < this.fds.length; ++i) {
      if (added[i])
        continue;
      if (closure.supersetOf(this.fds[i].domain)) {
        closure = closure.union(this.fds[i].range)
        added[i] = true;
        newAttr = true;
      }
    }
  }

  return closure;
}