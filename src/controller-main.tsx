import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Input, Button, Typography, Space, message, Alert } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { findFiberByComponentName, getFiberInfo, getComponentName, getTargetFiberRoot, traverseFiberTree, updateFiberProps } from '../shared/fiber-utils';
import type { Fiber } from '../shared/fiber-utils';

const { Title, Text } = Typography;

function ControllerApp() {
  const [searchName, setSearchName] = useState('Counter');
  const [selectedFiber, setSelectedFiber] = useState<Fiber | null>(null);
  const [fiberInfo, setFiberInfo] = useState('');
  const [propInput, setPropInput] = useState('');
  const [components, setComponents] = useState<string[]>([]);

  // 组件加载时扫描可用组件列表
  useEffect(() => {
    const rootFiber = getTargetFiberRoot();
    if (rootFiber) {
      const list: string[] = [];
      traverseFiberTree(rootFiber, (f) => {
        const name = f.type ? getComponentName(f.type) : null;
        if (name && !list.includes(name)) list.push(name);
      });
      setComponents(list);
    }
  }, []);

  /**
   * 通过组件名称查找 Fiber
   *
   * 步骤：
   * 1. 获取目标应用的根 Fiber 节点
   * 2. 使用 findFiberByComponentName 在 Fiber 树中搜索匹配名称的组件
   * 3. 找到后保存 Fiber 引用，用于后续修改 props
   */
  const handleFind = () => {
    const rootFiber = getTargetFiberRoot();
    if (!rootFiber) {
      message.error('找不到 fiber 根节点');
      return;
    }
    const fiber = findFiberByComponentName(rootFiber, searchName);
    if (fiber) {
      setSelectedFiber(fiber);
      setFiberInfo(JSON.stringify(getFiberInfo(fiber), null, 2));
      message.success(`找到组件: ${getFiberInfo(fiber).name}`);
    } else {
      setSelectedFiber(null);
      setFiberInfo('');
      message.error(`未找到组件: ${searchName}`);
    }
  };

  /**
   * 修改组件的 Props
   *
   * 重要提示：
   * 这是一个 Hack！我们直接修改了 Fiber 节点的 memoizedProps。
   *
   * 但这样做有几个关键限制：
   * 1. 不会触发 React 重新渲染 - 修改后组件不会自动更新显示
   * 2. 只能修改 props，无法修改组件的 state
   * 3. React 下次更新时可能会用 pendingProps 覆盖我们的修改
   *
   * 为什么还要演示这个？
   * - 这是一个重要的调试技术，可以用来查看组件接收到的 props
   * - 理解这个原理有助于理解 React 的工作方式
   * - 在某些特殊场景下（如调试工具）可能有用途
   *
   * 正确的修改方式应该是：
   * - 使用 React 提供的标准 API（如 props、context、state）
   * - 或者通过父组件传递回调函数来修改
   */
  const handleUpdateProps = () => {
    if (!selectedFiber) {
      message.warning('请先选择一个组件');
      return;
    }
    try {
      const newProps = JSON.parse(propInput);
      // 调用 updateFiberProps 修改 Fiber 的 props
      // 这会修改 memoizedProps，但不会触发重新渲染
      updateFiberProps(selectedFiber, newProps);

      // 刷新显示，看看修改是否生效（实际上UI不会变）
      setFiberInfo(JSON.stringify(getFiberInfo(selectedFiber), null, 2));
      message.success('Props 已更新（注意：UI 不会自动刷新！）');
    } catch (e) {
      message.error('JSON 格式错误');
    }
  };

  return (
    <div>
      <Title level={2}>控制面板</Title>
      <Text type="secondary">查找组件并修改其 Props</Text>

      <Card title="查找组件" style={{ marginTop: 16 }}>
        <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
          <Input
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            placeholder="输入组件名称"
            prefix={<SearchOutlined />}
            onPressEnter={handleFind}
          />
          <Button type="primary" onClick={handleFind}>查找</Button>
        </Space.Compact>
        <Text type="secondary">可用组件: {components.filter(c => !['div', 'span', 'button'].includes(c)).join(', ')}</Text>
      </Card>

      {selectedFiber && (
        <>
          <Card title="组件信息" style={{ marginTop: 16 }}>
            <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 12, borderRadius: 4, fontSize: 12 }}>
              {fiberInfo}
            </pre>
          </Card>

          <Card title="修改 Props（Hack 方式）" style={{ marginTop: 16 }}>
            <Alert
              message="注意：直接修改 Fiber Props 不会触发重新渲染，仅供调试使用"
              type="warning"
              showIcon
              style={{ marginBottom: 12 }}
            />
            <Space.Compact>
              <Input
                value={propInput}
                onChange={e => setPropInput(e.target.value)}
                placeholder='{"key": "value"}'
                style={{ width: 250 }}
              />
              <Button type="primary" onClick={handleUpdateProps}>应用</Button>
            </Space.Compact>
            <div style={{ marginTop: 12 }}>
              <Text strong>预设:</Text>
              <Space style={{ marginTop: 8 }}>
                <Button size="small" onClick={() => { setPropInput('{"initialCount": 100}'); handleFind(); }}>Counter=100</Button>
                <Button size="small" onClick={() => { setPropInput('{"message": "已修改!"}'); handleFind(); }}>MessageBox</Button>
              </Space>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

const controllerRootElement = document.getElementById('controller-root');
if (controllerRootElement) {
  const root = createRoot(controllerRootElement);
  root.render(<ControllerApp />);
}
