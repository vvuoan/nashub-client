interface MetaFieldProps {
  label: string;
  /** 为空时显示占位条，不伪造字段值 */
  value?: string | null;
}

/** 画布「元数据字段」：420×54，标签 15 / 值 19。 */
export function MetaField({ label, value }: MetaFieldProps) {
  return (
    <div className="meta-field">
      <span className="k">{label}</span>
      {value ? <span className="v">{value}</span> : <span className="v-bar" aria-hidden="true" />}
    </div>
  );
}
