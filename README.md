# React Fiber 修改 Props Demo

## 概述

本 Demo 展示如何找到组件后**修改其 Props**。

## 场景

- **左侧**：目标应用（Counter, MessageBox）
- **右侧**：控制面板

## 核心原理

直接修改 Fiber 节点的 `memoizedProps`：

```typescript
function updateFiberProps(fiber: Fiber, newProps: Record<string, unknown>) {
  fiber.memoizedProps = { ...fiber.memoizedProps, ...newProps };
}
```

**注意**：这是 hack 方式，直接修改 fiber.memoizedProps 不会触发 React 自动重渲染。

## 运行

```bash
pnpm install
pnpm start
```

## 功能

1. 输入组件名称查找
2. 查看组件当前 Props
3. 输入新的 Props 并应用

## 深入学习

### 更高的挑战

前面我们学了如何找到组件。但找到之后呢？能不能修改组件的属性？

这一节我们来挑战这个更高阶的操作。

### Fiber 中的 Props 存储在哪里？

每个 Fiber 节点都有两个和 Props 相关的属性：

**memoizedProps - 已经完成渲染的 Props**

这是上次渲染时使用的 Props，React 用它来判断是否有变化。

**pendingProps - 即将生效的 Props**

这是新传进来的 Props，正在等待处理。

### 修改 Props 的尝试

直接修改 memoizedProps 看起来很简单：

```javascript
function updateFiberProps(fiber, newProps) {
  fiber.memoizedProps = { ...fiber.memoizedProps, ...newProps };
}
```

这样确实会修改 Fiber 节点中存储的 Props 数据。

但这里有个大问题：修改后不会触发 React 自动重渲染。

### 为什么不会自动更新？

React 的渲染流程是这样的：

1. 父组件渲染，传递新的 Props 给子组件
2. React 会创建新的 Fiber 节点（或复用旧的）
3. 将新的 Props 放到 pendingProps
4. 调度渲染任务
5. 执行渲染，memoizedProps 被更新

如果我们直接修改 memoizedProps，相当于绕过了 React 的调度系统。React 不知道数据变了，就不会重新渲染。

这就像你直接改了数据库，但没有告诉应用去刷新界面。

### 强制更新

如果要看到修改效果，需要手动触发更新。可以尝试：

```javascript
// 标记需要更新
fiber.flags |= 4; // Update

// 或者尝试调用更新方法（取决于 React 版本）
if (fiber.stateNode && fiber.stateNode.forceUpdate) {
  fiber.stateNode.forceUpdate();
}
```

但这涉及到更多的内部细节，操作不当可能导致应用崩溃。

### 这种修改有什么用途？

虽然不能自动渲染，但直接修改 Props 在某些场景下仍然有用：

**调试和检查**

在控制台查看组件当前的 Props，不需要通过 React DevTools。可以快速获取组件的状态信息。

**测试场景**

模拟 Props 变化，观察组件的内部状态和反应。虽然不会自动渲染，但可以查看数据变化。

**特殊工具**

一些调试工具可能需要直接读取或修改 Props 来实现功能，比如修改某个组件的样式或内容。

### 风险提示

直接修改 Fiber 节点属于"黑科技"：

- 不是 React 官方支持的 API
- 不同 React 版本可能不兼容
- 可能导致不可预期的行为
- 生产环境绝对不要使用

### 总结

可以直接修改 Fiber 的 memoizedProps，但这：

- 不会触发自动重渲染
- 属于非官方用法，有风险
- 主要用于调试和特殊工具开发

理解这个机制，可以帮助我们更深入地理解 React 的渲染流程。React 通过 props 和 state 的变化来驱动渲染，直接操作 Fiber 绕过了这个机制，所以不会自动更新。
