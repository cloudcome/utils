import type { ComponentInternalInstance } from 'vue';

export type Rect = {
  /**
   * 元素距离屏幕的左坐标，单位：px
   */
  left: number;
  /**
   * 元素距离屏幕的上坐标，单位：px
   */
  top: number;
  /**
   * 元素距离屏幕的宽度，单位：px
   */
  width: number;
  /**
   * 元素距离屏幕的高度，单位：px
   */
  height: number;
};

/**
 * 查询元素距离屏幕的矩形信息
 * @param instance 组件实例
 * @param selector 选择器
 * @returns 元素距离屏幕的矩形信息
 */
export async function querySelectorRects(instance: ComponentInternalInstance, selector: string) {
  return new Promise<Rect[]>((resolve) => {
    uni
      .createSelectorQuery()
      .in(instance.proxy)
      .selectAll(selector)
      .boundingClientRect((_rects) => {
        const rects = _rects as UniApp.NodeInfo[];
        resolve(
          rects.map((rect) => ({
            left: rect.left || 0,
            top: rect.top || 0,
            width: rect.width || 0,
            height: rect.height || 0,
          })),
        );
      })
      .exec();
  });
}
