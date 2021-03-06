// Observer 
function Observer(value) {
  this.value = value
  this.walk(value)
}
// 遍历将所有key的转换为响应式属性
Observer.prototype.walk = function (value) {
  var keys = Object.keys(value)
  keys.forEach(function (key) {
    this.convert(key, value[key])
  }.bind(this))
}
// 劫持并转换属性
Observer.prototype.convert = function (key, val) {
  defineReactive(this.value, key, val)
}

// 转化为响应式属性,注册消息订阅器
function defineReactive(obj, key, val) {
  // 创建订阅器数组
  var dep = new Dep()
  // 递归遍历
  var childObj = observe(val)
  // 
  Object.defineProperty(obj, key, {
    enumrable: true,
    configurable: true,
    get: function () {
      // 如果是有watcher触发的get,注册到dep中
      if (Dep.target) {
        dep.addSub(Dep.target)
      }
      return val
    },
    set: function (newVal) {
      var value = val
      // 新旧值相等直接返回
      if (newVal === value) {
        return
      }
      // 新旧值不等，表明发生了改变
      val = newVal
      childObj = observe(newVal)
      // 广播数据到订阅者数组
      dep.notify()
    }
  })
}

// 递归生成Observer
function observe(value, vm) {
  // 如果不是对象则直接返回，递归结束
  if (!value || typeof value != 'object') {
    return
  }
  //生成新的observer
  return new Observer(value)
}


// 消息订阅器
/* set操作会广播消息到订阅器数组的所有订阅者
（UI层或数据层），然后进行刷新操作
 */
function Dep() {
  this.subs = []
}
// 添加订阅者
Dep.prototype.addSub = function (sub) {
  if (this.subs.indexOf(sub) < 0) {
    this.subs.push(sub)
  }
}
// 通知订阅者
Dep.prototype.notify = function () {
  this.subs.forEach(function (sub) { sub.update() })
}


// 消息订阅者 存储在订阅器数组中  
function Watcher(vm, expOrFn, cb) {
  this.cb = cb
  this.vm = vm
  this.expOrFn = expOrFn
  // 初始化时便注册了cb
  this.value = this.get()
}

// 刷新操作
Watcher.prototype.update = function () {
  this.run()
}

Watcher.prototype.run = function () {
  value = this.get()
  // 如果value值发生了变化,更新并执行回调
  if (value !== this.value) {
    this.value = value
    this.cb.call(this.vm)
  }
}

// 获取指令表达式的值
Watcher.prototype.get = function () {
  // 设置状态标识
  Dep.target = this
  //调用数据层get
  var value = this.vm[this.expOrFn]
  Dep.target = null
  // 还原状态标识
  return value
}


function Parser(vm) {
  this.vm = vm
}

Parser.prototype.parseVText = function (node) {
  var content = node.textContent
  var vm = this.vm
  var model = content.match(/{{(.*)}}/)[1]
  var text = vm[model]
  // 更新节点的文本
  vm.updater.updateNodeTextContent(node, text)
  // 在watcher中订阅model的变化, 在cb中更新视图层
  var watcher = new Watcher(vm, model, function () {
    var text = this[model]
    vm.updater.updateNodeTextContent(node, text)
  })
}


function Updater(vm) {
  this.vm = vm
}
// v-text的刷新函数
Updater.prototype.updateNodeTextContent = function (node, text) {
  node.textContent = text
}


function Vue(options) {
  this.$options = options
  this.$el = document.querySelector(options.el)
  var data = this.$data = options.data
  // 添加属性代理 例如this.count 代理data.count 
  Object.keys(data).forEach(function (key) { this._proxy(key) }.bind(this))
  this.parser = new Parser(this)
  this.updater = new Updater(this)
  var observer = new Observer(this.$data)
  this.initWatch(this)

  // 编译并挂载
  if (this.$el) {
    this.complieElement(this.$el, true)
  }
}

// 实现对元素所有节点的扫描和提取
Vue.prototype.complieElement = function (fragment, root) {
  var node, childNodes = fragment.childNodes
  for (var i = 0; i < childNodes.length; i++) {
    node = childNodes[i]
    if (this.hasDirective(node)) {
      if (!this.$unComplieNodes) {
        this.$unComplieNodes = []
      }
      this.$unComplieNodes.push(node)
    }
    if (node.childNodes.length) {
      this.complieElement(node, false)
    }
  }
  // 如果是根节点
  if (root) {
    // 实现$unCompileNodes总每个节点的编译
    this.complieAllNodes();
  }
}

Vue.prototype.hasDirective = function (node) {
  return /{{.*}}/.test(node.nodeValue)
}

Vue.prototype.complieAllNodes = function () {
  for (var i = 0; i < this.$unComplieNodes.length; i++) {
    this.parser.parseVText(this.$unComplieNodes[i])
  }
}

// 
Vue.prototype.$watch = function (expOrFn, cb) {
  return new Watcher(this, expOrFn, cb)
}

Vue.prototype.initWatch = function (vm) {
  var watch = vm.$options.watch
  for (var key in watch) {
    vm.$watch(key, watch[key])
  }
}

// 添加属性代理
Vue.prototype._proxy = function (key) {
  var self = this
  Object.defineProperty(self, key, {
    configurable: true,
    enumrable: true,
    get: function proxyGetter() {
      return self.$data[key]
    },
    set: function proxyGetter(val) {
      self.$data[key] = val
    }
  })
}





