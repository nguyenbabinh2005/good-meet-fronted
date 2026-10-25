import styles from './toggle-row.module.scss'

type ToggleRowProps = {
  checked: boolean
  disabled?: boolean
  hint?: string
  label: string
  onChange: (checked: boolean) => void
}

export const ToggleRow = ({ checked, disabled, hint, label, onChange }: ToggleRowProps) => (
  <label className={styles.row}>
    <span className={styles.text}>
      <strong>{label}</strong>
      {hint && <small>{hint}</small>}
    </span>
    <input
      checked={checked}
      className={styles.input}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
      role="switch"
      type="checkbox"
    />
    <span aria-hidden="true" className={styles.track} />
  </label>
)
