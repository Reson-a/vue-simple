# vue的简单实现

[demo地址](https://reson-a.github.io/vue-simple/)

vue.js的一个简单实现，支持 Mustache语法的数据绑定和watch

核心的Observer和Watcher部分参考了vue.js源码，其余部分参照mvvm原理自己进行了实现，没有用到render函数和虚拟dom，与源码会有一定出入

简单原理描述
- Observer负责把数据变成响应式，观察变化并广播消息
 - 通过Object.defineProperty为vm.data的所有属性添加getter和setter
 - 在getter中，如果是watcher触发的get，那么订阅这个watcher
 - 在setter中，如果值发生了改变，那么广播消息，执行watcher的cb

- Watcher定义了一个依赖，负责消息的订阅
 - 对于不同指令的解析，new一个watcher，在cb中执行响应的update方法
 - 在watcher初始化时在构造函数中会触发一次get，把这个watcher订阅到dep中

- Dep负责收集依赖，维护了一个watcher实例的队列

实际的实现还要复杂很多，抽出核心部分更便于理解，有时间再好好读读源码，在这里先膜拜一下尤大，想达到这种水平无疑还有很长的路要走
