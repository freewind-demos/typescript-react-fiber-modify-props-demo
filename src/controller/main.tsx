import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, Input, Button, Typography, Space, message } from 'antd';
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

  const handleUpdateProps = () => {
    if (!selectedFiber) {
      message.warning('请先选择一个组件');
      return;
    }
    try {
      const newProps = JSON.parse(propInput);
      updateFiberProps(selectedFiber, newProps);
      setFiberInfo(JSON.stringify(getFiberInfo(selectedFiber), null, 2));
      message.success('Props 已更新');
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

          <Card title="修改 Props" style={{ marginTop: 16 }}>
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
