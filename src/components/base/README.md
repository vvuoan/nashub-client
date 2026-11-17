# src/components/base/ — 基础控件

| 文件 | 作用 |
|---|---|
| `Button.tsx` | 可聚焦按钮，含主/次/危险变体 |
| `Focusable.tsx` | 焦点节点包装：注册到焦点管理器、处理确认键 |
| `FocusScope.tsx` | 焦点作用域：限制方向键在区域内移动 |
| `FocusTrap.tsx` | 弹层内焦点陷阱，关闭后恢复到原焦点 |
| `IconButton.tsx` | 纯图标按钮，带无障碍标签 |
| `Image.tsx` | 带占位与失败回退的图片 |
| `MetaField.tsx` | 详情页字段（标签 + 值） |
| `Modal.tsx` | 模态容器，配合 `FocusTrap` 使用 |
| `NavIcon.tsx` | 导航图标 |
| `Placeholder.tsx` | 空态/占位插画 |
| `PosterImage.tsx` | 海报图（固定比例、懒加载） |
| `ProgressBar.tsx` | 播放/任务进度条 |
| `Segmented.tsx` | 分段选择器 |
| `Select.tsx` | 下拉选择，键盘可达 |
| `Skeleton.tsx` | 骨架屏 |
| `Slider.tsx` | 滑杆（音量、进度） |
| `StateSlot.tsx` | 统一加载/空/错状态槽 |
| `StatusChip.tsx` | 状态徽标 |
| `Stepper.tsx` | 数字步进器 |
| `Switch.tsx` | 开关 |

## 约束

- 所有基础控件必须可被遥控器聚焦与操作，焦点样式来自 token（`--card-focus-ring` 等）。
- 不在基础控件里调用业务 API；数据由调用方传入。
