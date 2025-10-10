import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { useEmit, useExpose, useMethod } from '../../src/component';

describe('组件工具函数', () => {
  describe('useExpose', () => {
    it('应该创建一个可响应式访问的组件实例引用', () => {
      const TestComponent = {
        setup() {
          defineExpose({
            testMethod() {
              return 'test';
            },
          });
        },
      };

      const compRef = useExpose(TestComponent);
      expect(compRef.value).toBeNull();

      compRef.value = { testMethod: () => 'mocked' };
      // @ts-ignore
      expect(compRef.value?.testMethod()).toBe('mocked');
    });
  });

  describe('useEmit', () => {
    it('应该正确返回事件监听函数', () => {
      const TestComponent = {
        props: {
          onClick: Function,
        },
      };

      const mockListener = vi.fn();
      // @ts-ignore
      const result = useEmit(TestComponent, 'click', mockListener);

      expect(result).toBe(mockListener);
      // @ts-ignore
      result();
      expect(mockListener).toHaveBeenCalledTimes(1);
    });

    it('应该正确处理带参数的emit事件', () => {
      const TestComponent = {
        props: {
          onChange: Function,
        },
      };

      const mockListener = vi.fn();
      // @ts-ignore
      const result = useEmit(TestComponent, 'change', mockListener);

      // @ts-ignore
      result(1, 'test');
      expect(mockListener).toHaveBeenCalledWith(1, 'test');
    });
  });

  describe('useMethod', () => {
    it('应该正确返回传入的方法', () => {
      const TestComponent = {
        props: {
          update: Function,
        },
      };

      const mockMethod = vi.fn();
      // @ts-ignore
      const result = useMethod(TestComponent, 'update', mockMethod);

      expect(result).toBe(mockMethod);
    });

    it('应该正确处理带参数的方法调用', () => {
      const TestComponent = {
        props: {
          validate: Function,
        },
      };

      const mockMethod = vi.fn();
      // @ts-ignore
      const result = useMethod(TestComponent, 'validate', mockMethod);

      // @ts-ignore
      result('value', true);
      expect(mockMethod).toHaveBeenCalledWith('value', true);
    });
  });
});
