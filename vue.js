function Vue(options) {

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
    this.subs.push(sub)
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
    return this.vm.$data[yhis.expOrFn]
  }







  // 添加属性代理
  this.$data = options.data
  var obs = new Observer(this.$data)
}


