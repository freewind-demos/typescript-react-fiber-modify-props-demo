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
