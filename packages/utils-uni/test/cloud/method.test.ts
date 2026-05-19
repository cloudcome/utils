import { assertType, describe, expect, it } from 'vitest';
import {
  buildCloudMethodCreator,
  type BuildCloudMethodCreatorOptions,
  type CloudObjectContext,
  type CreateCloudMethod,
  type CreateCloudObjectOptions,
} from '@/cloud/method';
import type { CloudObjectThis } from '@/cloud/types';

describe('BuildCloudMethodCreatorOptions - ExtraConfig generic', () => {
  it('应该接受空泛型参数，保持向后兼容', () => {
    type DefaultOptions = BuildCloudMethodCreatorOptions;
    const _options: DefaultOptions = {
      requiredUserErrCode: 'test',
      onBefore: () => {},
    };
    expect(_options.requiredUserErrCode).toBe('test');
  });

  it('onBefore 的 options 参数应包含 ExtraConfig 字段', () => {
    type ExtendedOptions = BuildCloudMethodCreatorOptions<{ tenantId: string }>;
    const _options: ExtendedOptions = {
      onBefore: (_context, options) => {
        assertType<string>(options.tenantId);
      },
    };
    expect(typeof _options.onBefore).toBe('function');
  });
});

describe('CreateCloudObjectOptions - ExtraConfig generic', () => {
  it('应该接受空泛型参数，保持向后兼容', () => {
    type DefaultOptions = CreateCloudObjectOptions;
    const _options: DefaultOptions = {
      requiredUser: true,
      onlyLocalEnv: false,
    };
    expect(_options.requiredUser).toBe(true);
  });

  it('应该允许扩展自定义配置字段', () => {
    type MyOptions = CreateCloudObjectOptions<{ customFlag: boolean; customName: string }>;
    const _options: MyOptions = {
      requiredUser: true,
      customFlag: true,
      customName: 'test',
    };
    expect(_options.customFlag).toBe(true);
    expect(_options.customName).toBe('test');
  });
});

describe('CloudObjectContext - ExtraConfig generic', () => {
  it('默认泛型下 options 为标准 resolved options', () => {
    type DefaultContext = CloudObjectContext;
    const _ctx = {} as DefaultContext;
    assertType<{
      options: {
        requiredUser: boolean;
        onlyLocalEnv: boolean;
        minVersion?: string;
        maxVersion?: string;
        noRespond?: boolean;
      };
      user: { id: string; role: string[]; permission: string[]; isAdmin: boolean };
    }>(_ctx);
  });

  it('扩展泛型下 options 包含自定义字段', () => {
    type ExtendedContext = CloudObjectContext<{ tenantId: string }>;
    const _ctx = {} as ExtendedContext;
    assertType<{
      options: {
        requiredUser: boolean;
        onlyLocalEnv: boolean;
        minVersion?: string;
        maxVersion?: string;
        noRespond?: boolean;
        tenantId: string;
      };
      user: { id: string; role: string[]; permission: string[]; isAdmin: boolean };
    }>(_ctx);
  });
});

describe('CreateCloudMethod - ExtraConfig generic', () => {
  it('应该接受空泛型参数', () => {
    type DefaultMethod = CreateCloudMethod;
    const _fn: DefaultMethod = null as unknown as DefaultMethod;
    assertType<Function>(_fn);
  });

  it('扩展泛型下 options 参数包含自定义字段', () => {
    type ExtendedMethod = CreateCloudMethod<{ audit: boolean }>;
    const _fn: ExtendedMethod = null as unknown as ExtendedMethod;
    assertType<Function>(_fn);
  });
});

describe('buildCloudMethodCreator - ExtraConfig generic propagation', () => {
  it('应该返回 CreateCloudMethod 类型', () => {
    const creator = buildCloudMethodCreator();
    assertType<Function>(creator);
  });

  it('扩展泛型应该传播到返回的 CreateCloudMethod', () => {
    type MyConfig = { audit?: boolean; tenantId?: string };

    const createMethod = buildCloudMethodCreator<MyConfig>({
      onBefore: (_context, options) => {
        expect(options).toBeDefined();
        expect(typeof options.audit).toBe('undefined');
        expect(typeof options.tenantId).toBe('undefined');
      },
    });

    assertType<CreateCloudMethod<MyConfig>>(createMethod);
  });

  it('onBefore 应该接收到 options 作为第二个参数', () => {
    let receivedOptions: unknown;

    const createMethod = buildCloudMethodCreator({
      onBefore: (_context, options) => {
        receivedOptions = options;
      },
    });

    assertType<Function>(createMethod);
    expect(receivedOptions).toBeUndefined();
  });
});

describe('buildCloudMethodCreator - backward compatibility', () => {
  it('不使用泛型时，onBefore 仍然可以只接收一个参数', () => {
    const createMethod = buildCloudMethodCreator({
      onBefore: (context) => {
        expect(context).toBeDefined();
      },
    });

    assertType<Function>(createMethod);
  });

  it('不使用泛型时，创建方法可以传入标准选项', () => {
    const createMethod = buildCloudMethodCreator();
    assertType<Function>(createMethod);
  });
});

describe('buildCloudMethodCreator - runtime onBefore options', () => {
  it('onBefore 的 options 参数应包含 requiredUser 和 onlyLocalEnv 默认值', async () => {
    let capturedOptions: { requiredUser: boolean; onlyLocalEnv: boolean } | undefined;

    const createMethod = buildCloudMethodCreator({
      onBefore: (_context, options) => {
        capturedOptions = options as any;
      },
    });

    const mockThis: CloudObjectThis = {
      getCloudInfo: () => ({ runtimeEnv: 'local' }) as any,
      getClientInfo: () => ({ appVersion: '1.0.0' }) as any,
      getUniIdToken: () => undefined,
      getMethodName: () => 'test',
      getUniCloudRequestId: () => 'req-1',
      getHttpInfo: () => undefined,
    };

    const method = createMethod(async () => ({ result: 'ok' }), { requiredUser: false });

    await method.call(mockThis as any, undefined);

    expect(capturedOptions).toBeDefined();
    expect(capturedOptions!.requiredUser).toBe(false);
    expect(capturedOptions!.onlyLocalEnv).toBe(false);
  });

  it('onBefore 的 options 应保留用户传入的自定义 ExtraConfig 字段', async () => {
    type MyConfig = { customTag?: string; skipCache?: boolean };

    let capturedOptions: { customTag?: string; skipCache?: boolean } | undefined;

    const createMethod = buildCloudMethodCreator<MyConfig>({
      onBefore: (_context, options) => {
        capturedOptions = options as any;
      },
    });

    const mockThis: CloudObjectThis = {
      getCloudInfo: () => ({ runtimeEnv: 'local' }) as any,
      getClientInfo: () => ({ appVersion: '1.0.0' }) as any,
      getUniIdToken: () => undefined,
      getMethodName: () => 'test',
      getUniCloudRequestId: () => 'req-1',
      getHttpInfo: () => undefined,
    };

    const method = createMethod(async () => ({ result: 'ok' }), { customTag: 'my-tag', skipCache: true });

    await method.call(mockThis as any, undefined);

    expect(capturedOptions).toBeDefined();
    expect(capturedOptions!.customTag).toBe('my-tag');
    expect(capturedOptions!.skipCache).toBe(true);
  });
});
